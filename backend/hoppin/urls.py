"""
URL configuration for hoppin project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.http import FileResponse, Http404
from django.conf import settings
import os
from django.contrib import admin
from django.urls import path, include
from trips.views import (
    notify_share,
    EventListCreateView,
    EventDetailView,
    EventByIdView,
    EventRegistrationCreateView,
    EventRegistrationListView,
)

def serve_logo(request):
    """
    View to serve the logo image
    """
    # Define the path to your image
    image_path = os.path.join(settings.MEDIA_ROOT, 'images', 'logo.png')
    print(image_path)
    
    # Check if file exists
    if not os.path.exists(image_path):
        raise Http404("Image not found")
    
    # Open and return the image file
    try:
        img = open(image_path, 'rb')
        return FileResponse(img, content_type='image/png')
    except IOError:
        raise Http404("Image not found")

urlpatterns = [
    path('images/logo.png', serve_logo, name='logo'),
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/trips/', include('trips.urls')),
    path("api/admin/notify-share/", notify_share, name="notify_share"),

    # Events
    path('api/events/', EventListCreateView.as_view(), name='event_list_create'),
    path('api/events/register/', EventRegistrationCreateView.as_view(), name='event_register'),
    path('api/events/by-id/<int:pk>/', EventByIdView.as_view(), name='event_by_id'),
    path('api/events/<slug:slug>/registrations/', EventRegistrationListView.as_view(), name='event_registrations'),
    path('api/events/<slug:slug>/', EventDetailView.as_view(), name='event_detail'),
]