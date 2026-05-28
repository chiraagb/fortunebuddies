import logging

import httpx
from django.conf import settings
from django.contrib.auth.models import User
from django.core.cache import cache
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import UserProfile

logger = logging.getLogger(__name__)

# ── MessageCentral constants ───────────────────────────────────────────────────
_MC_BASE        = "https://cpaas.messagecentral.com/verification/v3"
_MC_CUSTOMER_ID = "C-FDADCCFFFC2044E"


class SendOtpView(APIView):
    """
    POST /api/v1/accounts/send-otp/
    Body: { "phone": "9876543210" }

    Async — non-blocking HTTP call to MessageCentral.
    Rate-limited: OTP_MAX_ATTEMPTS per OTP_RATE_WINDOW seconds per phone number.
    """

    async def post(self, request):
        phone = request.data.get("phone", "").strip()
        if not phone:
            return Response(
                {"error": "Phone number required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ── Rate limiting ──────────────────────────────────────────────────────
        cache_key      = f"otp_rate:{phone}"
        attempts       = await cache.aget(cache_key, default=0)
        max_attempts   = getattr(settings, "OTP_MAX_ATTEMPTS", 5)
        rate_window    = getattr(settings, "OTP_RATE_WINDOW", 60)

        if attempts >= max_attempts:
            logger.warning("OTP rate limit hit for phone=%s", phone)
            return Response(
                {"error": f"Too many OTP requests. Please wait {rate_window} seconds."},
                status=status.HTTP_429_TOO_MANY_REQUESTS,
            )
        await cache.aset(cache_key, attempts + 1, timeout=rate_window)

        # ── Send OTP ───────────────────────────────────────────────────────────
        url = (
            f"{_MC_BASE}/send"
            f"?countryCode=91&customerId={_MC_CUSTOMER_ID}"
            f"&flowType=SMS&mobileNumber={phone}"
        )
        headers = {"authToken": settings.MESSAGE_CENTRAL_AUTH_KEY}

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(url, headers=headers)
        except httpx.RequestError as exc:
            logger.error("MessageCentral connection error: %s", exc)
            return Response(
                {"error": "Could not connect to OTP service.", "detail": str(exc)},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        try:
            data = response.json()
        except ValueError:
            logger.error("MessageCentral non-JSON response: %s", response.text)
            return Response(
                {"error": "Invalid response from OTP service.", "raw": response.text},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        if response.status_code == 200 and data.get("responseCode") == 200:
            inner           = data.get("data", {})
            verification_id = inner.get("verificationId")
            if verification_id:
                return Response(
                    {
                        "message":        "OTP sent successfully.",
                        "verificationId": verification_id,
                        "transactionId":  inner.get("transactionId"),
                        "timeout":        inner.get("timeout"),
                    },
                    status=status.HTTP_200_OK,
                )
            return Response(
                {"error": "Missing verificationId in OTP response.", "response": data},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        logger.warning("OTP send failed for phone=%s — %s %s", phone, response.status_code, data)
        return Response(
            {"error": "Failed to send OTP.", "status_code": response.status_code, "response": data},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


class VerifyOtpView(APIView):
    """
    POST /api/v1/accounts/verify-otp/
    Body: { "otp": "1234", "verificationId": "...", "phone": "9876543210" }

    Async — non-blocking HTTP call to MessageCentral.
    On success: creates/updates User + UserProfile and returns JWT pair.
    """

    async def post(self, request):
        otp             = request.data.get("otp", "").strip()
        verification_id = request.data.get("verificationId", "").strip()
        phone           = request.data.get("phone", "").strip()

        if not otp or not verification_id or not phone:
            return Response(
                {"error": "otp, verificationId, and phone are all required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ── Validate OTP ───────────────────────────────────────────────────────
        url = (
            f"{_MC_BASE}/validateOtp"
            f"?countryCode=91&mobileNumber={phone}&verificationId={verification_id}"
            f"&customerId={_MC_CUSTOMER_ID}&code={otp}"
        )
        headers = {"authToken": settings.MESSAGE_CENTRAL_AUTH_KEY}

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(url, headers=headers)
            response.raise_for_status()
        except httpx.HTTPStatusError as exc:
            logger.warning("OTP verify HTTP error phone=%s: %s", phone, exc)
            return Response(
                {"error": "OTP verification failed.", "detail": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except httpx.RequestError as exc:
            logger.error("MessageCentral verify connection error: %s", exc)
            return Response(
                {"error": "Error during OTP verification.", "detail": str(exc)},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        try:
            data = response.json()
        except ValueError:
            return Response(
                {"error": "Invalid response from OTP verification service."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        if not data or "data" not in data:
            return Response(
                {"error": "Unexpected response structure from OTP service."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        verification_status = data["data"].get("verificationStatus")

        if verification_status != "VERIFICATION_COMPLETED":
            return Response(
                {"error": "OTP verification failed."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ── Create / update user (async ORM) ──────────────────────────────────
        user, created = await User.objects.aget_or_create(username=phone)
        if created:
            user.set_unusable_password()
            await user.asave()
            await UserProfile.objects.acreate(user=user, phone=phone, is_verified=True)
        else:
            profile              = await UserProfile.objects.aget(user=user)
            profile.is_verified  = True
            await profile.asave()

        # ── Issue JWT ──────────────────────────────────────────────────────────
        refresh = RefreshToken.for_user(user)
        # Clear rate-limit counter on successful verification
        await cache.adelete(f"otp_rate:{phone}")
        return Response(
            {
                "message": "OTP verified successfully.",
                "access":  str(refresh.access_token),
                "refresh": str(refresh),
            },
            status=status.HTTP_200_OK,
        )
