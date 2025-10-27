from django.contrib import admin

# Register your models here.

from django.contrib import admin
from .models import Trip

@admin.register(Trip)
class TripAdmin(admin.ModelAdmin):
    list_display = ['user', 'role', 'departure_location', 'arrival_location', 'date', 'is_matched', 'created_at']
    list_filter = ['role', 'recurrence', 'is_matched', 'created_at']
    search_fields = ['user__email', 'departure_location', 'arrival_location']
    actions = ['mark_as_matched', 'mark_as_unmatched']
    
    def mark_as_matched(self, request, queryset):
        queryset.update(is_matched=True)
    
    def mark_as_unmatched(self, request, queryset):
        queryset.update(is_matched=False)