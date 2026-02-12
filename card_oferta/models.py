from django.db import models
from cliente.models import Cliente
from convenio.models import Matricula
from datetime import datetime
from accounts.models import CustomUser

STATUS_CHOICES = [
    ('NAO_INICIADO', 'Não Iniciado'),
    ('DIGITACAO', 'Aguardando Digitação'),
    ('ANDAMENTO', 'Andamento'),
    ('FORMALIZACAO', 'Aguardando Formalização'),
    ('ATENCAO', 'Precisa de Atenção'),
    ('FINALIZADO', 'Finalizado'),
    ('CANCELADO', 'Cancelado'),
    ('EXCLUIDO', 'Excluído'),
]

def get_card_code(proposta):
    id = str(proposta.id).zfill(5)
    codigo_interno = datetime.now().strftime(f"CARD-%y%m%d{id}")
    return codigo_interno


class CardOferta(models.Model):
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE)
    matricula = models.ForeignKey(Matricula, on_delete=models.CASCADE)
    codigo_interno = models.CharField(max_length=100, unique=True, null=True, blank=True)
    status = models.CharField(max_length=100, choices=STATUS_CHOICES, default='NAO_INICIADO')
    user = models.ForeignKey(CustomUser, on_delete=models.PROTECT, null=True, blank=True)
    is_blocked = models.BooleanField(default=False)
    active = models.BooleanField(default=False)
    ultima_atualizacao = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.id:
            super().save(*args, **kwargs) 

        if not self.codigo_interno:
            self.codigo_interno = get_card_code(self)
            kwargs['force_insert'] = False
            super().save(*args, **kwargs)
        else:
            super().save(*args, **kwargs)

    def __str__(self):
        return self.codigo_interno

    class Meta:
        verbose_name = 'Card de Ofertas'
        verbose_name_plural = 'Cards de Ofertas'
