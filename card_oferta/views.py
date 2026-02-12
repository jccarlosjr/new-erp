from django.views import View
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.contrib.auth.mixins import LoginRequiredMixin
import json
from django.views.generic import TemplateView
from .models import CardOferta
from cliente.models import Cliente
from convenio.models import Matricula
from proposta.models import Proposta


class CardOfertaAPIView(LoginRequiredMixin, View):

    def get(self, request):
            user = request.user

            cpf = request.GET.get('cpf')
            nome = request.GET.get('nome')
            matricula = request.GET.get('matricula')
            codigo_interno = request.GET.get('codigo_interno')
            status = request.GET.get('status')
            user_id = request.GET.get('user_id')

            cards = CardOferta.objects.select_related(
                'cliente', 'matricula', 'user'
            )

            cards = cards.filter(user=user, active=True)

            if user_id:
                cards = cards.filter(user__id=user_id)

            if cpf:
                cards = cards.filter(cliente__cpf__icontains=cpf)

            if nome:
                cards = cards.filter(cliente__nome__icontains=nome)

            if matricula:
                cards = cards.filter(matricula__matricula__icontains=matricula)

            if codigo_interno:
                cards = cards.filter(codigo_interno__icontains=codigo_interno)

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

            if status:
                status = STATUS_MAP.get(status, status)
                cards = cards.filter(status=status)

            cards = cards.order_by('-id')

            data = []
            for card in cards:
                data.append({
                    'id': card.id,
                    'codigo_interno': card.codigo_interno,
                    'status': card.status,
                    'status_nome': card.get_status_display(),
                    'is_blocked': card.is_blocked,

                    'user__id': card.user.id if card.user else None,
                    'user__username': card.user.username if card.user else None,

                    'cliente__cpf': card.cliente.cpf,
                    'cliente__nome': card.cliente.nome,

                    'matricula__id': card.matricula.id if card.matricula else None,
                    'matricula__matricula': card.matricula.matricula if card.matricula else None,
                })

            return JsonResponse({
                "status": "success",
                "data": data
            })


    def post(self, request):
        try:
            body = json.loads(request.body)
            user = request.user
            card_id = body.get('id')
            cpf = body.get('cpf')
            active = body.get('active')
            matricula_id = body.get('matricula_id')

            if not cpf:
                return JsonResponse({
                    "status": "error",
                    "message": "CPF do cliente é obrigatório"
                }, status=400)

            if not matricula_id:
                return JsonResponse({
                    "status": "error",
                    "message": "Matrícula é obrigatória"
                }, status=400)

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

                return JsonResponse({
                    "status": "success",
                    "data": {
                        "id": card.id,
                        "codigo_interno": card.codigo_interno
                    }
                })

            # CREATE
            card = CardOferta.objects.create(
                cliente=cliente,
                matricula=matricula,
                user=user
            )

            return JsonResponse({
                "status": "success",
                "data": {
                    "id": card.id,
                    "codigo_interno": card.codigo_interno
                }
            }, status=201)

        except Exception as e:
            return JsonResponse({
                "status": "error",
                "message": str(e)
            }, status=400)


    def patch(self, request):
        try:
            body = json.loads(request.body)
            card_id = body.get('id')

            if not card_id:
                return JsonResponse({
                    "status": "error",
                    "message": "ID do card é obrigatório"
                }, status=400)

            card = get_object_or_404(CardOferta, id=card_id)

            if 'cpf' in body:
                card.cliente = Cliente.objects.filter(
                    cpf=body.get('cpf')
                ).first()

            if 'matricula_id' in body:
                card.matricula = Matricula.objects.filter(
                    id=body.get('matricula_id')
                ).first()

            if 'status' in body:
                card.status = body.get('status')

            if 'active' in body:
                card.active = body.get('active')

            if card.status != 'NAO_INICIADO':
                card.is_blocked = True
            
            if card.status == 'NAO_INICIADO':
                card.is_blocked = False

            card.save()

            return JsonResponse({
                "status": "success",
                "data": {
                    "id": card.id,
                    "codigo_interno": card.codigo_interno,
                    "status": card.get_status_display()
                }
            })

        except Exception as e:
            return JsonResponse({
                "status": "error",
                "message": str(e)
            }, status=400)


    def delete(self, request):
        try:
            body = json.loads(request.body)
            card_id = body.get('id')

            if not card_id:
                return JsonResponse({
                    "status": "error",
                    "message": "ID do card é obrigatório"
                }, status=400)

            card = get_object_or_404(CardOferta, id=card_id)
            card.active = False
            card.status = 'EXCLUIDO'
            card.save()

            return JsonResponse({
                "status": "success",
                "message": "Card removido com sucesso"
            })

        except Exception as e:
            return JsonResponse({
                "status": "error",
                "message": str(e)
            }, status=400)


class CardProposalsOfertaAPIView(LoginRequiredMixin, View):

    def get(self, request):
        user = request.user
        status = request.GET.get('status')

        STATUS_MAP = {
            'Não Iniciado': 'NAO_INICIADO',
            'Aguardando Digitação': 'DIGITACAO',
            'Andamento': 'ANDAMENTO',
            'Aguardando Formalização': 'FORMALIZACAO',
            'Finalizado': 'FINALIZADO',
            'Precisa de Atenção': 'ATENCAO',
            'Cancelado': 'CANCELADO',
            'Excluído': 'EXCLUIDO',
        }

        ## Buscar cards do usuário
        cards = CardOferta.objects.select_related(
            'user', 'cliente', 'matricula'
        ).filter(
            user=user,
            active=True
        )

        if status:
            status = STATUS_MAP.get(status, status)
            cards = cards.filter(status=status)

        cards = cards.order_by('-ultima_atualizacao')

        # Pega ids dos cards
        card_ids = list(cards.values_list('id', flat=True))

        # Busca propostas relacionadas a esses cards
        propostas = Proposta.objects.select_related(
            'cliente',
            'tabela__banco',
            'tabela__operacao',
            'usuario',
            'status',
            'card_oferta'
        ).filter(
            card_oferta__in=card_ids
        ).order_by('-ultima_atualizacao')

        propostas_values = propostas.values(
            'id',
            'ade',
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
        )

        # Agrupa propostas por card
        propostas_por_card = {}

        for proposta in propostas_values:
            card_id = proposta['card_oferta__id']

            if card_id not in propostas_por_card:
                propostas_por_card[card_id] = []

            propostas_por_card[card_id].append(proposta)

        # Response final
        data = []

        for card in cards:
            data.append({
                'id': card.id,
                'codigo_interno': card.codigo_interno,
                'status': card.status,
                'status_nome': card.get_status_display(),
                'is_blocked': card.is_blocked,

                'user__id': card.user.id if card.user else None,
                'user__username': card.user.username if card.user else None,

                'cliente__cpf': card.cliente.cpf,
                'cliente__nome': card.cliente.nome,

                'matricula__id': card.matricula.id if card.matricula else None,
                'matricula__matricula': card.matricula.matricula if card.matricula else None,

                'propostas': propostas_por_card.get(card.id, [])
            })

        return JsonResponse({
            "status": "success",
            "data": data
        })


class CardView(LoginRequiredMixin, TemplateView):
    template_name = 'cards.html'


class CardEsteiraView(LoginRequiredMixin, TemplateView):
    template_name = 'meus_cards.html'