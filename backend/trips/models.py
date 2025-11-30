from django.db import models
from django.conf import settings

class Trip(models.Model):
    ROLE_CHOICES = [
        ('driver', 'Driver'),
        ('passenger', 'Passenger'),
        ('both', 'Both'),
    ]
    
    RECURRENCE_CHOICES = [
        ('once', 'Once'),
        ('weekly', 'Weekly'),
        ('custom', 'Custom'),
    ]
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='trips'
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    departure_location = models.CharField(max_length=255)
    arrival_location = models.CharField(max_length=255)
    date = models.DateField()
    arrival_time = models.TimeField()
    recurrence = models.CharField(
        max_length=20,
        choices=RECURRENCE_CHOICES,
        default='once'
    )
    recurring_days = models.JSONField(null=True, blank=True)  # ["monday", "wednesday"]
    is_matched = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    available_seats = models.PositiveSmallIntegerField(null=True, blank=True)
    rules = models.TextField(blank=True)
    flexibility_before_minutes = models.IntegerField(null=True, blank=True)
    flexibility_after_minutes = models.IntegerField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} - {self.role} - {self.departure_location} to {self.arrival_location}"


class TripMatch(models.Model):
    driver_trip = models.ForeignKey(
        Trip,
        on_delete=models.CASCADE,
        related_name='driver_matches'
    )
    passenger_trip = models.ForeignKey(
        Trip,
        on_delete=models.CASCADE,
        related_name='passenger_matches'
    )
    is_archived = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('driver_trip', 'passenger_trip')
        ordering = ['-created_at']

    def __str__(self):
        return f"Match: driver={self.driver_trip_id} passenger={self.passenger_trip_id}"


def update_trip_matched_flags(trip_ids):
    """
    Aggiorna il flag is_matched sui Trip passati in base alla presenza
    di ALMENO UN TripMatch, attivo o archiviato.
    Questo significa: se un viaggio è mai stato abbinato, resta segnato come abbinato.
    """
    from django.db.models import Exists, OuterRef
    any_matches_as_driver = TripMatch.objects.filter(
        driver_trip_id=OuterRef('pk')
    )
    any_matches_as_passenger = TripMatch.objects.filter(
        passenger_trip_id=OuterRef('pk')
    )

    # prima azzero
    Trip.objects.filter(id__in=trip_ids).update(is_matched=False)

    # poi rimetto True se esiste QUALSIASI match
    Trip.objects.filter(id__in=trip_ids).update(
        is_matched=Exists(any_matches_as_driver) | Exists(any_matches_as_passenger)
    )
