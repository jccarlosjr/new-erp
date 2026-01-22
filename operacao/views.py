from django.contrib.auth.mixins import LoginRequiredMixin
from app.mixins import AdminRequiredMixin
from django.views.generic import TemplateView
from django.shortcuts import get_object_or_404
from django.views import View
from django.http import JsonResponse
import json
from .models import Operacao


class OperacaoView(LoginRequiredMixin, AdminRequiredMixin, TemplateView):
    template_name = 'operacao.html'


class OperacaoAPIView(LoginRequiredMixin, AdminRequiredMixin, View):

    def get(self, request):
        operacoes = Operacao.objects.all().values('id', 'nome')

        return JsonResponse({
            "status": "success",
            "data": list(operacoes)
        })
    
    def post(self, request):
        try:
            body = json.loads(request.body)

            operacao_id = body.get('id')
            nome = body.get('nome')

            if not nome:
                return JsonResponse({
                    "status": "error",
                    "message": "Nome é obrigatório"
                }, status=400)
            
            if operacao_id:
                operacao = get_object_or_404(Operacao, id=operacao_id)
                
                operacao.nome = nome
                operacao.save()

                return JsonResponse({
                    "status": "success",
                    "data": {
                        "id": operacao.id,
                        "nome": operacao.nome
                    }
                })

            operacao = Operacao.objects.create(nome=nome)

            return JsonResponse({
                "status": "success",
                "data": {
                    "id": operacao.id,
                    "nome": operacao.nome
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
            operacao_id = body.get('id')

            if not operacao_id:
                return JsonResponse({
                    "status": "error",
                    "message": "ID da operação é obrigatório"
                }, status=400)

            operacao = get_object_or_404(Operacao, id=operacao_id)
            operacao.delete()

            return JsonResponse({
                "status": "success",
                "message": "Operação removida com sucesso"
            })

        except Exception as e:
            return JsonResponse({
                "status": "error",
                "message": str(e)
            }, status=400)
