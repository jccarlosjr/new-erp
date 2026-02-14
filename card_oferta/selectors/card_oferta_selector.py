from card_oferta.models import CardOferta
from proposta.models import Proposta

STATUS_MAP = {
    'Não Iniciado': 'NAO_INICIADO',
    'Aguardando Digitação': 'DIGITACAO',
    'Andamento': 'ANDAMENTO',
    'Aguardando Formalização': 'FORMALIZACAO',
    'Finalizado': 'FINALIZADO',
    'Precisa de Atenção': 'ATENCAO',
    'Finalizado': 'FINALIZADO',
    'Cancelado': 'CANCELADO',
    'Excluído': 'EXCLUIDO',
}


def list_cards(user, filters):
    cards = CardOferta.objects.select_related(
        'cliente', 'matricula', 'user'
    ).filter(user=user, active=True)

    if filters.get('user_id'):
        cards = cards.filter(user__id=filters['user_id'])

    if filters.get('cpf'):
        cards = cards.filter(cliente__cpf__icontains=filters['cpf'])

    if filters.get('nome'):
        cards = cards.filter(cliente__nome__icontains=filters['nome'])

    if filters.get('matricula'):
        cards = cards.filter(matricula__matricula__icontains=filters['matricula'])

    if filters.get('codigo_interno_card'):
        cards = cards.filter(codigo_interno__icontains=filters['codigo_interno'])

    if filters.get('codigo_interno_proposta'):
        cards = cards.filter(proposta__codigo_interno__icontains=filters['codigo_interno'])

    if filters.get('banco'):
        cards = cards.filter(proposta__tabela__banco__nome__icontains=filters['banco']).distinct()
    
    if filters.get('operacao'):
        cards = cards.filter(proposta__tabela__operacao__nome__icontains=filters['operacao']).distinct()

    if filters.get('status'):
        status = STATUS_MAP.get(filters['status'], filters['status'])
        cards = cards.filter(status=status)

    return cards.order_by('-id')
