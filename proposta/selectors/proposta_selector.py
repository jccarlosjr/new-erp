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
        'status',

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
        'status',

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

        'card_oferta__id',
        'card_oferta__status',
        'card_oferta__codigo_interno',
        'card_oferta__matricula__matricula',
    )


def list_propostas_detail(pk: int):

    proposta = (
        Proposta.objects
        .select_related(
            'cliente',
            'tabela__banco',
            'tabela__operacao',
            'usuario',
            'status',
            'card_oferta__matricula',
        )
        .filter(id=pk, ativo=True)
        .first()
    )

    if not proposta:
        return None

    return {
        "id": proposta.id,
        "ade": proposta.ade,
        "ade_2": proposta.ade_2,
        "bloqueado": proposta.bloqueado,
        "codigo_interno": proposta.codigo_interno,
        "obs": proposta.obs,
        "ultima_atualizacao": proposta.ultima_atualizacao,
        "criacao": proposta.criacao,
        "cms": proposta.cms,
        "parcela": proposta.parcela,
        "prazo": proposta.prazo,
        "financiado": proposta.financiado,
        "saldo_devedor": proposta.saldo_devedor,
        "troco": proposta.troco,
        "prazo_original": proposta.prazo_original,
        "prazo_restante": proposta.prazo_restante,
        "contrato_portado": proposta.contrato_portado,
        "banco_origem": proposta.banco_origem,
        "ativo": proposta.ativo,
        "status": proposta.status,

        "cliente": {
            "cpf": proposta.cliente.cpf,
            "nome": proposta.cliente.nome,
            "nascimento": proposta.cliente.nascimento,
            "sexo": proposta.cliente.sexo,
            "email": proposta.cliente.email,
            "iletrado": proposta.cliente.iletrado,
            "numero_documento": proposta.cliente.numero_documento,
            "orgao_emissor": proposta.cliente.orgao_emissor,
            "uf_emissao": proposta.cliente.uf_emissao,
            "data_emissao": proposta.cliente.data_emissao,
            "naturalidade": proposta.cliente.naturalidade,
            "uf_naturalidade": proposta.cliente.uf_naturalidade,
            "pai": proposta.cliente.pai,
            "mae": proposta.cliente.mae,
            "celular": proposta.cliente.celular,
            "cep": proposta.cliente.cep,
            "endereco": proposta.cliente.endereco,
            "numero": proposta.cliente.numero,
            "bairro": proposta.cliente.bairro,
            "complemento": proposta.cliente.complemento,
            "cidade": proposta.cliente.cidade,
            "uf_cidade": proposta.cliente.uf_cidade,
        },

        "tabela": {
            "id": proposta.tabela.id,
            "nome": proposta.tabela.nome,
            "coeficiente": proposta.tabela.coeficiente,
            "prazo": proposta.tabela.prazo,

            "banco": {
                "id": proposta.tabela.banco.id,
                "nome": proposta.tabela.banco.nome,
            },

            "operacao": {
                "id": proposta.tabela.operacao.id,
                "nome": proposta.tabela.operacao.nome,
            }
        },

        "usuario": {
            "id": proposta.usuario.id,
            "username": proposta.usuario.username,
        },

        "card_oferta": (
            {
                "id": proposta.card_oferta.id,
                "status": proposta.card_oferta.status,
                "codigo_interno": proposta.card_oferta.codigo_interno,
                "matricula": {
                    "id": proposta.card_oferta.matricula.id,
                    "matricula": proposta.card_oferta.matricula.matricula,
                    "codigo_convenio": proposta.card_oferta.matricula.codigo_convenio,
                    "nome_convenio": proposta.card_oferta.matricula.convenio.nome,
                    "uf_convenio": proposta.card_oferta.matricula.uf_convenio,
                    "recebimento": proposta.card_oferta.matricula.recebimento,
                    "banco": proposta.card_oferta.matricula.banco,
                    "agencia": proposta.card_oferta.matricula.agencia,
                    "conta": proposta.card_oferta.matricula.conta,
                }
            }
            if proposta.card_oferta else None
        )
    }


