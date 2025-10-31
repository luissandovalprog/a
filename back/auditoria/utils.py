# auditoria/utils.py
from django.db import transaction
from .models import LogAuditoria

def log_audit(user, request, action_code, instance=None, details=""):
    if not user or not user.is_authenticated:
        return

    ip_address = request.META.get('REMOTE_ADDR')
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip_address = x_forwarded_for.split(',')[0]

    try:
        log_entry = LogAuditoria(
            usuario=user,
            accion=action_code,
            tabla_afectada=instance._meta.db_table if instance else None,
            registro_id_uuid=instance.id if instance and hasattr(instance, 'id') else None,
            ip_usuario=ip_address
        )
        # Usar el setter para cifrar los detalles
        log_entry.set_detalles(details) 
        log_entry.save()
    except Exception as e:
        print(f"ERROR al guardar log de auditoría para {user.username} - Acción {action_code}: {e}")