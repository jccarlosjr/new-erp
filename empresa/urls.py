from django.urls import path
from empresa import views


urlpatterns = [
    path('api/salas/', views.SalaAPIView.as_view(), name='api_salas'),
    path('salas/', views.SalaView.as_view(), name='salas'),
]
