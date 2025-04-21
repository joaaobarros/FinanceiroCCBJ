from django.db import models
from django.utils.translation import gettext_lazy as _
from .usuario import Usuario
from .estrutura import Setor, Rubrica, FonteRecurso
from .contratos import Contrato, ParcelaContrato


class ConfiguracaoSistema(models.Model):
    """
    Configurações gerais do sistema.
    """
    chave = models.CharField(max_length=100, unique=True)
    valor = models.TextField()
    descricao = models.TextField(blank=True, null=True)
    data_atualizacao = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _('configuração do sistema')
        verbose_name_plural = _('configurações do sistema')
        
    def __str__(self):
        return self.chave


class Notificacao(models.Model):
    """
    Notificações do sistema para os usuários.
    """
    TIPO_CHOICES = [
        ('alerta', 'Alerta'),
        ('informacao', 'Informação'),
        ('erro', 'Erro'),
        ('sucesso', 'Sucesso'),
    ]
    
    usuario = models.ForeignKey(
        Usuario,
        on_delete=models.CASCADE,
        related_name='notificacoes'
    )
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES)
    titulo = models.CharField(max_length=255)
    mensagem = models.TextField()
    data_criacao = models.DateTimeField(auto_now_add=True)
    lida = models.BooleanField(default=False)
    data_leitura = models.DateTimeField(blank=True, null=True)
    link = models.CharField(max_length=255, blank=True, null=True)
    
    class Meta:
        verbose_name = _('notificação')
        verbose_name_plural = _('notificações')
        ordering = ['-data_criacao']
        
    def __str__(self):
        return f"{self.titulo} ({self.get_tipo_display()})"


class RelatorioGerado(models.Model):
    """
    Registro de relatórios gerados pelo sistema.
    """
    TIPO_CHOICES = [
        ('financeiro', 'Financeiro'),
        ('contratos', 'Contratos'),
        ('bolsistas', 'Bolsistas'),
        ('orcamento', 'Orçamento'),
        ('personalizado', 'Personalizado'),
    ]
    
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES)
    titulo = models.CharField(max_length=255)
    descricao = models.TextField(blank=True, null=True)
    parametros = models.JSONField()
    arquivo_url = models.URLField()
    data_geracao = models.DateTimeField(auto_now_add=True)
    usuario = models.ForeignKey(
        Usuario,
        on_delete=models.PROTECT,
        related_name='relatorios_gerados'
    )
    
    class Meta:
        verbose_name = _('relatório gerado')
        verbose_name_plural = _('relatórios gerados')
        ordering = ['-data_geracao']
        
    def __str__(self):
        return f"{self.titulo} ({self.get_tipo_display()}) - {self.data_geracao}"


class ProjecaoOrcamentaria(models.Model):
    """
    Projeções orçamentárias para planejamento financeiro.
    """
    setor = models.ForeignKey(
        Setor,
        on_delete=models.PROTECT,
        related_name='projecoes'
    )
    fonte_recurso = models.ForeignKey(
        FonteRecurso,
        on_delete=models.PROTECT,
        related_name='projecoes'
    )
    rubrica = models.ForeignKey(
        Rubrica,
        on_delete=models.PROTECT,
        related_name='projecoes'
    )
    mes_referencia = models.DateField()
    valor_previsto = models.DecimalField(max_digits=15, decimal_places=2)
    valor_realizado = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    observacao = models.TextField(blank=True, null=True)
    criado_por = models.ForeignKey(
        Usuario,
        on_delete=models.PROTECT,
        related_name='projecoes_criadas'
    )
    data_criacao = models.DateTimeField(auto_now_add=True)
    data_atualizacao = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _('projeção orçamentária')
        verbose_name_plural = _('projeções orçamentárias')
        ordering = ['mes_referencia']
        
    def __str__(self):
        return f"Projeção para {self.setor.nome} - {self.rubrica.nome} ({self.mes_referencia.strftime('%m/%Y')})"
