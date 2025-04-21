from rest_framework import serializers
from core.models import (
    Setor, Programa, FonteRecurso, Meta, Atividade, 
    Rubrica, AlocacaoRecurso, TransferenciaRecurso
)


class SetorSerializer(serializers.ModelSerializer):
    """
    Serializer para o modelo Setor.
    """
    responsavel_nome = serializers.ReadOnlyField(source='responsavel.get_full_name')
    
    class Meta:
        model = Setor
        fields = ['id', 'nome', 'descricao', 'responsavel', 'responsavel_nome', 'ativo']


class ProgramaSerializer(serializers.ModelSerializer):
    """
    Serializer para o modelo Programa.
    """
    class Meta:
        model = Programa
        fields = ['id', 'nome', 'descricao', 'data_inicio', 'data_fim', 'ativo']


class FonteRecursoSerializer(serializers.ModelSerializer):
    """
    Serializer para o modelo FonteRecurso.
    """
    class Meta:
        model = FonteRecurso
        fields = ['id', 'nome', 'descricao', 'valor_total', 'data_inicio', 'data_fim', 'ativo']


class MetaSerializer(serializers.ModelSerializer):
    """
    Serializer para o modelo Meta.
    """
    fonte_recurso_nome = serializers.ReadOnlyField(source='fonte_recurso.nome')
    
    class Meta:
        model = Meta
        fields = ['id', 'fonte_recurso', 'fonte_recurso_nome', 'codigo', 'descricao', 'valor_previsto', 'ativo']


class AtividadeSerializer(serializers.ModelSerializer):
    """
    Serializer para o modelo Atividade.
    """
    meta_codigo = serializers.ReadOnlyField(source='meta.codigo')
    
    class Meta:
        model = Atividade
        fields = ['id', 'meta', 'meta_codigo', 'codigo', 'descricao', 'valor_previsto', 'ativo']


class RubricaSerializer(serializers.ModelSerializer):
    """
    Serializer para o modelo Rubrica.
    """
    atividade_codigo = serializers.ReadOnlyField(source='atividade.codigo')
    
    class Meta:
        model = Rubrica
        fields = ['id', 'atividade', 'atividade_codigo', 'nome', 'descricao', 'valor_previsto', 'ativo']


class AlocacaoRecursoSerializer(serializers.ModelSerializer):
    """
    Serializer para o modelo AlocacaoRecurso.
    """
    fonte_recurso_nome = serializers.ReadOnlyField(source='fonte_recurso.nome')
    setor_nome = serializers.ReadOnlyField(source='setor.nome')
    rubrica_nome = serializers.ReadOnlyField(source='rubrica.nome')
    
    class Meta:
        model = AlocacaoRecurso
        fields = ['id', 'fonte_recurso', 'fonte_recurso_nome', 'setor', 'setor_nome', 
                  'rubrica', 'rubrica_nome', 'valor_alocado', 'data_alocacao', 'observacao']
        read_only_fields = ['data_alocacao']


class TransferenciaRecursoSerializer(serializers.ModelSerializer):
    """
    Serializer para o modelo TransferenciaRecurso.
    """
    setor_origem_nome = serializers.ReadOnlyField(source='setor_origem.nome')
    setor_destino_nome = serializers.ReadOnlyField(source='setor_destino.nome')
    rubrica_nome = serializers.ReadOnlyField(source='rubrica.nome')
    aprovado_por_nome = serializers.ReadOnlyField(source='aprovado_por.get_full_name')
    
    class Meta:
        model = TransferenciaRecurso
        fields = ['id', 'setor_origem', 'setor_origem_nome', 'setor_destino', 'setor_destino_nome', 
                  'rubrica', 'rubrica_nome', 'valor', 'data_solicitacao', 'data_aprovacao', 
                  'aprovado_por', 'aprovado_por_nome', 'status', 'observacao']
        read_only_fields = ['data_solicitacao', 'data_aprovacao', 'aprovado_por']


class MetaDetalhadaSerializer(MetaSerializer):
    """
    Serializer para o modelo Meta com detalhes de atividades.
    """
    atividades = AtividadeSerializer(many=True, read_only=True)
    
    class Meta(MetaSerializer.Meta):
        fields = MetaSerializer.Meta.fields + ['atividades']


class FonteRecursoDetalhadaSerializer(FonteRecursoSerializer):
    """
    Serializer para o modelo FonteRecurso com detalhes de metas.
    """
    metas = MetaSerializer(many=True, read_only=True)
    
    class Meta(FonteRecursoSerializer.Meta):
        fields = FonteRecursoSerializer.Meta.fields + ['metas']


class AtividadeDetalhadaSerializer(AtividadeSerializer):
    """
    Serializer para o modelo Atividade com detalhes de rubricas.
    """
    rubricas = RubricaSerializer(many=True, read_only=True)
    
    class Meta(AtividadeSerializer.Meta):
        fields = AtividadeSerializer.Meta.fields + ['rubricas']
