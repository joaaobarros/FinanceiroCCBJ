from django.db import models
from django.utils.translation import gettext_lazy as _
from .usuario import Usuario
from .contratos import Contrato

class AcompanhamentoProcesso(models.Model):
    """
    Modelo para permitir que usuários acompanhem processos específicos
    e recebam notificações sobre sua evolução.
    """
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='processos_acompanhados')
    contrato = models.ForeignKey(Contrato, on_delete=models.CASCADE, related_name='usuarios_acompanhando')
    data_inicio_acompanhamento = models.DateTimeField(auto_now_add=True)
    notificar_mudanca_status = models.BooleanField(default=True)
    notificar_pagamentos = models.BooleanField(default=True)
    notificar_prazos = models.BooleanField(default=True)
    notificar_por_email = models.BooleanField(default=False)
    notas_pessoais = models.TextField(blank=True, null=True)
    
    class Meta:
        verbose_name = 'Acompanhamento de Processo'
        verbose_name_plural = 'Acompanhamentos de Processos'
        unique_together = ['usuario', 'contrato']
    
    def __str__(self):
        return f"{self.usuario.username} - {self.contrato.nome_curso_acao}"


class Notificacao(models.Model):
    """
    Modelo para armazenar notificações sobre processos.
    """
    TIPO_CHOICES = [
        ('status', 'Mudança de Status'),
        ('pagamento', 'Pagamento Realizado'),
        ('prazo', 'Prazo Próximo'),
        ('vencimento', 'Contrato Vencido'),
        ('sistema', 'Notificação do Sistema'),
    ]
    
    PRIORIDADE_CHOICES = [
        ('baixa', 'Baixa'),
        ('media', 'Média'),
        ('alta', 'Alta'),
    ]
    
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='notificacoes')
    contrato = models.ForeignKey(Contrato, on_delete=models.CASCADE, related_name='notificacoes', null=True, blank=True)
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES)
    titulo = models.CharField(max_length=255)
    mensagem = models.TextField()
    data_criacao = models.DateTimeField(auto_now_add=True)
    lida = models.BooleanField(default=False)
    data_leitura = models.DateTimeField(null=True, blank=True)
    prioridade = models.CharField(max_length=10, choices=PRIORIDADE_CHOICES, default='media')
    enviado_email = models.BooleanField(default=False)
    
    class Meta:
        verbose_name = 'Notificação'
        verbose_name_plural = 'Notificações'
        ordering = ['-data_criacao']
    
    def __str__(self):
        return self.titulo
    
    def marcar_como_lida(self):
        """
        Marca a notificação como lida e registra a data de leitura.
        """
        from django.utils import timezone
        
        self.lida = True
        self.data_leitura = timezone.now()
        self.save()


class FiltroSalvo(models.Model):
    """
    Modelo para salvar filtros personalizados de busca de processos.
    """
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='filtros_salvos')
    nome = models.CharField(max_length=100)
    descricao = models.CharField(max_length=255, blank=True, null=True)
    data_criacao = models.DateTimeField(auto_now_add=True)
    
    # Campos de filtro
    setor = models.CharField(max_length=255, blank=True, null=True)
    fonte_recurso = models.CharField(max_length=255, blank=True, null=True)
    meta = models.CharField(max_length=255, blank=True, null=True)
    atividade = models.CharField(max_length=255, blank=True, null=True)
    rubrica = models.CharField(max_length=255, blank=True, null=True)
    status_contrato = models.CharField(max_length=255, blank=True, null=True)
    tipo_contrato = models.CharField(max_length=255, blank=True, null=True)
    data_inicio_de = models.DateField(blank=True, null=True)
    data_inicio_ate = models.DateField(blank=True, null=True)
    data_fim_de = models.DateField(blank=True, null=True)
    data_fim_ate = models.DateField(blank=True, null=True)
    valor_minimo = models.DecimalField(max_digits=15, decimal_places=2, blank=True, null=True)
    valor_maximo = models.DecimalField(max_digits=15, decimal_places=2, blank=True, null=True)
    texto_busca = models.CharField(max_length=255, blank=True, null=True)
    
    # Configurações de exibição
    ordenacao = models.CharField(max_length=100, default='-data_inicio')
    itens_por_pagina = models.PositiveIntegerField(default=25)
    
    class Meta:
        verbose_name = 'Filtro Salvo'
        verbose_name_plural = 'Filtros Salvos'
        ordering = ['-data_criacao']
    
    def __str__(self):
        return f"{self.nome} ({self.usuario.username})"
    
    def aplicar_filtro(self, queryset):
        """
        Aplica os filtros salvos a um queryset de contratos.
        """
        if self.setor:
            queryset = queryset.filter(setor__nome__icontains=self.setor)
        
        if self.fonte_recurso:
            queryset = queryset.filter(meta__fonte_recurso__nome__icontains=self.fonte_recurso)
        
        if self.meta:
            queryset = queryset.filter(meta__nome__icontains=self.meta)
        
        if self.atividade:
            queryset = queryset.filter(atividade__nome__icontains=self.atividade)
        
        if self.rubrica:
            queryset = queryset.filter(rubrica__nome__icontains=self.rubrica)
        
        if self.status_contrato:
            status_list = self.status_contrato.split(',')
            queryset = queryset.filter(status_contrato__in=status_list)
        
        if self.tipo_contrato:
            tipos_list = self.tipo_contrato.split(',')
            queryset = queryset.filter(tipo__in=tipos_list)
        
        if self.data_inicio_de:
            queryset = queryset.filter(data_inicio__gte=self.data_inicio_de)
        
        if self.data_inicio_ate:
            queryset = queryset.filter(data_inicio__lte=self.data_inicio_ate)
        
        if self.data_fim_de:
            queryset = queryset.filter(data_fim__gte=self.data_fim_de)
        
        if self.data_fim_ate:
            queryset = queryset.filter(data_fim__lte=self.data_fim_ate)
        
        if self.valor_minimo:
            queryset = queryset.filter(valor_total__gte=self.valor_minimo)
        
        if self.valor_maximo:
            queryset = queryset.filter(valor_total__lte=self.valor_maximo)
        
        if self.texto_busca:
            queryset = queryset.filter(
                models.Q(nome_curso_acao__icontains=self.texto_busca) |
                models.Q(bolsista__nome__icontains=self.texto_busca) |
                models.Q(credor__nome__icontains=self.texto_busca) |
                models.Q(responsavel__icontains=self.texto_busca)
            )
        
        return queryset.order_by(self.ordenacao)
