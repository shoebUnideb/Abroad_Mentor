from django.urls import path
from . import api_views

urlpatterns = [
    path('csrf/',       api_views.api_csrf,        name='api_csrf'),
    path('login/',      api_views.api_login,        name='api_login'),
    path('logout/',     api_views.api_logout,       name='api_logout'),
    path('me/',         api_views.api_me,           name='api_me'),
    path('users/',      api_views.api_users_list,   name='api_users_list'),
    path('users/<int:pk>/', api_views.api_user_detail, name='api_user_detail'),
]
