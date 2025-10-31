# catalogos/models.py
from django.db import models
import uuid

class DiagnosticoCIE10(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    codigo = models.CharField(max_length=10, unique=True, db_index=True)
    descripcion = models.TextField()
    class Meta: 
        db_table = 'DiagnosticoCIE10'
        verbose_name = 'Diagnóstico CIE-10'
        verbose_name_plural = 'Diagnósticos CIE-10'
        ordering = ['codigo']
    def __str__(self): return f"{self.codigo}: {self.descripcion}"