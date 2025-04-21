# Modelo de Dados do Sistema de Gestão Financeira do CCBJ

## Visão Geral

Este documento descreve o modelo de dados para o sistema de gestão financeira do Centro Cultural Bom Jardim (CCBJ), baseado nos requisitos e na tabela de visualização geral fornecida pelo cliente.

## Entidades Principais

### 1. Usuário e Autenticação

#### Usuario
- id (PK)
- username
- email
- password (hash)
- is_active
- date_joined
- last_login

#### Perfil
- id (PK)
- usuario_id (FK)
- nome_completo
- telefone
- cargo
- setor_id (FK)
- nivel_acesso (enum: admin, gestor, consulta)

#### RegistroAuditoria
- id (PK)
- usuario_id (FK)
- data_hora
- acao
- tabela_afetada
- registro_id
- dados_antigos (JSON)
- dados_novos (JSON)
- ip_origem

### 2. Estrutura Organizacional

#### Setor
- id (PK)
- nome (Gestão, Adm/Infra, Escola, NArTE, Comunicação, Ação Cultural)
- descricao
- responsavel_id (FK)
- ativo

#### Programa
- id (PK)
- nome
- descricao
- data_inicio
- data_fim
- ativo

### 3. Gestão Financeira

#### FonteRecurso
- id (PK)
- nome
- descricao
- valor_total
- data_inicio
- data_fim
- ativo

#### Meta
- id (PK)
- fonte_recurso_id (FK)
- codigo
- descricao
- valor_previsto
- ativo

#### Atividade
- id (PK)
- meta_id (FK)
- codigo (ex: "Atividade 1.1")
- descricao
- valor_previsto
- ativo

#### Rubrica
- id (PK)
- atividade_id (FK)
- nome (ex: "CACHE", "BOLSA AUXILIO")
- descricao
- valor_previsto
- ativo

#### AlocacaoRecurso
- id (PK)
- fonte_recurso_id (FK)
- setor_id (FK)
- rubrica_id (FK)
- valor_alocado
- data_alocacao
- observacao

#### TransferenciaRecurso
- id (PK)
- setor_origem_id (FK)
- setor_destino_id (FK)
- rubrica_id (FK)
- valor
- data_solicitacao
- data_aprovacao
- aprovado_por_id (FK)
- status (enum: pendente, aprovado, rejeitado)
- observacao

### 4. Credores e Bolsistas

#### Credor
- id (PK)
- razao_social
- nome_fantasia
- cnpj
- endereco
- telefone
- email
- banco
- agencia
- conta
- ativo

#### Bolsista
- id (PK)
- nome
- cpf
- endereco
- telefone
- email
- banco
- agencia
- conta
- ativo

### 5. Contratos e Pagamentos

#### Contrato
- id (PK)
- tipo (enum: servico, bolsa)
- nome_curso_acao
- status_processo (enum: em_elaboracao, em_analise, aprovado, em_execucao, concluido, cancelado)
- setor_id (FK)
- programa_id (FK, nullable)
- bolsista_id (FK, nullable)
- credor_id (FK, nullable)
- responsavel_id (FK)
- data_inicio
- data_fim
- atividade_id (FK)
- rubrica_id (FK)
- meta_id (FK)
- valor_total
- quantidade_parcelas
- observacoes_parcela
- total_pago
- data_criacao
- data_atualizacao
- criado_por_id (FK)
- atualizado_por_id (FK)

#### ParcelaContrato
- id (PK)
- contrato_id (FK)
- numero_parcela
- valor
- data_prevista
- data_pagamento
- status (enum: pendente, pago, cancelado)
- atividade_pagamento
- observacao

#### HistoricoProcesso
- id (PK)
- contrato_id (FK)
- status_anterior
- status_novo
- data_alteracao
- usuario_id (FK)
- observacao

### 6. Fluxo de Caixa

#### MovimentoFinanceiro
- id (PK)
- tipo (enum: entrada, saida)
- fonte_recurso_id (FK)
- setor_id (FK)
- rubrica_id (FK)
- contrato_id (FK, nullable)
- parcela_id (FK, nullable)
- valor
- data_movimento
- descricao
- comprovante_url
- usuario_id (FK)

## Relacionamentos

1. Um Usuário possui um Perfil
2. Um Setor possui vários Usuários (através de Perfil)
3. Uma FonteRecurso possui várias Metas
4. Uma Meta possui várias Atividades
5. Uma Atividade possui várias Rubricas
6. Uma Rubrica pode estar em várias AlocacaoRecurso
7. Um Setor pode ter várias AlocacaoRecurso
8. Um Contrato está associado a um Setor, uma Atividade, uma Rubrica e uma Meta
9. Um Contrato pode estar associado a um Bolsista OU a um Credor (não ambos)
10. Um Contrato possui várias ParcelaContrato
11. Um Contrato possui vários registros de HistoricoProcesso
12. Um MovimentoFinanceiro pode estar associado a um Contrato e uma ParcelaContrato

## Índices e Constraints

1. Índice em Contrato.bolsista_id e Contrato.credor_id para consultas rápidas
2. Índice em Contrato.setor_id, Contrato.atividade_id, Contrato.rubrica_id, Contrato.meta_id
3. Índice em ParcelaContrato.contrato_id e ParcelaContrato.status
4. Índice em MovimentoFinanceiro.fonte_recurso_id, MovimentoFinanceiro.setor_id, MovimentoFinanceiro.rubrica_id
5. Constraint para garantir que um Bolsista não possa ter contratos com datas sobrepostas
6. Constraint para garantir que o valor total de contratos por rubrica não exceda o valor alocado

## Triggers e Funções

1. Trigger para atualizar total_pago em Contrato quando uma ParcelaContrato é paga
2. Trigger para criar registro em HistoricoProcesso quando status_processo de Contrato é alterado
3. Trigger para criar registro em RegistroAuditoria em alterações nas tabelas principais
4. Função para verificar disponibilidade orçamentária antes de criar um novo Contrato
5. Função para verificar sobreposição de datas ao cadastrar um Bolsista em um novo Contrato
