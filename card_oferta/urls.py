from django.urls import path
from card_oferta import views

urlpatterns = [
    path('cards-oferta/', views.CardView.as_view(), name='cardoferta'),
    path('meus-cards/', views.CardEsteiraView.as_view(), name='meus_cards'),
    path('api/esteira-operacional/', views.CardEsteiraOperacionalView.as_view(), name='esteira_operacional'),

    path('api/cards-oferta/', views.CardOfertaAPIView.as_view()),
    path('api/cards-oferta/<int:id>/', views.CardOfertaAPIView.as_view()),
    path('api/cards-propostas/', views.CardOfertaPropostaAPIView.as_view()),
    path('api/cards-propostas/geral/', views.EsteiraOperacionalAPIView.as_view()),
]
