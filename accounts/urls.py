from django.contrib.auth import views as auth_view
from accounts import views
from django.urls import path


urlpatterns = [
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', auth_view.LogoutView.as_view(), name='logout'),
]