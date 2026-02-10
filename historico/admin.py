from django.contrib import admin
from .models import HistoricoCard
# Register your models here.

admin.site.register(HistoricoCard)
class HistoricoCardAdmin(admin.ModelAdmin):
    list_display = ['card__codigo_interno', 'date']
    search_fields = ['card__codigo_interno', 'date']
