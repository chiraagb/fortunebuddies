import asyncio
import base64
import hashlib
import hmac
import json
import logging
import uuid
from datetime import timedelta

from django.conf import settings
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from cashfree_pg.api_client import Cashfree
from cashfree_pg.models.create_order_request import CreateOrderRequest
from cashfree_pg.models.customer_details import CustomerDetails
from cashfree_pg.models.order_meta import OrderMeta

from accounts.models import UserProfile
from forms.models import FormSubmission
from payments.models import Payment

logger = logging.getLogger(__name__)

# ── Cashfree SDK initialisation ────────────────────────────────────────────────
Cashfree.XClientId     = settings.CASHFREE_APP_ID
Cashfree.XClientSecret = settings.CASHFREE_SECRET_KEY
Cashfree.XEnvironment  = getattr(Cashfree, settings.CASHFREE_ENVIRONMENT)
_CF_API_VERSION        = "2023-08-01"

# Cashfree payment_status → our Payment.status mapping
_CF_STATUS_MAP = {
    "SUCCESS":      "success",
    "FAILED":       "failed",
    "USER_DROPPED": "cancelled",
    "PENDING":      "pending",
    "VOID":         "cancelled",
    "FLAGGED":      "pending",
}


class CreateCashfreeOrderAPIView(APIView):
    """
    POST /api/v1/payments/create-order/
    Auth: IsAuthenticated (JWT)
    Body: { "form_id": "<uuid>" }

    Creates a Cashfree payment order and records it in the DB.
    The Cashfree SDK call is run in a thread pool (SDK is sync-only).
    """

    permission_classes = [IsAuthenticated]

    async def post(self, request):
        user    = request.user
        form_id = request.data.get("form_id")

        if not form_id:
            return Response(
                {"status": "error", "message": "form_id is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ── Fetch form submission (async ORM) ──────────────────────────────────
        try:
            form = await FormSubmission.objects.aget(id=form_id)
        except FormSubmission.DoesNotExist:
            return Response(
                {"status": "error", "message": "Form submission not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # ── Determine amount ───────────────────────────────────────────────────
        gender = (form.gender or "").lower()
        amount = 49.0 if gender == "female" else 99.0

        # ── Build Cashfree request ─────────────────────────────────────────────
        payment_id = uuid.uuid4()
        order_id   = f"order_{payment_id.hex[:10]}"

        try:
            profile        = await UserProfile.objects.aget(user=user)
            customer_phone = profile.phone or "9999999999"
        except UserProfile.DoesNotExist:
            customer_phone = "9999999999"

        customer_details      = CustomerDetails(
            customer_id    = f"user_{user.id}",
            customer_phone = customer_phone,
            customer_email = user.email or "none@fortunebuddies.com",
        )
        create_order_request               = CreateOrderRequest(
            order_amount   = amount,
            order_currency = "INR",
            customer_details = customer_details,
        )
        create_order_request.order_meta = OrderMeta(
            return_url = f"{settings.FRONTEND_BASE_URL}/thank-you?order_id={order_id}"
        )
        create_order_request.order_id = order_id

        # ── Call Cashfree SDK in thread pool (SDK is sync) ─────────────────────
        try:
            api_response = await asyncio.to_thread(
                lambda: Cashfree().PGCreateOrder(_CF_API_VERSION, create_order_request, None, None)
            )
        except Exception as exc:
            logger.exception("Cashfree PGCreateOrder failed: %s", exc)
            return Response(
                {"status": "error", "message": f"Payment gateway error: {exc}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        payment_session_id = api_response.data.payment_session_id

        # ── Persist payment record (async ORM) — status starts as "created" ───
        await Payment.objects.acreate(
            id              = payment_id,
            user            = user,
            form_submission = form,
            gateway         = "cashfree",
            order_id        = order_id,
            amount          = amount,
            currency        = "INR",
            status          = "created",          # ← webhook confirms "success"
            provider_response = {
                "order_id":            api_response.data.order_id,
                "payment_session_id":  payment_session_id,
                "order_status":        api_response.data.order_status,
            },
        )

        # ── Set submission cooldown on the user profile ────────────────────────
        profile, _ = await UserProfile.objects.aget_or_create(user=user)
        profile.next_allowed_submission = timezone.now() + timedelta(days=7)
        await profile.asave()

        logger.info("Cashfree order created: %s for user_id=%s amount=₹%s", order_id, user.id, amount)

        return Response(
            {
                "status":             "success",
                "payment_session_id": payment_session_id,
                "order_id":           order_id,
            },
            status=status.HTTP_200_OK,
        )


class CashfreeWebhookView(APIView):
    """
    POST /api/v1/payments/webhook/
    No auth — Cashfree calls this directly.

    Verifies the HMAC-SHA256 signature from the x-webhook-signature header,
    then updates the Payment record to reflect the real payment outcome.

    Cashfree webhook payload shape:
        {
          "data": {
            "order":   { "order_id": "...", "order_status": "PAID" },
            "payment": { "payment_status": "SUCCESS", "cf_payment_id": "..." }
          },
          "event_time": "...",
          "type": "PAYMENT_SUCCESS_WEBHOOK"
        }
    """

    def _verify_signature(self, raw_body: bytes, timestamp: str, signature: str) -> bool:
        """Return True if the webhook signature is valid."""
        secret = getattr(settings, "CASHFREE_WEBHOOK_SECRET", "")
        if not secret:
            logger.warning("CASHFREE_WEBHOOK_SECRET not set — skipping signature check")
            return True  # allow in dev; enforce in production by setting the secret

        message  = timestamp + raw_body.decode("utf-8")
        computed = base64.b64encode(
            hmac.new(
                secret.encode("utf-8"),
                message.encode("utf-8"),
                hashlib.sha256,
            ).digest()
        ).decode("utf-8")
        return hmac.compare_digest(computed, signature)

    async def post(self, request):
        # ── Verify signature ───────────────────────────────────────────────────
        timestamp = request.headers.get("x-webhook-timestamp", "")
        signature = request.headers.get("x-webhook-signature", "")

        if not self._verify_signature(request.body, timestamp, signature):
            logger.warning("Cashfree webhook: invalid signature")
            return Response({"error": "Invalid signature."}, status=status.HTTP_401_UNAUTHORIZED)

        # ── Parse body ─────────────────────────────────────────────────────────
        try:
            payload = json.loads(request.body)
        except (ValueError, KeyError):
            return Response({"error": "Invalid JSON payload."}, status=status.HTTP_400_BAD_REQUEST)

        data             = payload.get("data", {})
        order_data       = data.get("order", {})
        payment_data     = data.get("payment", {})
        order_id         = order_data.get("order_id")
        cf_payment_status = payment_data.get("payment_status", "")

        if not order_id:
            return Response({"error": "Missing order_id."}, status=status.HTTP_400_BAD_REQUEST)

        # ── Map Cashfree status → our internal status ──────────────────────────
        our_status = _CF_STATUS_MAP.get(cf_payment_status.upper(), "pending")

        # ── Update Payment record (async ORM) ─────────────────────────────────
        try:
            payment = await Payment.objects.aget(order_id=order_id)
        except Payment.DoesNotExist:
            logger.error("Webhook received for unknown order_id=%s", order_id)
            # Return 200 so Cashfree doesn't keep retrying
            return Response({"status": "order not found"}, status=status.HTTP_200_OK)

        payment.status           = our_status
        payment.provider_response = payload
        if our_status == "success":
            payment.paid_at = timezone.now()
        await payment.asave()

        logger.info(
            "Cashfree webhook processed: order_id=%s cf_status=%s our_status=%s",
            order_id, cf_payment_status, our_status,
        )

        return Response({"status": "ok"}, status=status.HTTP_200_OK)
