from rest_framework import serializers
from .models import Setor, FonteRecurso, Meta, Atividade, Rubrica, Credor, Bolsista, Contrato, Parcela
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class SetorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Setor
        fields = '__all__'

class FonteRecursoSerializer(serializers.ModelSerializer):
    class Meta:
        model = FonteRecurso
        fields = '__all__'

class MetaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Meta
        fields = '__all__'

class AtividadeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Atividade
        fields = '__all__'

class RubricaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rubrica
        fields = '__all__'

class CredorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Credor
        fields = '__all__'

class BolsistaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bolsista
        fields = '__all__'

class ParcelaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Parcela
        fields = '__all__'

class ContratoSerializer(serializers.ModelSerializer):
    parcelas = ParcelaSerializer(many=True, read_only=True)
    setor_nome = serializers.ReadOnlyField(source='setor.nome')
    rubrica_nome = serializers.ReadOnlyField(source='rubrica.nome')
    responsavel_nome = serializers.ReadOnlyField(source='responsavel.get_full_name')
    
    class Meta:
        model = Contrato
        fields = '__all__'
        depth = 1
