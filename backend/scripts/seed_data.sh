#!/bin/bash

# Script para preparar dados de exemplo para o sistema CCBJ Financeiro

# Criar superusuário
echo "Criando superusuário admin..."
python manage.py shell -c "
from django.contrib.auth.models import User
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@ccbj.org.br', 'admin123')
    print('Superusuário criado com sucesso!')
else:
    print('Superusuário já existe!')
"

# Criar setores
echo "Criando setores..."
python manage.py shell -c "
from core.models import Setor
setores = ['Gestão', 'Adm/Infra', 'Escola', 'NArTE', 'Comunicação', 'Ação Cultural']
for nome in setores:
    if not Setor.objects.filter(nome=nome).exists():
        Setor.objects.create(nome=nome, descricao=f'Setor de {nome} do CCBJ')
        print(f'Setor {nome} criado com sucesso!')
    else:
        print(f'Setor {nome} já existe!')
"

# Criar fontes de recurso
echo "Criando fontes de recurso..."
python manage.py shell -c "
from core.models import FonteRecurso
from datetime import date, timedelta
fontes = [
    {'nome': 'Contrato de Gestão 2025', 'valor_total': 8000000.00, 'data_inicio': date.today(), 'data_fim': date.today() + timedelta(days=365)},
    {'nome': 'Edital Cultura 2025', 'valor_total': 2000000.00, 'data_inicio': date.today(), 'data_fim': date.today() + timedelta(days=365)},
    {'nome': 'Patrocínio Empresa X', 'valor_total': 1000000.00, 'data_inicio': date.today(), 'data_fim': date.today() + timedelta(days=180)}
]
for fonte in fontes:
    if not FonteRecurso.objects.filter(nome=fonte['nome']).exists():
        FonteRecurso.objects.create(
            nome=fonte['nome'],
            descricao=f'Fonte de recurso: {fonte['nome']}',
            valor_total=fonte['valor_total'],
            data_inicio=fonte['data_inicio'],
            data_fim=fonte['data_fim']
        )
        print(f'Fonte {fonte['nome']} criada com sucesso!')
    else:
        print(f'Fonte {fonte['nome']} já existe!')
"

# Criar metas
echo "Criando metas..."
python manage.py shell -c "
from core.models import Meta, FonteRecurso
fonte = FonteRecurso.objects.first()
if fonte:
    metas = [
        {'nome': 'Meta 1 - Gestão', 'valor_previsto': 3000000.00},
        {'nome': 'Meta 2 - Formação', 'valor_previsto': 2500000.00},
        {'nome': 'Meta 3 - Difusão', 'valor_previsto': 2500000.00}
    ]
    for meta in metas:
        if not Meta.objects.filter(nome=meta['nome']).exists():
            Meta.objects.create(
                fonte_recurso=fonte,
                nome=meta['nome'],
                descricao=f'Descrição da {meta['nome']}',
                valor_previsto=meta['valor_previsto']
            )
            print(f'Meta {meta['nome']} criada com sucesso!')
        else:
            print(f'Meta {meta['nome']} já existe!')
else:
    print('Nenhuma fonte de recurso encontrada!')
"

# Criar atividades
echo "Criando atividades..."
python manage.py shell -c "
from core.models import Atividade, Meta
meta = Meta.objects.first()
if meta:
    atividades = [
        {'nome': 'Atividade 1.1 - Administração', 'valor_previsto': 1500000.00},
        {'nome': 'Atividade 1.2 - Manutenção', 'valor_previsto': 1500000.00},
        {'nome': 'Atividade 2.1 - Cursos Regulares', 'valor_previsto': 1500000.00},
        {'nome': 'Atividade 2.2 - Oficinas', 'valor_previsto': 1000000.00},
        {'nome': 'Atividade 3.1 - Eventos', 'valor_previsto': 1500000.00},
        {'nome': 'Atividade 3.2 - Exposições', 'valor_previsto': 1000000.00}
    ]
    for atividade in atividades:
        if not Atividade.objects.filter(nome=atividade['nome']).exists():
            Atividade.objects.create(
                meta=meta,
                nome=atividade['nome'],
                descricao=f'Descrição da {atividade['nome']}',
                valor_previsto=atividade['valor_previsto']
            )
            print(f'Atividade {atividade['nome']} criada com sucesso!')
        else:
            print(f'Atividade {atividade['nome']} já existe!')
else:
    print('Nenhuma meta encontrada!')
