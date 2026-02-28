import json
from django.shortcuts import get_object_or_404
from django.db import transaction
from card_oferta.models import CardOferta
from cliente.models import Cliente
from convenio.models import Matricula
from proposta.models import Proposta, Status
from django.core.exceptions import ValidationError
from historico.models import HistoricoCard, HistoricoProposta


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
def patch_card(body, request):
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
            proposta.status = "Aberto"
            proposta.bloqueado = False
            proposta.save()
            HistoricoProposta.objects.create(
                proposta=proposta,
                user=request.user,
                title=proposta.status,
                obs="Proposta alterada para 'Aberto' através do card de ofertas"
            )

    if card.status == 'CANCELADO':
        card.is_blocked = False
        for proposta in propostas:
            proposta.status = "Cancelado"
            proposta.bloqueado = False
            proposta.save()
            HistoricoProposta.objects.create(
                proposta=proposta,
                user=request.user,
                title=proposta.status,
                obs="Proposta alterada para 'Cancelado' através do card de ofertas"
            )
    
    if 'is_blocked' in body:
        card.is_blocked = body.get('is_blocked')
    
    HistoricoCard.objects.create(
            card=card,
            user=request.user,
            obs=card.get_status_display()
        )

    card.save()

    return card


def delete_card(body, request):
    card_id = body.get('id')

    if not card_id:
        raise ValueError("ID do card é obrigatório")

    card = get_object_or_404(CardOferta, id=card_id)

    has_propostas = Proposta.objects.filter(
        card_oferta=card, 
        ativo=True
        ).exists()
    
    HistoricoCard.objects.create(
            card=card,
            user=request.user,
            obs="Card excluído"
        )
    
    if has_propostas:
        raise ValidationError(
            "Este card possui propostas vinculadas e não pode ser inativado."
        )

    card.active = False
    card.status = 'EXCLUIDO'
    card.save()

    return card
