from django.urls import path
from . import views

urlpatterns = [
    path('api/clientes/', views.ClienteAPIView.as_view(), name='api_clientes'),
    path('criar_card/', views.CreateCardView.as_view(), name='create_card'),
]