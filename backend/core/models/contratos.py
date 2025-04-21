from django.db import models
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from .usuario import Usuario
from .estrutura import Setor, Meta, Atividade, Rubrica
from .credores import Bolsista, Credor
from decimal import Decimal

class StatusContrato(models.TextChoices):
    EM_ELABORACAO = 'em_elaboracao', _('Em Elaboração')
    ASSINADO = 'assinado', _('Assinado')
    EM_EXECUCAO = 'em_execucao', _('Em Execução')
    CONCLUIDO = 'concluido', _('Concluído')
    CANCELADO = 'cancelado', _('Cancelado')
    SUSPENSO = 'suspenso', _('Suspenso')
    ATRASADO = 'atrasado', _('Atrasado')
    INADIMPLENTE = 'inadimplente', _('Inadimplente')
    FINALIZADO_COM_PENDENCIAS = 'finalizado_com_pendencias', _('Finalizado com Pendências')

class TipoContrato(models.TextChoices):
    BOLSA = 'bolsa', _('Bolsa')
    SERVICO = 'servico', _('Serviço')
    AQUISICAO = 'aquisicao', _('Aquisição')
    OUTROS = 'outros', _('Outros')

class StatusProcesso(models.TextChoices):
    EM_ANDAMENTO = 'em_andamento', _('Em Andamento')
    CONCLUIDO = 'concluido', _('Concluído')
    CANCELADO = 'cancelado', _('Cancelado')
    SUSPENSO = 'suspenso', _('Suspenso')

