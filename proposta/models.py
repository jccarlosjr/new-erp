from django.db import models
from tabela.models import Tabela
from accounts.models import CustomUser
from cliente.models import Cliente
from card_oferta.models import CardOferta
from datetime import datetime

FILE_TYPE_CHOICES = [
    ('Documento Identificação', 'Documento Identificação'),
    ('Contrato', 'Contrato'),
    ('Contracheque', 'Contracheque'),
    ('Outro', 'Outro')
]


def get_proposal_code(proposta):
    id = str(proposta.id).zfill(5)
    codigo_interno = datetime.now().strftime(f"PRO-%y%m%d{id}")
    return codigo_interno


class Status(models.Model):
    codigo = models.IntegerField()
    nome = models.CharField(max_length=100)

    def __str__(self):
        return self.nome
    
    class Meta:
        verbose_name = 'Status'
        verbose_name_plural = 'Status'


class Proposta(models.Model):
    ade = models.CharField(max_length=100, null=True, blank=True)
    bloqueado = models.BooleanField(default=False)
    codigo_interno = models.CharField(max_length=100, unique=True, null=True, blank=True)
    obs = models.TextField(null=True, blank=True)
    ultima_atualizacao = models.DateTimeField(auto_now=True)
    criacao = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    cms = models.FloatField(null=True, blank=True)
    parcela = models.FloatField()
    prazo = models.PositiveIntegerField()
    financiado = models.FloatField(null=True, blank=True)
    saldo_devedor = models.FloatField(null=True, blank=True)
    troco = models.FloatField()
    prazo_original = models.PositiveIntegerField(null=True, blank=True)
    prazo_restante = models.PositiveIntegerField(null=True, blank=True)
    contrato_portado = models.CharField(max_length=100, null=True, blank=True)
    banco_origem = models.CharField(max_length=3, null=True, blank=True)
    cliente = models.ForeignKey(Cliente, on_delete=models.PROTECT)
    tabela = models.ForeignKey(Tabela, on_delete=models.PROTECT)
    usuario = models.ForeignKey(CustomUser, on_delete=models.PROTECT)
    status = models.ForeignKey(Status, on_delete=models.PROTECT)
    card_oferta = models.ForeignKey(CardOferta, on_delete=models.PROTECT, null=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.id:
            self.status.codigo = '1'
            super().save(*args, **kwargs) 

        if not self.codigo_interno:
            self.codigo_interno = get_proposal_code(self)
            kwargs['force_insert'] = False
            super().save(*args, **kwargs)
        else:
            super().save(*args, **kwargs)

    def __str__(self):
        return self.codigo_interno

    class Meta:
        verbose_name = 'Proposta'
        verbose_name_plural = 'Propostas'



class Arquivo(models.Model):
    proposta = models.ForeignKey(Proposta, related_name="arquivos", on_delete=models.SET_NULL, null=True, blank=True)
    arquivo = models.FileField(upload_to="propostas/")
    tipo = models.CharField(max_length=100, choices=FILE_TYPE_CHOICES, null=True, blank=True)
    uploaded = models.DateTimeField(auto_now_add=True)
    usuario = models.ForeignKey(CustomUser, related_name="files", on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"Arquivo para a proposta: {self.proposta.codigo_interno}"
    
    class Meta:
        verbose_name = 'Arquivo'
        verbose_name_plural = 'Arquivos'