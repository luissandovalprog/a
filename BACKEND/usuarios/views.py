# usuarios/views.py
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from . import models # <--- LÍNEA FALTANTE
from . import serializers # <--- LÍNEA FALTANTE
from . import permissions as custom_permissions
from auditoria.utils import log_audit 

class RolViewSet(viewsets.ModelViewSet):
    queryset = models.Rol.objects.all().order_by('nombre')
    serializer_class = serializers.RolSerializer
    permission_classes = [custom_permissions.IsAdminSistema]

class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = models.Usuario.objects.select_related('rol').order_by('username')
    serializer_class = serializers.UserSerializer
    permission_classes = [custom_permissions.CanManageUsers]

    def perform_create(self, serializer):
        instance = serializer.save()
        log_audit(
            self.request.user, self.request,
            "CREAR_USUARIO",
            instance,
            f"Usuario '{instance.username}' ({instance.rol.nombre}) creado."
        )

    def perform_update(self, serializer):
        instance = serializer.save()
        log_audit(
            self.request.user, self.request,
            "MODIFICAR_USUARIO",
            instance,
            f"Usuario '{instance.username}' actualizado."
        )

    def perform_destroy(self, instance):
        # --- INICIO DE CORRECCIÓN ---
        if instance.is_active:
            instance.is_active = False # Cambiado 'activo' a 'is_active'
            instance.save()
            log_audit(
        # --- FIN DE CORRECCIÓN ---
                self.request.user, self.request,
                "DESACTIVAR_USUARIO",
                instance,
                f"Usuario '{instance.username}' desactivado."
            )

class CurrentUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            # Solución 1: Buscamos el 'Usuario' personalizado (de models.py) 
            # usando el 'username' del 'User' de Django (request.user).
            usuario_custom = models.Usuario.objects.get(username=request.user.username)
            
            # Solución 2: Usamos 'UserSerializer' (como se define en serializers.py)
            serializer = serializers.UserSerializer(usuario_custom, context={'request': request})
            return Response(serializer.data)
        
        except models.Usuario.DoesNotExist:
            return Response(
                {"detail": "El usuario autenticado no existe en el sistema."},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            # Captura de error genérica
            return Response(
                {"detail": f"Error interno al obtener datos del usuario: {e}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )