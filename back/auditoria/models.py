# auditoria/models.py
from django.db import models
import uuid
from core.utils.security_utils import encrypt_data, decrypt_data
from usuarios.models import Usuario # Importar de la app 'usuarios'

class LogAuditoria(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    usuario = models.ForeignKey(Usuario, on_delete=models.SET_NULL, related_name='logs_auditoria', null=True, blank=True)
    accion = models.CharField(max_length=255, db_index=True)
    tabla_afectada = models.CharField(max_length=100, blank=True, null=True, db_index=True)
    registro_id_uuid = models.UUIDField(blank=True, null=True, db_index=True)
    detalles = models.TextField(blank=True, null=True) # Cifrado
    ip_usuario = models.CharField(max_length=45, blank=True, null=True)
    fecha_accion = models.DateTimeField(auto_now_add=True, db_index=True)

    _plain_detalles = None

    class Meta:
        db_table = 'LogAuditoria'
        verbose_name = 'Log de Auditoría'
        verbose_name_plural = 'Logs de Auditoría'
        ordering = ['-fecha_accion']

    def set_detalles(self, value): self._plain_detalles = value

    def save(self, *args, **kwargs):
        if self._plain_detalles:
            self.detalles = encrypt_data(str(self._plain_detalles))
            self._plain_detalles = None
        super().save(*args, **kwargs)

    @property
    def decrypted_detalles(self): return decrypt_data(self.detalles)

    def __str__(self):
        user_str = self.usuario.username if self.usuario else "Usuario Desconocido"
        return f"{user_str} - {self.accion} - {self.fecha_accion.strftime('%Y-%m-%d %H:%M')}"