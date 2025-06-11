import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Payment
from forms.models import FormSubmission
from django.conf import settings
import uuid


class CreateCashfreeOrderAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        form_id = request.data.get('form_id')
        form = FormSubmission.objects.filter(id=form_id, user=request.user).first()
        if not form:
            return Response({"error": "Invalid form ID"}, status=400)

        # Order details
        order_id = f"GB_{uuid.uuid4().hex[:12]}"
        amount = "119.00"  # Or derive from form data
        currency = "INR"

        headers = {
            "x-client-id": settings.CASHFREE_CLIENT_ID,
            "x-client-secret": settings.CASHFREE_CLIENT_SECRET,
            "x-api-version": "2025-01-01",
            "Content-Type": "application/json"
        }

        data = {
            "order_id": order_id,
            "order_amount": amount,
            "order_currency": currency,
            "customer_details": {
                "customer_id": str(request.user.id),
                "customer_email": form.email,
                "customer_phone": request.user.user_profile.phone,
            },
            "order_meta": {
                "return_url": f"https://yourfrontend.com/payment-status?order_id={order_id}"
            }
        }

        res = requests.post(f"{settings.CASHFREE_BASE_URL}/orders", headers=headers, json=data)
        res_data = res.json()

        if res.status_code == 200:
            Payment.objects.create(
                id=uuid.uuid4(),
                user=request.user,
                form_submission=form,
                gateway="cashfree",
                order_id=order_id,
                amount=amount,
                currency=currency,
                status="created",
                provider_response=res_data
            )
            return Response({
                "payment_link": res_data.get("payment_link"),
                "order_id": order_id
            })

        return Response({"error": res_data}, status=400)