class Contrato(models.Model):
    tipo = models.CharField(max_length=20, choices=TipoContrato.choices, default=TipoContrato.BOLSA)
    nome_curso_acao = models.CharField(max_length=255)
    status_processo = models.CharField(max_length=20, choices=StatusProcesso.choices, default=StatusProcesso.EM_ANDAMENTO)
    status_contrato = models.CharField(max_length=30, choices=StatusContrato.choices, default=StatusContrato.EM_ELABORACAO)
    historico_processo = models.TextField(blank=True, null=True)
    setor = models.ForeignKey(Setor, on_delete=models.PROTECT, related_name='contratos')
    programa = models.CharField(max_length=255, blank=True, null=True)
    bolsista = models.ForeignKey(Bolsista, on_delete=models.PROTECT, related_name='contratos', blank=True, null=True)
    credor = models.ForeignKey(Credor, on_delete=models.PROTECT, related_name='contratos', blank=True, null=True)
    responsavel = models.CharField(max_length=255, blank=True, null=True)
    data_inicio = models.DateField()
    data_fim = models.DateField()
    meta = models.ForeignKey(Meta, on_delete=models.PROTECT, related_name='contratos')
    atividade = models.ForeignKey(Atividade, on_delete=models.PROTECT, related_name='contratos')
    rubrica = models.ForeignKey(Rubrica, on_delete=models.PROTECT, related_name='contratos')
    valor_total = models.DecimalField(max_digits=15, decimal_places=2)
    quantidade_parcelas = models.PositiveIntegerField(default=1)
    observacoes_parcela = models.TextField(blank=True, null=True)
    total_pago = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    # Campos de auditoria
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)
    criado_por = models.ForeignKey(Usuario, on_delete=models.PROTECT, related_name='contratos_criados')
    atualizado_por = models.ForeignKey(Usuario, on_delete=models.PROTECT, related_name='contratos_atualizados')
    
    # Campos para controle de status
    ultima_verificacao = models.DateTimeField(auto_now_add=True)
    status_anterior = models.CharField(max_length=30, choices=StatusContrato.choices, blank=True, null=True)
    motivo_alteracao_status = models.TextField(blank=True, null=True)
    
    class Meta:
        verbose_name = 'Contrato'
        verbose_name_plural = 'Contratos'
        ordering = ['-data_inicio']
    
    def __str__(self):
        return f"{self.nome_curso_acao} - {self.get_tipo_display()}"
    
    def clean(self):
        # Validar que pelo menos um bolsista ou credor está associado
        if not self.bolsista and not self.credor:
            raise ValidationError(_('É necessário associar um bolsista ou um credor ao contrato.'))
        
        # Validar que não há bolsista e credor ao mesmo tempo
        if self.bolsista and self.credor:
            raise ValidationError(_('Não é possível associar um bolsista e um credor ao mesmo tempo.'))
        
        # Validar que a data de início é anterior à data de fim
        if self.data_inicio and self.data_fim and self.data_inicio > self.data_fim:
            raise ValidationError(_('A data de início deve ser anterior à data de fim.'))
        
        # Validar que o bolsista não tem contratos com datas sobrepostas
        if self.bolsista:
            contratos_sobrepostos = Contrato.objects.filter(
                bolsista=self.bolsista,
                data_inicio__lte=self.data_fim,
                data_fim__gte=self.data_inicio
            ).exclude(pk=self.pk)
            
            if contratos_sobrepostos.exists():
                raise ValidationError(_('O bolsista já possui um contrato ativo no período informado.'))
        
        # Validar disponibilidade orçamentária
        if self.rubrica and self.valor_total:
            # Obter o valor já comprometido em outros contratos
            valor_comprometido = Contrato.objects.filter(
                rubrica=self.rubrica,
                setor=self.setor
            ).exclude(pk=self.pk).aggregate(
                total=models.Sum('valor_total')
            )['total'] or Decimal('0')
            
            # Obter o valor alocado para o setor nesta rubrica
            from .sistema import AlocacaoRecurso
            valor_alocado = AlocacaoRecurso.objects.filter(
                rubrica=self.rubrica,
                setor=self.setor
            ).aggregate(
                total=models.Sum('valor_alocado')
            )['total'] or Decimal('0')
            
            # Calcular saldo disponível
            saldo_disponivel = valor_alocado - valor_comprometido
            
            if self.valor_total > saldo_disponivel:
                raise ValidationError(_(
                    f'Não há disponibilidade orçamentária suficiente. '
                    f'Saldo disponível: R$ {saldo_disponivel}. '
                    f'Valor do contrato: R$ {self.valor_total}.'
                ))
    
    def save(self, *args, **kwargs):
        self.clean()
        
        # Salvar status anterior antes de atualizar
        if self.pk:
            old_instance = Contrato.objects.get(pk=self.pk)
            if old_instance.status_contrato != self.status_contrato:
                self.status_anterior = old_instance.status_contrato
        
        super().save(*args, **kwargs)
        
        # Criar histórico de alteração de status se houve mudança
        if self.status_anterior and self.status_anterior != self.status_contrato:
            HistoricoStatusContrato.objects.create(
                contrato=self,
                status_anterior=self.status_anterior,
                status_novo=self.status_contrato,
                motivo=self.motivo_alteracao_status,
                usuario=self.atualizado_por
            )
    
    @property
    def valor_parcela(self):
        if self.quantidade_parcelas > 0:
            return self.valor_total / self.quantidade_parcelas
        return Decimal('0')
    
    @property
    def saldo_a_pagar(self):
        return self.valor_total - self.total_pago
    
    @property
    def percentual_executado(self):
        if self.valor_total > 0:
            return (self.total_pago / self.valor_total) * 100
        return Decimal('0')
    
    @property
    def status_pagamento(self):
        if self.total_pago == 0:
            return 'não_iniciado'
        elif self.total_pago < self.valor_total:
            return 'parcial'
        else:
            return 'completo'
    
    @property
    def parcelas_pagas(self):
        return self.parcelas.filter(pago=True).count()
    
    @property
    def parcelas_pendentes(self):
        return self.parcelas.filter(pago=False).count()
    
    @property
    def tem_parcelas_atrasadas(self):
        from django.utils import timezone
        return self.parcelas.filter(
            data_prevista__lt=timezone.now().date(),
            pago=False
        ).exists()
    
    def verificar_status_automatico(self):
        """
        Verifica e atualiza o status do contrato automaticamente com base em regras de negócio.
        Retorna True se o status foi alterado, False caso contrário.
        """
        from django.utils import timezone
        
        status_atual = self.status_contrato
        novo_status = None
        
        # Verificar se o contrato está concluído
        if self.data_fim < timezone.now().date():
            if self.total_pago >= self.valor_total:
                novo_status = StatusContrato.CONCLUIDO
            elif self.status_contrato != StatusContrato.CANCELADO:
                novo_status = StatusContrato.FINALIZADO_COM_PENDENCIAS
        
        # Verificar se o contrato está em execução
        elif self.data_inicio <= timezone.now().date() <= self.data_fim:
            if self.status_contrato == StatusContrato.EM_ELABORACAO or self.status_contrato == StatusContrato.ASSINADO:
                novo_status = StatusContrato.EM_EXECUCAO
            
            # Verificar se há parcelas atrasadas
            if self.tem_parcelas_atrasadas:
                novo_status = StatusContrato.ATRASADO
        
        # Atualizar status se necessário
        if novo_status and novo_status != status_atual:
            self.status_anterior = status_atual
            self.status_contrato = novo_status
            self.motivo_alteracao_status = "Atualização automática de status"
            self.ultima_verificacao = timezone.now()
            self.save()
            return True
        
        return False


