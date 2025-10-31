# catalogos/serializers.py
from rest_framework import serializers
from .models import DiagnosticoCIE10

class DiagnosticoCIE10Serializer(serializers.ModelSerializer):
    class Meta: 
        model = DiagnosticoCIE10
        fields = '__all__'