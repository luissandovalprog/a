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
    serializer_class = serializers.UsuarioSerializer
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
        if instance.activo:
            instance.activo = False
            instance.save()
            log_audit(
                self.request.user, self.request,
                "DESACTIVAR_USUARIO",
                instance,
                f"Usuario '{instance.username}' desactivado."
            )

class CurrentUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = serializers.UsuarioSerializer(request.user, context={'request': request})
        return Response(serializer.data)