from django.urls import path
from . import views

urlpatterns = [
    # TRIPS
    path('my/', views.MyTripsView.as_view(), name='my_trips'),
    path('<int:pk>/match/', views.toggle_trip_match, name='toggle_match'),  # legacy / opzionale
    path('<int:pk>/', views.TripDetailView.as_view(), name='trip_detail'),
    path('', views.TripListCreateView.as_view(), name='trip_list_create'),

    # MATCHES
    path('matches/', views.TripMatchListCreateView.as_view(), name='tripmatch_list_create'),
    path('matches/<int:pk>/', views.TripMatchDeleteView.as_view(), name='tripmatch_delete'),
    path('matches/<int:pk>/archive/', views.archive_match, name='tripmatch_archive'),
]
