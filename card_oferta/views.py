from django.views import View
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.contrib.auth.mixins import LoginRequiredMixin
import json
from .models import CardOferta
from cliente.models import Cliente
from convenio.models import Matricula


class CardOfertaAPIView(LoginRequiredMixin, View):

    def get(self, request):
        cpf = request.GET.get('cpf')

        cards = CardOferta.objects.select_related(
            'cliente', 'matricula'
        )

        if cpf:
            cards = cards.filter(cliente__cpf=cpf)

        cards = cards.values(
            'id',
            'codigo_interno',

            'cliente__cpf',
            'cliente__nome',

            'matricula__id',
            'matricula__matricula',
        )

        return JsonResponse({
            "status": "success",
            "data": list(cards)
        })


    def post(self, request):
        try:
            body = json.loads(request.body)

            card_id = body.get('id')
            cpf = body.get('cpf')
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
                matricula=matricula
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

            card.save()

            return JsonResponse({
                "status": "success",
                "data": {
                    "id": card.id,
                    "codigo_interno": card.codigo_interno
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
            card.delete()

            return JsonResponse({
                "status": "success",
                "message": "Card removido com sucesso"
            })

        except Exception as e:
            return JsonResponse({
                "status": "error",
                "message": str(e)
            }, status=400)
