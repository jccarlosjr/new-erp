from django.views import View
from django.http import JsonResponse
from django.contrib.auth.mixins import LoginRequiredMixin
import json
from django.views.generic import TemplateView
from .models import CardOferta
from proposta.models import Proposta
from .selectors.card_oferta_selector import list_cards, list_cards_esteira_operacional
from .services.card_oferta_service import (
    create_or_update_card,
    patch_card,
    delete_card
)


class CardOfertaAPIView(LoginRequiredMixin, View):

    def get(self, request):
        filters = request.GET.dict()
        cards = list_cards(request.user, filters)

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
            card, created = create_or_update_card(request.user, body)

            return JsonResponse({
                "status": "success",
                "data": {
                    "id": card.id,
                    "codigo_interno": card.codigo_interno
                }
            }, status=201 if created else 200)

        except Exception as e:
            return JsonResponse({
                "status": "error",
                "message": str(e)
            }, status=400)


    def patch(self, request):
        try:
            body = json.loads(request.body)
            card = patch_card(body, request)

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
            delete_card(body, request)

            return JsonResponse({
                "status": "success",
                "message": "Card removido com sucesso"
            })

        except Exception as e:
            return JsonResponse({
                "status": "error",
                "message": str(e)
            }, status=400)


class CardOfertaPropostaAPIView(LoginRequiredMixin, View):

    def get(self, request):
        filters = request.GET.dict()
        cards = list_cards(request.user, filters)

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
            'ultima_atualizacao',
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

            'status',

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


class EsteiraOperacionalAPIView(LoginRequiredMixin, View):

    def get(self, request):
        filters = request.GET.dict()
        cards = list_cards_esteira_operacional(filters)

        cards = cards.order_by('-ultima_atualizacao')

        card_ids = list(cards.values_list('id', flat=True))

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
            'ultima_atualizacao',
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

            'status',

            'card_oferta__id',
        )

        propostas_por_card = {}

        for proposta in propostas_values:
            card_id = proposta['card_oferta__id']

            if card_id not in propostas_por_card:
                propostas_por_card[card_id] = []

            propostas_por_card[card_id].append(proposta)

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


class CardEsteiraOperacionalView(LoginRequiredMixin, TemplateView):
    template_name = 'esteira_operacional.html'
