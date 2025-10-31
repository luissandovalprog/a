# catalogos/views.py
from rest_framework import viewsets, permissions
from . import models # <--- LÍNEA FALTANTE
from . import serializers # <--- LÍNEA FALTANTE

class DiagnosticoCIE10ViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = models.DiagnosticoCIE10.objects.all().order_by('codigo')
    serializer_class = serializers.DiagnosticoCIE10Serializer
    permission_classes = [permissions.IsAuthenticated] # Cualquiera autenticado puede verlos