from .views import *
from django.urls import path

urlpatterns = [
    path("create-order/", CreateCashfreeOrderAPIView.as_view(), name="create_cashfree_order"),
]
