from django.views import View
from django.http import JsonResponse
from django.views.generic import TemplateView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import get_object_or_404
from app.mixins import AdminRequiredMixin
import json
from .models import Status, Proposta
from cliente.models import Cliente
from card_oferta.models import CardOferta
from tabela.models import Tabela
from accounts.models import CustomUser

class StatusView(LoginRequiredMixin, AdminRequiredMixin, TemplateView):
    template_name = 'status.html'


class StatusAPIView(LoginRequiredMixin, AdminRequiredMixin, View):
    
    def get(self, request):
        status = Status.objects.all().values('id', 'codigo', 'nome', 'color')

        return JsonResponse({
            "status": "success",
            "data": list(status)
        })


    def post(self, request):
        try:
            body = json.loads(request.body)

            status_id = body.get('id')
            codigo = body.get('codigo')
            nome = body.get('nome')
            color = body.get('color')

            if not codigo or not nome:
                return JsonResponse({
                    "status": "error",
                    "message": "Código e nome são obrigatórios"
                }, status=400)

            if status_id:
                status = get_object_or_404(Status, id=status_id)

                if Status.objects.exclude(id=status_id).filter(codigo=codigo).exists():
                    return JsonResponse({
                        "status": "error",
                        "message": "Já existe um status com esse código"
                    }, status=400)

                status.codigo = codigo
                status.nome = nome
                status.color = color
                status.save()

                return JsonResponse({
                    "status": "success",
                    "data": {
                        "id": status.id,
                        "codigo": status.codigo,
                        "nome": status.nome,
                        "color": status.color
                    }
                })

            if Status.objects.filter(codigo=codigo).exists():
                return JsonResponse({
                    "status": "error",
                    "message": "Já existe um status com esse código"
                }, status=400)

            status = Status.objects.create(
                codigo=codigo,
                nome=nome,
                color=color
            )

            return JsonResponse({
                "status": "success",
                "data": {
                    "id": status.id,
                    "codigo": status.codigo,
                    "nome": status.nome,
                    "color": status.color
                }
            }, status=201)

        except Exception as e:
            return JsonResponse({
                "status": "error",
                "message": str(e)
            }, status=400)


    def delete(self, request):
        try:
            body = json.loads(request.body)
            status_id = body.get('id')

            if not status_id:
                return JsonResponse({
                    "status": "error",
                    "message": "ID do status é obrigatório"
                }, status=400)

            status = get_object_or_404(Status, id=status_id)
            status.delete()

            return JsonResponse({
                "status": "success",
                "message": "Status removido com sucesso"
            })

        except Exception as e:
            return JsonResponse({
                "status": "error",
                "message": str(e)
            }, status=400)


