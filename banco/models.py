from django.db import models

class Banco(models.Model):
    codigo = models.PositiveBigIntegerField(unique=True)
    nome = models.CharField(max_length=50)

    def __str__(self):
        return self.nome

    class Meta:
        verbose_name = 'Banco'
        verbose_name_plural = 'Bancos'
