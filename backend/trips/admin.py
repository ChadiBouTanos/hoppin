from django.contrib import admin
from .models import Trip, Event, EventRegistration


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


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ['title', 'slug', 'is_active', 'created_at']
    list_filter = ['is_active']
    search_fields = ['title', 'slug']
    prepopulated_fields = {'slug': ('title',)}


@admin.register(EventRegistration)
class EventRegistrationAdmin(admin.ModelAdmin):
    list_display = ['contact', 'event', 'role', 'departure_city', 'event_date', 'created_at']
    list_filter = ['role', 'event', 'created_at']
    search_fields = ['contact', 'departure_city']