"

# Criar rubricas
echo "Criando rubricas..."
python manage.py shell -c "
from core.models import Rubrica, Atividade
atividade = Atividade.objects.first()
if atividade:
    rubricas = [
        {'nome': 'Bolsa Auxílio', 'valor_previsto': 500000.00},
        {'nome': 'Cachê', 'valor_previsto': 800000.00},
        {'nome': 'Material de Consumo', 'valor_previsto': 300000.00},
        {'nome': 'Serviços de Terceiros', 'valor_previsto': 700000.00},
        {'nome': 'Locação de Equipamentos', 'valor_previsto': 400000.00},
        {'nome': 'Alimentação', 'valor_previsto': 200000.00}
    ]
    for rubrica in rubricas:
        if not Rubrica.objects.filter(nome=rubrica['nome']).exists():
            Rubrica.objects.create(
                atividade=atividade,
                nome=rubrica['nome'],
                descricao=f'Descrição da rubrica {rubrica['nome']}',
                valor_previsto=rubrica['valor_previsto']
            )
            print(f'Rubrica {rubrica['nome']} criada com sucesso!')
        else:
            print(f'Rubrica {rubrica['nome']} já existe!')
else:
    print('Nenhuma atividade encontrada!')
"

# Criar bolsistas
echo "Criando bolsistas..."
python manage.py shell -c "
from core.models import Bolsista
bolsistas = [
    {'nome': 'João Silva', 'cpf': '123.456.789-00', 'email': 'joao@exemplo.com', 'telefone': '(85) 98765-4321'},
    {'nome': 'Maria Oliveira', 'cpf': '987.654.321-00', 'email': 'maria@exemplo.com', 'telefone': '(85) 91234-5678'},
    {'nome': 'Pedro Santos', 'cpf': '456.789.123-00', 'email': 'pedro@exemplo.com', 'telefone': '(85) 95678-1234'},
    {'nome': 'Ana Costa', 'cpf': '789.123.456-00', 'email': 'ana@exemplo.com', 'telefone': '(85) 94321-8765'},
    {'nome': 'Carlos Pereira', 'cpf': '321.654.987-00', 'email': 'carlos@exemplo.com', 'telefone': '(85) 98765-1234'}
]
for bolsista in bolsistas:
    if not Bolsista.objects.filter(cpf=bolsista['cpf']).exists():
        Bolsista.objects.create(
            nome=bolsista['nome'],
            cpf=bolsista['cpf'],
            email=bolsista['email'],
            telefone=bolsista['telefone'],
            dados_bancarios='Banco X, Agência 1234, Conta 56789-0'
        )
        print(f'Bolsista {bolsista['nome']} criado com sucesso!')
    else:
        print(f'Bolsista com CPF {bolsista['cpf']} já existe!')
"

# Criar credores
echo "Criando credores..."
python manage.py shell -c "
from core.models import Credor
credores = [
    {'nome': 'Empresa de Eventos XYZ', 'cnpj': '12.345.678/0001-90', 'email': 'contato@xyz.com', 'telefone': '(85) 3333-4444'},
    {'nome': 'Serviços de Som e Luz Ltda', 'cnpj': '98.765.432/0001-10', 'email': 'contato@someluz.com', 'telefone': '(85) 3222-1111'},
    {'nome': 'Gráfica Rápida ME', 'cnpj': '45.678.901/0001-23', 'email': 'contato@grafica.com', 'telefone': '(85) 3111-2222'},
    {'nome': 'Buffet Sabor & Arte', 'cnpj': '78.901.234/0001-56', 'email': 'contato@buffet.com', 'telefone': '(85) 3444-5555'},
    {'nome': 'Transportadora Expressa', 'cnpj': '32.109.876/0001-54', 'email': 'contato@transportadora.com', 'telefone': '(85) 3555-6666'}
]
for credor in credores:
    if not Credor.objects.filter(cnpj=credor['cnpj']).exists():
        Credor.objects.create(
            nome=credor['nome'],
            cnpj=credor['cnpj'],
            email=credor['email'],
            telefone=credor['telefone'],
            dados_bancarios='Banco Y, Agência 5678, Conta 12345-6'
        )
        print(f'Credor {credor['nome']} criado com sucesso!')
    else:
        print(f'Credor com CNPJ {credor['cnpj']} já existe!')
"

