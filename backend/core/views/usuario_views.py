from rest_framework import viewsets, permissions, status, generics
from rest_framework.response import Response
from rest_framework.decorators import action
from django.contrib.auth import get_user_model
from core.models import Usuario, Perfil, RegistroAuditoria
from core.serializers.usuario_serializers import (
    UsuarioSerializer, UsuarioComPerfilSerializer, PerfilSerializer,
    RegistroAuditoriaSerializer, ChangePasswordSerializer
)


class UsuarioViewSet(viewsets.ModelViewSet):
    """
    API endpoint para gerenciar usuários.
    """
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'retrieve' or self.action == 'me':
            return UsuarioComPerfilSerializer
        return UsuarioSerializer
    
    def get_permissions(self):
        if self.action == 'create':
            return [permissions.IsAdminUser()]
        return super().get_permissions()
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """
        Retorna os dados do usuário autenticado.
        """
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def change_password(self, request, pk=None):
        """
        Altera a senha do usuário.
        """
        user = self.get_object()
        serializer = ChangePasswordSerializer(data=request.data)
        
        if serializer.is_valid():
            # Verificar senha atual
            if not user.check_password(serializer.validated_data['old_password']):
                return Response(
                    {"old_password": ["Senha atual incorreta."]}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Definir nova senha
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response({"status": "Senha alterada com sucesso."})
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PerfilViewSet(viewsets.ModelViewSet):
    """
    API endpoint para gerenciar perfis de usuários.
    """
    queryset = Perfil.objects.all()
    serializer_class = PerfilSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return super().get_permissions()


class RegistroAuditoriaViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint para visualizar registros de auditoria.
    """
    queryset = RegistroAuditoria.objects.all()
    serializer_class = RegistroAuditoriaSerializer
    permission_classes = [permissions.IsAdminUser]
    filterset_fields = ['usuario', 'acao', 'tabela_afetada']
    search_fields = ['acao', 'tabela_afetada', 'usuario__username']
    ordering_fields = ['data_hora', 'usuario', 'acao', 'tabela_afetada']
    ordering = ['-data_hora']


class UserInfoView(generics.RetrieveAPIView):
    """
    API endpoint para obter informações do usuário autenticado.
    """
    serializer_class = UsuarioComPerfilSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user


class ChangePasswordView(generics.UpdateAPIView):
    """
    API endpoint para alterar a senha do usuário autenticado.
    """
    serializer_class = ChangePasswordSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user
    
    def update(self, request, *args, **kwargs):
        user = self.get_object()
        serializer = self.get_serializer(data=request.data)
        
        if serializer.is_valid():
            # Verificar senha atual
            if not user.check_password(serializer.validated_data['old_password']):
                return Response(
                    {"old_password": ["Senha atual incorreta."]}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Definir nova senha
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response({"status": "Senha alterada com sucesso."})
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
