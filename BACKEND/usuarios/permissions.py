# usuarios/permissions.py
from rest_framework import permissions
from . import models # <- Import local

# --- Roles Definidos ---
ROL_ADMINISTRATIVO = 'Administrativo'
ROL_ENFERMERA = 'Enfermera'
ROL_MATRONA = 'Matrona'
ROL_MEDICO = 'Médico'
ROL_ADMIN_SISTEMA = 'Administrador del Sistema (TI)'

class DenyAll(permissions.BasePermission):
    def has_permission(self, request, view):
        return False

class IsAdminSistema(permissions.BasePermission):
    message = 'Solo el Administrador del Sistema (TI) puede realizar esta acción.'
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and hasattr(request, 'user') and hasattr(request.user, 'rol') and request.user.rol.nombre == ROL_ADMIN_SISTEMA

class IsPersonalClinico(permissions.BasePermission):
    message = 'Solo el personal clínico (Matrona, Médico, Enfermera) puede acceder.'
    def has_permission(self, request, view):
        allowed_roles = [ROL_MATRONA, ROL_MEDICO, ROL_ENFERMERA]
        return request.user and request.user.is_authenticated and hasattr(request, 'user') and hasattr(request.user, 'rol') and request.user.rol.nombre in allowed_roles

class IsMedico(permissions.BasePermission):
    message = 'Solo Médicos pueden realizar esta acción.'
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and hasattr(request, 'user') and hasattr(request.user, 'rol') and request.user.rol.nombre == ROL_MEDICO

class IsMatrona(permissions.BasePermission):
    message = 'Solo Matronas pueden realizar esta acción.'
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and hasattr(request, 'user') and hasattr(request.user, 'rol') and request.user.rol.nombre == ROL_MATRONA

class IsEnfermera(permissions.BasePermission):
    message = 'Solo Enfermeras pueden realizar esta acción.'
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and hasattr(request, 'user') and hasattr(request.user, 'rol') and request.user.rol.nombre == ROL_ENFERMERA

class IsAdministrativo(permissions.BasePermission):
    message = 'Solo personal Administrativo puede realizar esta acción.'
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and hasattr(request, 'user') and hasattr(request.user, 'rol') and request.user.rol.nombre == ROL_ADMINISTRATIVO

# --- Permisos Combinados ---

class CanManageUsers(IsAdminSistema):
    message = 'Solo el Administrador del Sistema tiene permisos para gestionar usuarios.'

class CanReadClinicalData(IsPersonalClinico):
    message = 'Solo el personal clínico autorizado puede ver estos datos.'

class CanWritePartoOrRN(IsMatrona):
    message = 'Solo Matronas pueden registrar o editar partos/recién nacidos (dentro de la ventana permitida).'

class CanManageEpicrisisOrDefuncion(IsMedico):
     message = 'Solo Médicos pueden gestionar epicrisis o registros de defunción.'

class CanManageAdmision(permissions.BasePermission):
    message = 'Solo personal Administrativo o Matronas pueden gestionar admisiones.'
    def has_permission(self, request, view):
        is_admin = IsAdministrativo().has_permission(request, view)
        is_matrona = IsMatrona().has_permission(request, view)
        return is_admin or is_matrona

class CanReadLogs(IsAdminSistema):
    message = 'Solo el Administrador del Sistema puede ver los logs de auditoría.'

class IsAuthenticatedReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.method in permissions.SAFE_METHODS

CanManageMadre = CanManageAdmision | (IsPersonalClinico & IsAuthenticatedReadOnly)

class IsAssignedToTurnoOrAdmin(permissions.BasePermission):
    """
    Permiso de objeto para filtrar por turno.
    """
    message = 'Acceso restringido a registros asociados a su turno asignado.'

    def has_object_permission(self, request, view, obj):
        user = request.user
        if not user or not user.is_authenticated or not hasattr(user, 'rol'):
            return False

        roles_sin_restriccion = [ROL_MEDICO, ROL_ADMIN_SISTEMA, ROL_ADMINISTRATIVO]
        if user.rol.nombre in roles_sin_restriccion:
            return True

        roles_con_turno = [ROL_ENFERMERA, ROL_MATRONA]
        if user.rol.nombre not in roles_con_turno:
            return False

        turno_usuario = user.turno
        if not turno_usuario or turno_usuario == models.Usuario.TURNO_NINGUNO:
            return False

        # Lógica para encontrar el turno del objeto
        # (Esta lógica es compleja y depende del modelo, 
        #  es mejor implementarla en get_queryset de la vista)
        # Aquí solo ponemos un placeholder.
        
        # Lógica real movida a las Vistas (get_queryset)
        # Aquí solo validamos que tiene permiso si los roles coinciden
        # (La lógica de get_queryset es la que filtra la lista)
        # Para un objeto específico, la lógica es más compleja:
        
        usuario_registro_objeto = None
        try:
            # Importar modelos de otras apps
            from pacientes.models import Madre
            from partos.models import Parto, RecienNacido, Defuncion, DocumentoReferencia

            if isinstance(obj, Madre):
                 # REVISAR LÓGICA: ¿Cómo se asigna una madre a un turno?
                 # Asumiremos que si un parto existe, usamos ese turno.
                 parto_asociado = obj.partos.first()
                 if parto_asociado:
                     usuario_registro_objeto = parto_asociado.usuario_registro
                 else:
                     # Si no hay parto, ¿quizás un campo en la madre?
                     # Por ahora, permitimos ver madres sin parto
                     return True 
            elif isinstance(obj, Parto):
                usuario_registro_objeto = obj.usuario_registro
            elif isinstance(obj, RecienNacido):
                usuario_registro_objeto = obj.usuario_registro
            elif isinstance(obj, Defuncion):
                 usuario_registro_objeto = obj.usuario_registro
            elif isinstance(obj, DocumentoReferencia):
                 usuario_registro_objeto = obj.usuario_generacion
            
            if usuario_registro_objeto and hasattr(usuario_registro_objeto, 'turno'):
                turno_objeto = usuario_registro_objeto.turno
                return turno_usuario == turno_objeto or turno_objeto == models.Usuario.TURNO_NINGUNO
            else:
                return False # No se pudo determinar el turno del objeto
        except AttributeError:
            return False