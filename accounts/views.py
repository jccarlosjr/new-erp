import json
from django.http import JsonResponse
from django.views import View
from django.views.generic import TemplateView
from django.shortcuts import get_object_or_404
from django.contrib.auth.mixins import LoginRequiredMixin
from accounts.models import CustomUser
from empresa.models import Sala
from accounts.models import Funcao
from app.mixins import AdminRequiredMixin
from django.contrib.auth import views as auth_view


class LoginView(auth_view.LoginView):
    template_name = 'login.html'
    redirect_authenticated_user = True


class UsersView(LoginRequiredMixin, AdminRequiredMixin, TemplateView):
    template_name = 'users.html'


class CustomUserAPIView(LoginRequiredMixin, AdminRequiredMixin, View):

    def get(self, request):
        users = CustomUser.objects.select_related(
            'sala', 'funcao'
        ).values(
            'id',
            'username',
            'first_name',
            'last_name',
            'email',
            'cpf',
            'nascimento',
            'admissao',
            'is_active',

            'sala__id',
            'sala__nome',

            'funcao__id',
            'funcao__nome',
        )

        return JsonResponse({
            "status": "success",
            "data": list(users)
        })

    def post(self, request):
        try:
            body = json.loads(request.body)

            user_id = body.get('id')
            username = body.get('username')
            first_name = body.get('first_name')
            last_name = body.get('last_name')
            email = body.get('email')
            cpf = body.get('cpf')
            nascimento = body.get('nascimento')
            admissao = body.get('admissao')
            sala_id = body.get('sala_id')
            funcao_id = body.get('funcao_id')
            is_active = body.get('is_active', True)
            password = body.get('password')

            if not username:
                return JsonResponse({
                    "status": "error",
                    "message": "Username é obrigatório"
                }, status=400)

            if user_id:
                user = get_object_or_404(CustomUser, id=user_id)

                if CustomUser.objects.exclude(id=user_id).filter(username=username).exists():
                    return JsonResponse({
                        "status": "error",
                        "message": "Já existe um usuário com esse username"
                    }, status=400)

                user.username = username
                user.first_name = first_name or ''
                user.last_name = last_name or ''
                user.email = email or ''
                user.cpf = cpf
                user.nascimento = nascimento
                user.admissao = admissao
                user.is_active = is_active

                user.sala = Sala.objects.filter(id=sala_id).first() if sala_id else None
                user.funcao = Funcao.objects.filter(id=funcao_id).first() if funcao_id else None

                if password:
                    user.set_password(password)

                user.save()

                return JsonResponse({
                    "status": "success",
                    "data": {
                        "id": user.id,
                        "username": user.username,
                        "nome": f"{user.first_name} {user.last_name}".strip(),
                        "email": user.email,
                        "is_active": user.is_active
                    }
                })

            if CustomUser.objects.filter(username=username).exists():
                return JsonResponse({
                    "status": "error",
                    "message": "Já existe um usuário com esse username"
                }, status=400)

            if not password:
                return JsonResponse({
                    "status": "error",
                    "message": "Senha é obrigatória para criar usuário"
                }, status=400)

            user = CustomUser.objects.create_user(
                username=username,
                password=password,
                first_name=first_name or '',
                last_name=last_name or '',
                email=email or '',
                cpf=cpf,
                nascimento=nascimento,
                admissao=admissao,
                is_active=is_active,
                sala=Sala.objects.filter(id=sala_id).first() if sala_id else None,
                funcao=Funcao.objects.filter(id=funcao_id).first() if funcao_id else None,
            )

            return JsonResponse({
                "status": "success",
                "data": {
                    "id": user.id,
                    "username": user.username,
                    "nome": f"{user.first_name} {user.last_name}".strip(),
                    "email": user.email,
                    "is_active": user.is_active
                }
            }, status=201)

        except Exception as e:
            return JsonResponse({
                "status": "error",
                "message": str(e)
            }, status=400)

    def delete(self, request):
        try:
            body = json.loads(request.body)
            user_id = body.get('id')

            if not user_id:
                return JsonResponse({
                    "status": "error",
                    "message": "ID do usuário é obrigatório"
                }, status=400)

            user = get_object_or_404(CustomUser, id=user_id)
            user.delete()

            return JsonResponse({
                "status": "success",
                "message": "Usuário removido com sucesso"
            })

        except Exception as e:
            return JsonResponse({
                "status": "error",
                "message": str(e)
            }, status=400)

    def patch(self, request):
        try:
            body = json.loads(request.body)
            user_id = body.get('id')
            is_active = body.get('is_active')

            if user_id is None or is_active is None:
                return JsonResponse({
                    "status": "error",
                    "message": "ID e status são obrigatórios"
                }, status=400)

            user = get_object_or_404(CustomUser, id=user_id)
            user.is_active = bool(is_active)
            user.save(update_fields=['is_active'])

            return JsonResponse({
                "status": "success",
                "data": {
                    "id": user.id,
                    "is_active": user.is_active
                }
            })

        except Exception as e:
            return JsonResponse({
                "status": "error",
                "message": str(e)
            }, status=400)


