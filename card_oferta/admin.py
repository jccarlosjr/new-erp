from django.contrib import admin
from .models import CardOferta
# Register your models here.

@admin.register(CardOferta)
class CardOfertaAdmin(admin.ModelAdmin):
    list_display = ['cliente', 'matricula', 'codigo_interno', 'status_nome']
    search_fields = ['codigo_interno', 'cliente__cpf']

    @admin.display(description='Status')
    def status_nome(self, obj):
        return obj.get_status_display()
