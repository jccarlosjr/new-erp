from django.shortcuts import render
from django.contrib.auth import views as auth_view


class LoginView(auth_view.LoginView):
    template_name = 'login.html'
    redirect_authenticated_user = True