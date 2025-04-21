from rest_framework import viewsets, permissions, status, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from core.models import (
    Setor, Programa, FonteRecurso, Meta, Atividade, 
    Rubrica, AlocacaoRecurso, TransferenciaRecurso
)
from core.serializers.estrutura_serializers import (
    SetorSerializer, ProgramaSerializer, FonteRecursoSerializer, MetaSerializer,
    AtividadeSerializer, RubricaSerializer, AlocacaoRecursoSerializer,
    TransferenciaRecursoSerializer, FonteRecursoDetalhadaSerializer,
    MetaDetalhadaSerializer, AtividadeDetalhadaSerializer
)


class SetorViewSet(viewsets.ModelViewSet):
    """
    API endpoint para gerenciar setores.
    """
    queryset = Setor.objects.all()
    serializer_class = SetorSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['ativo', 'responsavel']
    search_fields = ['nome', 'descricao']
    ordering_fields = ['nome', 'ativo']
    ordering = ['nome']
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return super().get_permissions()
    
    @action(detail=True, methods=['get'])
    def alocacoes(self, request, pk=None):
        """
        Retorna as alocações de recursos para o setor.
        """
        setor = self.get_object()
        alocacoes = AlocacaoRecurso.objects.filter(setor=setor)
        serializer = AlocacaoRecursoSerializer(alocacoes, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def contratos(self, request, pk=None):
        """
        Retorna os contratos do setor.
        """
        setor = self.get_object()
        contratos = setor.contratos.all()
        from core.serializers.contratos_serializers import ContratoSerializer
        serializer = ContratoSerializer(contratos, many=True)
        return Response(serializer.data)


class ProgramaViewSet(viewsets.ModelViewSet):
    """
    API endpoint para gerenciar programas.
    """
    queryset = Programa.objects.all()
    serializer_class = ProgramaSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['ativo']
    search_fields = ['nome', 'descricao']
    ordering_fields = ['nome', 'data_inicio', 'data_fim', 'ativo']
    ordering = ['nome']
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return super().get_permissions()
    
    @action(detail=True, methods=['get'])
    def contratos(self, request, pk=None):
        """
        Retorna os contratos do programa.
        """
        programa = self.get_object()
        contratos = programa.contratos.all()
        from core.serializers.contratos_serializers import ContratoSerializer
        serializer = ContratoSerializer(contratos, many=True)
        return Response(serializer.data)


class FonteRecursoViewSet(viewsets.ModelViewSet):
    """
    API endpoint para gerenciar fontes de recursos.
    """
    queryset = FonteRecurso.objects.all()
    serializer_class = FonteRecursoSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['ativo']
    search_fields = ['nome', 'descricao']
    ordering_fields = ['nome', 'valor_total', 'data_inicio', 'data_fim', 'ativo']
    ordering = ['nome']
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return super().get_permissions()
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return FonteRecursoDetalhadaSerializer
        return FonteRecursoSerializer
    
    @action(detail=True, methods=['get'])
    def metas(self, request, pk=None):
        """
        Retorna as metas da fonte de recurso.
        """
        fonte = self.get_object()
        metas = fonte.metas.all()
        serializer = MetaSerializer(metas, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def alocacoes(self, request, pk=None):
        """
        Retorna as alocações da fonte de recurso.
        """
        fonte = self.get_object()
        alocacoes = fonte.alocacoes.all()
        serializer = AlocacaoRecursoSerializer(alocacoes, many=True)
        return Response(serializer.data)


class MetaViewSet(viewsets.ModelViewSet):
    """
    API endpoint para gerenciar metas.
    """
    queryset = Meta.objects.all()
    serializer_class = MetaSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['fonte_recurso', 'ativo']
    search_fields = ['codigo', 'descricao']
    ordering_fields = ['codigo', 'valor_previsto', 'ativo']
    ordering = ['codigo']
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return super().get_permissions()
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return MetaDetalhadaSerializer
        return MetaSerializer
    
    @action(detail=True, methods=['get'])
    def atividades(self, request, pk=None):
        """
        Retorna as atividades da meta.
        """
        meta = self.get_object()
        atividades = meta.atividades.all()
        serializer = AtividadeSerializer(atividades, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def contratos(self, request, pk=None):
        """
        Retorna os contratos da meta.
        """
        meta = self.get_object()
        contratos = meta.contratos.all()
        from core.serializers.contratos_serializers import ContratoSerializer
        serializer = ContratoSerializer(contratos, many=True)
        return Response(serializer.data)


class AtividadeViewSet(viewsets.ModelViewSet):
    """
    API endpoint para gerenciar atividades.
    """
    queryset = Atividade.objects.all()
    serializer_class = AtividadeSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['meta', 'ativo']
    search_fields = ['codigo', 'descricao']
    ordering_fields = ['codigo', 'valor_previsto', 'ativo']
    ordering = ['codigo']
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return super().get_permissions()
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return AtividadeDetalhadaSerializer
        return AtividadeSerializer
    
    @action(detail=True, methods=['get'])
    def rubricas(self, request, pk=None):
        """
        Retorna as rubricas da atividade.
        """
        atividade = self.get_object()
        rubricas = atividade.rubricas.all()
        serializer = RubricaSerializer(rubricas, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def contratos(self, request, pk=None):
        """
        Retorna os contratos da atividade.
        """
        atividade = self.get_object()
        contratos = atividade.contratos.all()
        from core.serializers.contratos_serializers import ContratoSerializer
        serializer = ContratoSerializer(contratos, many=True)
        return Response(serializer.data)


class RubricaViewSet(viewsets.ModelViewSet):
    """
    API endpoint para gerenciar rubricas.
    """
    queryset = Rubrica.objects.all()
    serializer_class = RubricaSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['atividade', 'ativo']
    search_fields = ['nome', 'descricao']
    ordering_fields = ['nome', 'valor_previsto', 'ativo']
    ordering = ['nome']
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return super().get_permissions()
    
    @action(detail=True, methods=['get'])
    def alocacoes(self, request, pk=None):
        """
        Retorna as alocações da rubrica.
        """
        rubrica = self.get_object()
        alocacoes = rubrica.alocacoes.all()
        serializer = AlocacaoRecursoSerializer(alocacoes, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def contratos(self, request, pk=None):
        """
        Retorna os contratos da rubrica.
        """
        rubrica = self.get_object()
        contratos = rubrica.contratos.all()
        from core.serializers.contratos_serializers import ContratoSerializer
        serializer = ContratoSerializer(contratos, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def transferencias(self, request, pk=None):
        """
        Retorna as transferências da rubrica.
        """
        rubrica = self.get_object()
        transferencias = rubrica.transferencias.all()
        serializer = TransferenciaRecursoSerializer(transferencias, many=True)
        return Response(serializer.data)


class AlocacaoRecursoViewSet(viewsets.ModelViewSet):
    """
    API endpoint para gerenciar alocações de recursos.
    """
    queryset = AlocacaoRecurso.objects.all()
    serializer_class = AlocacaoRecursoSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['fonte_recurso', 'setor', 'rubrica']
    search_fields = ['observacao']
    ordering_fields = ['data_alocacao', 'valor_alocado']
    ordering = ['-data_alocacao']
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return super().get_permissions()


class TransferenciaRecursoViewSet(viewsets.ModelViewSet):
    """
    API endpoint para gerenciar transferências de recursos.
    """
    queryset = TransferenciaRecurso.objects.all()
    serializer_class = TransferenciaRecursoSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['setor_origem', 'setor_destino', 'rubrica', 'status']
    search_fields = ['observacao']
    ordering_fields = ['data_solicitacao', 'valor', 'status']
    ordering = ['-data_solicitacao']
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return super().get_permissions()
    
    @action(detail=True, methods=['post'])
    def aprovar(self, request, pk=None):
        """
        Aprova uma transferência de recursos.
        """
        transferencia = self.get_object()
        
        # Verificar se a transferência já foi processada
        if transferencia.status != 'pendente':
            return Response(
                {"detail": "Esta transferência já foi processada."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verificar se o usuário é o responsável pelo setor de origem
        if request.user != transferencia.setor_origem.responsavel:
            return Response(
                {"detail": "Apenas o responsável pelo setor de origem pode aprovar a transferência."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Atualizar a transferência
        transferencia.status = 'aprovado'
        transferencia.aprovado_por = request.user
        transferencia.data_aprovacao = timezone.now()
        transferencia.save()
        
        # Atualizar as alocações de recursos
        from django.db.models import F
        
        # Reduzir o valor da alocação no setor de origem
        AlocacaoRecurso.objects.filter(
            setor=transferencia.setor_origem,
            rubrica=transferencia.rubrica
        ).update(valor_alocado=F('valor_alocado') - transferencia.valor)
        
        # Aumentar o valor da alocação no setor de destino
        alocacao_destino, created = AlocacaoRecurso.objects.get_or_create(
            setor=transferencia.setor_destino,
            rubrica=transferencia.rubrica,
            defaults={
                'fonte_recurso': AlocacaoRecurso.objects.filter(
                    setor=transferencia.setor_origem,
                    rubrica=transferencia.rubrica
                ).first().fonte_recurso,
                'valor_alocado': 0,
                'observacao': f"Transferência automática de {transferencia.setor_origem.nome}"
            }
        )
        
        if not created:
            alocacao_destino.valor_alocado += transferencia.valor
            alocacao_destino.save()
        else:
            alocacao_destino.valor_alocado = transferencia.valor
            alocacao_destino.save()
        
        serializer = self.get_serializer(transferencia)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def rejeitar(self, request, pk=None):
        """
        Rejeita uma transferência de recursos.
        """
        transferencia = self.get_object()
        
        # Verificar se a transferência já foi processada
        if transferencia.status != 'pendente':
            return Response(
                {"detail": "Esta transferência já foi processada."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verificar se o usuário é o responsável pelo setor de origem
        if request.user != transferencia.setor_origem.responsavel:
            return Response(
                {"detail": "Apenas o responsável pelo setor de origem pode rejeitar a transferência."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Atualizar a transferência
        transferencia.status = 'rejeitado'
        transferencia.aprovado_por = request.user
        transferencia.data_aprovacao = timezone.now()
        transferencia.save()
        
        serializer = self.get_serializer(transferencia)
        return Response(serializer.data)
