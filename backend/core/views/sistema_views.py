from rest_framework import viewsets, permissions, status, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.views import APIView
from django.db.models import Sum, Count, Q, F
from django.utils import timezone
from datetime import timedelta
import calendar
from core.models import (
    ConfiguracaoSistema, Notificacao, RelatorioGerado, ProjecaoOrcamentaria,
    Contrato, Setor, FonteRecurso, Meta, Atividade, Rubrica, AlocacaoRecurso,
    MovimentoFinanceiro, Credor, Bolsista
)
from core.serializers.sistema_serializers import (
    ConfiguracaoSistemaSerializer, NotificacaoSerializer, RelatorioGeradoSerializer,
    ProjecaoOrcamentariaSerializer, DashboardResumoSerializer,
    DashboardContratosSerializer, DashboardFinanceiroSerializer
)


class ConfiguracaoSistemaViewSet(viewsets.ModelViewSet):
    """
    API endpoint para gerenciar configurações do sistema.
    """
    queryset = ConfiguracaoSistema.objects.all()
    serializer_class = ConfiguracaoSistemaSerializer
    permission_classes = [permissions.IsAdminUser]
    filter_backends = [filters.SearchFilter]
    search_fields = ['chave', 'descricao']
    ordering = ['chave']


class NotificacaoViewSet(viewsets.ModelViewSet):
    """
    API endpoint para gerenciar notificações.
    """
    serializer_class = NotificacaoSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['usuario', 'tipo', 'lida']
    search_fields = ['titulo', 'mensagem']
    ordering_fields = ['data_criacao', 'lida', 'data_leitura']
    ordering = ['-data_criacao']
    
    def get_queryset(self):
        """
        Filtra as notificações pelo usuário autenticado.
        """
        return Notificacao.objects.filter(usuario=self.request.user)
    
    @action(detail=True, methods=['post'])
    def marcar_como_lida(self, request, pk=None):
        """
        Marca uma notificação como lida.
        """
        notificacao = self.get_object()
        
        if notificacao.lida:
            return Response(
                {"detail": "Esta notificação já está marcada como lida."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        notificacao.lida = True
        notificacao.data_leitura = timezone.now()
        notificacao.save()
        
        serializer = self.get_serializer(notificacao)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def marcar_todas_como_lidas(self, request):
        """
        Marca todas as notificações do usuário como lidas.
        """
        notificacoes = self.get_queryset().filter(lida=False)
        count = notificacoes.count()
        
        if count == 0:
            return Response(
                {"detail": "Não há notificações não lidas."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        notificacoes.update(lida=True, data_leitura=timezone.now())
        
        return Response({"detail": f"{count} notificações marcadas como lidas."})


class RelatorioGeradoViewSet(viewsets.ModelViewSet):
    """
    API endpoint para gerenciar relatórios gerados.
    """
    queryset = RelatorioGerado.objects.all()
    serializer_class = RelatorioGeradoSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['tipo', 'usuario']
    search_fields = ['titulo', 'descricao']
    ordering_fields = ['data_geracao', 'tipo']
    ordering = ['-data_geracao']
    
    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)


class ProjecaoOrcamentariaViewSet(viewsets.ModelViewSet):
    """
    API endpoint para gerenciar projeções orçamentárias.
    """
    queryset = ProjecaoOrcamentaria.objects.all()
    serializer_class = ProjecaoOrcamentariaSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['setor', 'fonte_recurso', 'rubrica']
    search_fields = ['observacao']
    ordering_fields = ['mes_referencia', 'valor_previsto', 'valor_realizado']
    ordering = ['mes_referencia']
    
    def perform_create(self, serializer):
        serializer.save(criado_por=self.request.user)


class DashboardResumoView(APIView):
    """
    API endpoint para obter o resumo do dashboard.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, format=None):
        # Total de contratos
        total_contratos = Contrato.objects.count()
        
        # Total de bolsistas
        total_bolsistas = Bolsista.objects.count()
        
        # Total de credores
        total_credores = Credor.objects.count()
        
        # Valor total de contratos
        valor_total_contratos = Contrato.objects.aggregate(total=Sum('valor_total'))['total'] or 0
        
        # Valor total pago
        valor_total_pago = Contrato.objects.aggregate(total=Sum('total_pago'))['total'] or 0
        
        # Contratos por setor
        contratos_por_setor = dict(
            Contrato.objects.values('setor__nome')
            .annotate(total=Count('id'))
            .values_list('setor__nome', 'total')
        )
        
        # Valores por setor
        valores_por_setor = dict(
            Contrato.objects.values('setor__nome')
            .annotate(total=Sum('valor_total'))
            .values_list('setor__nome', 'total')
        )
        
        # Contratos por status
        contratos_por_status = dict(
            Contrato.objects.values('status_processo')
            .annotate(total=Count('id'))
            .values_list('status_processo', 'total')
        )
        
        # Contratos recentes
        contratos_recentes = list(
            Contrato.objects.order_by('-data_criacao')[:5]
            .values('id', 'nome_curso_acao', 'valor_total', 'data_inicio', 'data_fim', 'setor__nome')
        )
        
        data = {
            'total_contratos': total_contratos,
            'total_bolsistas': total_bolsistas,
            'total_credores': total_credores,
            'valor_total_contratos': valor_total_contratos,
            'valor_total_pago': valor_total_pago,
            'contratos_por_setor': contratos_por_setor,
            'valores_por_setor': valores_por_setor,
            'contratos_por_status': contratos_por_status,
            'contratos_recentes': contratos_recentes,
        }
        
        serializer = DashboardResumoSerializer(data)
        return Response(serializer.data)


class DashboardContratosView(APIView):
    """
    API endpoint para obter dados de contratos para o dashboard.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, format=None):
        # Contratos por mês (últimos 12 meses)
        hoje = timezone.now().date()
        meses = {}
        
        for i in range(11, -1, -1):
            mes = hoje.replace(day=1) - timedelta(days=i*30)
            mes_str = mes.strftime('%Y-%m')
            meses[mes_str] = 0
        
        contratos_por_mes = dict(
            Contrato.objects.filter(
                data_criacao__gte=hoje.replace(day=1) - timedelta(days=365)
            )
            .annotate(mes=F('data_criacao__year') * 100 + F('data_criacao__month'))
            .values('mes')
            .annotate(total=Count('id'))
            .values_list('mes', 'total')
        )
        
        contratos_por_mes_formatado = {}
        for mes_num, total in contratos_por_mes.items():
            ano = mes_num // 100
            mes = mes_num % 100
            mes_str = f"{ano}-{mes:02d}"
            contratos_por_mes_formatado[mes_str] = total
        
        # Valores por mês (últimos 12 meses)
        valores_por_mes = dict(
            Contrato.objects.filter(
                data_criacao__gte=hoje.replace(day=1) - timedelta(days=365)
            )
            .annotate(mes=F('data_criacao__year') * 100 + F('data_criacao__month'))
            .values('mes')
            .annotate(total=Sum('valor_total'))
            .values_list('mes', 'total')
        )
        
        valores_por_mes_formatado = {}
        for mes_num, total in valores_por_mes.items():
            ano = mes_num // 100
            mes = mes_num % 100
            mes_str = f"{ano}-{mes:02d}"
            valores_por_mes_formatado[mes_str] = total
        
        # Contratos por tipo
        contratos_por_tipo = dict(
            Contrato.objects.values('tipo')
            .annotate(total=Count('id'))
            .values_list('tipo', 'total')
        )
        
        # Valores por tipo
        valores_por_tipo = dict(
            Contrato.objects.values('tipo')
            .annotate(total=Sum('valor_total'))
            .values_list('tipo', 'total')
        )
        
        # Top bolsistas
        top_bolsistas = list(
            Contrato.objects.filter(bolsista__isnull=False)
            .values('bolsista__nome')
            .annotate(total=Count('id'), valor_total=Sum('valor_total'))
            .order_by('-valor_total')[:5]
            .values('bolsista__nome', 'total', 'valor_total')
        )
        
        # Top credores
        top_credores = list(
            Contrato.objects.filter(credor__isnull=False)
            .values('credor__razao_social')
            .annotate(total=Count('id'), valor_total=Sum('valor_total'))
            .order_by('-valor_total')[:5]
            .values('credor__razao_social', 'total', 'valor_total')
        )
        
        data = {
            'contratos_por_mes': contratos_por_mes_formatado,
            'valores_por_mes': valores_por_mes_formatado,
            'contratos_por_tipo': contratos_por_tipo,
            'valores_por_tipo': valores_por_tipo,
            'top_bolsistas': top_bolsistas,
            'top_credores': top_credores,
        }
        
        serializer = DashboardContratosSerializer(data)
        return Response(serializer.data)


class DashboardFinanceiroView(APIView):
    """
    API endpoint para obter dados financeiros para o dashboard.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, format=None):
        # Orçamento total
        orcamento_total = FonteRecurso.objects.aggregate(total=Sum('valor_total'))['total'] or 0
        
        # Valor comprometido em contratos
        comprometido = Contrato.objects.aggregate(total=Sum('valor_total'))['total'] or 0
        
        # Valor pago
        pago = Contrato.objects.aggregate(total=Sum('total_pago'))['total'] or 0
        
        # Valor disponível
        disponivel = orcamento_total - comprometido
        
        # Orçamento por fonte de recurso
        orcamento_por_fonte = dict(
            FonteRecurso.objects.values('nome')
            .annotate(total=Sum('valor_total'))
            .values_list('nome', 'total')
        )
        
        # Orçamento por meta
        orcamento_por_meta = dict(
            Meta.objects.values('codigo')
            .annotate(total=Sum('valor_previsto'))
            .values_list('codigo', 'total')
        )
        
        # Orçamento por atividade
        orcamento_por_atividade = dict(
            Atividade.objects.values('codigo')
            .annotate(total=Sum('valor_previsto'))
            .values_list('codigo', 'total')
        )
        
        # Orçamento por rubrica
        orcamento_por_rubrica = dict(
            Rubrica.objects.values('nome')
            .annotate(total=Sum('valor_previsto'))
            .values_list('nome', 'total')
        )
        
        # Orçamento por setor
        orcamento_por_setor = dict(
            AlocacaoRecurso.objects.values('setor__nome')
            .annotate(total=Sum('valor_alocado'))
            .values_list('setor__nome', 'total')
        )
        
        # Fluxo de caixa mensal (últimos 12 meses)
        hoje = timezone.now().date()
        fluxo_caixa_mensal = {}
        
        for i in range(11, -1, -1):
            mes = hoje.replace(day=1) - timedelta(days=i*30)
            mes_str = mes.strftime('%Y-%m')
            
            # Entradas do mês
            entradas = MovimentoFinanceiro.objects.filter(
                tipo='entrada',
                data_movimento__year=mes.year,
                data_movimento__month=mes.month
            ).aggregate(total=Sum('valor'))['total'] or 0
            
            # Saídas do mês
            saidas = MovimentoFinanceiro.objects.filter(
                tipo='saida',
                data_movimento__year=mes.year,
                data_movimento__month=mes.month
            ).aggregate(total=Sum('valor'))['total'] or 0
            
            fluxo_caixa_mensal[mes_str] = {
                'entradas': entradas,
                'saidas': saidas,
                'saldo': entradas - saidas
            }
        
        data = {
            'orcamento_total': orcamento_total,
            'comprometido': comprometido,
            'pago': pago,
            'disponivel': disponivel,
            'orcamento_por_fonte': orcamento_por_fonte,
            'orcamento_por_meta': orcamento_por_meta,
            'orcamento_por_atividade': orcamento_por_atividade,
            'orcamento_por_rubrica': orcamento_por_rubrica,
            'orcamento_por_setor': orcamento_por_setor,
            'fluxo_caixa_mensal': fluxo_caixa_mensal,
        }
        
        serializer = DashboardFinanceiroSerializer(data)
        return Response(serializer.data)


class RelatorioContratosView(APIView):
    """
    API endpoint para gerar relatório de contratos.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, format=None):
        # Filtros
        setor_id = request.query_params.get('setor')
        tipo = request.query_params.get('tipo')
        status = request.query_params.get('status')
        data_inicio = request.query_params.get('data_inicio')
        data_fim = request.query_params.get('data_fim')
        
        # Consulta base
        queryset = Contrato.objects.all()
        
        # Aplicar filtros
        if setor_id:
            queryset = queryset.filter(setor_id=setor_id)
        
        if tipo:
            queryset = queryset.filter(tipo=tipo)
        
        if status:
            queryset = queryset.filter(status_processo=status)
        
        if data_inicio:
            queryset = queryset.filter(data_inicio__gte=data_inicio)
        
        if data_fim:
            queryset = queryset.filter(data_fim__lte=data_fim)
        
        # Dados do relatório
        contratos = list(
            queryset.values(
                'id', 'nome_curso_acao', 'tipo', 'status_processo',
                'setor__nome', 'data_inicio', 'data_fim', 'valor_total',
                'total_pago', 'quantidade_parcelas'
            )
        )
        
        # Totais
        total_contratos = len(contratos)
        valor_total = sum(c['valor_total'] for c in contratos)
        valor_pago = sum(c['total_pago'] for c in contratos)
        
        # Gerar relatório
        relatorio = {
            'filtros': {
                'setor_id': setor_id,
                'tipo': tipo,
                'status': status,
                'data_inicio': data_inicio,
                'data_fim': data_fim,
            },
            'dados': {
                'contratos': contratos,
                'total_contratos': total_contratos,
                'valor_total': valor_total,
                'valor_pago': valor_pago,
            }
        }
        
        # Salvar relatório
        relatorio_obj = RelatorioGerado.objects.create(
            tipo='contratos',
            titulo=f"Relatório de Contratos - {timezone.now().strftime('%d/%m/%Y')}",
            descricao="Relatório gerado pelo sistema",
            parametros=relatorio['filtros'],
            arquivo_url="#",  # Seria gerado um arquivo real em produção
            usuario=request.user
        )
        
        return Response({
            'relatorio_id': relatorio_obj.id,
            'dados': relatorio['dados']
        })


class RelatorioFinanceiroView(APIView):
    """
    API endpoint para gerar relatório financeiro.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, format=None):
        # Filtros
        setor_id = request.query_params.get('setor')
        fonte_id = request.query_params.get('fonte')
        rubrica_id = request.query_params.get('rubrica')
        data_inicio = request.query_params.get('data_inicio')
        data_fim = request.query_params.get('data_fim')
        
        # Consulta base para movimentos
        queryset = MovimentoFinanceiro.objects.all()
        
        # Aplicar filtros
        if setor_id:
            queryset = queryset.filter(setor_id=setor_id)
        
        if fonte_id:
            queryset = queryset.filter(fonte_recurso_id=fonte_id)
        
        if rubrica_id:
            queryset = queryset.filter(rubrica_id=rubrica_id)
        
        if data_inicio:
            queryset = queryset.filter(data_movimento__gte=data_inicio)
        
        if data_fim:
            queryset = queryset.filter(data_movimento__lte=data_fim)
        
        # Dados do relatório
        movimentos = list(
            queryset.values(
                'id', 'tipo', 'fonte_recurso__nome', 'setor__nome',
                'rubrica__nome', 'valor', 'data_movimento', 'descricao'
            )
        )
        
        # Totais
        total_entradas = sum(m['valor'] for m in movimentos if m['tipo'] == 'entrada')
        total_saidas = sum(m['valor'] for m in movimentos if m['tipo'] == 'saida')
        saldo = total_entradas - total_saidas
        
        # Gerar relatório
        relatorio = {
            'filtros': {
                'setor_id': setor_id,
                'fonte_id': fonte_id,
                'rubrica_id': rubrica_id,
                'data_inicio': data_inicio,
                'data_fim': data_fim,
            },
            'dados': {
                'movimentos': movimentos,
                'total_entradas': total_entradas,
                'total_saidas': total_saidas,
                'saldo': saldo,
            }
        }
        
        # Salvar relatório
        relatorio_obj = RelatorioGerado.objects.create(
            tipo='financeiro',
            titulo=f"Relatório Financeiro - {timezone.now().strftime('%d/%m/%Y')}",
            descricao="Relatório gerado pelo sistema",
            parametros=relatorio['filtros'],
            arquivo_url="#",  # Seria gerado um arquivo real em produção
            usuario=request.user
        )
        
        return Response({
            'relatorio_id': relatorio_obj.id,
            'dados': relatorio['dados']
        })


class RelatorioBolsistasView(APIView):
    """
    API endpoint para gerar relatório de bolsistas.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, format=None):
        # Filtros
        setor_id = request.query_params.get('setor')
        ativo = request.query_params.get('ativo')
        data_referencia = request.query_params.get('data_referencia', timezone.now().date().isoformat())
        
        # Consulta base
        queryset = Bolsista.objects.all()
        
        # Aplicar filtros
        if ativo == 'true':
            queryset = queryset.filter(
                contratos__data_inicio__lte=data_referencia,
                contratos__data_fim__gte=data_referencia
            ).distinct()
        elif ativo == 'false':
            queryset = queryset.exclude(
                contratos__data_inicio__lte=data_referencia,
                contratos__data_fim__gte=data_referencia
            )
        
        # Dados do relatório
        bolsistas = []
        
        for bolsista in queryset:
            contratos_query = bolsista.contratos.all()
            
            if setor_id:
                contratos_query = contratos_query.filter(setor_id=setor_id)
            
            contratos = list(
                contratos_query.values(
                    'id', 'nome_curso_acao', 'setor__nome',
                    'data_inicio', 'data_fim', 'valor_total'
                )
            )
            
            valor_total = sum(c['valor_total'] for c in contratos)
            
            bolsistas.append({
                'id': bolsista.id,
                'nome': bolsista.nome,
                'cpf': bolsista.cpf,
                'email': bolsista.email,
                'telefone': bolsista.telefone,
                'contratos': contratos,
                'total_contratos': len(contratos),
                'valor_total': valor_total,
            })
        
        # Totais
        total_bolsistas = len(bolsistas)
        valor_total = sum(b['valor_total'] for b in bolsistas)
        
        # Gerar relatório
        relatorio = {
            'filtros': {
                'setor_id': setor_id,
                'ativo': ativo,
                'data_referencia': data_referencia,
            },
            'dados': {
                'bolsistas': bolsistas,
                'total_bolsistas': total_bolsistas,
                'valor_total': valor_total,
            }
        }
        
        # Salvar relatório
        relatorio_obj = RelatorioGerado.objects.create(
            tipo='bolsistas',
            titulo=f"Relatório de Bolsistas - {timezone.now().strftime('%d/%m/%Y')}",
            descricao="Relatório gerado pelo sistema",
            parametros=relatorio['filtros'],
            arquivo_url="#",  # Seria gerado um arquivo real em produção
            usuario=request.user
        )
        
        return Response({
            'relatorio_id': relatorio_obj.id,
            'dados': relatorio['dados']
        })
