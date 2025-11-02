# usuarios/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

router = DefaultRouter()
router.register(r'roles', views.RolViewSet, basename='rol')
router.register(r'usuarios', views.UsuarioViewSet, basename='usuario')

urlpatterns = [
    # Rutas de ViewSets
    path('', include(router.urls)),
    
    # Rutas de Autenticación JWT
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('user/me/', views.CurrentUserView.as_view(), name='current_user'),
]