class ResetSenhaUsuarioAPIView(LoginRequiredMixin, AdminRequiredMixin, View):

    def post(self, request):
        try:
            body = json.loads(request.body)
            user_id = body.get('id')
            password = body.get('password')

            if not user_id or not password:
                return JsonResponse({
                    "status": "error",
                    "message": "Usuário e senha são obrigatórios"
                }, status=400)

            user = get_object_or_404(CustomUser, id=user_id)
            user.set_password(password)
            user.save()

            return JsonResponse({
                "status": "success",
                "message": "Senha redefinida com sucesso"
            })

        except Exception as e:
            return JsonResponse({
                "status": "error",
                "message": str(e)
            }, status=400)



class FuncaoView(LoginRequiredMixin, AdminRequiredMixin, TemplateView):
    template_name = 'funcoes.html'


class FuncaoAPIView(LoginRequiredMixin, AdminRequiredMixin, View):

    def get(self, request):
        funcoes = Funcao.objects.all().values(
            'id',
            'nome'
        )

        return JsonResponse({
            "status": "success",
            "data": list(funcoes)
        })


    def post(self, request):
        try:
            body = json.loads(request.body)

            funcao_id = body.get('id')
            nome = body.get('nome')

            if not nome:
                return JsonResponse({
                    "status": "error",
                    "message": "Nome da função é obrigatório"
                }, status=400)

            # UPDATE
            if funcao_id:
                funcao = get_object_or_404(Funcao, id=funcao_id)

                if Funcao.objects.exclude(id=funcao_id).filter(nome=nome).exists():
                    return JsonResponse({
                        "status": "error",
                        "message": "Já existe uma função com esse nome"
                    }, status=400)

                funcao.nome = nome
                funcao.save()

                return JsonResponse({
                    "status": "success",
                    "data": {
                        "id": funcao.id,
                        "nome": funcao.nome
                    }
                })

            # CREATE
            if Funcao.objects.filter(nome=nome).exists():
                return JsonResponse({
                    "status": "error",
                    "message": "Já existe uma função com esse nome"
                }, status=400)

            funcao = Funcao.objects.create(nome=nome)

            return JsonResponse({
                "status": "success",
                "data": {
                    "id": funcao.id,
                    "nome": funcao.nome
                }
            }, status=201)

        except Exception as e:
            return JsonResponse({
                "status": "error",
                "message": str(e)
            }, status=400)


    def delete(self, request):
        try:
            body = json.loads(request.body)
            funcao_id = body.get('id')

            if not funcao_id:
                return JsonResponse({
                    "status": "error",
                    "message": "ID da função é obrigatório"
                }, status=400)

            funcao = get_object_or_404(Funcao, id=funcao_id)
            funcao.delete()

            return JsonResponse({
                "status": "success",
                "message": "Função removida com sucesso"
            })

        except Exception as e:
            return JsonResponse({
                "status": "error",
                "message": str(e)
            }, status=400)
