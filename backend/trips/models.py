from django.db import models

# Create your models here.
from django.db import models
from django.conf import settings

class Trip(models.Model):
    ROLE_CHOICES = [
        ('driver', 'Driver'),
        ('passenger', 'Passenger'),
    ]
    
    RECURRENCE_CHOICES = [
        ('once', 'Once'),
        ('weekly', 'Weekly'),
        ('daily', 'Daily'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='trips')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    departure_location = models.CharField(max_length=255)
    arrival_location = models.CharField(max_length=255)
    date = models.DateField()
    arrival_time = models.TimeField()
    recurrence = models.CharField(max_length=20, choices=RECURRENCE_CHOICES, default='once')
    recurring_days = models.JSONField(null=True, blank=True)  # e.g., ["monday", "wednesday"]
    is_matched = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.role} - {self.departure_location} to {self.arrival_location}"
