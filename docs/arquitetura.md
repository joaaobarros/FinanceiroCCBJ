# Arquitetura do Sistema de Gestão Financeira para o CCBJ

## 1. Visão Geral da Arquitetura

O sistema de gestão financeira para o CCBJ será desenvolvido como uma aplicação web moderna, utilizando uma arquitetura de três camadas:

1. **Frontend**: Interface de usuário responsiva e intuitiva
2. **Backend**: API RESTful para processamento de dados e lógica de negócios
3. **Banco de Dados**: Armazenamento persistente de dados

## 2. Tecnologias Utilizadas

### 2.1 Frontend
- **Framework**: React.js
- **Biblioteca de UI**: Material-UI
- **Gráficos**: Chart.js / Recharts
- **Gerenciamento de Estado**: Redux
- **Roteamento**: React Router

### 2.2 Backend
- **Linguagem**: Python
- **Framework**: Django / Django REST Framework
- **Autenticação**: JWT (JSON Web Tokens)
- **Validação de Dados**: Django REST Framework Validators

### 2.3 Banco de Dados
- **SGBD**: PostgreSQL
- **ORM**: Django ORM
- **Migrações**: Django Migrations

### 2.4 Infraestrutura
- **Servidor Web**: Nginx
- **Servidor de Aplicação**: Gunicorn
- **Containerização**: Docker
- **Orquestração**: Docker Compose

## 3. Estrutura do Banco de Dados

### 3.1 Entidades Principais

#### Usuários e Permissões
- **Usuario**: Informações de usuário e autenticação
- **Perfil**: Dados adicionais do usuário
- **Grupo**: Agrupamento de permissões
- **Permissao**: Permissões específicas do sistema

#### Estrutura Organizacional
- **Setor**: Centros de custo (Gestão, Adm/Infra, Escola, etc.)
- **Programa**: Programas específicos (opcional)

#### Gestão Financeira
- **FonteRecurso**: Origem dos recursos financeiros
- **Meta**: Metas do contrato de gestão
- **Atividade**: Submetas ou atividades relacionadas às metas
- **Rubrica**: Itens de custeio para cada atividade
- **AlocacaoRecurso**: Distribuição de recursos por setor
- **TransferenciaRecurso**: Registro de transferências entre setores

#### Credores e Bolsistas
- **Credor**: Dados de pessoas jurídicas
- **Bolsista**: Dados de bolsistas
- **Contato**: Informações de contato

#### Contratos
- **Contrato**: Informações gerais de contratos
- **ParcelaContrato**: Detalhes de cada parcela de pagamento
- **HistoricoProcesso**: Registro de alterações no status do processo
- **StatusProcesso**: Tipos de status possíveis

### 3.2 Diagrama de Entidade-Relacionamento

```
Usuario (1) --- (*) Perfil
Usuario (*) --- (*) Grupo
Grupo (*) --- (*) Permissao

Setor (1) --- (*) AlocacaoRecurso
Setor (1) --- (*) Contrato
Programa (1) --- (*) Contrato

FonteRecurso (1) --- (*) AlocacaoRecurso
Meta (1) --- (*) Atividade
Atividade (1) --- (*) Rubrica
Rubrica (1) --- (*) AlocacaoRecurso
Rubrica (1) --- (*) Contrato

Setor (1) --- (*) TransferenciaRecurso (origem)
Setor (1) --- (*) TransferenciaRecurso (destino)
Rubrica (1) --- (*) TransferenciaRecurso

Credor (1) --- (*) Contrato
Bolsista (1) --- (*) Contrato
Contrato (1) --- (*) ParcelaContrato
Contrato (1) --- (*) HistoricoProcesso
StatusProcesso (1) --- (*) HistoricoProcesso
```

## 4. Componentes do Sistema

### 4.1 Módulos do Backend

#### Autenticação e Autorização
- Registro e login de usuários
- Gerenciamento de sessões
- Controle de permissões

#### Gestão Financeira
- Cadastro e gerenciamento de fontes de recursos
- Controle de metas, atividades e rubricas
- Alocação de recursos por setor
- Transferência de recursos entre setores
- Verificação de disponibilidade orçamentária

#### Gestão de Contratos
- Cadastro e gerenciamento de contratos
- Controle de parcelas e pagamentos
- Histórico de processos
- Validação de datas e sobreposições

#### Gestão de Credores e Bolsistas
- Cadastro e gerenciamento de credores
- Cadastro e gerenciamento de bolsistas
- Validação de períodos de contrato

#### API RESTful
- Endpoints para todas as operações do sistema
- Documentação automática (Swagger/OpenAPI)
- Validação de dados de entrada
- Paginação e filtragem de resultados

### 4.2 Módulos do Frontend

#### Autenticação
- Telas de login e registro
- Recuperação de senha
- Perfil de usuário

#### Dashboard
- Visão geral financeira
- Gráficos interativos
- Indicadores de desempenho
- Alertas e notificações

#### Gestão Financeira
- Cadastro e visualização de fontes de recursos
- Gerenciamento de metas, atividades e rubricas
- Alocação e transferência de recursos
- Relatórios financeiros

#### Gestão de Contratos
- Cadastro e edição de contratos
- Visualização de parcelas e pagamentos
- Acompanhamento de status e histórico
- Filtros e buscas avançadas

#### Gestão de Credores e Bolsistas
- Cadastro e edição de credores
- Cadastro e edição de bolsistas
- Validação de períodos de contrato

#### Ajuda e Documentação
- Manual de usuário integrado
- Tutoriais passo a passo
- Dicas contextuais

## 5. Fluxos Principais

### 5.1 Fluxo de Cadastro de Contrato
1. Verificação de disponibilidade orçamentária
2. Preenchimento de dados do contrato
3. Vinculação com credor ou bolsista
4. Definição de parcelas
5. Confirmação e registro no sistema
6. Atualização automática de saldos disponíveis

### 5.2 Fluxo de Transferência de Recursos
1. Seleção de setor de origem
2. Seleção de setor de destino
3. Definição de valores e rubricas
4. Solicitação de aprovação
5. Aprovação pelo responsável do setor de origem
6. Efetivação da transferência
7. Atualização automática de saldos

### 5.3 Fluxo de Consulta e Relatórios
1. Seleção de parâmetros de filtro
2. Geração de visualização de dados
3. Interação com gráficos e tabelas
4. Exportação de dados em diferentes formatos

## 6. Considerações de Segurança

- Autenticação baseada em tokens JWT
- Controle de acesso baseado em papéis (RBAC)
- Validação de dados em todas as entradas
- Proteção contra ataques comuns (CSRF, XSS, SQL Injection)
- Registro de atividades para auditoria
- Backup regular de dados

## 7. Escalabilidade e Desempenho

- Arquitetura modular para facilitar expansão
- Otimização de consultas ao banco de dados
- Paginação de resultados em listas extensas
- Caching de dados frequentemente acessados
- Compressão de recursos estáticos
- Lazy loading de componentes do frontend
