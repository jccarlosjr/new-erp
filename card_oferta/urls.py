from django.urls import path
from card_oferta import views

urlpatterns = [
    path('api/cards-oferta/', views.CardOfertaAPIView.as_view(), name='cardoferta_api'),
    path('api/cards-oferta/<int:id>/', views.CardOfertaAPIView.as_view()),
    path('cards-oferta/', views.CardView.as_view(), name='cardoferta'),
    path('meus-cards/', views.CardEsteiraView.as_view(), name='meus_cards'),
    path('api/cards-propostas/', views.CardProposalsOfertaAPIView.as_view(), name='api_cards_propostas'),
]
