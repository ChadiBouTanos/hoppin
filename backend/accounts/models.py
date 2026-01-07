from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    email = models.CharField(max_length=255, unique=True)
    phone = models.CharField(max_length=50, blank=True)
    whatsapp_consent = models.BooleanField(default=False)
    is_admin = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    birth_date = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=20, null=True, blank=True)

    address = models.CharField(max_length=255, null=True, blank=True)
    city = models.CharField(max_length=100, null=True, blank=True)
    country = models.CharField(max_length=100, null=True, blank=True)

    document_type = models.CharField(max_length=50, null=True, blank=True)
    document_number = models.CharField(max_length=50, null=True, blank=True)
    document_front = models.FileField(upload_to="documents/", null=True, blank=True)
    document_back = models.FileField(upload_to="documents/", null=True, blank=True)
    document_verified = models.BooleanField(default=False)

    preferred_language = models.CharField(max_length=10, default="it")
    receive_notifications = models.BooleanField(default=True)

    is_driver = models.BooleanField(default=False)
    driver_verified = models.BooleanField(default=False)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email
