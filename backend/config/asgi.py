"""
ASGI config for FortuneBuddies.

Handles both HTTP (Django) and WebSocket (Django Channels) traffic.
WebSocket consumer routes are registered in each app's routing.py;
add them to `websocket_urlpatterns` below when you build messaging.
"""

import os

from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from django.core.asgi import get_asgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

# Initialise Django before importing any app code
django_asgi_app = get_asgi_application()

# ── WebSocket URL patterns ────────────────────────────────────────────────────
# Add consumer routes here as you build real-time features, e.g.:
#
#   from messaging.routing import websocket_urlpatterns as messaging_ws
#   websocket_urlpatterns = messaging_ws
#
websocket_urlpatterns = [
    # path("ws/chat/<room_id>/", consumers.ChatConsumer.as_asgi()),
]

application = ProtocolTypeRouter(
    {
        # Standard HTTP → Django
        "http": django_asgi_app,
        # WebSocket → Channels (JWT-aware middleware stack)
        "websocket": AllowedHostsOriginValidator(
            AuthMiddlewareStack(
                URLRouter(websocket_urlpatterns)
            )
        ),
    }
)
