from django.contrib.auth.mixins import LoginRequiredMixin
from app.mixins import AdminRequiredMixin
from django.views.generic import TemplateView
from django.shortcuts import get_object_or_404
from django.views import View
from django.http import JsonResponse
import json
from .models import Tabela
from banco.models import Banco
from operacao.models import Operacao


class TabelaView(LoginRequiredMixin, AdminRequiredMixin, TemplateView):
    template_name = 'tabela.html'


class TabelaAPIView(LoginRequiredMixin, AdminRequiredMixin, View):

    def get(self, request):
        banco_id = request.GET.get('banco')
        operacao_id = request.GET.get('operacao')
        is_active = request.GET.get('ativo')

        tabelas = Tabela.objects.select_related('banco', 'operacao')

        if banco_id:
            tabelas = tabelas.filter(banco_id=banco_id)
        
        if operacao_id:
            tabelas = tabelas.filter(operacao_id=operacao_id)

        if is_active:
            tabelas = tabelas.filter(ativo=True)

        data = tabelas.values(
            'id',
            'nome',
            'coeficiente',
            'taxa',
            'prazo',
            'ativo',
            'cms',
            'tipo_cms',
            'digital',
            'banco__id',
            'banco__nome',
            'operacao__id',
            'operacao__nome'
        )

        return JsonResponse({
            "status": "success",
            "data": list(data)
        })

    def post(self, request):
        try:
            body = json.loads(request.body)

            tabela_id = body.get('id')
            nome = body.get('nome')
            operacao_id = body.get('operacao')
            banco_id = body.get('banco')
            coeficiente = body.get('coeficiente')
            taxa = body.get('taxa', 1.85)
            prazo = body.get('prazo')
            ativo = body.get('ativo', True)
            cms = body.get('cms')
            tipo_cms = body.get('tipo_cms')
            digital = body.get('digital', True)

            required_fields = [nome, operacao_id, banco_id, coeficiente, prazo, cms, tipo_cms]
            if any(field is None for field in required_fields):
                return JsonResponse({
                    "status": "error",
                    "message": f"Campos obrigatórios não informados"
                }, status=400)

            operacao = get_object_or_404(Operacao, id=operacao_id)
            banco = get_object_or_404(Banco, id=banco_id)

            if tabela_id:
                tabela = get_object_or_404(Tabela, id=tabela_id)
            else:
                tabela = Tabela()

            tabela.nome = nome
            tabela.operacao = operacao
            tabela.banco = banco
            tabela.coeficiente = coeficiente
            tabela.taxa = taxa
            tabela.prazo = prazo
            tabela.ativo = ativo
            tabela.cms = cms
            tabela.tipo_cms = tipo_cms
            tabela.digital = digital

            tabela.save()

            return JsonResponse({
                "status": "success",
                "data": {
                    "id": tabela.id,
                    "nome": tabela.nome
                }
            }, status=201 if not tabela_id else 200)

        except Exception as e:
            return JsonResponse({
                "status": "error",
                "message": str(e)
            }, status=400)
    
    def delete(self, request):
        try:
            body = json.loads(request.body)
            tabela_id = body.get('id')

            if not tabela_id:
                return JsonResponse({
                    "status": "error",
                    "message": "ID da tabela é obrigatório"
                }, status=400)

            tabela = get_object_or_404(Tabela, id=tabela_id)
            tabela.delete()

            return JsonResponse({
                "status": "success",
                "message": "Tabela removida com sucesso"
            })

        except Exception as e:
            return JsonResponse({
                "status": "error",
                "message": str(e)
            }, status=400)

    def patch(self, request):
        try:
            body = json.loads(request.body)
            tabela_id = body.get('id')
            ativo = body.get('ativo')

            if tabela_id is None or ativo is None:
                return JsonResponse({
                    "status": "error",
                    "message": "ID e status ativo são obrigatórios"
                }, status=400)

            tabela = get_object_or_404(Tabela, id=tabela_id)
            tabela.ativo = ativo
            tabela.save(update_fields=['ativo'])

            return JsonResponse({
                "status": "success",
                "message": "Tabela atualizada com sucesso",
                "data": {
                    "id": tabela.id,
                    "ativo": tabela.ativo
                }
            })

        except Exception as e:
            return JsonResponse({
                "status": "error",
                "message": str(e)
            }, status=400)
