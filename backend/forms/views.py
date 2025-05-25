from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import SelectOption, FormSubmission
from .serializers import FormSubmissionSerializer

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
            serializer.save(user=request.user)  # Set the user field
            return Response({"message": "Form submitted successfully!"})
        return Response(serializer.errors, status=400)
