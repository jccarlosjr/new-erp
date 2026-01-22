from django.db import models

class Operacao(models.Model):
    nome = models.CharField(max_length=100)

    def __str__(self):
        return self.nome
    
    class Meta:
        verbose_name = 'Operação'
        verbose_name_plural = 'Operações'
