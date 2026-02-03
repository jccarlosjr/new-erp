from django.db.models.signals import post_migrate
from django.dispatch import receiver
from .models import Operacao


@receiver(post_migrate)
def padronizar_bancos(sender, **kwargs):
    default_operations = [
        'Margem Livre',
        'Portabilidade',
        'Portabilidade + Refin',
        'Cartão Consignado (RMC)',
        'Cartão Benefício (RCC)',
        'Empréstimo Pessoal',
        'Saque Complementar (RMC)',
        'Saque Complementar (RCC)',
    ]

    for operation in default_operations:
        Operacao.objects.get_or_create(nome=operation)
