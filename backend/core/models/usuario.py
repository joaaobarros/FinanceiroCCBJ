from django.db import models
from django.contrib.auth.models import AbstractUser, Group, Permission
from django.utils.translation import gettext_lazy as _


class Usuario(AbstractUser):
    """
    Modelo de usuário personalizado para o sistema de gestão financeira do CCBJ.
    Estende o modelo de usuário padrão do Django.
    """
    email = models.EmailField(_('endereço de email'), unique=True)
    
    class Meta:
        verbose_name = _('usuário')
        verbose_name_plural = _('usuários')
        
    def __str__(self):
        return self.username


class Perfil(models.Model):
    """
    Perfil de usuário com informações adicionais.
    """
    NIVEL_ACESSO_CHOICES = [
        ('admin', 'Administrador'),
        ('gestor', 'Gestor de Setor'),
        ('consulta', 'Usuário de Consulta'),
    ]
    
    usuario = models.OneToOneField(
        Usuario, 
        on_delete=models.CASCADE, 
        related_name='perfil'
    )
    nome_completo = models.CharField(max_length=255)
    telefone = models.CharField(max_length=20, blank=True, null=True)
    cargo = models.CharField(max_length=100)
    setor = models.ForeignKey(
        'Setor', 
        on_delete=models.PROTECT, 
        related_name='usuarios'
    )
    nivel_acesso = models.CharField(
        max_length=20,
        choices=NIVEL_ACESSO_CHOICES,
        default='consulta'
    )
    
    class Meta:
        verbose_name = _('perfil')
        verbose_name_plural = _('perfis')
        
    def __str__(self):
        return f"{self.nome_completo} ({self.usuario.username})"


class RegistroAuditoria(models.Model):
    """
    Registro de auditoria para rastreamento de alterações no sistema.
    """
    usuario = models.ForeignKey(
        Usuario, 
        on_delete=models.PROTECT, 
        related_name='registros_auditoria'
    )
    data_hora = models.DateTimeField(auto_now_add=True)
    acao = models.CharField(max_length=50)
    tabela_afetada = models.CharField(max_length=100)
    registro_id = models.IntegerField()
    dados_antigos = models.JSONField(blank=True, null=True)
    dados_novos = models.JSONField(blank=True, null=True)
    ip_origem = models.GenericIPAddressField(blank=True, null=True)
    
    class Meta:
        verbose_name = _('registro de auditoria')
        verbose_name_plural = _('registros de auditoria')
        ordering = ['-data_hora']
        
    def __str__(self):
        return f"{self.acao} em {self.tabela_afetada} por {self.usuario.username} em {self.data_hora}"
