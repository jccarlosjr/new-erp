from django.urls import path
from .views import HistoricoCardAPIView, HistoricoPropostaAPIView

urlpatterns = [
    path('api/historico-card/', HistoricoCardAPIView.as_view(), name='api_historico_card'),
    path('api/historico-proposta/', HistoricoPropostaAPIView.as_view(), name='api_historico_proposta'),
]
