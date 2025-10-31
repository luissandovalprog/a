# usuarios/serializers.py
from rest_framework import serializers
from .models import Rol, Usuario

class RolSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rol
        fields = ['id', 'nombre', 'descripcion']

class UsuarioSerializer(serializers.ModelSerializer):
    rut = serializers.CharField(source='decrypted_rut', read_only=True)
    nombre_completo = serializers.CharField(source='decrypted_nombre', read_only=True)
    email = serializers.EmailField(source='decrypted_email', read_only=True, allow_null=True)
    rol_nombre = serializers.CharField(source='rol.nombre', read_only=True)
    turno_display = serializers.CharField(source='get_turno_display', read_only=True)
    password = serializers.CharField(write_only=True, required=False, style={'input_type': 'password'})

    class Meta:
        model = Usuario
        fields = [
            'id', 'username', 'nombre_completo', 'email', 'rut',
            'rol', 'rol_nombre', 'turno', 'turno_display',
            'activo', 'fecha_creacion', 'fecha_modificacion',
            'password'
        ]
        read_only_fields = ['fecha_creacion', 'fecha_modificacion']
        extra_kwargs = {
            'password_hash': {'write_only': True, 'required': False},
            'rol': {'write_only': True}, # Aceptar ID de rol al escribir
        }

    def create(self, validated_data):
        plain_password = validated_data.pop('password', None)
        
        # Permitir que el frontend envíe 'rut', 'nombre_completo', 'email'
        # Estos se cifrarán en el .save() del modelo
        usuario = Usuario(**validated_data) 

        if plain_password:
            usuario.set_password(plain_password)
        
        usuario.save() # El save() del modelo se encarga del cifrado/hash
        return usuario

    def update(self, instance, validated_data):
        plain_password = validated_data.pop('password', None)
        if plain_password:
            instance.set_password(plain_password)

        # Asignar campos sensibles (se cifrarán en save)
        if 'rut' in validated_data: instance.rut = validated_data.pop('rut')
        if 'nombre_completo' in validated_data: instance.nombre_completo = validated_data.pop('nombre_completo')
        if 'email' in validated_data: instance.email = validated_data.pop('email')

        # Actualizar campos normales restantes
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance