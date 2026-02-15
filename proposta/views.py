from django.views import View
from django.http import JsonResponse
from django.views.generic import TemplateView, DetailView, ListView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import get_object_or_404
from app.mixins import AdminRequiredMixin
import json
from .models import Status, Proposta
from django.views.generic import TemplateView
from .selectors.proposta_selector import list_propostas, list_propostas_geral
from .services.proposta_service import (
    create_or_update_proposta,
    patch_proposta, patch_proposta_geral,
    delete_proposta
)

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
        filters = request.GET.dict()
        propostas = list_propostas(filters, request.user)

        return JsonResponse({
            "status": "success",
            "data": list(propostas)
        })


    def post(self, request):
        try:
            body = json.loads(request.body)
            proposta, created = create_or_update_proposta(body)

            return JsonResponse({
                "status": "success",
                "data": {
                    "id": proposta.id,
                    "codigo_interno": proposta.codigo_interno
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
            proposta = patch_proposta(body)

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
            delete_proposta(body)

            return JsonResponse({
                "status": "success",
                "message": "Proposta removida com sucesso"
            })

        except Exception as e:
            return JsonResponse({
                "status": "error",
                "message": str(e)
            }, status=400)


class PropostaGeralListAPIView(LoginRequiredMixin, AdminRequiredMixin, View):

    def get(self, request):
        filters = request.GET.dict()
        propostas = list_propostas_geral(filters)

        return JsonResponse({
            "status": "success",
            "data": list(propostas)
        })

    def patch(self, request):
        try:
            body = json.loads(request.body)
            proposta = patch_proposta_geral(body, request)

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


class PropostaView(LoginRequiredMixin, TemplateView):
    template_name = 'propostas.html'


class PropostaDetailView(LoginRequiredMixin, DetailView):
    template_name = 'proposta.html'
    model = Proposta
    context_object_name = 'proposta'


class PropostaGeralListView(LoginRequiredMixin, AdminRequiredMixin, TemplateView):
    template_name = 'proposta_list.html'
