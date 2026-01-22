from django.db import models

# Create your models here.
class Empresa(models.Model):
    nome = models.CharField(max_length=100)
    cnpj = models.CharField(max_length=14)

    def __str__(self):
        return self.nome

    class Meta:
        verbose_name = 'Empresa'
        verbose_name_plural = 'Empresas'


class Sala(models.Model):
    nome = models.CharField(max_length=100)
    empresa = models.ForeignKey('empresa.Empresa', on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return self.nome

    class Meta:
        verbose_name = 'Sala'
        verbose_name_plural = 'Salas'