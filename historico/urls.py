from django.urls import path
from .views import HistoricoCardAPIView

urlpatterns = [
    path('api/historico-card/', HistoricoCardAPIView.as_view(), name='api_historico_card'),
]
