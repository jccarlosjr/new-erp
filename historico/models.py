from django.db import models
from card_oferta.models import CardOferta
from accounts.models import CustomUser
from proposta.models import Status


class HistoricoCard(models.Model):
    card = models.ForeignKey(CardOferta, on_delete=models.CASCADE, related_name='card')
    user = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True, related_name='user')
    date = models.DateTimeField(auto_now_add=True)
    obs = models.TextField(null=True, blank=True)

    def __str__(self):
        return self.card.codigo_interno

    class Meta:
        ordering = ['-date']
