from django.db import models
from django.contrib.auth.models import User

# Modelo básico para demonstração
class Setor(models.Model):
    nome = models.CharField(max_length=100)
    descricao = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return self.nome

class FonteRecurso(models.Model):
    nome = models.CharField(max_length=100)
    descricao = models.TextField(blank=True, null=True)
    valor_total = models.DecimalField(max_digits=15, decimal_places=2)
    data_inicio = models.DateField()
    data_fim = models.DateField()
    
    def __str__(self):
        return self.nome

class Meta(models.Model):
    nome = models.CharField(max_length=100)
    descricao = models.TextField(blank=True, null=True)
    fonte_recurso = models.ForeignKey(FonteRecurso, on_delete=models.CASCADE, related_name='metas')
    valor_previsto = models.DecimalField(max_digits=15, decimal_places=2)
    
    def __str__(self):
        return self.nome

class Atividade(models.Model):
    nome = models.CharField(max_length=100)
    descricao = models.TextField(blank=True, null=True)
    meta = models.ForeignKey(Meta, on_delete=models.CASCADE, related_name='atividades')
    valor_previsto = models.DecimalField(max_digits=15, decimal_places=2)
    
    def __str__(self):
        return self.nome

class Rubrica(models.Model):
    nome = models.CharField(max_length=100)
    descricao = models.TextField(blank=True, null=True)
    atividade = models.ForeignKey(Atividade, on_delete=models.CASCADE, related_name='rubricas')
    valor_previsto = models.DecimalField(max_digits=15, decimal_places=2)
    
    def __str__(self):
        return self.nome

class Credor(models.Model):
    TIPO_CHOICES = (
        ('PF', 'Pessoa Física'),
        ('PJ', 'Pessoa Jurídica'),
    )
    
    nome = models.CharField(max_length=200)
    tipo = models.CharField(max_length=2, choices=TIPO_CHOICES)
    documento = models.CharField(max_length=20)  # CPF ou CNPJ
    telefone = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    
    def __str__(self):
        return self.nome

class Bolsista(models.Model):
    nome = models.CharField(max_length=200)
    documento = models.CharField(max_length=20)  # CPF
    telefone = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    
    def __str__(self):
        return self.nome

class Contrato(models.Model):
    STATUS_CHOICES = (
        ('elaboracao', 'Em Elaboração'),
        ('assinado', 'Assinado'),
        ('execucao', 'Em Execução'),
        ('concluido', 'Concluído'),
        ('cancelado', 'Cancelado'),
        ('suspenso', 'Suspenso'),
    )
    
    nome = models.CharField(max_length=200)
    descricao = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='elaboracao')
    setor = models.ForeignKey(Setor, on_delete=models.CASCADE, related_name='contratos')
    rubrica = models.ForeignKey(Rubrica, on_delete=models.CASCADE, related_name='contratos')
    credor = models.ForeignKey(Credor, on_delete=models.CASCADE, related_name='contratos', null=True, blank=True)
    bolsista = models.ForeignKey(Bolsista, on_delete=models.CASCADE, related_name='contratos', null=True, blank=True)
    responsavel = models.ForeignKey(User, on_delete=models.CASCADE, related_name='contratos_responsavel')
    data_inicio = models.DateField()
    data_fim = models.DateField()
    valor_total = models.DecimalField(max_digits=15, decimal_places=2)
    qtd_parcelas = models.PositiveIntegerField(default=1)
    observacoes = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return self.nome

class Parcela(models.Model):
    STATUS_CHOICES = (
        ('pendente', 'Pendente'),
        ('paga', 'Paga'),
        ('cancelada', 'Cancelada'),
    )
    
    contrato = models.ForeignKey(Contrato, on_delete=models.CASCADE, related_name='parcelas')
    numero = models.PositiveIntegerField()
    valor = models.DecimalField(max_digits=15, decimal_places=2)
    data_prevista = models.DateField()
    data_pagamento = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pendente')
    
    def __str__(self):
        return f"{self.contrato.nome} - Parcela {self.numero}"
