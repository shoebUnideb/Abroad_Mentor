from django.contrib.auth import authenticate, login, logout
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import CustomUser
from .serializers import UserSerializer, UserAdminSerializer


# ── Auth ──────────────────────────────────────

@api_view(['POST'])
@permission_classes([AllowAny])
def api_login(request):
    """
    Body: { "username": "...", "password": "..." }
    Returns the logged-in user or 400.
    """
    username = request.data.get('username', '').strip()
    password = request.data.get('password', '').strip()

    user = authenticate(request, username=username, password=password)
    if user is None:
        return Response({'detail': 'Invalid username or password.'}, status=status.HTTP_400_BAD_REQUEST)

    if user.role == 'mentor' and not user.is_approved:
        return Response(
            {'detail': 'Your mentor account is pending approval.'},
            status=status.HTTP_403_FORBIDDEN,
        )

    login(request, user)
    return Response(UserSerializer(user).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_logout(request):
    logout(request)
    return Response({'detail': 'Logged out.'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_me(request):
    """Return the currently logged-in user."""
    return Response(UserSerializer(request.user).data)


# ── User management (superadmin only) ─────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_users_list(request):
    if request.user.role != 'superadmin':
        return Response({'detail': 'Forbidden.'}, status=status.HTTP_403_FORBIDDEN)
    users = CustomUser.objects.all().order_by('role', 'username')
    return Response(UserAdminSerializer(users, many=True).data)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def api_user_detail(request, pk):
    """Superadmin can update role / is_approved."""
    if request.user.role != 'superadmin':
        return Response({'detail': 'Forbidden.'}, status=status.HTTP_403_FORBIDDEN)
    user = CustomUser.objects.get(pk=pk)
    serializer = UserAdminSerializer(user, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)


# ── CSRF helper ────────────────────────────────

@api_view(['GET'])
@permission_classes([AllowAny])
def api_csrf(request):
    """Endpoint the frontend can hit to get a CSRF cookie before login."""
    from django.middleware.csrf import get_token
    get_token(request)
    return Response({'detail': 'CSRF cookie set.'})
