from django.db import models
from cliente.models import Cliente
from convenio.models import Matricula
from datetime import datetime



def get_card_code(proposta):
    id = str(proposta.id).zfill(5)
    codigo_interno = datetime.now().strftime(f"PRO-%y%m%d{id}")
    return codigo_interno


class CardOferta(models.Model):
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE)
    matricula = models.ForeignKey(Matricula, on_delete=models.CASCADE)
    codigo_interno = models.CharField(max_length=100, unique=True, null=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.codigo_interno:
            self.codigo_interno = get_card_code(self)
            kwargs['force_insert'] = False
            super().save(*args, **kwargs)
        else:
            super().save(*args, **kwargs)

    def __str__(self):
        return self.codigo_interno

    class Meta:
        verbose_name = 'Cartão de Oferta'
        verbose_name_plural = 'Cartões de Oferta'
