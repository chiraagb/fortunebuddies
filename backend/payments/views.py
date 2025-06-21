from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from datetime import timedelta
from django.utils import timezone
from django.conf import settings

from cashfree_pg.models.create_order_request import CreateOrderRequest
from cashfree_pg.api_client import Cashfree
from cashfree_pg.models.customer_details import CustomerDetails
from cashfree_pg.models.order_meta import OrderMeta
from accounts.models import UserProfile
from forms.models import FormSubmission
from payments.models import Payment
import logging

logger = logging.getLogger(__name__)

import uuid

Cashfree.XClientId = settings.CASHFREE_APP_ID
Cashfree.XClientSecret = settings.CASHFREE_SECRET_KEY
Cashfree.XEnvironment =  getattr(Cashfree, settings.CASHFREE_ENVIRONMENT)
x_api_version = "2023-08-01"




class CreateCashfreeOrderAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        print("Creating Cashfree order",settings.CASHFREE_APP_ID, settings.CASHFREE_SECRET_KEY,Cashfree.XEnvironment)
        user = request.user
        form_id = request.data.get("form_id")

        logger.info(f"Cashfree settings: {Cashfree.XClientId}, {Cashfree.XEnvironment}")
        
        if not form_id:
            return Response({"status": "error", "message": "Form ID is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            form = FormSubmission.objects.get(id=form_id)
        except FormSubmission.DoesNotExist:
            return Response({"status": "error", "message": "Form not found"}, status=status.HTTP_404_NOT_FOUND)

        # Determine amount based on gender
        gender = form.gender.lower()
        amount = 49.0 if gender == "female" else 99.0

        # Create order ID and Payment record
        payment_id = uuid.uuid4()
        order_id = f"order_{payment_id.hex[:10]}"

        customer_phone = (
            user.user_profile.phone if hasattr(user, "user_profile") and user.user_profile.phone
            else "9999999999"
        )

        customer_details = CustomerDetails(
            customer_id=f"user_{user.id}",
            customer_phone=customer_phone,
            customer_email=user.email if user.email else "None"
        )

        create_order_request = CreateOrderRequest(
            order_amount=amount,
            order_currency="INR",
            customer_details=customer_details
        )

        order_meta = OrderMeta(
            return_url=f"{settings.FRONTEND_BASE_URL}/thank-you?order_id={order_id}"
        )
        create_order_request.order_meta = order_meta
        create_order_request.order_id = order_id

        try:
            api_response = Cashfree().PGCreateOrder(
                x_api_version, create_order_request, None, None
            )

            payment_session_id = api_response.data.payment_session_id

            # Save to DB
            payment = Payment.objects.create(
                id=payment_id,
                user=user,
                form_submission=form,
                gateway="cashfree",
                order_id=order_id,
                amount=amount,
                currency="INR",
                status="success",
                provider_response={
                    "order_id": api_response.data.order_id,
                    "payment_session_id": api_response.data.payment_session_id,
                    "order_status": api_response.data.order_status,
                }
            )
            
            user_profile, _ = UserProfile.objects.get_or_create(user=user)
            user_profile.next_allowed_submission = timezone.now() + timedelta(days=7)
            user_profile.save()

            return Response({
                "status": "success",
                "payment_session_id": payment_session_id,
                "order_id": order_id
            })

        except Exception as e:
            return Response({
                "status": "error",
                "message": f"Error creating order: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
