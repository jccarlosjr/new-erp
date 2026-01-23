from django.contrib.auth import views as auth_view
from accounts import views
from django.urls import path


urlpatterns = [
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', auth_view.LogoutView.as_view(), name='logout'),
    path('usuarios/', views.UsersView.as_view(), name='usuarios'),
    path('funcoes/', views.FuncaoView.as_view(), name='funcoes'),

    path('api/usuarios/reset-senha/', views.ResetSenhaUsuarioAPIView.as_view()),
    path('api/usuarios/', views.CustomUserAPIView.as_view(), name='api_usuarios'),
    path('api/funcoes/', views.FuncaoAPIView.as_view(), name='api_funcoes'),
]