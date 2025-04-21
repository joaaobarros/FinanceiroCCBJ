from django.db import models
from django.utils.translation import gettext_lazy as _


class Credor(models.Model):
    """
    Dados de pessoas jurídicas que prestam serviços ao CCBJ.
    """
    razao_social = models.CharField(max_length=255)
    nome_fantasia = models.CharField(max_length=255, blank=True, null=True)
    cnpj = models.CharField(max_length=18, unique=True)
    endereco = models.TextField()
    telefone = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    banco = models.CharField(max_length=100)
    agencia = models.CharField(max_length=20)
    conta = models.CharField(max_length=20)
    ativo = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = _('credor')
        verbose_name_plural = _('credores')
        ordering = ['razao_social']
        
    def __str__(self):
        return f"{self.razao_social} ({self.cnpj})"


class Bolsista(models.Model):
    """
    Dados de bolsistas que participam de cursos e atividades do CCBJ.
    """
    nome = models.CharField(max_length=255)
    cpf = models.CharField(max_length=14, unique=True)
    endereco = models.TextField()
    telefone = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    banco = models.CharField(max_length=100)
    agencia = models.CharField(max_length=20)
    conta = models.CharField(max_length=20)
    ativo = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = _('bolsista')
        verbose_name_plural = _('bolsistas')
        ordering = ['nome']
        
    def __str__(self):
        return f"{self.nome} ({self.cpf})"