class Parcela(models.Model):
    contrato = models.ForeignKey(Contrato, on_delete=models.CASCADE, related_name='parcelas')
    numero = models.PositiveIntegerField()
    valor = models.DecimalField(max_digits=15, decimal_places=2)
    data_prevista = models.DateField()
    data_pagamento = models.DateField(blank=True, null=True)
    pago = models.BooleanField(default=False)
    comprovante = models.FileField(upload_to='comprovantes/', blank=True, null=True)
    observacoes = models.TextField(blank=True, null=True)
    
    # Campos de auditoria
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)
    criado_por = models.ForeignKey(Usuario, on_delete=models.PROTECT, related_name='parcelas_criadas')
    atualizado_por = models.ForeignKey(Usuario, on_delete=models.PROTECT, related_name='parcelas_atualizadas')
    
    class Meta:
        verbose_name = 'Parcela'
        verbose_name_plural = 'Parcelas'
        ordering = ['contrato', 'numero']
        unique_together = ['contrato', 'numero']
    
    def __str__(self):
        return f"{self.contrato.nome_curso_acao} - Parcela {self.numero}"
    
    def save(self, *args, **kwargs):
        # Se a parcela foi marcada como paga, atualizar o total pago no contrato
        is_new_payment = False
        if self.pk:
            old_instance = Parcela.objects.get(pk=self.pk)
            if not old_instance.pago and self.pago:
                is_new_payment = True
        else:
            if self.pago:
                is_new_payment = True
        
        super().save(*args, **kwargs)
        
        if is_new_payment:
            # Atualizar o total pago no contrato
            total_pago = Parcela.objects.filter(
                contrato=self.contrato,
                pago=True
            ).aggregate(
                total=models.Sum('valor')
            )['total'] or Decimal('0')
            
            self.contrato.total_pago = total_pago
            self.contrato.save()


class HistoricoStatusContrato(models.Model):
    contrato = models.ForeignKey(Contrato, on_delete=models.CASCADE, related_name='historico_status')
    status_anterior = models.CharField(max_length=30, choices=StatusContrato.choices)
    status_novo = models.CharField(max_length=30, choices=StatusContrato.choices)
    data_alteracao = models.DateTimeField(auto_now_add=True)
    motivo = models.TextField(blank=True, null=True)
    usuario = models.ForeignKey(Usuario, on_delete=models.PROTECT, related_name='alteracoes_status')
    
    class Meta:
        verbose_name = 'Histórico de Status de Contrato'
        verbose_name_plural = 'Históricos de Status de Contratos'
        ordering = ['-data_alteracao']
    
    def __str__(self):
        return f"{self.contrato.nome_curso_acao} - {self.get_status_anterior_display()} → {self.get_status_novo_display()}"
