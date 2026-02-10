from django.apps import AppConfig


class PropostaConfig(AppConfig):
    name = 'proposta'

    def ready(self):
        import proposta.signals
