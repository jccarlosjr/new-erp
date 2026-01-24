from django.db import models

# Create your models here.
class Cliente(models.Model):
    nome = models.CharField(max_length=150)
    cpf = models.CharField(max_length=14, primary_key=True, unique=True)
    nascimento = models.DateField()
    sexo = models.CharField(max_length=1)
    email = models.EmailField()
    iletrado = models.BooleanField(default=False)
    numero_documento = models.CharField(max_length=50)
    orgao_emissor = models.CharField(max_length=20)
    uf_emissao = models.CharField(max_length=2)
    data_emissao = models.DateField()
    naturalidade = models.CharField(max_length=50)
    uf_naturalidade = models.CharField(max_length=2)
    pai = models.CharField(max_length=50)
    mae = models.CharField(max_length=50)
    celular = models.CharField(max_length=50)
    cep = models.CharField(max_length=50)
    endereco = models.CharField(max_length=50)
    numero = models.CharField(max_length=50)
    bairro = models.CharField(max_length=50)
    complemento = models.CharField(max_length=50)
    cidade = models.CharField(max_length=50)
    uf_cidade = models.CharField(max_length=2)

    def __str__(self):
        return self.nome

    class Meta:
        verbose_name = 'Cliente'
        verbose_name_plural = 'Clientes'