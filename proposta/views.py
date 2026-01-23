from django.views import View
from django.http import JsonResponse
from django.views.generic import TemplateView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import get_object_or_404
from app.mixins import AdminRequiredMixin
import json
from .models import Status


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
