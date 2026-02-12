from django.contrib import admin
from .models import HistoricoCard, HistoricoProposta
# Register your models here.

admin.site.register(HistoricoCard)
class HistoricoCardAdmin(admin.ModelAdmin):
    list_display = ['card__codigo_interno', 'date']
    search_fields = ['card__codigo_interno', 'date']


admin.site.register(HistoricoProposta)
class HistoricoPropostaAdmin(admin.ModelAdmin):
    list_display = ['proposta__codigo_interno', 'date']
    search_fields = ['proposta__codigo_interno', 'date']
