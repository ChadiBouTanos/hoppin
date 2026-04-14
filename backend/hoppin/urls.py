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

from django.http import FileResponse, Http404, HttpResponse
from django.conf import settings
import os
from django.contrib import admin
from django.urls import path, include
from trips.models import Event
from trips.views import (
    notify_share,
    EventListCreateView,
    EventDetailView,
    EventByIdView,
    EventRegistrationCreateView,
    EventRegistrationListView,
)

SITE_URL = 'https://hoppin.cloud'


def sitemap_xml(request):
    """Sitemap dinamica con homepage + tutti gli eventi attivi."""
    from xml.sax.saxutils import escape
    urls = [
        {'loc': SITE_URL + '/', 'priority': '1.0', 'changefreq': 'weekly', 'lastmod': None},
    ]
    for ev in Event.objects.filter(is_active=True).only('slug', 'created_at'):
        urls.append({
            'loc': f'{SITE_URL}/eventi/{ev.slug}',
            'priority': '0.8',
            'changefreq': 'weekly',
            'lastmod': ev.created_at.strftime('%Y-%m-%d') if ev.created_at else None,
        })

    parts = ['<?xml version="1.0" encoding="UTF-8"?>',
             '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for u in urls:
        parts.append('  <url>')
        parts.append(f'    <loc>{escape(u["loc"])}</loc>')
        if u['lastmod']:
            parts.append(f'    <lastmod>{u["lastmod"]}</lastmod>')
        parts.append(f'    <changefreq>{u["changefreq"]}</changefreq>')
        parts.append(f'    <priority>{u["priority"]}</priority>')
        parts.append('  </url>')
    parts.append('</urlset>')
    return HttpResponse('\n'.join(parts), content_type='application/xml')


def robots_txt(request):
    body = (
        "User-agent: *\n"
        "Allow: /\n\n"
        f"Sitemap: {SITE_URL}/sitemap.xml\n"
    )
    return HttpResponse(body, content_type='text/plain')


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
    path('sitemap.xml', sitemap_xml, name='sitemap'),
    path('robots.txt', robots_txt, name='robots'),
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