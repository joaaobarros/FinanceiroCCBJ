from rest_framework import viewsets, permissions, status, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from core.models import (
    Contrato, ParcelaContrato, HistoricoProcesso, MovimentoFinanceiro
)
from core.serializers.contratos_serializers import (
    ContratoSerializer, ParcelaContratoSerializer, HistoricoProcessoSerializer,
    MovimentoFinanceiroSerializer, ContratoDetalhadoSerializer,
    VerificacaoDisponibilidadeOrcamentariaSerializer
)
from rest_framework.views import APIView
from django.db.models import Sum, F, Q
from django.utils import timezone


class ContratoViewSet(viewsets.ModelViewSet):
    """
    API endpoint para gerenciar contratos.
    """
    queryset = Contrato.objects.all()
    serializer_class = ContratoSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['tipo', 'status_processo', 'setor', 'programa', 'bolsista', 'credor', 'atividade', 'rubrica', 'meta']
    search_fields = ['nome_curso_acao', 'observacoes_parcela']
    ordering_fields = ['nome_curso_acao', 'data_inicio', 'data_fim', 'valor_total', 'data_criacao']
    ordering = ['-data_criacao']
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ContratoDetalhadoSerializer
        return ContratoSerializer
    
    def perform_create(self, serializer):
        serializer.save(
            criado_por=self.request.user,
            atualizado_por=self.request.user
        )
        
        # Criar histórico de processo
        contrato = serializer.instance
        HistoricoProcesso.objects.create(
            contrato=contrato,
            status_anterior='',
            status_novo=contrato.status_processo,
            usuario=self.request.user,
            observacao='Contrato criado'
        )
        
        # Criar parcelas automaticamente
        self._criar_parcelas(contrato)
    
    def perform_update(self, serializer):
        # Obter status anterior
        contrato = self.get_object()
        status_anterior = contrato.status_processo
        
        # Atualizar contrato
        serializer.save(atualizado_por=self.request.user)
        
        # Verificar se o status foi alterado
        contrato_atualizado = serializer.instance
        if status_anterior != contrato_atualizado.status_processo:
            # Criar histórico de processo
            HistoricoProcesso.objects.create(
                contrato=contrato_atualizado,
                status_anterior=status_anterior,
                status_novo=contrato_atualizado.status_processo,
                usuario=self.request.user,
                observacao=f'Status alterado de {status_anterior} para {contrato_atualizado.status_processo}'
            )
    
    def _criar_parcelas(self, contrato):
        """
        Cria as parcelas do contrato automaticamente.
        """
        # Verificar se já existem parcelas
        if contrato.parcelas.exists():
            return
        
        # Calcular valor de cada parcela
        valor_parcela = contrato.valor_total / contrato.quantidade_parcelas
        
        # Calcular intervalo entre parcelas (em dias)
        dias_contrato = (contrato.data_fim - contrato.data_inicio).days
        intervalo = max(1, dias_contrato // contrato.quantidade_parcelas)
        
        # Criar parcelas
        for i in range(1, contrato.quantidade_parcelas + 1):
            data_prevista = contrato.data_inicio + timezone.timedelta(days=(i-1) * intervalo)
            
            ParcelaContrato.objects.create(
                contrato=contrato,
                numero_parcela=i,
                valor=valor_parcela,
                data_prevista=data_prevista,
                status='pendente'
            )
    
    @action(detail=True, methods=['get'])
    def parcelas(self, request, pk=None):
        """
        Retorna as parcelas do contrato.
        """
        contrato = self.get_object()
        parcelas = contrato.parcelas.all()
        serializer = ParcelaContratoSerializer(parcelas, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def historico(self, request, pk=None):
        """
        Retorna o histórico de processos do contrato.
        """
        contrato = self.get_object()
        historicos = contrato.historicos.all()
        serializer = HistoricoProcessoSerializer(historicos, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def movimentos(self, request, pk=None):
        """
        Retorna os movimentos financeiros do contrato.
        """
        contrato = self.get_object()
        movimentos = contrato.movimentos.all()
        serializer = MovimentoFinanceiroSerializer(movimentos, many=True)
        return Response(serializer.data)


class ParcelaContratoViewSet(viewsets.ModelViewSet):
    """
    API endpoint para gerenciar parcelas de contratos.
    """
    queryset = ParcelaContrato.objects.all()
    serializer_class = ParcelaContratoSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['contrato', 'status']
    search_fields = ['observacao', 'atividade_pagamento']
    ordering_fields = ['contrato', 'numero_parcela', 'data_prevista', 'data_pagamento', 'valor']
    ordering = ['contrato', 'numero_parcela']
    
    @action(detail=True, methods=['post'])
    def registrar_pagamento(self, request, pk=None):
        """
        Registra o pagamento de uma parcela.
        """
        parcela = self.get_object()
        
        # Verificar se a parcela já foi paga
        if parcela.status == 'pago':
            return Response(
                {"detail": "Esta parcela já foi paga."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Obter data de pagamento
        data_pagamento = request.data.get('data_pagamento', timezone.now().date())
        atividade_pagamento = request.data.get('atividade_pagamento', '')
        observacao = request.data.get('observacao', '')
        
        # Atualizar parcela
        parcela.status = 'pago'
        parcela.data_pagamento = data_pagamento
        parcela.atividade_pagamento = atividade_pagamento
        parcela.observacao = observacao
        parcela.save()
        
        # Atualizar total pago no contrato
        contrato = parcela.contrato
        contrato.total_pago = contrato.parcelas.filter(status='pago').aggregate(total=Sum('valor'))['total'] or 0
        contrato.save()
        
        # Registrar movimento financeiro
        MovimentoFinanceiro.objects.create(
            tipo='saida',
            fonte_recurso=contrato.meta.fonte_recurso,
            setor=contrato.setor,
            rubrica=contrato.rubrica,
            contrato=contrato,
            parcela=parcela,
            valor=parcela.valor,
            data_movimento=data_pagamento,
            descricao=f"Pagamento da parcela {parcela.numero_parcela} do contrato {contrato.nome_curso_acao}",
            usuario=request.user
        )
        
        serializer = self.get_serializer(parcela)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def cancelar_pagamento(self, request, pk=None):
        """
        Cancela o pagamento de uma parcela.
        """
        parcela = self.get_object()
        
        # Verificar se a parcela está paga
        if parcela.status != 'pago':
            return Response(
                {"detail": "Esta parcela não está paga."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Atualizar parcela
        parcela.status = 'pendente'
        parcela.data_pagamento = None
        parcela.save()
        
        # Atualizar total pago no contrato
        contrato = parcela.contrato
        contrato.total_pago = contrato.parcelas.filter(status='pago').aggregate(total=Sum('valor'))['total'] or 0
        contrato.save()
        
        # Excluir movimento financeiro
        MovimentoFinanceiro.objects.filter(
            contrato=contrato,
            parcela=parcela
        ).delete()
        
        serializer = self.get_serializer(parcela)
        return Response(serializer.data)


class HistoricoProcessoViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint para visualizar históricos de processos.
    """
    queryset = HistoricoProcesso.objects.all()
    serializer_class = HistoricoProcessoSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['contrato', 'usuario', 'status_anterior', 'status_novo']
    search_fields = ['observacao']
    ordering_fields = ['data_alteracao', 'contrato', 'usuario']
    ordering = ['-data_alteracao']


class MovimentoFinanceiroViewSet(viewsets.ModelViewSet):
    """
    API endpoint para gerenciar movimentos financeiros.
    """
    queryset = MovimentoFinanceiro.objects.all()
    serializer_class = MovimentoFinanceiroSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['tipo', 'fonte_recurso', 'setor', 'rubrica', 'contrato', 'parcela', 'usuario']
    search_fields = ['descricao']
    ordering_fields = ['data_movimento', 'valor', 'tipo']
    ordering = ['-data_movimento']
    
    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)


class VerificacaoDisponibilidadeOrcamentariaView(APIView):
    """
    API endpoint para verificar disponibilidade orçamentária.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, format=None):
        serializer = VerificacaoDisponibilidadeOrcamentariaSerializer(data=request.data)
        
        if serializer.is_valid():
            # A validação já foi feita no serializer
            return Response({"detail": "Há disponibilidade orçamentária suficiente."})
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
