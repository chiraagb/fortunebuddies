from django.urls import path

from .views import CashfreeWebhookView, CreateCashfreeOrderAPIView

urlpatterns = [
    path("create-order/", CreateCashfreeOrderAPIView.as_view(), name="create_cashfree_order"),
    path("webhook/",      CashfreeWebhookView.as_view(),        name="cashfree_webhook"),
]
