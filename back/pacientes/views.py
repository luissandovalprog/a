# pacientes/views.py
from rest_framework import viewsets, permissions
from . import models # <--- LÍNEA FALTANTE
from . import serializers # <--- LÍNEA FALTANTE
from usuarios import permissions as custom_permissions
from auditoria.utils import log_audit

class MadreViewSet(viewsets.ModelViewSet):
    queryset = models.Madre.objects.all().order_by('-fecha_registro')
    serializer_class = serializers.MadreSerializer
    permission_classes = [custom_permissions.CanManageMadre]

    def perform_create(self, serializer):
        instance = serializer.save() 
        log_audit(self.request.user, self.request, "CREAR_PACIENTE", instance, f"Madre ID {instance.id} admitida.")

    def perform_update(self, serializer):
        user = self.request.user
        if user.rol.nombre == custom_permissions.ROL_ADMINISTRATIVO:
            allowed_fields = {'rut_write', 'nombre_write', 'telefono_write', 'fecha_nacimiento', 'nacionalidad', 'pertenece_pueblo_originario', 'prevision', 'ficha_clinica_id'}
            for field in serializer.validated_data.keys():
                if field not in allowed_fields:
                    raise permissions.PermissionDenied(f"Rol Administrativo no puede modificar el campo '{field}'.")

        instance = serializer.save()
        log_audit(self.request.user, self.request, "EDITAR_PACIENTE", instance, f"Madre ID {instance.id} actualizada.")