class PropostaAPIView(LoginRequiredMixin, View):

    def get(self, request):
        ade = request.GET.get('ade')
        codigo_interno = request.GET.get('codigo_interno')
        card_codigo = request.GET.get('card_codigo_interno')
        cpf = request.GET.get('cpf')

        propostas = Proposta.objects.select_related(
            'cliente',
            'tabela',
            'usuario',
            'status',
            'card_oferta'
        )

        # 🔎 Filtros
        if ade:
            propostas = propostas.filter(ade=ade)

        if codigo_interno:
            propostas = propostas.filter(codigo_interno=codigo_interno)

        if card_codigo:
            propostas = propostas.filter(
                card_oferta__codigo_interno=card_codigo
            )

        if cpf:
            propostas = propostas.filter(cliente__cpf=cpf)

        propostas = propostas.order_by('-ultima_atualizacao')

        propostas = propostas.values(
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

            'usuario__id',
            'usuario__username',

            'status__id',
            'status__nome',
            'status__codigo',

            'card_oferta__id',
            'card_oferta__codigo_interno',
        )

        return JsonResponse({
            "status": "success",
            "data": list(propostas)
        })


    def post(self, request):
        try:
            body = json.loads(request.body)

            proposta_id = body.get('id')

            cpf = body.get('cpf')
            tabela_id = body.get('tabela_id')
            status_id = body.get('status_id')
            usuario_id = body.get('usuario_id')
            card_oferta_id = body.get('card_oferta_id')

            parcela = body.get('parcela')
            prazo = body.get('prazo')
            troco = body.get('troco')

            if not cpf:
                return JsonResponse({
                    "status": "error",
                    "message": "CPF do cliente é obrigatório"
                }, status=400)

            if not tabela_id or not status_id or not usuario_id:
                return JsonResponse({
                    "status": "error",
                    "message": "Tabela, status e usuário são obrigatórios"
                }, status=400)

            if parcela is None or prazo is None or troco is None:
                return JsonResponse({
                    "status": "error",
                    "message": "Parcela, prazo e troco são obrigatórios"
                }, status=400)

            cliente = get_object_or_404(Cliente, cpf=cpf)
            tabela = get_object_or_404(Tabela, id=tabela_id)
            status = get_object_or_404(Status, id=status_id)
            usuario = get_object_or_404(CustomUser, id=usuario_id)

            card_oferta = None
            if card_oferta_id:
                card_oferta = get_object_or_404(CardOferta, id=card_oferta_id)

            data = {
                "ade": body.get('ade'),
                "bloqueado": body.get('bloqueado', False),
                "obs": body.get('obs'),
                "cms": body.get('cms'),
                "parcela": parcela,
                "prazo": prazo,
                "financiado": body.get('financiado'),
                "saldo_devedor": body.get('saldo_devedor'),
                "troco": troco,
                "prazo_original": body.get('prazo_original'),
                "prazo_restante": body.get('prazo_restante'),
                "contrato_portado": body.get('contrato_portado'),
                "banco_origem": body.get('banco_origem'),
                "cliente": cliente,
                "tabela": tabela,
                "status": status,
                "usuario": usuario,
                "card_oferta": card_oferta,
            }

            # UPDATE
            if proposta_id:
                proposta = get_object_or_404(Proposta, id=proposta_id)

                for field, value in data.items():
                    setattr(proposta, field, value)

                proposta.save()

                return JsonResponse({
                    "status": "success",
                    "data": {
                        "id": proposta.id,
                        "codigo_interno": proposta.codigo_interno
                    }
                })

            # CREATE
            proposta = Proposta.objects.create(**data)

            return JsonResponse({
                "status": "success",
                "data": {
                    "id": proposta.id,
                    "codigo_interno": proposta.codigo_interno
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
            proposta_id = body.get('id')

            if not proposta_id:
                return JsonResponse({
                    "status": "error",
                    "message": "ID da proposta é obrigatório"
                }, status=400)

            proposta = get_object_or_404(Proposta, id=proposta_id)

            # FKs
            if 'cpf' in body:
                proposta.cliente = Cliente.objects.filter(
                    cpf=body.get('cpf')
                ).first()

            if 'tabela_id' in body:
                proposta.tabela = Tabela.objects.filter(
                    id=body.get('tabela_id')
                ).first()

            if 'status_id' in body:
                proposta.status = Status.objects.filter(
                    id=body.get('status_id')
                ).first()

            if 'usuario_id' in body:
                proposta.usuario = CustomUser.objects.filter(
                    id=body.get('usuario_id')
                ).first()

            if 'card_oferta_id' in body:
                proposta.card_oferta = CardOferta.objects.filter(
                    id=body.get('card_oferta_id')
                ).first()

            # Campos simples
            fields = [
                'ade',
                'bloqueado',
                'obs',
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
            ]

            for field in fields:
                if field in body:
                    setattr(proposta, field, body.get(field))

            proposta.save()

            return JsonResponse({
                "status": "success",
                "data": {
                    "id": proposta.id,
                    "codigo_interno": proposta.codigo_interno
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
            proposta_id = body.get('id')

            if not proposta_id:
                return JsonResponse({
                    "status": "error",
                    "message": "ID da proposta é obrigatório"
                }, status=400)

            proposta = get_object_or_404(Proposta, id=proposta_id)
            proposta.delete()

            return JsonResponse({
                "status": "success",
                "message": "Proposta removida com sucesso"
            })

        except Exception as e:
            return JsonResponse({
                "status": "error",
                "message": str(e)
            }, status=400)
