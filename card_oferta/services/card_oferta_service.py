import json
from django.shortcuts import get_object_or_404
from django.db import transaction
from card_oferta.models import CardOferta
from cliente.models import Cliente
from convenio.models import Matricula
from proposta.models import Proposta, Status
from django.core.exceptions import ValidationError


def create_or_update_card(user, body):
    card_id = body.get('id')
    cpf = body.get('cpf')
    active = body.get('active')
    matricula_id = body.get('matricula_id')

    if not cpf:
        raise ValueError("CPF do cliente é obrigatório")

    if not matricula_id:
        raise ValueError("Matrícula é obrigatória")

    cliente = get_object_or_404(Cliente, cpf=cpf)
    matricula = get_object_or_404(Matricula, id=matricula_id)

    # UPDATE
    if card_id:
        card = get_object_or_404(CardOferta, id=card_id)

        if card.status != 'NAO_INICIADO':
            card.is_blocked = True

        if card.status == 'NAO_INICIADO':
            card.is_blocked = False

        card.active = active
        card.cliente = cliente
        card.matricula = matricula
        card.save()

        return card, False

    # CREATE
    card = CardOferta.objects.create(
        cliente=cliente,
        matricula=matricula,
        user=user
    )

    return card, True


@transaction.atomic
def patch_card(body):
    card_id = body.get('id')

    if not card_id:
        raise ValueError("ID do card é obrigatório")

    card = get_object_or_404(CardOferta, id=card_id)

    if 'cpf' in body:
        card.cliente = Cliente.objects.filter(
            cpf=body.get('cpf')
        ).first()

    if 'matricula_id' in body:
        card.matricula = Matricula.objects.filter(
            id=body.get('matricula_id')
        ).first()

    propostas = Proposta.objects.select_related(
        'cliente',
        'tabela__banco',
        'tabela__operacao',
        'usuario',
        'status',
        'card_oferta'
    ).order_by('-ultima_atualizacao')

    propostas = propostas.filter(card_oferta=card_id)

    if 'status' in body:
        card.status = body.get('status')

    if 'active' in body:
        card.active = body.get('active')

    if card.status != 'NAO_INICIADO':
        card.is_blocked = True
        for proposta in propostas:
            proposta.bloqueado = True
            proposta.save()

    if card.status == 'NAO_INICIADO':
        card.is_blocked = False
        for proposta in propostas:
            proposta.status = Status.objects.get(codigo=1)
            proposta.bloqueado = False
            proposta.save()

    if card.status == 'CANCELADO':
        card.is_blocked = False
        for proposta in propostas:
            proposta.status = Status.objects.get(codigo=13)
            proposta.bloqueado = False
            proposta.save()

    card.save()

    return card


def delete_card(body):
    card_id = body.get('id')

    if not card_id:
        raise ValueError("ID do card é obrigatório")

    card = get_object_or_404(CardOferta, id=card_id)

    has_propostas = Proposta.objects.filter(
        card_oferta=card, 
        ativo=True
        ).exists()
    
    if has_propostas:
        raise ValidationError(
            "Este card possui propostas vinculadas e não pode ser inativado."
        )

    card.active = False
    card.status = 'EXCLUIDO'
    card.save()

    return card
