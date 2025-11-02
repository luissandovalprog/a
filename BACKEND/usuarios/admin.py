from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from django.contrib.auth.models import Group
from .models import Usuario, Rol

# ---
# 1. Definir Formularios Personalizados para el Admin
# ---
class CustomUserCreationForm(UserCreationForm):
    class Meta(UserCreationForm.Meta):
        model = Usuario
        # Campos para el formulario de CREACIÓN
        fields = ('username', 'nombre_completo', 'rut', 'email', 'turno', 'rol', 'is_active', 'is_staff')

class CustomUserChangeForm(UserChangeForm):
    class Meta(UserChangeForm.Meta):
        model = Usuario
        # Campos para el formulario de EDICIÓN
        fields = ('username', 'nombre_completo', 'rut', 'email', 'turno', 'rol', 'is_active', 'is_staff', 'is_superuser')

# ---
# 2. Configuración avanzada para tu modelo 'Usuario'
# ---
class CustomUserAdmin(UserAdmin):
    # Asignar los formularios personalizados
    form = CustomUserChangeForm
    add_form = CustomUserCreationForm

    model = Usuario

    # Lista de usuarios
    list_display = ('username', 'get_decrypted_nombre', 'rol', 'is_active', 'is_staff')
    list_filter = ('is_active', 'is_staff', 'is_superuser', 'rol')
    search_fields = ('username',)
    ordering = ('username',)
    
    # Fieldsets para la PÁGINA DE EDICIÓN
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Información Personal (Cifrada)', {
            'fields': ('nombre_completo', 'rut', 'email', 'turno', 'rol')
        }),
        ('Vista de Datos (Solo Lectura)', {
            'fields': ('decrypted_nombre', 'decrypted_rut', 'decrypted_email')
        }),
        ('Permisos', {
            'fields': ('is_active', 'is_staff', 'is_superuser')
        }),
        ('Fechas Importantes', {
            'fields': ('last_login', 'fecha_creacion', 'fecha_modificacion')
        }),
    )
    
    # (Usa los campos definidos en CustomUserCreationForm)
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'password', 'password2'),
        }),
        ('Información Personal (Cifrada)', {
            'fields': ('nombre_completo', 'rut', 'email', 'turno', 'rol')
        }),
        ('Permisos', {
            'fields': ('is_active', 'is_staff', 'is_superuser')
        }),
    )
    
    readonly_fields = (
        'last_login', 'fecha_creacion', 'fecha_modificacion',
        'decrypted_nombre', 'decrypted_rut', 'decrypted_email'
    )
    
    filter_horizontal = ()

    @admin.display(description='Nombre Completo')
    def get_decrypted_nombre(self, obj):
        return obj.decrypted_nombre

# ---
# 3. Configuración para 'Rol'
# ---
class RolAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'descripcion')
    search_fields = ('nombre',)

# ---
# 4. Registrar tus modelos y des-registrar 'Group'
# ---
try:
    admin.site.unregister(Group)
except admin.sites.NotRegistered:
    pass

admin.site.register(Usuario, CustomUserAdmin) 
admin.site.register(Rol, RolAdmin)