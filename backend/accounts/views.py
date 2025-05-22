from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from django.conf import settings
import requests
from rest_framework_simplejwt.tokens import RefreshToken
from .models import UserProfile

# Create your views here.

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import requests
from django.conf import settings

class SendOtpView(APIView):
    def post(self, request):
        phone = request.data.get("phone")
        if not phone:
            return Response({"error": "Phone number required."}, status=status.HTTP_400_BAD_REQUEST)

        url = (
            f"https://cpaas.messagecentral.com/verification/v3/send"
            f"?countryCode=91&customerId=C-FDADCCFFFC2044E&flowType=SMS&mobileNumber={phone}"
        )

        headers = {
            "authToken": settings.MESSAGE_CENTRAL_AUTH_KEY
        }

        try:
            response = requests.post(url, headers=headers)
        except requests.RequestException as e:
            return Response(
                {"error": "Could not connect to OTP service", "detail": str(e)},
                status=status.HTTP_502_BAD_GATEWAY
            )

        print("Auth token:", settings.MESSAGE_CENTRAL_AUTH_KEY)
        try:

            print("STATUS CODE:", response.status_code)
            print("HEADERS:", response.headers)
            print("RESPONSE TEXT:", response.text)
            response_data = response.json()
        except ValueError:
            return Response(
                {"error": "Invalid JSON response from OTP service", "raw": response.text},
                status=status.HTTP_502_BAD_GATEWAY
            )

        if response.status_code == 200 and response_data.get("responseCode") == 200:
            data = response_data.get("data", {})
            verification_id = data.get("verificationId")
            if verification_id:
                return Response({
                    "message": "OTP sent successfully.",
                    "verificationId": verification_id,
                    "transactionId": data.get("transactionId"),
                    "timeout": data.get("timeout")
                }, status=status.HTTP_200_OK)

            return Response({
                "error": "Missing verificationId in response",
                "response": response_data
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({
            "error": "Failed to send OTP",
            "status_code": response.status_code,
            "response": response_data
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


    

class VerifyOtpView(APIView):
    def post(self, request):
        # Get OTP, verificationId, and phone from the request data
        otp = request.data.get("otp")
        verification_id = request.data.get("verificationId")
        phone = request.data.get("phone")

        if not otp or not verification_id or not phone:
            return Response({"error": "OTP, verificationId, and phone number are required."}, status=status.HTTP_400_BAD_REQUEST)

        # Construct the URL for OTP verification
        url = f"https://cpaas.messagecentral.com/verification/v3/validateOtp?countryCode=91&mobileNumber={phone}&verificationId={verification_id}&customerId=C-FDADCCFFFC2044E&code={otp}"

        # Add the auth token to the headers
        headers = {
            "authToken": settings.MESSAGE_CENTRAL_AUTH_KEY  # The auth key should be stored in Django settings
        }

        # Send the request to MessageCentral API for OTP verification
        try:
            response = requests.get(url, headers=headers)
            response.raise_for_status()  # This will raise an HTTPError for bad responses (4xx or 5xx)
        except requests.exceptions.RequestException as e:
            return Response({"error": "Error during OTP verification", "detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Check if response is valid JSON
        try:
            response_data = response.json()
        except ValueError:
            return Response({"error": "Invalid response from the OTP verification service"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Check if response_data is None or doesn't contain the expected keys
        if not response_data or "data" not in response_data:
            return Response({"error": "Invalid response structure from OTP verification service"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Extract verification status
        verification_status = response_data.get("data", {}).get("verificationStatus")

        # If OTP is verified successfully, create or update the user
        if verification_status == "VERIFICATION_COMPLETED":
            # Check if the user already exists
            user, created = User.objects.get_or_create(username=phone)

            # If user is created, set a password (or use an unusable password)
            if created:
                user.set_unusable_password()  # Or set a random password
                user.save()

                # Create the user profile and mark it as verified
                UserProfile.objects.create(user=user, phone=phone, is_verified=True)
            else:
                # If user already exists, simply update the profile to mark it as verified
                profile = user.user_profile
                profile.is_verified = True
                profile.save()

            # Issue JWT tokens (access and refresh)
            refresh = RefreshToken.for_user(user)
            return Response({
                "message": "OTP verified successfully.",
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            }, status=status.HTTP_200_OK)

        return Response({"error": "OTP verification failed."}, status=status.HTTP_400_BAD_REQUEST)
