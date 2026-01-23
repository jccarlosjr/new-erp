from django.views import View
from django.http import JsonResponse
from django.views.generic import TemplateView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import get_object_or_404
from app.mixins import AdminRequiredMixin
import json
from .models import Banco


class BancoView(LoginRequiredMixin, AdminRequiredMixin, TemplateView):
    template_name = 'bancos.html'


class BancoAPIView(LoginRequiredMixin, AdminRequiredMixin, View):

    def get(self, request):
        bancos = Banco.objects.all().values('id', 'codigo', 'nome')

        return JsonResponse({
            "status": "success",
            "data": list(bancos)
        })


    def post(self, request):
        try:
            body = json.loads(request.body)

            banco_id = body.get('id')
            codigo = body.get('codigo')
            nome = body.get('nome')

            if not codigo or not nome:
                return JsonResponse({
                    "status": "error",
                    "message": "Código e nome são obrigatórios"
                }, status=400)

            if banco_id:
                banco = get_object_or_404(Banco, id=banco_id)

                if Banco.objects.exclude(id=banco_id).filter(codigo=codigo).exists():
                    return JsonResponse({
                        "status": "error",
                        "message": "Já existe um banco com esse código"
                    }, status=400)

                banco.codigo = codigo
                banco.nome = nome
                banco.save()

                return JsonResponse({
                    "status": "success",
                    "data": {
                        "id": banco.id,
                        "codigo": banco.codigo,
                        "nome": banco.nome
                    }
                })

            if Banco.objects.filter(codigo=codigo).exists():
                return JsonResponse({
                    "status": "error",
                    "message": "Já existe um banco com esse código"
                }, status=400)

            banco = Banco.objects.create(
                codigo=codigo,
                nome=nome
            )

            return JsonResponse({
                "status": "success",
                "data": {
                    "id": banco.id,
                    "codigo": banco.codigo,
                    "nome": banco.nome
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
            banco_id = body.get('id')

            if not banco_id:
                return JsonResponse({
                    "status": "error",
                    "message": "ID do banco é obrigatório"
                }, status=400)

            banco = get_object_or_404(Banco, id=banco_id)
            banco.delete()

            return JsonResponse({
                "status": "success",
                "message": "Banco removido com sucesso"
            })

        except Exception as e:
            return JsonResponse({
                "status": "error",
                "message": str(e)
            }, status=400)
