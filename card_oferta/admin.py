from django.contrib import admin
from .models import CardOferta
# Register your models here.

@admin.register(CardOferta)
class CardOfertaAdmin(admin.ModelAdmin):
    list_display = ['cliente', 'matricula', 'codigo_interno']
    search_fields = ['codigo_interno', 'cliente__cpf']