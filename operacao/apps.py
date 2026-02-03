from django.apps import AppConfig


class OperacaoConfig(AppConfig):
    name = 'operacao'

    def ready(self):
        import operacao.signals