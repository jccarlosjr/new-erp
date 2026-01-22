from django.contrib import admin
from .models import Operacao


@admin.register(Operacao)
class OperacaoAdmin(admin.ModelAdmin):
    list_display = ('nome',)
    search_fields = ('nome',)