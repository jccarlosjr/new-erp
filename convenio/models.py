from django.db import models
from cliente.models import Cliente

class Convenio(models.Model):
    nome = models.CharField(max_length=100)

    def __str__(self):
        return self.nome
    
    class Meta:
        verbose_name = 'Convênio'
        verbose_name_plural = 'Convênios'


class Matricula(models.Model):
    cliente = models.ForeignKey(Cliente, on_delete=models.PROTECT)
    convenio = models.ForeignKey(Convenio, on_delete=models.PROTECT)
    matricula = models.CharField(max_length=20)
    codigo_convenio = models.CharField(max_length=20)
    uf_convenio = models.CharField(max_length=2)
    recebimento = models.CharField(max_length=30)
    banco = models.CharField(max_length=3)
    agencia = models.CharField(max_length=4)
    conta = models.CharField(max_length=20)

    def __str__(self):
        return self.matricula

    class Meta:
        verbose_name = 'Matricula'
        verbose_name_plural = 'Matriculas'
