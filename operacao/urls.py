from django.urls import path
from operacao import views

urlpatterns = [
    path('api/operacoes/', views.OperacaoAPIView.as_view(), name='api_operacoes'),
    path('operacoes/', views.OperacaoView.as_view(), name='operacoes'),
]