from django.db import models
from operacao.models import Operacao
from banco.models import Banco


class Tabela(models.Model):
    nome = models.CharField(max_length=150)
    operacao = models.ForeignKey(Operacao, on_delete=models.PROTECT)
    banco = models.ForeignKey(Banco, on_delete=models.PROTECT)
    coeficiente = models.FloatField()
    taxa = models.FloatField(default=1.85)
    prazo = models.PositiveIntegerField()
    ativo = models.BooleanField(default=True)
    cms = models.FloatField()
    tipo_cms = models.CharField(max_length=1)
    digital = models.BooleanField(default=True)

    def __str__(self):
        return self.nome

    class Meta:
        verbose_name = 'Tabela'
        verbose_name_plural = 'Tabelas'