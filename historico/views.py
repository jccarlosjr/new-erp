import json
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.views import View
from .models import HistoricoCard, HistoricoProposta
from django.contrib.auth.mixins import LoginRequiredMixin
from card_oferta.models import CardOferta
from proposta.models import Status, Proposta


class HistoricoCardAPIView(LoginRequiredMixin, View):

    def parse_body(self, request):
        try:
            return json.loads(request.body or '{}')
        except json.JSONDecodeError:
            return None


    def get(self, request):
        card_id = request.GET.get('card_id')

        historicos = HistoricoCard.objects.select_related(
            'card', 'user',
        )

        if card_id:
            historicos = historicos.filter(card_id=card_id)

        historicos = historicos.values(
            'id',
            'date',
            'obs',
            'card_id',
            'card__codigo_interno',
            'user__id',
            'user__username',
        )

        return JsonResponse({
            "status": "success",
            "data": list(historicos)
        })


    def post(self, request):
        body = self.parse_body(request)

        if body is None:
            return JsonResponse({
                "status": "error",
                "message": "JSON inválido"
            }, status=400)

        card_id = body.get('card_id')
        obs = body.get('obs')

        if not card_id:
            return JsonResponse({
                "status": "error",
                "message": "Card é obrigatório"
            }, status=400)

        card = get_object_or_404(CardOferta, id=card_id)

        historico = HistoricoCard.objects.create(
            card=card,
            user=request.user,
            obs=obs
        )

        return JsonResponse({
            "status": "success",
            "data": {
                "id": historico.id,
                "date": historico.date,
                "obs": historico.obs,
                "card_id": card.id,
                "user": request.user.username if request.user else None,
            }
        }, status=201)


    def delete(self, request):
        body = self.parse_body(request)

        if body is None:
            return JsonResponse({
                "status": "error",
                "message": "JSON inválido"
            }, status=400)

        historico_id = body.get('id')

        if not historico_id:
            return JsonResponse({
                "status": "error",
                "message": "ID do histórico é obrigatório"
            }, status=400)

        historico = get_object_or_404(HistoricoCard, id=historico_id)
        historico.delete()

        return JsonResponse({
            "status": "success",
            "message": "Histórico removido com sucesso"
        })


class HistoricoPropostaAPIView(LoginRequiredMixin, View):

    def parse_body(self, request):
        try:
            return json.loads(request.body or '{}')
        except json.JSONDecodeError:
            return None


    def get(self, request):
        proposta_id = request.GET.get('proposta_id')

        historicos = HistoricoProposta.objects.select_related(
            'proposta', 'user',
        )

        if proposta_id:
            historicos = historicos.filter(proposta_id=proposta_id)

        historicos = historicos.values(
            'id',
            'date',
            'obs',
            'proposta_id',
            'proposta_id__codigo_interno',
            'status__id',
            'status__codigo',
            'status__nome',
            'user__id',
            'user__username',
        )

        return JsonResponse({
            "status": "success",
            "data": list(historicos)
        })


    def post(self, request):
        body = self.parse_body(request)

        if body is None:
            return JsonResponse({
                "status": "error",
                "message": "JSON inválido"
            }, status=400)

        proposta_id = body.get('proposta_id')
        status_codigo = body.get('status_codigo')
        obs = body.get('obs')
        status = get_object_or_404(Status, codigo=status_codigo)

        if not proposta_id:
            return JsonResponse({
                "status": "error",
                "message": "Propposta é obrigatório"
            }, status=400)

        proposta = get_object_or_404(Proposta, id=proposta_id)

        historico = HistoricoCard.objects.create(
            card=proposta,
            user=request.user,
            status=status,
            obs=obs
        )

        return JsonResponse({
            "status": "success",
            "data": {
                "id": historico.id,
                "date": historico.date,
                "obs": historico.obs,
                "proposta_id": proposta.id,
                "status_id": status.id,
                "status_codigo": status.codigo,
                "status_nome": status.nome,
                "user": request.user.username if request.user else None,
            }
        }, status=201)


    def delete(self, request):
        body = self.parse_body(request)

        if body is None:
            return JsonResponse({
                "status": "error",
                "message": "JSON inválido"
            }, status=400)

        historico_id = body.get('id')

        if not historico_id:
            return JsonResponse({
                "status": "error",
                "message": "ID do histórico é obrigatório"
            }, status=400)

        historico = get_object_or_404(HistoricoProposta, id=historico_id)
        historico.delete()

        return JsonResponse({
            "status": "success",
            "message": "Histórico removido com sucesso"
        })
