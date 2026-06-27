import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mentor_platform.settings')

# Initialize Django ASGI app early to populate AppRegistry
django_asgi_app = get_asgi_application()

import core.routing        # noqa: E402 — must be after Django setup
import org_portal.routing  # noqa: E402
from mentor_platform.jwt_middleware import JWTAuthMiddleware  # noqa: E402

all_ws_patterns = core.routing.websocket_urlpatterns + org_portal.routing.websocket_urlpatterns

application = ProtocolTypeRouter({
    'http': django_asgi_app,
    'websocket': JWTAuthMiddleware(
        URLRouter(all_ws_patterns)
    ),
})
