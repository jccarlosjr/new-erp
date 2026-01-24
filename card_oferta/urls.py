from django.urls import path
from card_oferta import views

urlpatterns = [
    path('api/cards-oferta/', views.CardOfertaAPIView.as_view(), name='cardoferta_api'),
]
