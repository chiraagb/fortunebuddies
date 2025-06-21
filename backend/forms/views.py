from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import SelectOption, FormSubmission
from .serializers import FormSubmissionSerializer
from accounts.models import UserProfile
from django.utils import timezone

class FormOptionsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        options = SelectOption.objects.all()
        data = {}
        for opt in options:
            data.setdefault(opt.option_type, []).append(opt.value)
        return Response(data)

class FormSubmissionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = FormSubmissionSerializer(data=request.data)
        if serializer.is_valid():
            # Save with pending payment status
            form_submission = serializer.save(user=request.user)

            return Response({
                "message": "Form submitted successfully! Please complete the payment.",
                "form_id": str(form_submission.id),
            })
        return Response(serializer.errors, status=400)


class CheckSubmissionStatus(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        latest_form = FormSubmission.objects.filter(user=user).order_by('-created_at').first()
        user_profile, _ = UserProfile.objects.get_or_create(user=user)

        if latest_form:
            latest_payment = latest_form.payments.order_by('-created_at').first()

            if latest_payment and latest_payment.status == 'pending':
                return Response({
                    "can_submit": False,
                    "redirect_to": "payment",
                    "form_id": str(latest_form.id),
                })

            user_profile, _ = UserProfile.objects.get_or_create(user=user)
            
            if latest_payment and latest_payment.status == 'success' and user_profile.next_allowed_submission and user_profile.next_allowed_submission > timezone.now():
                return Response({
                    "can_submit": False,
                    "next_allowed_submission": user_profile.next_allowed_submission.isoformat(),
                    "redirect_to": "wait"
                })


        return Response({"can_submit": True, "redirect_to": "form"})
