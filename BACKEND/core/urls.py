# core/urls.py
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Endpoints de autenticación (JWT y datos de usuario)
    path('api/auth/', include('usuarios.urls')), 
    
    # Endpoints de las otras apps
    path('api/pacientes', include('pacientes.urls')),
    path('api/partos', include('partos.urls')),
    path('api/auditoria', include('auditoria.urls')),
    path('api/catalogos', include('catalogos.urls')),
]