from django.contrib import admin
from .models import Sala, Empresa
# Register your models here.

@admin.register(Empresa)
class EmpresaAdmin(admin.ModelAdmin):
    list_display = ['nome', 'cnpj']
    search_fields = ['nome', 'cnpj']

@admin.register(Sala)
class SalaAdmin(admin.ModelAdmin):
    list_display = ['nome', 'empresa']
    search_fields = ['nome', 'cnpj']
