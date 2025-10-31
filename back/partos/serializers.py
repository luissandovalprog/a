# partos/serializers.py
from rest_framework import serializers
from . import models # <--- LÍNEA FALTANTE

# --- Importaciones de modelos de otras apps ---
from catalogos.models import DiagnosticoCIE10
from pacientes.models import Madre
from usuarios.models import Usuario
# --- Fin de importaciones ---


class PartoSerializer(serializers.ModelSerializer):
    madre_nombre = serializers.CharField(source='madre.nombre', read_only=True)
    usuario_registro_nombre = serializers.CharField(source='usuario_registro.username', read_only=True, allow_null=True)
    tipo_parto = serializers.ChoiceField(choices=models.Parto.TIPO_PARTO_CHOICES)

    class Meta:
        model = models.Parto
        fields = '__all__'

class RecienNacidoSerializer(serializers.ModelSerializer):
    parto_fecha = serializers.DateTimeField(source='parto.fecha_parto', read_only=True)
    madre_id = serializers.UUIDField(source='parto.madre_id', read_only=True)
    madre_nombre = serializers.CharField(source='parto.madre.nombre', read_only=True)
    usuario_registro_nombre = serializers.CharField(source='usuario_registro.username', read_only=True, allow_null=True)
    rut_provisorio = serializers.CharField(source='decrypted_rut_provisorio', read_only=True, allow_null=True)
    rut_provisorio_write = serializers.CharField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = models.RecienNacido
        fields = '__all__'
        extra_kwargs = {
            'rut_provisorio': {'source': 'decrypted_rut_provisorio'},
        }

    def create(self, validated_data):
        rut_prov_plain = validated_data.pop('rut_provisorio_write', None)
        rn = models.RecienNacido(**validated_data)
        if rut_prov_plain: rn.set_rut_provisorio(rut_prov_plain)
        rn.save()
        return rn

    def update(self, instance, validated_data):
        rut_prov_plain = validated_data.pop('rut_provisorio_write', None)
        if rut_prov_plain: instance.set_rut_provisorio(rut_prov_plain)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

class PartoDiagnosticoSerializer(serializers.ModelSerializer):
    diagnostico_codigo = serializers.CharField(source='diagnostico.codigo', read_only=True)
    diagnostico_descripcion = serializers.CharField(source='diagnostico.descripcion', read_only=True)
    diagnostico_id = serializers.PrimaryKeyRelatedField(queryset=DiagnosticoCIE10.objects.all(), source='diagnostico', write_only=True)
    class Meta: 
        model = models.PartoDiagnostico
        fields = ['parto', 'diagnostico_id', 'diagnostico_codigo', 'diagnostico_descripcion']

class DefuncionSerializer(serializers.ModelSerializer):
    madre_nombre = serializers.CharField(source='madre.nombre', read_only=True, allow_null=True)
    recien_nacido_rut_provisorio = serializers.CharField(source='recien_nacido.decrypted_rut_provisorio', read_only=True, allow_null=True)
    causa_defuncion_display = serializers.CharField(source='causa_defuncion.descripcion', read_only=True)
    usuario_registro_nombre = serializers.CharField(source='usuario_registro.username', read_only=True, allow_null=True)
    madre = serializers.PrimaryKeyRelatedField(queryset=Madre.objects.all(), allow_null=True, required=False)
    recien_nacido = serializers.PrimaryKeyRelatedField(queryset=models.RecienNacido.objects.all(), allow_null=True, required=False) # <- 'models.' faltante
    causa_defuncion = serializers.PrimaryKeyRelatedField(queryset=DiagnosticoCIE10.objects.all())
    class Meta: 
        model = models.Defuncion
        fields = '__all__'
    def validate(self, data):
        if not data.get('madre') and not data.get('recien_nacido'): raise serializers.ValidationError("Se debe asociar una madre O un recién nacido.")
        if data.get('madre') and data.get('recien_nacido'): raise serializers.ValidationError("No se puede asociar una madre Y un recién nacido a la vez.")
        return data

class DocumentoReferenciaSerializer(serializers.ModelSerializer):
    parto_fecha = serializers.DateTimeField(source='parto.fecha_parto', read_only=True)
    usuario_generacion_nombre = serializers.CharField(source='usuario_generacion.username', read_only=True, allow_null=True)
    nombre_archivo = serializers.CharField(source='decrypted_nombre_archivo', read_only=True)
    nombre_archivo_write = serializers.CharField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = models.DocumentoReferencia
        fields = '__all__'
        extra_kwargs = {
            'nombre_archivo': {'source': 'decrypted_nombre_archivo'},
        }

    def create(self, validated_data):
        nombre_plain = validated_data.pop('nombre_archivo_write', None)
        doc = models.DocumentoReferencia(**validated_data)
        if nombre_plain: doc.set_nombre_archivo(nombre_plain)
        doc.save()
        return doc