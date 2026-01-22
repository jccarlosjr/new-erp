from django.contrib import admin
from .models import Arquivo, Proposta, Status

@admin.register(Proposta)
class PropostaAdmin(admin.ModelAdmin):
    list_display = ['codigo_interno', 'ade', 'status', 'usuario', 'cliente__cpf']
    list_filter = ['codigo_interno', 'ade', 'ultima_atualizacao', 'cliente__cpf', 'cliente__nome']


@admin.register(Status)
class StatusAdmin(admin.ModelAdmin):
    list_display = ('codigo', 'nome')