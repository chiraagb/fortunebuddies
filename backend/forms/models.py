from django.db import models
from django.contrib.auth.models import User
import uuid

class SelectOption(models.Model):
    OPTION_TYPES = (
        ('location', 'Meetup Location'),
        ('time', 'Preferred Time'),
        ('language', 'Language'),
        ('occupation', 'Occupation'),
        ('weekend', 'Weekend Activity'),
        ('hobby', 'Hobby'),
        ('movie', 'Movie Genre'),
        ('music', 'Music Genre'),
        ('cuisine', 'Cuisine Type'),
        ('group_activity', 'Group Activity'),
        ('pet', 'Pet'),
    )
    option_type = models.CharField(max_length=20, choices=OPTION_TYPES)
    value = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.get_option_type_display()}: {self.value}"


class FormSubmission(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='form_submissions')
    full_name = models.CharField(max_length=100)
    email = models.EmailField()
    age = models.PositiveIntegerField()
    gender = models.CharField(max_length=10)
    meetup_location = models.CharField(max_length=100)
    preferred_time = models.CharField(max_length=50)
    plus_one = models.CharField(max_length=10)
    languages = models.JSONField(default=list)
    occupation = models.CharField(max_length=100)
    meal_preference = models.CharField(max_length=20)
    venue_preference = models.CharField(max_length=20)
    budget = models.CharField(max_length=10)
    group_activities = models.CharField(max_length=100)
    pets = models.CharField(max_length=50)
    weekends = models.JSONField(default=list)
    hobbies = models.JSONField(default=list)
    movies = models.JSONField(default=list)
    music = models.JSONField(default=list)
    cuisine = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.full_name} - {self.email}"