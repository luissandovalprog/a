# partos/views.py
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.utils import timezone
from datetime import timedelta
from . import models # <--- LÍNEA FALTANTE
from . import serializers # <--- LÍNEA FALTANTE
from usuarios import permissions as custom_permissions
from usuarios.models import Usuario as CustomUserModel 
from auditoria.utils import log_audit

VENTANA_EDICION_HORAS = 2

class PartoViewSet(viewsets.ModelViewSet):
    queryset = models.Parto.objects.select_related('madre', 'usuario_registro').order_by('-fecha_parto')
    serializer_class = serializers.PartoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action in ['update', 'partial_update']:
            return [custom_permissions.IsMatrona()]
        elif self.action == 'create':
            return [custom_permissions.IsMatrona()]
        elif self.action == 'anexar_correccion':
             return [custom_permissions.IsMedico()]
        return [custom_permissions.CanReadClinicalData()]

    def get_queryset(self):
        user = self.request.user
        queryset = super().get_queryset()
        if user.rol.nombre in [custom_permissions.ROL_ENFERMERA, custom_permissions.ROL_MATRONA] and user.turno and user.turno != CustomUserModel.TURNO_NINGUNO:
            return queryset.filter(usuario_registro__turno=user.turno)
        return queryset

    def perform_create(self, serializer):
        instance = serializer.save(usuario_registro=self.request.user)
        log_audit(self.request.user, self.request, "CREAR_PARTO", instance, f"Parto ID {instance.id} registrado.")

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        user = request.user
        
        if not custom_permissions.IsAssignedToTurnoOrAdmin().has_object_permission(request, self, instance):
             raise permissions.PermissionDenied(custom_permissions.IsAssignedToTurnoOrAdmin.message)

        if user.rol.nombre == custom_permissions.ROL_MATRONA:
            tiempo_limite = instance.fecha_registro + timedelta(hours=VENTANA_EDICION_HORAS)
            if timezone.now() > tiempo_limite:
                return Response(
                    {"detail": f"La ventana de edición de {VENTANA_EDICION_HORAS} horas ha expirado. Use 'Anexar Corrección' (Médico)."},
                    status=status.HTTP_403_FORBIDDEN
                )
            log_audit(user, request, "EDITAR_PARTO", instance, f"Parto ID {instance.id} editado (dentro de ventana).")
            return super().update(request, *args, **kwargs)

        return Response(
            {"detail": "Solo Matronas pueden editar directamente un parto."},
            status=status.HTTP_403_FORBIDDEN
        )

    @action(detail=True, methods=['post'], permission_classes=[custom_permissions.IsMedico])
    def anexar_correccion(self, request, pk=None):
        parto = self.get_object()
        campo = request.data.get('campo')
        valor_nuevo = request.data.get('valor_nuevo')
        justificacion = request.data.get('justificacion')

        if not all([campo, valor_nuevo, justificacion]):
            return Response({"detail": "Faltan campos: 'campo', 'valor_nuevo', 'justificacion'."}, status=status.HTTP_400_BAD_REQUEST)
        
        log_audit(
            request.user, request,
            "ANEXAR_CORRECCION",
            parto,
            f"Corrección anexada por Médico: Campo='{campo}', Nuevo='{valor_nuevo}', Justificación='{justificacion}'"
        )
        return Response({"status": "corrección anexada"}, status=status.HTTP_200_OK)


class RecienNacidoViewSet(viewsets.ModelViewSet):
    queryset = models.RecienNacido.objects.select_related('parto__madre', 'usuario_registro').order_by('-fecha_registro')
    serializer_class = serializers.RecienNacidoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action in ['update', 'partial_update']:
             return [custom_permissions.IsMatrona()]
        elif self.action == 'create':
             return [custom_permissions.IsMatrona()]
        return [custom_permissions.CanReadClinicalData()]

    def get_queryset(self):
        user = self.request.user
        queryset = super().get_queryset()
        if user.rol.nombre in [custom_permissions.ROL_ENFERMERA, custom_permissions.ROL_MATRONA] and user.turno and user.turno != CustomUserModel.TURNO_NINGUNO:
            return queryset.filter(usuario_registro__turno=user.turno)
        return queryset

    def perform_create(self, serializer):
        instance = serializer.save(usuario_registro=self.request.user)
        log_audit(self.request.user, self.request, "CREAR_RECIENNACIDO", instance, f"RN ID {instance.id} registrado.")

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        user = request.user
        if not custom_permissions.IsAssignedToTurnoOrAdmin().has_object_permission(request, self, instance):
             raise permissions.PermissionDenied(custom_permissions.IsAssignedToTurnoOrAdmin.message)

        tiempo_limite = instance.fecha_registro + timedelta(hours=VENTANA_EDICION_HORAS)
        if timezone.now() > tiempo_limite:
            return Response(
                {"detail": f"La ventana de edición de {VENTANA_EDICION_HORAS} horas ha expirado."},
                status=status.HTTP_403_FORBIDDEN
            )
        log_audit(user, request, "EDITAR_RECIENNACIDO", instance, f"RN ID {instance.id} actualizado.")
        return super().update(request, *args, **kwargs)


class PartoDiagnosticoViewSet(viewsets.ModelViewSet):
    queryset = models.PartoDiagnostico.objects.select_related('parto', 'diagnostico').all()
    serializer_class = serializers.PartoDiagnosticoSerializer
    permission_classes = [custom_permissions.IsMatrona | custom_permissions.IsMedico]


class DefuncionViewSet(viewsets.ModelViewSet):
    queryset = models.Defuncion.objects.select_related('recien_nacido', 'madre', 'causa_defuncion', 'usuario_registro').order_by('-fecha_defuncion')
    serializer_class = serializers.DefuncionSerializer
    permission_classes = [custom_permissions.CanManageEpicrisisOrDefuncion]

    def perform_create(self, serializer):
        instance = serializer.save(usuario_registro=self.request.user)
        tipo = "RN" if instance.recien_nacido else "Madre"
        log_audit(self.request.user, self.request, "REGISTRAR_DEFUNCION", instance, f"Defunción ({tipo}) ID {instance.id} registrada.")

    def perform_update(self, serializer):
        instance = serializer.save()
        log_audit(self.request.user, self.request, "EDITAR_DEFUNCION", instance, f"Registro Defunción ID {instance.id} actualizado.")


class DocumentoReferenciaViewSet(viewsets.ModelViewSet):
    queryset = models.DocumentoReferencia.objects.select_related('parto', 'usuario_generacion').order_by('-fecha_generacion')
    serializer_class = serializers.DocumentoReferenciaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
         if self.action == 'create':
             return [custom_permissions.IsMedico()]
         elif self.action in ['update', 'partial_update', 'destroy']:
             return [custom_permissions.IsAdminSistema()]
         return [custom_permissions.CanReadClinicalData()]

    def get_queryset(self):
        user = self.request.user
        queryset = super().get_queryset()
        if user.rol.nombre in [custom_permissions.ROL_ENFERMERA, custom_permissions.ROL_MATRONA] and user.turno and user.turno != CustomUserModel.TURNO_NINGUNO:
            return queryset.filter(parto__usuario_registro__turno=user.turno)
        return queryset

    def perform_create(self, serializer):
        instance = serializer.save(usuario_generacion=self.request.user)
        log_audit(self.request.user, self.request, "CREAR_DOC_REF", instance, f"Referencia '{instance.decrypted_nombre_archivo}' creada.")