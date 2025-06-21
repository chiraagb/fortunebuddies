from django.urls import path, include
from .views import *

urlpatterns = [
    path("get-options/", FormOptionsView.as_view(), name="form_options"),
    path("submit-form/", FormSubmissionView.as_view(), name="form_submission"),
    path("check-submission-status/", CheckSubmissionStatus.as_view(), name="check_submission_status"),
]
