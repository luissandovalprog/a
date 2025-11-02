# partos/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'partos', views.PartoViewSet, basename='parto')
router.register(r'recien-nacidos', views.RecienNacidoViewSet, basename='reciennacido')
router.register(r'parto-diagnosticos', views.PartoDiagnosticoViewSet, basename='partodiagnostico')
router.register(r'defunciones', views.DefuncionViewSet, basename='defuncion')
router.register(r'documentos', views.DocumentoReferenciaViewSet, basename='documentoreferencia')

urlpatterns = [
    path('', include(router.urls)),
]