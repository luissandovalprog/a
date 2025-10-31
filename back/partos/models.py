# partos/models.py
from django.db import models
import uuid
from core.utils.security_utils import encrypt_data, decrypt_data
# Importar modelos de otras apps
from pacientes.models import Madre
from usuarios.models import Usuario
from catalogos.models import DiagnosticoCIE10

class Parto(models.Model):
    TIPO_PARTO_CHOICES = [('Eutócico', 'Eutócico'), ('Cesárea Electiva', 'Cesárea Electiva'), ('Cesárea Urgencia', 'Cesárea Urgencia'), ('Fórceps', 'Fórceps'), ('Ventosa', 'Ventosa')]
    ANESTESIA_CHOICES = [('Epidural', 'Epidural'), ('Raquídea', 'Raquídea'), ('General', 'General'), ('Otra', 'Otra'), ('Ninguna', 'Ninguna')]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    madre = models.ForeignKey(Madre, on_delete=models.CASCADE, related_name='partos')
    fecha_parto = models.DateTimeField()
    edad_gestacional = models.IntegerField(blank=True, null=True)
    tipo_parto = models.CharField(max_length=50, choices=TIPO_PARTO_CHOICES)
    anestesia = models.CharField(max_length=50, choices=ANESTESIA_CHOICES, blank=True, null=True)
    partograma_data = models.JSONField(blank=True, null=True)
    epicrisis_data = models.JSONField(blank=True, null=True)
    usuario_registro = models.ForeignKey(Usuario, on_delete=models.SET_NULL, related_name='partos_registrados', null=True)
    fecha_registro = models.DateTimeField(auto_now_add=True)
    
    class Meta: 
        db_table = 'Parto'
        verbose_name = 'Parto'
        verbose_name_plural = 'Partos'
        ordering = ['-fecha_parto']
    def __str__(self): return f"Parto ID: {self.id} - Madre ID: {self.madre_id}"

class RecienNacido(models.Model):
    ESTADO_CHOICES = [ ('Vivo', 'Vivo'), ('Nacido Muerto', 'Nacido Muerto'), ]
    SEXO_CHOICES = [ ('Masculino', 'Masculino'), ('Femenino', 'Femenino'), ('Indeterminado', 'Indeterminado'), ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    parto = models.ForeignKey(Parto, on_delete=models.CASCADE, related_name='recien_nacidos')
    rut_provisorio = models.TextField(blank=True, null=True) # Cifrado
    estado_al_nacer = models.CharField(max_length=50, choices=ESTADO_CHOICES)
    sexo = models.CharField(max_length=50, choices=SEXO_CHOICES, blank=True, null=True)
    peso_gramos = models.IntegerField(blank=True, null=True)
    talla_cm = models.DecimalField(max_digits=4, decimal_places=1, blank=True, null=True)
    apgar_1_min = models.SmallIntegerField(blank=True, null=True)
    apgar_5_min = models.SmallIntegerField(blank=True, null=True)
    profilaxis_vit_k = models.BooleanField(blank=True, null=True)
    profilaxis_oftalmica = models.BooleanField(blank=True, null=True)
    usuario_registro = models.ForeignKey(Usuario, on_delete=models.SET_NULL, related_name='recien_nacidos_registrados', null=True)
    fecha_registro = models.DateTimeField(auto_now_add=True)

    _plain_rut_provisorio = None

    class Meta: 
        db_table = 'RecienNacido'
        verbose_name = 'Recién Nacido'
        verbose_name_plural = 'Recién Nacidos'
        ordering = ['-fecha_registro']

    def set_rut_provisorio(self, value): self._plain_rut_provisorio = value

    def save(self, *args, **kwargs):
        if self._plain_rut_provisorio:
            self.rut_provisorio = encrypt_data(str(self._plain_rut_provisorio))
            self._plain_rut_provisorio = None
        super().save(*args, **kwargs)

    @property
    def decrypted_rut_provisorio(self): return decrypt_data(self.rut_provisorio)

    def __str__(self): return f"RN ID: {self.id} - Parto ID: {self.parto_id}"

class PartoDiagnostico(models.Model):
    parto = models.ForeignKey(Parto, on_delete=models.CASCADE)
    diagnostico = models.ForeignKey(DiagnosticoCIE10, on_delete=models.PROTECT)
    class Meta: 
        db_table = 'PartoDiagnostico'
        unique_together = ('parto', 'diagnostico')
        verbose_name = 'Parto-Diagnóstico'
        verbose_name_plural = 'Partos-Diagnósticos'

class Defuncion(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    recien_nacido = models.OneToOneField(RecienNacido, on_delete=models.CASCADE, related_name='defuncion', blank=True, null=True)
    madre = models.OneToOneField(Madre, on_delete=models.CASCADE, related_name='defuncion', blank=True, null=True)
    fecha_defuncion = models.DateTimeField()
    causa_defuncion = models.ForeignKey(DiagnosticoCIE10, on_delete=models.PROTECT, related_name='defunciones')
    usuario_registro = models.ForeignKey(Usuario, on_delete=models.SET_NULL, related_name='defunciones_registradas', null=True)
    fecha_registro = models.DateTimeField(auto_now_add=True)
    class Meta:
        db_table = 'Defuncion'
        verbose_name = 'Defunción'
        verbose_name_plural = 'Defunciones'
        ordering = ['-fecha_defuncion']
        constraints = [ models.CheckConstraint( check=(models.Q(recien_nacido__isnull=False) & models.Q(madre__isnull=True)) | (models.Q(recien_nacido__isnull=True) & models.Q(madre__isnull=False)), name='check_recien_nacido_or_madre' ) ]

class DocumentoReferencia(models.Model):
    TIPO_DOCUMENTO_CHOICES = [ ('EPICRISIS_PDF', 'Epicrisis PDF'), ('REPORTE_EXCEL', 'Reporte Excel'), ('OTRO', 'Otro'), ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    parto = models.ForeignKey(Parto, on_delete=models.CASCADE, related_name='documentos_referencia')
    mongodb_object_id = models.CharField(max_length=255, unique=True)
    nombre_archivo = models.TextField() # Cifrado
    tipo_documento = models.CharField(max_length=50, choices=TIPO_DOCUMENTO_CHOICES, db_index=True)
    usuario_generacion = models.ForeignKey(Usuario, on_delete=models.SET_NULL, related_name='documentos_generados', null=True)
    fecha_generacion = models.DateTimeField(auto_now_add=True)

    _plain_nombre_archivo = None

    class Meta: 
        db_table = 'DocumentoReferencia'
        verbose_name = 'Referencia de Documento'
        verbose_name_plural = 'Referencias de Documentos'
        ordering = ['-fecha_generacion']

    def set_nombre_archivo(self, value): self._plain_nombre_archivo = value

    def save(self, *args, **kwargs):
        if self._plain_nombre_archivo:
            self.nombre_archivo = encrypt_data(str(self._plain_nombre_archivo))
            self._plain_nombre_archivo = None
        super().save(*args, **kwargs)

    @property
    def decrypted_nombre_archivo(self): return decrypt_data(self.nombre_archivo)