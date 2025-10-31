# auditoria/views.py
from rest_framework import viewsets
from . import models # <--- LÍNEA FALTANTE
from . import serializers # <--- LÍNEA FALTANTE
from usuarios import permissions as custom_permissions

class LogAuditoriaViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint para ver Logs de Auditoría (Solo Admin Sistema).
    """
    queryset = models.LogAuditoria.objects.select_related('usuario').order_by('-fecha_accion')
    serializer_class = serializers.LogAuditoriaSerializer
    permission_classes = [custom_permissions.CanReadLogs]