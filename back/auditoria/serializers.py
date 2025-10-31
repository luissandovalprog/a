# auditoria/serializers.py
from rest_framework import serializers
from .models import LogAuditoria

class LogAuditoriaSerializer(serializers.ModelSerializer):
    usuario_username = serializers.CharField(source='usuario.username', read_only=True, allow_null=True)
    detalles = serializers.CharField(source='decrypted_detalles', read_only=True)

    class Meta:
        model = LogAuditoria
        fields = [
            'id', 'usuario', 'usuario_username', 'accion', 'tabla_afectada',
            'registro_id_uuid', 'detalles', 'ip_usuario', 'fecha_accion'
        ]