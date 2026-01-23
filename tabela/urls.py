from django.urls import path
from . import views

urlpatterns = [
    path('tabelas/', views.TabelaView.as_view(), name='tabelas'),
    path('api/tabelas/', views.TabelaAPIView.as_view(), name='api_tabelas'),
]
