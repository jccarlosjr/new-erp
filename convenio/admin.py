from django.contrib import admin
from .models import Convenio, Matricula
# Register your models here.


@admin.register(Convenio)
class ConvenioAdmin(admin.ModelAdmin):
    list_display = ['nome']
    search_fields = ['nome']


@admin.register(Matricula)
class MatriculaAdmin(admin.ModelAdmin):
    list_display = ['matricula', 'convenio']
    search_fields = ['matricula', 'convenio', 'cliente__nome', 'cliente__cpf']
