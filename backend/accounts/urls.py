from django.urls import path
from .views import *
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('send-otp/', SendOtpView.as_view(), name='send_otp'),
    path('verify-otp/', VerifyOtpView.as_view(), name='verify_otp'),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]
