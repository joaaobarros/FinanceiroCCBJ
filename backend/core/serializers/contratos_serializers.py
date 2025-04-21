from rest_framework import serializers
from core.models import (
    Contrato, ParcelaContrato, HistoricoProcesso, MovimentoFinanceiro
)
from core.serializers.credores_serializers import CredorSerializer, BolsistaSerializer


class ParcelaContratoSerializer(serializers.ModelSerializer):
    """
    Serializer para o modelo ParcelaContrato.
    """
    class Meta:
        model = ParcelaContrato
        fields = ['id', 'contrato', 'numero_parcela', 'valor', 'data_prevista', 
                  'data_pagamento', 'status', 'atividade_pagamento', 'observacao']


class HistoricoProcessoSerializer(serializers.ModelSerializer):
    """
    Serializer para o modelo HistoricoProcesso.
    """
    usuario_nome = serializers.ReadOnlyField(source='usuario.get_full_name')
    status_anterior_display = serializers.ReadOnlyField(source='get_status_anterior_display')
    status_novo_display = serializers.ReadOnlyField(source='get_status_novo_display')
    
    class Meta:
        model = HistoricoProcesso
        fields = ['id', 'contrato', 'status_anterior', 'status_anterior_display', 
                  'status_novo', 'status_novo_display', 'data_alteracao', 
                  'usuario', 'usuario_nome', 'observacao']
        read_only_fields = ['data_alteracao']


class MovimentoFinanceiroSerializer(serializers.ModelSerializer):
    """
    Serializer para o modelo MovimentoFinanceiro.
    """
    tipo_display = serializers.ReadOnlyField(source='get_tipo_display')
    fonte_recurso_nome = serializers.ReadOnlyField(source='fonte_recurso.nome')
    setor_nome = serializers.ReadOnlyField(source='setor.nome')
    rubrica_nome = serializers.ReadOnlyField(source='rubrica.nome')
    usuario_nome = serializers.ReadOnlyField(source='usuario.get_full_name')
    
    class Meta:
        model = MovimentoFinanceiro
        fields = ['id', 'tipo', 'tipo_display', 'fonte_recurso', 'fonte_recurso_nome', 
                  'setor', 'setor_nome', 'rubrica', 'rubrica_nome', 'contrato', 
                  'parcela', 'valor', 'data_movimento', 'descricao', 
                  'comprovante_url', 'usuario', 'usuario_nome']


class ContratoSerializer(serializers.ModelSerializer):
    """
    Serializer para o modelo Contrato.
    """
    tipo_display = serializers.ReadOnlyField(source='get_tipo_display')
    status_processo_display = serializers.ReadOnlyField(source='get_status_processo_display')
    setor_nome = serializers.ReadOnlyField(source='setor.nome')
    programa_nome = serializers.ReadOnlyField(source='programa.nome')
    atividade_codigo = serializers.ReadOnlyField(source='atividade.codigo')
    rubrica_nome = serializers.ReadOnlyField(source='rubrica.nome')
    meta_codigo = serializers.ReadOnlyField(source='meta.codigo')
    responsavel_nome = serializers.ReadOnlyField(source='responsavel.get_full_name')
    criado_por_nome = serializers.ReadOnlyField(source='criado_por.get_full_name')
    atualizado_por_nome = serializers.ReadOnlyField(source='atualizado_por.get_full_name')
    
    class Meta:
        model = Contrato
        fields = ['id', 'tipo', 'tipo_display', 'nome_curso_acao', 'status_processo', 
                  'status_processo_display', 'setor', 'setor_nome', 'programa', 
                  'programa_nome', 'bolsista', 'credor', 'responsavel', 'responsavel_nome', 
                  'data_inicio', 'data_fim', 'atividade', 'atividade_codigo', 'rubrica', 
                  'rubrica_nome', 'meta', 'meta_codigo', 'valor_total', 'quantidade_parcelas', 
                  'observacoes_parcela', 'total_pago', 'data_criacao', 'data_atualizacao', 
                  'criado_por', 'criado_por_nome', 'atualizado_por', 'atualizado_por_nome']
        read_only_fields = ['data_criacao', 'data_atualizacao', 'total_pago']


class ContratoDetalhadoSerializer(ContratoSerializer):
    """
    Serializer para o modelo Contrato com detalhes de parcelas e histórico.
    """
    parcelas = ParcelaContratoSerializer(many=True, read_only=True)
    historicos = HistoricoProcessoSerializer(many=True, read_only=True)
    bolsista_detalhes = BolsistaSerializer(source='bolsista', read_only=True)
    credor_detalhes = CredorSerializer(source='credor', read_only=True)
    
    class Meta(ContratoSerializer.Meta):
        fields = ContratoSerializer.Meta.fields + ['parcelas', 'historicos', 'bolsista_detalhes', 'credor_detalhes']


class VerificacaoDisponibilidadeOrcamentariaSerializer(serializers.Serializer):
    """
    Serializer para verificação de disponibilidade orçamentária.
    """
    setor_id = serializers.IntegerField(required=True)
    rubrica_id = serializers.IntegerField(required=True)
    valor = serializers.DecimalField(max_digits=15, decimal_places=2, required=True)
    contrato_id = serializers.IntegerField(required=False)
    
    def validate(self, data):
        """
        Validação para verificar disponibilidade orçamentária.
        """
        from core.models import Setor, Rubrica, AlocacaoRecurso, Contrato
        from django.db.models import Sum
        
        setor_id = data.get('setor_id')
        rubrica_id = data.get('rubrica_id')
        valor = data.get('valor')
        contrato_id = data.get('contrato_id')
        
        # Verificar se o setor e a rubrica existem
        try:
            setor = Setor.objects.get(id=setor_id)
            rubrica = Rubrica.objects.get(id=rubrica_id)
        except (Setor.DoesNotExist, Rubrica.DoesNotExist):
            raise serializers.ValidationError("Setor ou Rubrica não encontrados.")
        
        # Obter o valor alocado para o setor e rubrica
        alocacoes = AlocacaoRecurso.objects.filter(
            setor_id=setor_id,
            rubrica_id=rubrica_id
        )
        
        valor_alocado = alocacoes.aggregate(total=Sum('valor_alocado'))['total'] or 0
        
        # Obter o valor já comprometido em contratos
        query = Contrato.objects.filter(
            setor_id=setor_id,
            rubrica_id=rubrica_id
        )
        
        # Excluir o próprio contrato se estiver editando
        if contrato_id:
            query = query.exclude(id=contrato_id)
        
        valor_comprometido = query.aggregate(total=Sum('valor_total'))['total'] or 0
        
        # Verificar disponibilidade
        disponivel = valor_alocado - valor_comprometido
        
        if valor > disponivel:
            raise serializers.ValidationError(
                f"Não há disponibilidade orçamentária suficiente. Disponível: R$ {disponivel}"
            )
        
        return data
