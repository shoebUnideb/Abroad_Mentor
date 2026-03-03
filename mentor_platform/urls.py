"""mentor_platform URL Configuration"""
from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    # Legacy template-based views
    path('accounts/', include('accounts.urls')),
    path('core/', include('core.urls')),
    # REST API
    path('api/auth/', include('accounts.api_urls')),
    path('api/', include('core.api_urls')),
    path('', RedirectView.as_view(url='/accounts/login/', permanent=False)),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
