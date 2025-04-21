from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status, viewsets
from django.db.models import Sum, Count
from .models import Setor, FonteRecurso, Meta, Atividade, Rubrica, Credor, Bolsista, Contrato, Parcela
from .serializers import (
    SetorSerializer, FonteRecursoSerializer, MetaSerializer, 
    AtividadeSerializer, RubricaSerializer, CredorSerializer, 
    BolsistaSerializer, ContratoSerializer, ParcelaSerializer
)

@api_view(['GET'])
@permission_classes([AllowAny])
def index(request):
    return Response({
        "message": "Bem-vindo ao Sistema Financeiro CCBJ!",
        "version": "1.0.0",
        "status": "API em funcionamento"
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard(request):
    # Dados para o dashboard
    total_contratos = Contrato.objects.count()
    total_valor_contratos = Contrato.objects.aggregate(total=Sum('valor_total'))['total'] or 0
    total_valor_pago = Parcela.objects.filter(status='paga').aggregate(total=Sum('valor'))['total'] or 0
    
    # Contratos por status
    contratos_por_status = Contrato.objects.values('status').annotate(count=Count('id'))
    
    # Contratos por setor
    contratos_por_setor = Contrato.objects.values('setor__nome').annotate(count=Count('id'))
    
    # Contratos recentes
    contratos_recentes = ContratoSerializer(Contrato.objects.order_by('-id')[:5], many=True).data
    
    return Response({
        "total_contratos": total_contratos,
        "total_valor_contratos": total_valor_contratos,
        "total_valor_pago": total_valor_pago,
        "contratos_por_status": contratos_por_status,
        "contratos_por_setor": contratos_por_setor,
        "contratos_recentes": contratos_recentes
    })

# ViewSets para os modelos
class SetorViewSet(viewsets.ModelViewSet):
    queryset = Setor.objects.all()
    serializer_class = SetorSerializer
    permission_classes = [IsAuthenticated]

class FonteRecursoViewSet(viewsets.ModelViewSet):
    queryset = FonteRecurso.objects.all()
    serializer_class = FonteRecursoSerializer
    permission_classes = [IsAuthenticated]

class MetaViewSet(viewsets.ModelViewSet):
    queryset = Meta.objects.all()
    serializer_class = MetaSerializer
    permission_classes = [IsAuthenticated]

class AtividadeViewSet(viewsets.ModelViewSet):
    queryset = Atividade.objects.all()
    serializer_class = AtividadeSerializer
    permission_classes = [IsAuthenticated]

class RubricaViewSet(viewsets.ModelViewSet):
    queryset = Rubrica.objects.all()
    serializer_class = RubricaSerializer
    permission_classes = [IsAuthenticated]

class CredorViewSet(viewsets.ModelViewSet):
    queryset = Credor.objects.all()
    serializer_class = CredorSerializer
    permission_classes = [IsAuthenticated]

class BolsistaViewSet(viewsets.ModelViewSet):
    queryset = Bolsista.objects.all()
    serializer_class = BolsistaSerializer
    permission_classes = [IsAuthenticated]

class ContratoViewSet(viewsets.ModelViewSet):
    queryset = Contrato.objects.all()
    serializer_class = ContratoSerializer
    permission_classes = [IsAuthenticated]

class ParcelaViewSet(viewsets.ModelViewSet):
    queryset = Parcela.objects.all()
    serializer_class = ParcelaSerializer
    permission_classes = [IsAuthenticated]
