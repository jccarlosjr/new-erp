from django.db import models
from django.contrib.auth.models import AbstractUser


class Funcao(models.Model):
    nome = models.CharField(max_length=100)

    def __str__(self):
        return self.nome
    
    class Meta:
        verbose_name = 'Função'
        verbose_name_plural = 'Funções'


class CustomUser(AbstractUser):
    cpf = models.CharField(max_length=14, null=True, blank=True)
    nascimento = models.DateField(null=True, blank=True)
    admissao = models.DateField(null=True, blank=True)
    sala = models.ForeignKey('empresa.Sala', on_delete=models.SET_NULL, null=True, blank=True)
    funcao = models.ForeignKey('accounts.Funcao', on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return self.username
    
    class Meta:
        verbose_name = 'Usuário'
        verbose_name_plural = 'Usuários'


class UserSession(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    session_key = models.CharField(max_length=100)
    login_time = models.DateTimeField(auto_now_add=True)
    logout_time = models.DateTimeField(null=True, blank=True)
