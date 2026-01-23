import json
from django.http import JsonResponse
from django.views import View
from django.shortcuts import get_object_or_404
from django.contrib.auth.mixins import LoginRequiredMixin
from empresa.models import Sala, Empresa
from app.mixins import AdminRequiredMixin
from django.views.generic import TemplateView


class SalaView(LoginRequiredMixin, AdminRequiredMixin, TemplateView):
    template_name = 'salas.html'


class SalaAPIView(LoginRequiredMixin, AdminRequiredMixin, View):

    def get_empresa_usuario(self, request):
        """
        Retorna a empresa do usuário logado.
        """
        if not request.user.sala or not request.user.sala.empresa:
            return None
        return request.user.sala.empresa

    def get(self, request):
        empresa = self.get_empresa_usuario(request)

        if not empresa:
            return JsonResponse({
                "status": "error",
                "message": "Usuário não possui empresa vinculada"
            }, status=403)

        salas = Sala.objects.filter(
            empresa=empresa
        ).values(
            'id',
            'nome',
            'empresa__id',
            'empresa__nome'
        )

        return JsonResponse({
            "status": "success",
            "data": list(salas)
        })


    def post(self, request):
        try:
            empresa = self.get_empresa_usuario(request)

            if not empresa:
                return JsonResponse({
                    "status": "error",
                    "message": "Usuário não possui empresa vinculada"
                }, status=403)

            body = json.loads(request.body)

            sala_id = body.get('id')
            nome = body.get('nome')

            if not nome:
                return JsonResponse({
                    "status": "error",
                    "message": "Nome da sala é obrigatório"
                }, status=400)

            if sala_id:
                sala = get_object_or_404(
                    Sala,
                    id=sala_id,
                    empresa=empresa
                )

                sala.nome = nome
                sala.save()

                return JsonResponse({
                    "status": "success",
                    "data": {
                        "id": sala.id,
                        "nome": sala.nome,
                        "empresa": sala.empresa.id,
                        "empresa_nome": sala.empresa.nome
                    }
                })

            sala = Sala.objects.create(
                nome=nome,
                empresa=empresa
            )

            return JsonResponse({
                "status": "success",
                "data": {
                    "id": sala.id,
                    "nome": sala.nome,
                    "empresa": sala.empresa.id,
                    "empresa_nome": sala.empresa.nome
                }
            }, status=201)

        except Exception as e:
            return JsonResponse({
                "status": "error",
                "message": str(e)
            }, status=400)


    def delete(self, request):
        try:
            empresa = self.get_empresa_usuario(request)

            if not empresa:
                return JsonResponse({
                    "status": "error",
                    "message": "Usuário não possui empresa vinculada"
                }, status=403)

            body = json.loads(request.body)
            sala_id = body.get('id')

            if not sala_id:
                return JsonResponse({
                    "status": "error",
                    "message": "ID da sala é obrigatório"
                }, status=400)

            sala = get_object_or_404(
                Sala,
                id=sala_id,
                empresa=empresa
            )

            sala.delete()

            return JsonResponse({
                "status": "success",
                "message": "Sala removida com sucesso"
            })

        except Exception as e:
            return JsonResponse({
                "status": "error",
                "message": str(e)
            }, status=400)
