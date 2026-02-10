# seu_app/signals.py
from django.db.models.signals import post_migrate
from django.dispatch import receiver

from .models import Status


@receiver(post_migrate)
def criar_status_iniciais(sender, **kwargs):
    status_list = [
        (1, "Aberto", "secondary"),
        (2, "Digitação Solicitada", "primary"),
        (3, "Pendente Pré-Digitação", "warning"),
        (4, "Aguardando Banco", "warning"),
        (5, "Pendente de Formalização", "warning"),
        (6, "Aguardando Pagamento", "primary"),
        (7, "Aguardando Retorno do Saldo", "primary"),
        (8, "Aguardando Atuação do Atendente", "warning"),
        (9, "Aguardando Atuação do Operacional", "primary"),
        (11, "Saldo Devedor Pago", "primary"),
        (12, "Pago - Troco Liberado para o Cliente", "success"),
        (13, "Cancelado - Possível Redigitar", "danger"),
        (14, "Cancelado - Definitivo", "danger"),
    ]

    for codigo, nome, color in status_list:
        Status.objects.get_or_create(
            codigo=codigo,
            defaults={
                "nome": nome,
                "color": color
            }
        )
