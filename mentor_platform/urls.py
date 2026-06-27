"""mentor_platform URL Configuration"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.http import FileResponse
from django.views.static import serve
import os

def spa_index(request, path=''):
    return FileResponse(
        open(os.path.join(settings.BASE_DIR, 'frontend', 'dist', 'index.html'), 'rb'),
        content_type='text/html',
    )

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.api_urls')),
    path('api/',      include('core.api_urls')),
    path('api/',      include('org_portal.api_urls')),
    re_path(r'^assets/(?P<path>.*)$', serve, {'document_root': os.path.join(settings.BASE_DIR, 'frontend', 'dist', 'assets')}),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) + [
    re_path(r'^.*$', spa_index),
]
