# usuarios/models.py
from django.db import models
import uuid
from core.utils.security_utils import encrypt_data, decrypt_data, hash_password

class Rol(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nombre = models.CharField(max_length=50, unique=True)
    descripcion = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'Rol'
        verbose_name = 'Rol'
        verbose_name_plural = 'Roles'
        ordering = ['nombre']

    def __str__(self):
        return self.nombre

class Usuario(models.Model):
    TURNO_NINGUNO = 'Ninguno'
    TURNO_MANANA = 'Mañana'
    TURNO_TARDE = 'Tarde'
    TURNO_NOCHE = 'Noche'
    TURNO_CHOICES = [
        (TURNO_NINGUNO, 'Sin Turno Asignado'),
        (TURNO_MANANA, 'Mañana (Diurno)'),
        (TURNO_TARDE, 'Tarde (Vespertino)'),
        (TURNO_NOCHE, 'Noche (Nocturno)'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    rut = models.TextField(unique=True) # Cifrado
    nombre_completo = models.TextField() # Cifrado
    email = models.TextField(unique=True, blank=True, null=True) # Cifrado
    password_hash = models.CharField(max_length=255) # Hash
    username = models.CharField(max_length=100, unique=True)
    rol = models.ForeignKey(Rol, on_delete=models.PROTECT, related_name='usuarios')
    turno = models.CharField(max_length=20, choices=TURNO_CHOICES, default=TURNO_NINGUNO, blank=True, null=True)
    activo = models.BooleanField(default=True, db_index=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_modificacion = models.DateTimeField(auto_now=True)

    _plain_password = None

    class Meta:
        db_table = 'Usuario'
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'
        ordering = ['username']

    def set_password(self, raw_password):
        self._plain_password = raw_password

    def save(self, *args, **kwargs):
        if self._plain_password:
            self.password_hash = hash_password(self._plain_password)
            self._plain_password = None
        
        # Cifrar (asumiendo que los valores planos se asignaron antes de llamar a save)
        if self.rut and not self.rut.startswith('gAAAAA'): self.rut = encrypt_data(str(self.rut))
        if self.nombre_completo and not self.nombre_completo.startswith('gAAAAA'): self.nombre_completo = encrypt_data(str(self.nombre_completo))
        if self.email and not self.email.startswith('gAAAAA'): self.email = encrypt_data(str(self.email))

        super().save(*args, **kwargs)

    @property
    def decrypted_rut(self): return decrypt_data(self.rut)
    @property
    def decrypted_nombre(self): return decrypt_data(self.nombre_completo)
    @property
    def decrypted_email(self): return decrypt_data(self.email)

    def __str__(self):
        return f"{self.username} ({self.rol.nombre})"