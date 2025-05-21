# yourapp/views.py
from django.contrib.auth.models import User
from rest_framework.views      import APIView
from rest_framework.response   import Response
from rest_framework            import status, permissions
from rest_framework_simplejwt.tokens import RefreshToken
from firebase_admin.auth      import verify_id_token, InvalidIdTokenError
from .models                  import UserProfile

class FirebaseLogin(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        id_token = request.data.get("idToken")
        if not id_token:
            return Response({"detail": "idToken required"}, status=400)

        try:
            decoded = verify_id_token(id_token)
            phone   = decoded.get("phone_number")
            if not phone:
                raise InvalidIdTokenError("no phone")
        except Exception as e:
            return Response({"detail": f"Invalid token: {str(e)}"}, status=400)

        # create or update user
        user, created = User.objects.get_or_create(username=phone)
        if created:
            user.set_unusable_password()
            user.save()
            UserProfile.objects.create(user=user, phone=phone, is_verified=True)
        else:
            profile = user.user_profile
            profile.is_verified = True
            profile.save()

        # issue JWT
        refresh = RefreshToken.for_user(user)
        return Response({
            "access":  str(refresh.access_token),
            "refresh": str(refresh),
        })


# you get /api/token/refresh/ via simplejwt out of the box
