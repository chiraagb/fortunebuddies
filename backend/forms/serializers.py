from rest_framework import serializers
from .models import FormSubmission

class FormSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = FormSubmission
        exclude = ['user', 'created_at', 'updated_at']  # user will be set from request
