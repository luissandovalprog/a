# pacientes/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'madres', views.MadreViewSet, basename='madre')

urlpatterns = [
    path('', include(router.urls)),
]