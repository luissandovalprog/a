# usuarios/backends.py
from django.contrib.auth.backends import BaseBackend
from .models import Usuario
from core.utils.security_utils import check_password # <- Ruta actualizada

class CustomUserModelBackend(BaseBackend):
    """
    Backend de autenticación para el modelo Usuario personalizado.
    Verifica las credenciales contra el campo 'password_hash'.
    """

    def authenticate(self, request, username=None, password=None, **kwargs):
        try:
            user = Usuario.objects.get(username=username)
            if user.activo and check_password(password, user.password_hash):
                return user
        except Usuario.DoesNotExist:
            return None
        except Exception as e:
            print(f"Error en CustomUserModelBackend: {e}")
            return None
        return None

    def get_user(self, user_id):
        try:
            return Usuario.objects.get(pk=user_id)
        except Usuario.DoesNotExist:
            return None