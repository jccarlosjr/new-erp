from django.urls import path
from . import views

urlpatterns = [
    path('api/clientes/', views.ClienteAPIView.as_view(), name='api_clientes'),
    path('clientes/', views.ClienteView.as_view(), name='clientes'),
]