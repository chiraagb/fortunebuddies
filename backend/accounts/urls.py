# yourapp/urls.py
from django.urls import path
from .views import *
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path("auth/firebase/", FirebaseLogin.as_view(), name="firebase_login"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]