# Criar contratos
echo "Criando contratos..."
python manage.py shell -c "
from core.models import Contrato, Bolsista, Credor, Setor, Rubrica, Atividade, Meta
from datetime import date, timedelta
import random

bolsistas = list(Bolsista.objects.all())
credores = list(Credor.objects.all())
setores = list(Setor.objects.all())
rubricas = list(Rubrica.objects.all())
atividades = list(Atividade.objects.all())
metas = list(Meta.objects.all())

if bolsistas and credores and setores and rubricas and atividades and metas:
    # Contratos de bolsistas
    for i in range(10):
        bolsista = random.choice(bolsistas)
        setor = random.choice(setores)
        rubrica = random.choice(rubricas)
        atividade = random.choice(atividades)
        meta = random.choice(metas)
        
        data_inicio = date.today() - timedelta(days=random.randint(0, 60))
        data_fim = data_inicio + timedelta(days=random.randint(90, 180))
        
        valor_total = random.randint(5, 30) * 1000
        qtd_parcelas = random.randint(3, 6)
        
        nome_curso = f'Curso de {random.choice(['Música', 'Teatro', 'Dança', 'Artes Visuais', 'Literatura', 'Fotografia'])}'
        
        contrato = Contrato.objects.create(
            nome=nome_curso,
            tipo='BOLSA',
            status=random.choice(['EM_ELABORACAO', 'ASSINADO', 'EM_EXECUCAO', 'CONCLUIDO']),
            setor=setor,
            bolsista=bolsista,
            data_inicio=data_inicio,
            data_fim=data_fim,
            meta=meta,
            atividade=atividade,
            rubrica=rubrica,
            valor_total=valor_total,
            qtd_parcelas=qtd_parcelas,
            observacoes=f'Observações para o contrato de {nome_curso}'
        )
        print(f'Contrato de bolsista {contrato.nome} criado com sucesso!')
    
    # Contratos de credores
    for i in range(10):
        credor = random.choice(credores)
        setor = random.choice(setores)
        rubrica = random.choice(rubricas)
        atividade = random.choice(atividades)
        meta = random.choice(metas)
        
        data_inicio = date.today() - timedelta(days=random.randint(0, 60))
        data_fim = data_inicio + timedelta(days=random.randint(30, 90))
        
        valor_total = random.randint(10, 50) * 1000
        qtd_parcelas = random.randint(1, 3)
        
        servico = random.choice([
            'Serviço de Sonorização', 
            'Locação de Equipamentos', 
            'Serviço de Buffet', 
            'Impressão de Material Gráfico', 
            'Transporte de Equipamentos',
            'Montagem de Estrutura'
        ])
        
        contrato = Contrato.objects.create(
            nome=servico,
            tipo='SERVICO',
            status=random.choice(['EM_ELABORACAO', 'ASSINADO', 'EM_EXECUCAO', 'CONCLUIDO']),
            setor=setor,
            credor=credor,
            data_inicio=data_inicio,
            data_fim=data_fim,
            meta=meta,
            atividade=atividade,
            rubrica=rubrica,
            valor_total=valor_total,
            qtd_parcelas=qtd_parcelas,
            observacoes=f'Observações para o contrato de {servico}'
        )
        print(f'Contrato de credor {contrato.nome} criado com sucesso!')
else:
    print('Faltam dados para criar contratos!')
"

# Criar parcelas
echo "Criando parcelas..."
python manage.py shell -c "
from core.models import Contrato, Parcela
from datetime import date, timedelta
import random

contratos = Contrato.objects.all()
for contrato in contratos:
    valor_parcela = contrato.valor_total / contrato.qtd_parcelas
    
    for i in range(contrato.qtd_parcelas):
        data_prevista = contrato.data_inicio + timedelta(days=30 * (i + 1))
        
        # Algumas parcelas já pagas, outras pendentes
        if i < contrato.qtd_parcelas / 2:
            data_pagamento = data_prevista - timedelta(days=random.randint(0, 5))
            status = 'PAGO'
        else:
            data_pagamento = None
            status = 'PENDENTE'
        
        Parcela.objects.create(
            contrato=contrato,
            numero=i+1,
            valor=valor_parcela,
            data_prevista=data_prevista,
            data_pagamento=data_pagamento,
            status=status,
            observacoes=f'Parcela {i+1} de {contrato.qtd_parcelas}'
        )
    print(f'Parcelas para o contrato {contrato.nome} criadas com sucesso!')
"

echo "Dados de exemplo criados com sucesso!"
