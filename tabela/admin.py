from django.contrib import admin
from .models import Tabela


@admin.register(Tabela)
class TabelaAdmin(admin.ModelAdmin):
    list_display = ('nome', 'operacao', 'banco', 'coeficiente', 'prazo', 'ativo')
    search_fields = ('nome', 'operacao__nome', 'banco__nome')
