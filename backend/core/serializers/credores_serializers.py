from rest_framework import serializers
from core.models import Credor, Bolsista


class CredorSerializer(serializers.ModelSerializer):
    """
    Serializer para o modelo Credor.
    """
    class Meta:
        model = Credor
        fields = ['id', 'razao_social', 'nome_fantasia', 'cnpj', 'endereco', 
                  'telefone', 'email', 'banco', 'agencia', 'conta', 'ativo']


class BolsistaSerializer(serializers.ModelSerializer):
    """
    Serializer para o modelo Bolsista.
    """
    class Meta:
        model = Bolsista
        fields = ['id', 'nome', 'cpf', 'endereco', 'telefone', 
                  'email', 'banco', 'agencia', 'conta', 'ativo']


class CredorDetalhadoSerializer(CredorSerializer):
    """
    Serializer para o modelo Credor com detalhes de contratos.
    """
    contratos_count = serializers.IntegerField(read_only=True)
    valor_total_contratos = serializers.DecimalField(max_digits=15, decimal_places=2, read_only=True)
    
    class Meta(CredorSerializer.Meta):
        fields = CredorSerializer.Meta.fields + ['contratos_count', 'valor_total_contratos']


class BolsistaDetalhadoSerializer(BolsistaSerializer):
    """
    Serializer para o modelo Bolsista com detalhes de contratos.
    """
    contratos_count = serializers.IntegerField(read_only=True)
    valor_total_contratos = serializers.DecimalField(max_digits=15, decimal_places=2, read_only=True)
    contratos_ativos = serializers.BooleanField(read_only=True)
    
    class Meta(BolsistaSerializer.Meta):
        fields = BolsistaSerializer.Meta.fields + ['contratos_count', 'valor_total_contratos', 'contratos_ativos']


class VerificacaoSobreposicaoBolsistaSerializer(serializers.Serializer):
    """
    Serializer para verificação de sobreposição de datas de bolsistas.
    """
    bolsista_id = serializers.IntegerField(required=True)
    data_inicio = serializers.DateField(required=True)
    data_fim = serializers.DateField(required=True)
    contrato_id = serializers.IntegerField(required=False)
    
    def validate(self, data):
        """
        Validação para verificar sobreposição de datas.
        """
        from core.models import Contrato
        from django.db.models import Q
        
        bolsista_id = data.get('bolsista_id')
        data_inicio = data.get('data_inicio')
        data_fim = data.get('data_fim')
        contrato_id = data.get('contrato_id')
        
        # Verificar se o bolsista existe
        try:
            bolsista = Bolsista.objects.get(id=bolsista_id)
        except Bolsista.DoesNotExist:
            raise serializers.ValidationError("Bolsista não encontrado.")
        
        # Verificar sobreposição de datas
        query = Q(
            bolsista_id=bolsista_id,
            data_inicio__lte=data_fim,
            data_fim__gte=data_inicio
        )
        
        # Excluir o próprio contrato se estiver editando
        if contrato_id:
            query &= ~Q(id=contrato_id)
        
        sobreposicao = Contrato.objects.filter(query).exists()
        
        if sobreposicao:
            raise serializers.ValidationError(
                "Este bolsista já possui um contrato ativo no período especificado."
            )
        
        return data
