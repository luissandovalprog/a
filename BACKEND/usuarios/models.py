# usuarios/models.py
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
import uuid
from core.utils.security_utils import encrypt_data, decrypt_data

# --- MODELO ROL (Sin cambios) ---
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

# Este manager define CÓMO se crean los usuarios.
class CustomUserManager(BaseUserManager):
    
    def create_user(self, username, password=None, **extra_fields):
        """
        Crea y guarda un Usuario con el username y contraseña dados.
        """
        if not username:
            raise ValueError('El campo Username es obligatorio')
        
        # Asigna el rol si se pasa (ej. desde el admin)
        if 'rol' in extra_fields and not isinstance(extra_fields['rol'], Rol):
             extra_fields['rol'] = Rol.objects.get(id=extra_fields['rol'])
        
        user = self.model(username=username, **extra_fields)
        
        # Cifrar campos (si se pasan)
        if 'rut' in extra_fields: user.rut = encrypt_data(str(extra_fields['rut']))
        if 'nombre_completo' in extra_fields: user.nombre_completo = encrypt_data(str(extra_fields['nombre_completo']))
        if 'email' in extra_fields and extra_fields['email']: 
            user.email = encrypt_data(str(extra_fields['email']))

        user.set_password(password) # set_password hashea la contraseña
        user.save(using=self._db)
        return user

    # --- ESTA ES LA FUNCIÓN QUE FALTABA O ESTABA MAL ESCRITA ---
    def create_superuser(self, username, password=None, **extra_fields):
        """
        Crea y guarda un superusuario.
        """
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser debe tener is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser debe tener is_superuser=True.')
        
        # Asigna automáticamente el rol de Admin TI
        try:
            admin_rol = Rol.objects.get(nombre='Administrador del Sistema (TI)')
            extra_fields['rol'] = admin_rol
        except Rol.DoesNotExist:
            raise ValueError(
                'ERROR: No se encontró el Rol "Administrador del Sistema (TI)". '
                'Por favor, créalo primero ejecutando: python manage.py shell'
            )

        # Los REQUIRED_FIELDS (rut, nombre_completo) vendrán en extra_fields
        return self.create_user(username, password, **extra_fields)
# --- FIN DEL MANAGER ---


# --- MODELO USUARIO (Heredando de AbstractBaseUser) ---
class Usuario(AbstractBaseUser, PermissionsMixin):
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
    
    username = models.CharField(max_length=100, unique=True)
    rol = models.ForeignKey(Rol, on_delete=models.PROTECT, related_name='usuarios', null=True) # Permitir null temporalmente
    turno = models.CharField(max_length=20, choices=TURNO_CHOICES, default=TURNO_NINGUNO, blank=True, null=True)
    
    is_active = models.BooleanField(default=True, db_index=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)

    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_modificacion = models.DateTimeField(auto_now=True)

    # Asignar el manager
    objects = CustomUserManager()

    # Campo para login
    USERNAME_FIELD = 'username'
    
    # Campos pedidos por 'createsuperuser' (sin 'rol')
    REQUIRED_FIELDS = ['nombre_completo', 'rut']

    class Meta:
        db_table = 'Usuario'
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'
        ordering = ['username']

    def save(self, *args, **kwargs):
        # Cifrar campos si se actualizan con texto plano
        if self.rut and not self.rut.startswith('gAAAAA'): self.rut = encrypt_data(str(self.rut))
        if self.nombre_completo and not self.nombre_completo.startswith('gAAAAA'): self.nombre_completo = encrypt_data(str(self.nombre_completo))
        if self.email and self.email and not self.email.startswith('gAAAAA'): self.email = encrypt_data(str(self.email))

        super().save(*args, **kwargs)

    @property
    def decrypted_rut(self): return decrypt_data(self.rut)
    @property
    def decrypted_nombre(self): return decrypt_data(self.nombre_completo)
    @property
    def decrypted_email(self): return decrypt_data(self.email)

    def __str__(self):
        if self.rol:
            return f"{self.username} ({self.rol.nombre})"
        return f"{self.username} (Sin rol)"