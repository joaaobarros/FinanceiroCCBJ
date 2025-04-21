from rest_framework import serializers
from core.models import Usuario, Perfil, RegistroAuditoria


class UsuarioSerializer(serializers.ModelSerializer):
    """
    Serializer para o modelo Usuario.
    """
    class Meta:
        model = Usuario
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_active', 'date_joined', 'last_login']
        read_only_fields = ['date_joined', 'last_login']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = super().create(validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        user = super().update(instance, validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user


class PerfilSerializer(serializers.ModelSerializer):
    """
    Serializer para o modelo Perfil.
    """
    usuario_username = serializers.ReadOnlyField(source='usuario.username')
    setor_nome = serializers.ReadOnlyField(source='setor.nome')
    
    class Meta:
        model = Perfil
        fields = ['id', 'usuario', 'usuario_username', 'nome_completo', 'telefone', 
                  'cargo', 'setor', 'setor_nome', 'nivel_acesso']


class UsuarioComPerfilSerializer(UsuarioSerializer):
    """
    Serializer para o modelo Usuario com informações do Perfil.
    """
    perfil = PerfilSerializer(read_only=True)
    
    class Meta(UsuarioSerializer.Meta):
        fields = UsuarioSerializer.Meta.fields + ['perfil']


class RegistroAuditoriaSerializer(serializers.ModelSerializer):
    """
    Serializer para o modelo RegistroAuditoria.
    """
    usuario_username = serializers.ReadOnlyField(source='usuario.username')
    
    class Meta:
        model = RegistroAuditoria
        fields = ['id', 'usuario', 'usuario_username', 'data_hora', 'acao', 
                  'tabela_afetada', 'registro_id', 'dados_antigos', 'dados_novos', 'ip_origem']
        read_only_fields = ['data_hora']


class ChangePasswordSerializer(serializers.Serializer):
    """
    Serializer para alteração de senha.
    """
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
    
    def validate_new_password(self, value):
        """
        Validação da nova senha.
        """
        from django.contrib.auth.password_validation import validate_password
        validate_password(value)
        return value
