import json
from django.shortcuts import get_object_or_404
from django.db import transaction
from proposta.models import Proposta, Status
from cliente.models import Cliente
from tabela.models import Tabela
from accounts.models import CustomUser
from card_oferta.models import CardOferta



def create_or_update_proposta(body):
    proposta_id = body.get('id')

    cpf = body.get('cpf')
    tabela_id = body.get('tabela_id')
    status_id = body.get('status_id')
    usuario_id = body.get('usuario_id')
    card_oferta_id = body.get('card_oferta_id')

    parcela = body.get('parcela')
    prazo = body.get('prazo')
    troco = body.get('troco')

    if not cpf:
        raise ValueError("CPF do cliente é obrigatório")

    if not tabela_id:
        raise ValueError("Tabela é obrigatória")

    if parcela is None or prazo is None or troco is None:
        raise ValueError("Parcela, prazo e troco são obrigatórios")

    cliente = get_object_or_404(Cliente, cpf=cpf)
    tabela = get_object_or_404(Tabela, id=tabela_id)

    try:
        status = get_object_or_404(Status, id=status_id)
    except:
        status = None

    usuario = get_object_or_404(CustomUser, id=usuario_id)

    card_oferta = None
    if card_oferta_id:
        card_oferta = get_object_or_404(CardOferta, id=card_oferta_id)

    data = {
        "ade": body.get('ade'),
        "bloqueado": body.get('bloqueado', False),
        "obs": body.get('obs'),
        "cms": body.get('cms'),
        "parcela": parcela,
        "prazo": prazo,
        "financiado": body.get('financiado'),
        "saldo_devedor": body.get('saldo_devedor'),
        "troco": troco,
        "prazo_original": body.get('prazo_original'),
        "prazo_restante": body.get('prazo_restante'),
        "contrato_portado": body.get('contrato_portado'),
        "banco_origem": body.get('banco_origem'),
        "cliente": cliente,
        "tabela": tabela,
        "status": status,
        "usuario": usuario,
        "card_oferta": card_oferta,
    }

    # UPDATE
    if proposta_id:
        proposta = get_object_or_404(Proposta, id=proposta_id)

        for field, value in data.items():
            setattr(proposta, field, value)

        proposta.save()
        return proposta, False

    # CREATE
    proposta = Proposta.objects.create(**data)
    return proposta, True


@transaction.atomic
def patch_proposta(body):
    proposta_id = body.get('id')

    if not proposta_id:
        raise ValueError("ID da proposta é obrigatório")

    proposta = get_object_or_404(Proposta, id=proposta_id)

    if proposta.bloqueado:
        raise ValueError("Proposta Bloqueada para edição")

    # FKs
    if 'cpf' in body:
        proposta.cliente = Cliente.objects.filter(
            cpf=body.get('cpf')
        ).first()

    if 'tabela_id' in body:
        proposta.tabela = Tabela.objects.filter(
            id=body.get('tabela_id')
        ).first()

    if 'status_id' in body:
        proposta.status = Status.objects.filter(
            id=body.get('status_id')
        ).first()

    if 'usuario_id' in body:
        proposta.usuario = CustomUser.objects.filter(
            id=body.get('usuario_id')
        ).first()

    if 'card_oferta_id' in body:
        proposta.card_oferta = CardOferta.objects.filter(
            id=body.get('card_oferta_id')
        ).first()

    fields = [
        'ade',
        'bloqueado',
        'obs',
        'cms',
        'parcela',
        'prazo',
        'financiado',
        'saldo_devedor',
        'troco',
        'prazo_original',
        'prazo_restante',
        'contrato_portado',
        'banco_origem',
    ]

    for field in fields:
        if field in body:
            setattr(proposta, field, body.get(field))

    proposta.save()
    return proposta


def delete_proposta(body):
    proposta_id = body.get('id')

    if not proposta_id:
        raise ValueError("ID da proposta é obrigatório")

    proposta = get_object_or_404(Proposta, id=proposta_id)

    if proposta.bloqueado:
        raise ValueError("Proposta Bloqueada para edição")

    proposta.ativo = False
    proposta.card_oferta = None
    proposta.usuario = None
    proposta.save()

    return proposta
