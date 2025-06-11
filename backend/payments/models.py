from django.db import models
from django.contrib.auth.models import User
from forms.models import FormSubmission
from django.utils import timezone

class Payment(models.Model):
    PAYMENT_STATUS_CHOICES = [
        ('created', 'Created'),         # Order created but not paid
        ('pending', 'Pending'),         # Payment initiated but not confirmed
        ('success', 'Success'),         # Payment successful
        ('failed', 'Failed'),           # Payment failed
        ('cancelled', 'Cancelled'),     # User cancelled or timed out
    ]

    id = models.UUIDField(primary_key=True, editable=False, unique=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payments')
    form_submission = models.ForeignKey(FormSubmission, on_delete=models.CASCADE, related_name='payments')
    
    gateway = models.CharField(max_length=50)
    order_id = models.CharField(max_length=255, unique=True)  # e.g., Cashfree order_id
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=10, default='INR')

    status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES)
    provider_response = models.JSONField(blank=True, null=True)  # Store full API response from Cashfree

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    paid_at = models.DateTimeField(null=True, blank=True)

    def mark_status(self, status, response_data):
        self.status = status
        self.provider_response = response_data
        if status == 'success':
            self.paid_at = timezone.now()
        self.save()
        
    def __str__(self):
        phone = self.user.user_profile.phone if hasattr(self.user, 'user_profile') else 'NoPhone'
        full_name = self.form_submission.full_name if self.form_submission else 'NoName'
        return f"{phone} | {full_name} | {self.gateway.upper()} | {self.order_id} | {self.status}"


