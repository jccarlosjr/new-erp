from django.views import View
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.contrib.auth.mixins import LoginRequiredMixin
import json
from app.mixins import AdminRequiredMixin
from django.views.generic import TemplateView
from .models import CardOferta
from cliente.models import Cliente
from convenio.models import Matricula


class CardOfertaAPIView(LoginRequiredMixin, View):

    def get(self, request):
            cpf = request.GET.get('cpf')
            nome = request.GET.get('nome')
            matricula = request.GET.get('matricula')
            codigo_interno = request.GET.get('codigo_interno')
            status = request.GET.get('status')
            user_id = request.GET.get('user_id')

            cards = CardOferta.objects.select_related(
                'cliente', 'matricula', 'user'
            )

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
                'Digitação Solicitada': 'DIGITACAO',
                'Digitado': 'DIGITADO',
                'Finalizado': 'FINALIZADO',
                'Cancelado': 'CANCELADO',
            }

            if status:
                status = STATUS_MAP.get(status, status)
                cards = cards.filter(status=status)

            data = []
            for card in cards:
                data.append({
                    'id': card.id,
                    'codigo_interno': card.codigo_interno,
                    'status': card.status,
                    'status_nome': card.get_status_display(),

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


class CardView(LoginRequiredMixin, TemplateView):
    template_name = 'cards.html'