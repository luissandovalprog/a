# catalogos/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'diagnosticos-cie10', views.DiagnosticoCIE10ViewSet, basename='diagnosticocie10')

urlpatterns = [
    path('', include(router.urls)),
]