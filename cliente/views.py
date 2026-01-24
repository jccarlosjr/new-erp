import json
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.views import View
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import TemplateView

from .models import Cliente



class ClienteView(LoginRequiredMixin, TemplateView):
    template_name = 'clientes/cliente_wizard.html'


class ClienteAPIView(LoginRequiredMixin, View):

    def get(self, request):
        cpf = request.GET.get('cpf')

        if not cpf:
            return JsonResponse({
                "status": "error",
                "message": "CPF é obrigatório"
            }, status=400)

        cliente = Cliente.objects.filter(cpf=cpf).values(
            'cpf',
            'nome',
            'nascimento',
            'sexo',
            'email',
            'iletrado',
            'numero_documento',
            'orgao_emissor',
            'uf_emissao',
            'data_emissao',
            'naturalidade',
            'uf_naturalidade',
            'pai',
            'mae',
            'celular',
            'cep',
            'endereco',
            'numero',
            'bairro',
            'complemento',
            'cidade',
            'uf_cidade',
        ).first()

        return JsonResponse({
            "status": "success",
            "data": cliente
        })

    def post(self, request):
        try:
            body = json.loads(request.body)

            cpf = body.get('cpf')
            nome = body.get('nome')

            if not cpf or not nome:
                return JsonResponse({
                    "status": "error",
                    "message": "CPF e nome são obrigatórios"
                }, status=400)

            data = {
                "nome": nome,
                "nascimento": body.get('nascimento'),
                "sexo": body.get('sexo'),
                "email": body.get('email'),
                "iletrado": body.get('iletrado', False),
                "numero_documento": body.get('numero_documento'),
                "orgao_emissor": body.get('orgao_emissor'),
                "uf_emissao": body.get('uf_emissao'),
                "data_emissao": body.get('data_emissao'),
                "naturalidade": body.get('naturalidade'),
                "uf_naturalidade": body.get('uf_naturalidade'),
                "pai": body.get('pai'),
                "mae": body.get('mae'),
                "celular": body.get('celular'),
                "cep": body.get('cep'),
                "endereco": body.get('endereco'),
                "numero": body.get('numero'),
                "bairro": body.get('bairro'),
                "complemento": body.get('complemento'),
                "cidade": body.get('cidade'),
                "uf_cidade": body.get('uf_cidade'),
            }

            cliente, created = Cliente.objects.update_or_create(
                cpf=cpf,
                defaults=data
            )

            return JsonResponse({
                "status": "success",
                "data": {
                    "cpf": cliente.cpf,
                    "nome": cliente.nome,
                    "created": created
                }
            }, status=201 if created else 200)

        except Exception as e:
            return JsonResponse({
                "status": "error",
                "message": str(e)
            }, status=400)

    def delete(self, request):
        try:
            body = json.loads(request.body)
            cpf = body.get('cpf')

            if not cpf:
                return JsonResponse({
                    "status": "error",
                    "message": "CPF é obrigatório"
                }, status=400)

            cliente = get_object_or_404(Cliente, cpf=cpf)
            cliente.delete()

            return JsonResponse({
                "status": "success",
                "message": "Cliente removido com sucesso"
            })

        except Exception as e:
            return JsonResponse({
                "status": "error",
                "message": str(e)
            }, status=400)

