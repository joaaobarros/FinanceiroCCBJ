import pytest
from django.test import TestCase
from core.models import (
    FonteRecurso, Meta, Atividade, Rubrica, Setor, 
    AlocacaoRecurso, MovimentoFinanceiro, Contrato
)
from decimal import Decimal
from django.db.utils import IntegrityError
from django.core.exceptions import ValidationError

@pytest.mark.django_db
class TestOrcamento:
    def test_alocacao_recursos(self, admin_user, setor):
        # Criar fonte de recurso
        fonte = FonteRecurso.objects.create(
            nome="Fonte Teste",
            descricao="Fonte para testes",
            valor_total=Decimal("100000.00"),
            data_inicio="2025-01-01",
            data_fim="2025-12-31",
            ativo=True
        )
        
        # Criar meta
        meta = Meta.objects.create(
            nome="Meta Teste",
            descricao="Meta para testes",
            fonte_recurso=fonte,
            valor_previsto=Decimal("50000.00"),
            ativo=True
        )
        
        # Criar atividade
        atividade = Atividade.objects.create(
            nome="Atividade Teste",
            descricao="Atividade para testes",
            meta=meta,
            valor_previsto=Decimal("30000.00"),
            ativo=True
        )
        
        # Criar rubrica
        rubrica = Rubrica.objects.create(
            nome="Rubrica Teste",
            descricao="Rubrica para testes",
            atividade=atividade,
            valor_previsto=Decimal("20000.00"),
            ativo=True
        )
        
        # Alocar recursos para o setor
        alocacao = AlocacaoRecurso.objects.create(
            setor=setor,
            rubrica=rubrica,
            valor_alocado=Decimal("10000.00"),
            data_alocacao="2025-01-15",
            usuario_responsavel=admin_user
        )
        
        # Verificar se a alocação foi criada corretamente
        assert alocacao.valor_alocado == Decimal("10000.00")
        assert alocacao.setor == setor
        assert alocacao.rubrica == rubrica
        
        # Verificar saldo disponível
        saldo_disponivel = rubrica.valor_previsto - alocacao.valor_alocado
        assert saldo_disponivel == Decimal("10000.00")
    
    def test_validacao_valor_alocacao(self, admin_user, setor):
        # Criar fonte de recurso
        fonte = FonteRecurso.objects.create(
            nome="Fonte Teste 2",
            descricao="Fonte para testes",
            valor_total=Decimal("100000.00"),
            data_inicio="2025-01-01",
            data_fim="2025-12-31",
            ativo=True
        )
        
        # Criar meta
        meta = Meta.objects.create(
            nome="Meta Teste 2",
            descricao="Meta para testes",
            fonte_recurso=fonte,
            valor_previsto=Decimal("50000.00"),
            ativo=True
        )
        
        # Criar atividade
        atividade = Atividade.objects.create(
            nome="Atividade Teste 2",
            descricao="Atividade para testes",
            meta=meta,
            valor_previsto=Decimal("30000.00"),
            ativo=True
        )
        
        # Criar rubrica
        rubrica = Rubrica.objects.create(
            nome="Rubrica Teste 2",
            descricao="Rubrica para testes",
            atividade=atividade,
            valor_previsto=Decimal("5000.00"),
            ativo=True
        )
        
        # Tentar alocar mais do que o valor previsto
        with pytest.raises(ValidationError):
            AlocacaoRecurso.objects.create(
                setor=setor,
                rubrica=rubrica,
                valor_alocado=Decimal("6000.00"),  # Valor maior que o previsto
                data_alocacao="2025-01-15",
                usuario_responsavel=admin_user
            )
    
    def test_transferencia_recursos(self, admin_user):
        # Criar setores
        setor_origem = Setor.objects.create(
            nome="Setor Origem",
            descricao="Setor de origem para testes",
            ativo=True
        )
        
        setor_destino = Setor.objects.create(
            nome="Setor Destino",
            descricao="Setor de destino para testes",
            ativo=True
        )
        
        # Criar fonte de recurso
        fonte = FonteRecurso.objects.create(
            nome="Fonte Teste 3",
            descricao="Fonte para testes",
            valor_total=Decimal("100000.00"),
            data_inicio="2025-01-01",
            data_fim="2025-12-31",
            ativo=True
        )
        
        # Criar meta
        meta = Meta.objects.create(
            nome="Meta Teste 3",
            descricao="Meta para testes",
            fonte_recurso=fonte,
            valor_previsto=Decimal("50000.00"),
            ativo=True
        )
        
        # Criar atividade
        atividade = Atividade.objects.create(
            nome="Atividade Teste 3",
            descricao="Atividade para testes",
            meta=meta,
            valor_previsto=Decimal("30000.00"),
            ativo=True
        )
        
        # Criar rubrica
        rubrica = Rubrica.objects.create(
            nome="Rubrica Teste 3",
            descricao="Rubrica para testes",
            atividade=atividade,
            valor_previsto=Decimal("20000.00"),
            ativo=True
        )
        
        # Alocar recursos para o setor de origem
        alocacao_origem = AlocacaoRecurso.objects.create(
            setor=setor_origem,
            rubrica=rubrica,
            valor_alocado=Decimal("10000.00"),
            data_alocacao="2025-01-15",
            usuario_responsavel=admin_user
        )
        
        # Transferir recursos para o setor de destino
        transferencia = MovimentoFinanceiro.objects.create(
            tipo="transferencia",
            setor_origem=setor_origem,
            setor_destino=setor_destino,
            rubrica=rubrica,
            valor=Decimal("5000.00"),
            data_movimento="2025-02-01",
            descricao="Transferência de teste",
            usuario_responsavel=admin_user
        )
        
        # Verificar se a transferência foi criada corretamente
        assert transferencia.valor == Decimal("5000.00")
        assert transferencia.setor_origem == setor_origem
        assert transferencia.setor_destino == setor_destino
        
        # Verificar saldo após transferência
        # Aqui seria necessário implementar uma função para calcular o saldo atual
        # do setor, considerando alocações e transferências
    
    def test_validacao_disponibilidade_orcamentaria(self, admin_user, setor, bolsista):
        # Criar fonte de recurso
        fonte = FonteRecurso.objects.create(
            nome="Fonte Teste 4",
            descricao="Fonte para testes",
            valor_total=Decimal("100000.00"),
            data_inicio="2025-01-01",
            data_fim="2025-12-31",
            ativo=True
        )
        
        # Criar meta
        meta = Meta.objects.create(
            nome="Meta Teste 4",
            descricao="Meta para testes",
            fonte_recurso=fonte,
            valor_previsto=Decimal("50000.00"),
            ativo=True
        )
        
        # Criar atividade
        atividade = Atividade.objects.create(
            nome="Atividade Teste 4",
            descricao="Atividade para testes",
            meta=meta,
            valor_previsto=Decimal("30000.00"),
            ativo=True
        )
        
        # Criar rubrica
        rubrica = Rubrica.objects.create(
            nome="Rubrica Teste 4",
            descricao="Rubrica para testes",
            atividade=atividade,
            valor_previsto=Decimal("5000.00"),
            ativo=True
        )
        
        # Alocar recursos para o setor
        alocacao = AlocacaoRecurso.objects.create(
            setor=setor,
            rubrica=rubrica,
            valor_alocado=Decimal("5000.00"),
            data_alocacao="2025-01-15",
            usuario_responsavel=admin_user
        )
        
        # Criar contrato dentro do limite orçamentário
        contrato_valido = Contrato.objects.create(
            tipo="bolsa",
            nome_curso_acao="Curso Teste",
            status_processo="em_andamento",
            setor=setor,
            bolsista=bolsista,
            data_inicio="2025-02-01",
            data_fim="2025-07-31",
            meta=meta,
            atividade=atividade,
            rubrica=rubrica,
            valor_total=Decimal("4000.00"),
            quantidade_parcelas=6
        )
        
        # Verificar se o contrato foi criado corretamente
        assert contrato_valido.valor_total == Decimal("4000.00")
        
        # Tentar criar outro contrato que excede o limite orçamentário
        with pytest.raises(ValidationError):
            Contrato.objects.create(
                tipo="bolsa",
                nome_curso_acao="Curso Teste 2",
                status_processo="em_andamento",
                setor=setor,
                bolsista=bolsista,
                data_inicio="2025-08-01",
                data_fim="2025-12-31",
                meta=meta,
                atividade=atividade,
                rubrica=rubrica,
                valor_total=Decimal("2000.00"),  # Excede o saldo disponível
                quantidade_parcelas=5
            )
