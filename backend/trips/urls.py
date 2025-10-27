from django.urls import path
from . import views

urlpatterns = [
    path('my/', views.MyTripsView.as_view(), name='my_trips'),  # Must be first!
    path('<int:pk>/match/', views.toggle_trip_match, name='toggle_match'),
    path('', views.TripListCreateView.as_view(), name='trip_list_create'),  # Handles both GET (admin) and POST
]