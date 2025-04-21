from rest_framework import viewsets, permissions, status, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from core.models import Credor, Bolsista
from core.serializers.credores_serializers import (
    CredorSerializer, BolsistaSerializer, CredorDetalhadoSerializer,
    BolsistaDetalhadoSerializer, VerificacaoSobreposicaoBolsistaSerializer
)
from rest_framework.views import APIView
from django.db.models import Count, Sum, Q
from django.utils import timezone


class CredorViewSet(viewsets.ModelViewSet):
    """
    API endpoint para gerenciar credores.
    """
    queryset = Credor.objects.all()
    serializer_class = CredorSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['ativo']
    search_fields = ['razao_social', 'nome_fantasia', 'cnpj', 'email']
    ordering_fields = ['razao_social', 'cnpj', 'ativo']
    ordering = ['razao_social']
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return super().get_permissions()
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return CredorDetalhadoSerializer
        return CredorSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        if self.action == 'retrieve':
            queryset = queryset.annotate(
                contratos_count=Count('contratos'),
                valor_total_contratos=Sum('contratos__valor_total')
            )
        
        return queryset
    
    @action(detail=True, methods=['get'])
    def contratos(self, request, pk=None):
        """
        Retorna os contratos do credor.
        """
        credor = self.get_object()
        contratos = credor.contratos.all()
        from core.serializers.contratos_serializers import ContratoSerializer
        serializer = ContratoSerializer(contratos, many=True)
        return Response(serializer.data)


class BolsistaViewSet(viewsets.ModelViewSet):
    """
    API endpoint para gerenciar bolsistas.
    """
    queryset = Bolsista.objects.all()
    serializer_class = BolsistaSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['ativo']
    search_fields = ['nome', 'cpf', 'email']
    ordering_fields = ['nome', 'cpf', 'ativo']
    ordering = ['nome']
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return super().get_permissions()
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return BolsistaDetalhadoSerializer
        return BolsistaSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        if self.action == 'retrieve':
            today = timezone.now().date()
            queryset = queryset.annotate(
                contratos_count=Count('contratos'),
                valor_total_contratos=Sum('contratos__valor_total'),
                contratos_ativos=Count(
                    'contratos',
                    filter=Q(
                        contratos__data_inicio__lte=today,
                        contratos__data_fim__gte=today
                    )
                ) > 0
            )
        
        return queryset
    
    @action(detail=True, methods=['get'])
    def contratos(self, request, pk=None):
        """
        Retorna os contratos do bolsista.
        """
        bolsista = self.get_object()
        contratos = bolsista.contratos.all()
        from core.serializers.contratos_serializers import ContratoSerializer
        serializer = ContratoSerializer(contratos, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def contratos_ativos(self, request, pk=None):
        """
        Retorna os contratos ativos do bolsista.
        """
        bolsista = self.get_object()
        today = timezone.now().date()
        contratos = bolsista.contratos.filter(
            data_inicio__lte=today,
            data_fim__gte=today
        )
        from core.serializers.contratos_serializers import ContratoSerializer
        serializer = ContratoSerializer(contratos, many=True)
        return Response(serializer.data)


class VerificacaoSobreposicaoBolsistaView(APIView):
    """
    API endpoint para verificar sobreposição de datas de bolsistas.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, format=None):
        serializer = VerificacaoSobreposicaoBolsistaSerializer(data=request.data)
        
        if serializer.is_valid():
            # A validação já foi feita no serializer
            return Response({"detail": "Não há sobreposição de datas."})
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
