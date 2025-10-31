# pacientes/models.py
from django.db import models
import uuid
from core.utils.security_utils import encrypt_data, decrypt_data, create_search_hash

class Madre(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    rut_hash = models.CharField(max_length=64, unique=True, blank=True, null=True, db_index=True)
    nombre_hash = models.CharField(max_length=64, blank=True, null=True, db_index=True)
    telefono_hash = models.CharField(max_length=64, blank=True, null=True, db_index=True)
    rut_encrypted = models.TextField(blank=True, null=True)
    nombre_encrypted = models.TextField(blank=True, null=True)
    telefono_encrypted = models.TextField(blank=True, null=True)
    antecedentes_medicos = models.TextField(blank=True, null=True) # Cifrado
    
    ficha_clinica_id = models.CharField(max_length=255, unique=True, blank=True, null=True)
    fecha_nacimiento = models.DateField(blank=True, null=True)
    nacionalidad = models.CharField(max_length=100, blank=True, null=True)
    pertenece_pueblo_originario = models.BooleanField(default=False)
    prevision = models.CharField(max_length=50, choices=[('FONASA', 'FONASA'), ('ISAPRE', 'ISAPRE'), ('PARTICULAR', 'PARTICULAR'), ('NINGUNA', 'NINGUNA')], blank=True, null=True)
    fecha_registro = models.DateTimeField(auto_now_add=True)
    # FALTA: usuario_registro y turno_asignado (para filtro de enfermeras)

    _rut_plain = None
    _nombre_plain = None
    _telefono_plain = None
    _antecedentes_plain = None

    class Meta:
        db_table = 'Madre'
        verbose_name = 'Madre'
        verbose_name_plural = 'Madres'
        ordering = ['-fecha_registro']

    def save(self, *args, **kwargs):
        # Usar valores planos si se proporcionaron
        if self._rut_plain:
            self.rut_hash = create_search_hash(self._rut_plain)
            self.rut_encrypted = encrypt_data(self._rut_plain)
            self._rut_plain = None
        if self._nombre_plain:
            self.nombre_hash = create_search_hash(self._nombre_plain)
            self.nombre_encrypted = encrypt_data(self._nombre_plain)
            self._nombre_plain = None
        if self._telefono_plain:
            self.telefono_hash = create_search_hash(self._telefono_plain)
            self.telefono_encrypted = encrypt_data(self._telefono_plain)
            self._telefono_plain = None
        if self._antecedentes_plain:
            self.antecedentes_medicos = encrypt_data(self._antecedentes_plain)
            self._antecedentes_plain = None

        super().save(*args, **kwargs)

    # Setters para los serializers
    def set_rut(self, value): self._rut_plain = value
    def set_nombre(self, value): self._nombre_plain = value
    def set_telefono(self, value): self._telefono_plain = value
    def set_antecedentes(self, value): self._antecedentes_plain = value

    @property
    def rut(self): return decrypt_data(self.rut_encrypted)
    @property
    def nombre(self): return decrypt_data(self.nombre_encrypted)
    @property
    def telefono(self): return decrypt_data(self.telefono_encrypted)
    @property
    def antecedentes(self): return decrypt_data(self.antecedentes_medicos)

    def __str__(self): return f"Madre ID: {self.id}"