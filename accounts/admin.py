from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Funcao


class CustomUserAdmin(UserAdmin):
    list_display = [
        'username', 'first_name', 
        'is_staff', 'is_superuser', 'funcao', 
        'is_active', 'sala'
        ]
    fieldsets = (
        (None, {'fields': ('username', 'password', 'sala', 'funcao')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'email')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login',)}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'password1', 'password2'),
        }),
    )


@admin.register(Funcao)
class FuncaoAdmin(admin.ModelAdmin):
    list_display = ['nome']
    search_fields = ['nome']

admin.site.register(CustomUser, CustomUserAdmin)