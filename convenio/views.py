from django.contrib.auth.mixins import LoginRequiredMixin
from app.mixins import AdminRequiredMixin
from django.views.generic import TemplateView
from django.shortcuts import get_object_or_404
from django.views import View
from django.http import JsonResponse
import json
from .models import Convenio


class ConvenioView(LoginRequiredMixin, AdminRequiredMixin, TemplateView):
    template_name = 'convenios.html'


class ConvenioAPIView(LoginRequiredMixin, AdminRequiredMixin, View):

    def get(self, request):
        convenios = Convenio.objects.all().values('id', 'nome')

        return JsonResponse({
            "status": "success",
            "data": list(convenios)
        })
    
    def post(self, request):
        try:
            body = json.loads(request.body)

            convenio_id = body.get('id')
            nome = body.get('nome')

            if not nome:
                return JsonResponse({
                    "status": "error",
                    "message": "Nome é obrigatório"
                }, status=400)
            
            if convenio_id:
                convenio = get_object_or_404(Convenio, id=convenio_id)
                
                convenio.nome = nome
                convenio.save()

                return JsonResponse({
                    "status": "success",
                    "data": {
                        "id": convenio.id,
                        "nome": convenio.nome
                    }
                })

            convenio = Convenio.objects.create(nome=nome)

            return JsonResponse({
                "status": "success",
                "data": {
                    "id": convenio.id,
                    "nome": convenio.nome
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
            convenio_id = body.get('id')

            if not convenio_id:
                return JsonResponse({
                    "status": "error",
                    "message": "ID do convênio é obrigatório"
                }, status=400)

            convenio = get_object_or_404(Convenio, id=convenio_id)
            convenio.delete()

            return JsonResponse({
                "status": "success",
                "message": "Convênio removido com sucesso"
            })

        except Exception as e:
            return JsonResponse({
                "status": "error",
                "message": str(e)
            }, status=400)


import json
from django.http import JsonResponse
from django.views import View
from django.shortcuts import get_object_or_404

from .models import Matricula
from cliente.models import Cliente
from convenio.models import Convenio


class MatriculaAPIView(View):

    def get(self, request):
        cpf = request.GET.get('cpf')

        if not cpf:
            return JsonResponse({
                "status": "success",
                "data": []
            })

        matriculas = Matricula.objects.select_related(
            'cliente', 'convenio'
        )

        if cpf:
            matriculas = matriculas.filter(cliente__cpf=cpf)

        matriculas = matriculas.values(
            'id',
            'matricula',
            'codigo_convenio',
            'uf_convenio',
            'recebimento',
            'banco',
            'agencia',
            'conta',

            'cliente__nome',
            'cliente__cpf',

            'convenio__id',
            'convenio__nome',
        )

        return JsonResponse({
            "status": "success",
            "data": list(matriculas)
        })


    def post(self, request):
        try:
            body = json.loads(request.body)

            cliente_cpf = body.get('cpf')

            matricula_id = body.get('id')
            convenio_id = body.get('convenio_id')

            matricula_num = body.get('matricula')
            codigo_convenio = body.get('codigo_convenio')
            uf_convenio = body.get('uf_convenio')
            recebimento = body.get('recebimento')
            banco = body.get('banco')
            agencia = body.get('agencia')
            conta = body.get('conta')

            if not cliente_cpf:
                return JsonResponse({
                    "status": "error",
                    "message": "CPF do cliente é obrigatório"
                }, status=400)
            if not convenio_id:
                return JsonResponse({
                    "status": "error",
                    "message": "Convênio é obrigatório"
                }, status=400)

            if not matricula_num:
                return JsonResponse({
                    "status": "error",
                    "message": "Matrícula é obrigatória"
                }, status=400)

            cliente = get_object_or_404(Cliente, cpf=cliente_cpf)
            convenio = get_object_or_404(Convenio, id=convenio_id)

            # UPDATE
            if matricula_id:
                matricula = get_object_or_404(Matricula, id=matricula_id)

                matricula.cliente = cliente
                matricula.convenio = convenio
                matricula.matricula = matricula_num
                matricula.codigo_convenio = codigo_convenio
                matricula.uf_convenio = uf_convenio
                matricula.recebimento = recebimento
                matricula.banco = banco
                matricula.agencia = agencia
                matricula.conta = conta

                matricula.save()

                return JsonResponse({
                    "status": "success",
                    "data": {
                        "id": matricula.id,
                        "matricula": matricula.matricula
                    }
                })

            # CREATE
            matricula = Matricula.objects.create(
                cliente=cliente,
                convenio=convenio,
                matricula=matricula_num,
                codigo_convenio=codigo_convenio,
                uf_convenio=uf_convenio,
                recebimento=recebimento,
                banco=banco,
                agencia=agencia,
                conta=conta
            )

            return JsonResponse({
                "status": "success",
                "data": {
                    "id": matricula.id,
                    "matricula": matricula.matricula
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
            matricula_id = body.get('id')

            if not matricula_id:
                return JsonResponse({
                    "status": "error",
                    "message": "ID da matrícula é obrigatório"
                }, status=400)

            matricula = get_object_or_404(Matricula, id=matricula_id)
            matricula.delete()

            return JsonResponse({
                "status": "success",
                "message": "Matrícula removida com sucesso"
            })

        except Exception as e:
            return JsonResponse({
                "status": "error",
                "message": str(e)
            }, status=400)

