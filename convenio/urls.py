from django.urls import path
from convenio import views

urlpatterns = [
    path('convenios/', views.ConvenioView.as_view(), name='convenios'),
    path('api/convenios/', views.ConvenioAPIView.as_view(), name='api_convenios'),
    path('api/matriculas/', views.MatriculaAPIView.as_view(), name='api_matriculas'),
    path('api/matriculas/<int:id>/', views.MatriculaAPIView.as_view()),
]