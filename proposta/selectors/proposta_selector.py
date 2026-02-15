from proposta.models import Proposta

def list_propostas(filters, usuario):
    propostas = Proposta.objects.select_related(
        'cliente',
        'tabela',
        'usuario',
        'status',
        'card_oferta'
    )

    if filters.get('ade'):
        propostas = propostas.filter(ade=filters['ade'])

    if filters.get('codigo_interno'):
        propostas = propostas.filter(
            codigo_interno=filters['codigo_interno']
        )

    if filters.get('card_codigo_interno'):
        propostas = propostas.filter(
            card_oferta__codigo_interno=filters['card_codigo_interno']
        )

    if filters.get('card_id'):
        propostas = propostas.filter(
            card_oferta__id=filters['card_id']
        )

    if filters.get('cpf'):
        propostas = propostas.filter(
            cliente__cpf=filters['cpf']
        )

    propostas = propostas.filter(ativo=True, usuario=usuario)
    propostas = propostas.order_by('-ultima_atualizacao')

    return propostas.values(
        'id',
        'ade',
        'ade_2',
        'bloqueado',
        'codigo_interno',
        'obs',
        'ultima_atualizacao',
        'criacao',
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
        'bloqueado',
        'ativo',

        'cliente__cpf',
        'cliente__nome',

        'tabela__id',
        'tabela__nome',
        'tabela__coeficiente',
        'tabela__banco__id',
        'tabela__banco__nome',
        'tabela__operacao__nome',
        'tabela__operacao__id',

        'usuario__id',
        'usuario__username',

        'status__id',
        'status__nome',
        'status__codigo',

        'card_oferta__id',
        'card_oferta__codigo_interno',
        'card_oferta__matricula__matricula',
    )


def list_propostas_geral(filters):
    propostas = Proposta.objects.select_related(
        'cliente',
        'tabela',
        'usuario',
        'status',
        'card_oferta'
    )

    if filters.get('ade'):
        propostas = propostas.filter(ade=filters['ade'])

    if filters.get('codigo_interno'):
        propostas = propostas.filter(
            codigo_interno=filters['codigo_interno']
        )

    if filters.get('card_codigo_interno'):
        propostas = propostas.filter(
            card_oferta__codigo_interno=filters['card_codigo_interno']
        )

    if filters.get('card_id'):
        propostas = propostas.filter(
            card_oferta__id=filters['card_id']
        )

    if filters.get('cpf'):
        propostas = propostas.filter(
            cliente__cpf=filters['cpf']
        )

    propostas = propostas.filter(ativo=True)
    propostas = propostas.order_by('-ultima_atualizacao')

    return propostas.values(
        'id',
        'ade',
        'ade_2',
        'bloqueado',
        'codigo_interno',
        'obs',
        'ultima_atualizacao',
        'criacao',
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
        'bloqueado',
        'ativo',

        'cliente__cpf',
        'cliente__nome',

        'tabela__id',
        'tabela__nome',
        'tabela__coeficiente',
        'tabela__banco__id',
        'tabela__banco__nome',
        'tabela__operacao__nome',
        'tabela__operacao__id',

        'usuario__id',
        'usuario__username',

        'status__id',
        'status__nome',
        'status__codigo',

        'card_oferta__id',
        'card_oferta__status',
        'card_oferta__codigo_interno',
        'card_oferta__matricula__matricula',
    )
