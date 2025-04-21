from rest_framework import serializers
from core.models import (
    ConfiguracaoSistema, Notificacao, RelatorioGerado, ProjecaoOrcamentaria
)


class ConfiguracaoSistemaSerializer(serializers.ModelSerializer):
    """
    Serializer para o modelo ConfiguracaoSistema.
    """
    class Meta:
        model = ConfiguracaoSistema
        fields = ['id', 'chave', 'valor', 'descricao', 'data_atualizacao']
        read_only_fields = ['data_atualizacao']


class NotificacaoSerializer(serializers.ModelSerializer):
    """
    Serializer para o modelo Notificacao.
    """
    tipo_display = serializers.ReadOnlyField(source='get_tipo_display')
    
    class Meta:
        model = Notificacao
        fields = ['id', 'usuario', 'tipo', 'tipo_display', 'titulo', 'mensagem', 
                  'data_criacao', 'lida', 'data_leitura', 'link']
        read_only_fields = ['data_criacao', 'data_leitura']


class RelatorioGeradoSerializer(serializers.ModelSerializer):
    """
    Serializer para o modelo RelatorioGerado.
    """
    tipo_display = serializers.ReadOnlyField(source='get_tipo_display')
    usuario_nome = serializers.ReadOnlyField(source='usuario.get_full_name')
    
    class Meta:
        model = RelatorioGerado
        fields = ['id', 'tipo', 'tipo_display', 'titulo', 'descricao', 'parametros', 
                  'arquivo_url', 'data_geracao', 'usuario', 'usuario_nome']
        read_only_fields = ['data_geracao']


class ProjecaoOrcamentariaSerializer(serializers.ModelSerializer):
    """
    Serializer para o modelo ProjecaoOrcamentaria.
    """
    setor_nome = serializers.ReadOnlyField(source='setor.nome')
    fonte_recurso_nome = serializers.ReadOnlyField(source='fonte_recurso.nome')
    rubrica_nome = serializers.ReadOnlyField(source='rubrica.nome')
    criado_por_nome = serializers.ReadOnlyField(source='criado_por.get_full_name')
    
    class Meta:
        model = ProjecaoOrcamentaria
        fields = ['id', 'setor', 'setor_nome', 'fonte_recurso', 'fonte_recurso_nome', 
                  'rubrica', 'rubrica_nome', 'mes_referencia', 'valor_previsto', 
                  'valor_realizado', 'observacao', 'criado_por', 'criado_por_nome', 
                  'data_criacao', 'data_atualizacao']
        read_only_fields = ['data_criacao', 'data_atualizacao']


class DashboardResumoSerializer(serializers.Serializer):
    """
    Serializer para o resumo do dashboard.
    """
    total_contratos = serializers.IntegerField()
    total_bolsistas = serializers.IntegerField()
    total_credores = serializers.IntegerField()
    valor_total_contratos = serializers.DecimalField(max_digits=15, decimal_places=2)
    valor_total_pago = serializers.DecimalField(max_digits=15, decimal_places=2)
    contratos_por_setor = serializers.DictField(child=serializers.IntegerField())
    valores_por_setor = serializers.DictField(child=serializers.DecimalField(max_digits=15, decimal_places=2))
    contratos_por_status = serializers.DictField(child=serializers.IntegerField())
    contratos_recentes = serializers.ListField(child=serializers.DictField())


class DashboardContratosSerializer(serializers.Serializer):
    """
    Serializer para o dashboard de contratos.
    """
    contratos_por_mes = serializers.DictField(child=serializers.IntegerField())
    valores_por_mes = serializers.DictField(child=serializers.DecimalField(max_digits=15, decimal_places=2))
    contratos_por_tipo = serializers.DictField(child=serializers.IntegerField())
    valores_por_tipo = serializers.DictField(child=serializers.DecimalField(max_digits=15, decimal_places=2))
    top_bolsistas = serializers.ListField(child=serializers.DictField())
    top_credores = serializers.ListField(child=serializers.DictField())


class DashboardFinanceiroSerializer(serializers.Serializer):
    """
    Serializer para o dashboard financeiro.
    """
    orcamento_total = serializers.DecimalField(max_digits=15, decimal_places=2)
    comprometido = serializers.DecimalField(max_digits=15, decimal_places=2)
    pago = serializers.DecimalField(max_digits=15, decimal_places=2)
    disponivel = serializers.DecimalField(max_digits=15, decimal_places=2)
    orcamento_por_fonte = serializers.DictField(child=serializers.DecimalField(max_digits=15, decimal_places=2))
    orcamento_por_meta = serializers.DictField(child=serializers.DecimalField(max_digits=15, decimal_places=2))
    orcamento_por_atividade = serializers.DictField(child=serializers.DecimalField(max_digits=15, decimal_places=2))
    orcamento_por_rubrica = serializers.DictField(child=serializers.DecimalField(max_digits=15, decimal_places=2))
    orcamento_por_setor = serializers.DictField(child=serializers.DecimalField(max_digits=15, decimal_places=2))
    fluxo_caixa_mensal = serializers.DictField(child=serializers.DictField())
