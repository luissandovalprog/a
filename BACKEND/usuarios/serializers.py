# back/usuarios/serializers.py
from rest_framework import serializers
from .models import Usuario, Rol
# Importamos la utilidad de descifrado para usarla de forma segura
from core.utils.security_utils import decrypt_data

class RolSerializer(serializers.ModelSerializer):
    """
    Serializer para listar y gestionar Roles.
    """
    class Meta:
        model = Rol
        fields = ['id', 'nombre', 'descripcion']

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer para gestionar Usuarios.
    Maneja la lógica de campos cifrados y la contraseña.
    """

    # --- CAMPOS DE LECTURA (Para enviar al Frontend) ---
    
    # Esta es la corrección de un error anterior (sigue siendo correcta)
    rol_nombre = serializers.CharField(source='rol.nombre', read_only=True)
    
    # --- INICIO DE LA CORRECCIÓN PARA EL ERROR 500 ---
    # Usamos SerializerMethodField para manejar de forma segura los
    # valores que pueden ser nulos (None) ANTES de descifrarlos.
    
    nombre_completo = serializers.SerializerMethodField()
    email = serializers.SerializerMethodField()
    rut = serializers.SerializerMethodField()
    
    # --- FIN DE LA CORRECCIÓN ---


    # --- CAMPOS DE ESCRITURA (Para recibir desde el Frontend) ---
    
    # Campo 'password' solo para escritura.
    password = serializers.CharField(
        write_only=True, 
        required=False, 
        style={'input_type': 'password'}
    )
    
    # Mapeamos los datos planos que recibimos a los campos del modelo
    rut_plain = serializers.CharField(write_only=True, source='rut')
    nombre_plain = serializers.CharField(write_only=True, source='nombre_completo')
    email_plain = serializers.EmailField(write_only=True, source='email', required=False, allow_null=True)

    class Meta:
        model = Usuario
        
        # Campos que se enviarán al frontend (en apiGetUserMe)
        read_only_fields = [
            'id', 
            'fecha_creacion', 
            'fecha_modificacion',
            'rol_nombre', 
            'nombre_completo', 
            'email', 
            'rut'
        ]
        
        # Todos los campos que el serializer necesita conocer
        fields = [
            'id', 'username', 'turno', 'is_active', 'rol',  #Cambiando 'activo' a 'is_active'
            'fecha_creacion', 'fecha_modificacion',
            # Campos de lectura (los de SerializerMethodField)
            'rol_nombre', 'nombre_completo', 'email', 'rut',
            # Campos de escritura
            'password', 'rut_plain', 'nombre_plain', 'email_plain'
        ]
        
        extra_kwargs = {
            'rut_plain': {'required': False},
            'nombre_plain': {'required': False},
            'email_plain': {'required': False},
        }

    # --- MÉTODOS PARA LOS SerializerMethodField ---

    def get_nombre_completo(self, obj):
        # obj es la instancia del Usuario
        if obj.nombre_completo:
            try:
                return decrypt_data(obj.nombre_completo)
            except Exception:
                return "Error al descifrar nombre"
        return None

    def get_email(self, obj):
        if obj.email:
            try:
                return decrypt_data(obj.email)
            except Exception:
                return "Error al descifrar email"
        return None

    def get_rut(self, obj):
        if obj.rut:
            try:
                return decrypt_data(obj.rut)
            except Exception:
                return "Error al descifrar RUT"
        return None

    # --- MÉTODOS CREATE Y UPDATE (Sin cambios) ---

    def create(self, validated_data):
        """
        Sobrescribimos 'create' para manejar el cifrado y el hash de contraseña.
        """
        rut_plain = validated_data.pop('rut', None)
        nombre_plain = validated_data.pop('nombre_completo', None)
        email_plain = validated_data.pop('email', None)
        password = validated_data.pop('password', None)
        
        usuario = Usuario(**validated_data)
        
        usuario.rut = rut_plain
        usuario.nombre_completo = nombre_plain
        usuario.email = email_plain
        
        if password:
            usuario.set_password(password)
        
        usuario.save()
        return usuario

    def update(self, instance, validated_data):
        """
        Sobrescribimos 'update' para manejar campos cifrados y contraseña.
        """
        instance.username = validated_data.get('username', instance.username)
        instance.turno = validated_data.get('turno', instance.turno)
        instance.is_active = validated_data.get('activo', instance.activo) # Cambiado 'activo' a 'is_active'
        instance.rol = validated_data.get('rol', instance.rol)

        if 'rut' in validated_data:
            instance.rut = validated_data.get('rut')
        if 'nombre_completo' in validated_data:
            instance.nombre_completo = validated_data.get('nombre_completo')
        if 'email' in validated_data:
            instance.email = validated_data.get('email')

        password = validated_data.get('password', None)
        if password:
            instance.set_password(password)
        
        instance.save()
        return instance