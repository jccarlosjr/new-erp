from django.urls import path
from banco import views

urlpatterns = [
    path('api/bancos/', views.BancoAPIView.as_view(), name='api_bancos'),
    path('bancos/', views.BancoListView.as_view(), name='bancos'),
]