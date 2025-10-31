# pacientes/serializers.py
from rest_framework import serializers
from .models import Madre

class MadreSerializer(serializers.ModelSerializer):
    rut = serializers.CharField(source='rut', read_only=True)
    nombre = serializers.CharField(source='nombre', read_only=True)
    telefono = serializers.CharField(source='telefono', read_only=True, allow_null=True)
    antecedentes_medicos = serializers.CharField(source='antecedentes', read_only=True, allow_null=True)

    # Campos para escritura (reciben texto plano)
    rut_write = serializers.CharField(write_only=True, required=False, allow_null=True)
    nombre_write = serializers.CharField(write_only=True, required=False, allow_null=True)
    telefono_write = serializers.CharField(write_only=True, required=False, allow_null=True)
    antecedentes_write = serializers.CharField(write_only=True, required=False, allow_null=True)


    class Meta:
        model = Madre
        fields = [
            'id', 'ficha_clinica_id', 'rut', 'nombre', 'telefono', 'fecha_nacimiento',
            'nacionalidad', 'pertenece_pueblo_originario', 'prevision',
            'antecedentes_medicos', 'fecha_registro',
            # Campos de solo escritura
            'rut_write', 'nombre_write', 'telefono_write', 'antecedentes_write'
        ]
        read_only_fields = ['fecha_registro']
        
    def create(self, validated_data):
        madre = Madre()
        
        # Asignar campos no cifrados directamente
        madre.ficha_clinica_id = validated_data.get('ficha_clinica_id')
        madre.fecha_nacimiento = validated_data.get('fecha_nacimiento')
        madre.nacionalidad = validated_data.get('nacionalidad')
        madre.pertenece_pueblo_originario = validated_data.get('pertenece_pueblo_originario', False)
        madre.prevision = validated_data.get('prevision')

        # Asignar valores planos a los setters
        madre.set_rut(validated_data.get('rut_write'))
        madre.set_nombre(validated_data.get('nombre_write'))
        madre.set_telefono(validated_data.get('telefono_write'))
        madre.set_antecedentes(validated_data.get('antecedentes_write'))

        madre.save()
        return madre

    def update(self, instance, validated_data):
        # Asignar valores planos a los setters si vienen
        if 'rut_write' in validated_data: instance.set_rut(validated_data.pop('rut_write'))
        if 'nombre_write' in validated_data: instance.set_nombre(validated_data.pop('nombre_write'))
        if 'telefono_write' in validated_data: instance.set_telefono(validated_data.pop('telefono_write'))
        if 'antecedentes_write' in validated_data: instance.set_antecedentes(validated_data.pop('antecedentes_write'))

        # Actualizar campos no cifrados restantes
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance