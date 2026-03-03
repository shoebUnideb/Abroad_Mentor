from rest_framework import serializers
from .models import CustomUser


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'role', 'is_approved', 'first_name', 'last_name']
        read_only_fields = ['id', 'role', 'is_approved']


class UserAdminSerializer(serializers.ModelSerializer):
    """Full serializer for superadmin use."""
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'role', 'is_approved', 'first_name', 'last_name', 'is_active', 'date_joined']
