from django.urls import path
from .views import (
    TripListCreateView,
    MyTripsView,
    toggle_trip_match,
    TripDetailView
)

urlpatterns = [
    # ATTENZIONE: my/ deve stare prima di <int:pk> altrimenti va in conflitto
    path('my/', MyTripsView.as_view(), name='my_trips'),
    # DELETE / GET /api/trips/<id>/
    path('<int:pk>/', TripDetailView.as_view(), name='trip_detail'),
    # Toggle match (admin)
    path('<int:pk>/match/', toggle_trip_match, name='toggle_match'),
    # Admin GET list + POST create
    path('', TripListCreateView.as_view(), name='trip_list_create'),
]
