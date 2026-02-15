from django.urls import path
from proposta import views


urlpatterns = [
    path('api/status/', views.StatusAPIView.as_view(), name='api_status'),
    path('status/', views.StatusView.as_view(), name='status'),
    path('api/propostas/', views.PropostaAPIView.as_view(), name='api_propostas'),
    path('api/propostas-geral/', views.PropostaGeralListAPIView.as_view(), name='api_propostas_geral'),
    path('propostas/', views.PropostaView.as_view(), name='propostas'),
    path('propostas/geral/', views.PropostaGeralListView.as_view(), name='propostas_geral'),
    path('propostas/<int:pk>/', views.PropostaDetailView.as_view(), name='propostas_detail'),
]
