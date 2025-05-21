from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.conf import settings
import requests

# Create your views here.

class SendOtpView(APIView):
    def post(self, request):
        phone = request.data.get("phone")
        if not phone:
            return Response({"error": "Phone number required"}, status=400)

        payload = {
            "mobile": phone,
        }

        headers = {
            "authkey": settings.MSG91_AUTH_KEY,
            "Content-Type": "application/json",
        }

        response = requests.post("https://control.msg91.com/api/v5/otp", json=payload, headers=headers)

        if response.status_code == 200:
            return Response({"message": "OTP sent","response":response}, status=200)
        else:
            return Response({"error": "Failed to send OTP", "detail": response.json()}, status=500)
    
    
class VerifyOtpView(APIView):
    def post(self, request):
        # Logic to verify OTP
        return Response({"message": "OTP verified successfully"}, status=200)

