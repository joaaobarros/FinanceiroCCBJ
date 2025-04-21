from django.db import models
from django.utils.translation import gettext_lazy as _
from .usuario import Usuario


class Setor(models.Model):
    """
    Representa os centros de custo (setores) do CCBJ.
    """
    nome = models.CharField(max_length=100)
    descricao = models.TextField(blank=True, null=True)
    responsavel = models.ForeignKey(
        Usuario,
        on_delete=models.PROTECT,
        related_name='setores_responsavel'
    )
    ativo = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = _('setor')
        verbose_name_plural = _('setores')
        ordering = ['nome']
        
    def __str__(self):
        return self.nome


class Programa(models.Model):
    """
    Programas específicos que podem estar associados a contratos.
    """
    nome = models.CharField(max_length=200)
    descricao = models.TextField(blank=True, null=True)
    data_inicio = models.DateField()
    data_fim = models.DateField(blank=True, null=True)
    ativo = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = _('programa')
        verbose_name_plural = _('programas')
        ordering = ['nome']
        
    def __str__(self):
        return self.nome


class FonteRecurso(models.Model):
    """
    Origem dos recursos financeiros.
    """
    nome = models.CharField(max_length=200)
    descricao = models.TextField(blank=True, null=True)
    valor_total = models.DecimalField(max_digits=15, decimal_places=2)
    data_inicio = models.DateField()
    data_fim = models.DateField(blank=True, null=True)
    ativo = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = _('fonte de recurso')
        verbose_name_plural = _('fontes de recursos')
        ordering = ['nome']
        
    def __str__(self):
        return f"{self.nome} (R$ {self.valor_total})"


class Meta(models.Model):
    """
    Metas do contrato de gestão.
    """
    fonte_recurso = models.ForeignKey(
        FonteRecurso,
        on_delete=models.PROTECT,
        related_name='metas'
    )
    codigo = models.CharField(max_length=50)
    descricao = models.TextField()
    valor_previsto = models.DecimalField(max_digits=15, decimal_places=2)
    ativo = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = _('meta')
        verbose_name_plural = _('metas')
        ordering = ['codigo']
        
    def __str__(self):
        return f"{self.codigo} - {self.descricao[:50]}"


class Atividade(models.Model):
    """
    Submetas ou atividades relacionadas às metas.
    """
    meta = models.ForeignKey(
        Meta,
        on_delete=models.PROTECT,
        related_name='atividades'
    )
    codigo = models.CharField(max_length=50)
    descricao = models.TextField()
    valor_previsto = models.DecimalField(max_digits=15, decimal_places=2)
    ativo = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = _('atividade')
        verbose_name_plural = _('atividades')
        ordering = ['codigo']
        
    def __str__(self):
        return f"{self.codigo} - {self.descricao[:50]}"


class Rubrica(models.Model):
    """
    Itens de custeio para cada atividade.
    """
    atividade = models.ForeignKey(
        Atividade,
        on_delete=models.PROTECT,
        related_name='rubricas'
    )
    nome = models.CharField(max_length=200)
    descricao = models.TextField(blank=True, null=True)
    valor_previsto = models.DecimalField(max_digits=15, decimal_places=2)
    ativo = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = _('rubrica')
        verbose_name_plural = _('rubricas')
        ordering = ['nome']
        
    def __str__(self):
        return f"{self.nome} ({self.atividade.codigo})"


class AlocacaoRecurso(models.Model):
    """
    Distribuição de recursos por setor.
    """
    fonte_recurso = models.ForeignKey(
        FonteRecurso,
        on_delete=models.PROTECT,
        related_name='alocacoes'
    )
    setor = models.ForeignKey(
        Setor,
        on_delete=models.PROTECT,
        related_name='alocacoes'
    )
    rubrica = models.ForeignKey(
        Rubrica,
        on_delete=models.PROTECT,
        related_name='alocacoes'
    )
    valor_alocado = models.DecimalField(max_digits=15, decimal_places=2)
    data_alocacao = models.DateField(auto_now_add=True)
    observacao = models.TextField(blank=True, null=True)
    
    class Meta:
        verbose_name = _('alocação de recurso')
        verbose_name_plural = _('alocações de recursos')
        ordering = ['-data_alocacao']
        
    def __str__(self):
        return f"Alocação de R$ {self.valor_alocado} para {self.setor.nome} ({self.rubrica.nome})"


class TransferenciaRecurso(models.Model):
    """
    Registro de transferências entre setores.
    """
    STATUS_CHOICES = [
        ('pendente', 'Pendente'),
        ('aprovado', 'Aprovado'),
        ('rejeitado', 'Rejeitado'),
    ]
    
    setor_origem = models.ForeignKey(
        Setor,
        on_delete=models.PROTECT,
        related_name='transferencias_origem'
    )
    setor_destino = models.ForeignKey(
        Setor,
        on_delete=models.PROTECT,
        related_name='transferencias_destino'
    )
    rubrica = models.ForeignKey(
        Rubrica,
        on_delete=models.PROTECT,
        related_name='transferencias'
    )
    valor = models.DecimalField(max_digits=15, decimal_places=2)
    data_solicitacao = models.DateTimeField(auto_now_add=True)
    data_aprovacao = models.DateTimeField(blank=True, null=True)
    aprovado_por = models.ForeignKey(
        Usuario,
        on_delete=models.PROTECT,
        related_name='transferencias_aprovadas',
        blank=True,
        null=True
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pendente'
    )
    observacao = models.TextField(blank=True, null=True)
    
    class Meta:
        verbose_name = _('transferência de recurso')
        verbose_name_plural = _('transferências de recursos')
        ordering = ['-data_solicitacao']
        
    def __str__(self):
        return f"Transferência de R$ {self.valor} de {self.setor_origem.nome} para {self.setor_destino.nome}"
