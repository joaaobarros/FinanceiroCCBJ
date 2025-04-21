# Documentação Técnica - Sistema de Gestão Financeira CCBJ

## Visão Geral do Sistema

O Sistema de Gestão Financeira do CCBJ (Centro Cultural Bom Jardim) é uma aplicação web desenvolvida para facilitar o acompanhamento financeiro e a execução de contratos, permitindo o controle eficiente de recursos, a gestão de bolsistas e credores, e o monitoramento de metas e atividades.

## Arquitetura do Sistema

### Visão Geral da Arquitetura

O sistema foi desenvolvido utilizando uma arquitetura de três camadas:

1. **Frontend**: Interface de usuário desenvolvida com React.js e Material-UI
2. **Backend**: API RESTful desenvolvida com Django e Django REST Framework
3. **Banco de Dados**: PostgreSQL para armazenamento de dados

### Diagrama de Arquitetura

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│             │     │             │     │             │
│   Frontend  │◄───►│   Backend   │◄───►│  Database   │
│  (React.js) │     │   (Django)  │     │ (PostgreSQL)│
│             │     │             │     │             │
└─────────────┘     └─────────────┘     └─────────────┘
```

### Tecnologias Utilizadas

#### Frontend
- React.js 18.x
- Material-UI 5.x
- React Router 6.x
- Axios para requisições HTTP
- Recharts para gráficos
- MUI X Data Grid para tabelas
- JWT para autenticação

#### Backend
- Python 3.10
- Django 4.2
- Django REST Framework 3.14
- Django Filter
- Django CORS Headers
- WeasyPrint para geração de PDFs
- Celery para tarefas assíncronas
- Redis para cache e filas

#### Banco de Dados
- PostgreSQL 14.x

#### DevOps
- Docker e Docker Compose para containerização
- Nginx como servidor web
- Gunicorn como servidor WSGI

## Estrutura do Projeto

### Estrutura de Diretórios

```
ccbj_financeiro/
├── backend/
│   ├── ccbj_financeiro/
│   │   ├── settings/
│   │   ├── urls.py
│   │   ├── wsgi.py
│   │   └── asgi.py
│   ├── core/
│   │   ├── models/
│   │   ├── serializers/
│   │   ├── views/
│   │   ├── tests/
│   │   └── urls.py
│   └── requirements.txt
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   ├── tests/
│   │   ├── utils/
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── webpack.config.js
└── docs/
    ├── requisitos.md
    ├── arquitetura.md
    ├── modelo_dados.md
    └── manual_usuario.md
```

## Modelo de Dados

### Diagrama de Entidade-Relacionamento

O sistema utiliza um modelo de dados relacional com as seguintes entidades principais:

- **Usuario**: Armazena informações dos usuários do sistema
- **Setor**: Representa os setores do CCBJ
- **FonteRecurso**: Representa as fontes de recursos financeiros
- **Meta**: Metas associadas às fontes de recursos
- **Atividade**: Atividades associadas às metas
- **Rubrica**: Rubricas associadas às atividades
- **Bolsista**: Informações dos bolsistas
- **Credor**: Informações dos credores (pessoas jurídicas)
- **Contrato**: Contratos firmados com bolsistas ou credores
- **Parcela**: Parcelas de pagamento dos contratos
- **AlocacaoRecurso**: Alocação de recursos para setores
- **MovimentoFinanceiro**: Registro de movimentações financeiras
- **HistoricoStatusContrato**: Histórico de alterações de status dos contratos
- **AcompanhamentoProcesso**: Processos acompanhados pelos usuários
- **Notificacao**: Notificações geradas pelo sistema
- **FiltroSalvo**: Filtros de busca salvos pelos usuários

### Relacionamentos Principais

- Uma **FonteRecurso** pode ter várias **Metas**
- Uma **Meta** pode ter várias **Atividades**
- Uma **Atividade** pode ter várias **Rubricas**
- Um **Contrato** está associado a um **Setor**, uma **Meta**, uma **Atividade** e uma **Rubrica**
- Um **Contrato** pode estar associado a um **Bolsista** OU a um **Credor**
- Um **Contrato** pode ter várias **Parcelas**
- Um **Contrato** pode ter vários registros de **HistoricoStatusContrato**
- Um **Usuario** pode acompanhar vários **Contratos** através de **AcompanhamentoProcesso**
- Um **Usuario** pode receber várias **Notificacoes**
- Um **Usuario** pode salvar vários **FiltroSalvo**

## Backend

### Estrutura da API

A API do sistema segue os princípios RESTful, com os seguintes endpoints principais:

- `/api/v1/auth/`: Endpoints de autenticação
- `/api/v1/usuarios/`: Gestão de usuários
- `/api/v1/setores/`: Gestão de setores
- `/api/v1/fontes-recursos/`: Gestão de fontes de recursos
- `/api/v1/metas/`: Gestão de metas
- `/api/v1/atividades/`: Gestão de atividades
- `/api/v1/rubricas/`: Gestão de rubricas
- `/api/v1/bolsistas/`: Gestão de bolsistas
- `/api/v1/credores/`: Gestão de credores
- `/api/v1/contratos/`: Gestão de contratos
- `/api/v1/parcelas/`: Gestão de parcelas
- `/api/v1/alocacoes/`: Gestão de alocações de recursos
- `/api/v1/movimentos/`: Gestão de movimentos financeiros
- `/api/v1/contratos/verificar-status/`: Verificação automática de status de contratos
- `/api/v1/contratos/buscar/`: Busca avançada de contratos
- `/api/v1/acompanhamentos/`: Gestão de acompanhamentos de processos
- `/api/v1/notificacoes/`: Gestão de notificações
- `/api/v1/filtros-salvos/`: Gestão de filtros salvos
- `/api/v1/documentos/`: Geração de documentos
- `/api/v1/relatorios/`: Geração de relatórios

### Autenticação e Autorização

O sistema utiliza autenticação baseada em JWT (JSON Web Tokens) com os seguintes endpoints:

- `/api/v1/auth/token/`: Obtenção de token de acesso
- `/api/v1/auth/token/refresh/`: Atualização de token de acesso
- `/api/v1/auth/token/verify/`: Verificação de token de acesso

A autorização é baseada em permissões associadas aos perfis de usuário:

- **Administrador**: Acesso completo a todas as funcionalidades
- **Gestor**: Acesso à gestão financeira e aprovação de solicitações
- **Operador**: Cadastro e acompanhamento de contratos
- **Visualizador**: Apenas visualização de dados e relatórios

### Validações

O sistema implementa diversas validações para garantir a integridade dos dados:

- **Validação de disponibilidade orçamentária**: Verifica se há saldo disponível na rubrica antes de permitir o cadastro de um contrato
- **Validação de sobreposição de datas**: Impede que um bolsista tenha dois contratos ativos no mesmo período
- **Validação de datas**: Verifica se a data de início é anterior à data de fim
- **Validação de CPF/CNPJ**: Verifica se os documentos são válidos
- **Validação de email**: Verifica se os emails são válidos
- **Validação de valores**: Verifica se os valores são positivos e dentro dos limites esperados

### Geração de PDFs

O sistema utiliza a biblioteca WeasyPrint para gerar documentos em PDF a partir de templates HTML. O processo de geração segue os seguintes passos:

1. O usuário seleciona um template e uma entidade (contrato ou bolsista)
2. O sistema recupera os dados da entidade do banco de dados
3. Os dados são inseridos no template HTML
4. O HTML é convertido para PDF utilizando o WeasyPrint
5. O PDF é enviado para o usuário

## Frontend

### Estrutura da Interface

A interface do sistema é organizada em módulos:

- **Dashboard**: Visão geral da situação financeira
- **Contratos**: Gestão de contratos
- **Cadastros**: Gestão de bolsistas e credores
- **Orçamento**: Gestão orçamentária
- **Documentos**: Geração de documentos
- **Relatórios**: Geração de relatórios
- **Configurações**: Configurações do sistema

### Componentes Principais

- **Layout**: Estrutura básica da interface com menu lateral e barra superior
- **Dashboard**: Componentes de visualização de dados financeiros
- **FormField**: Campo de formulário com validação em tempo real
- **DataTable**: Tabela de dados com paginação, ordenação e filtros
- **StatusChip**: Componente para exibição de status de contratos
- **PDFGenerator**: Componente para geração de documentos em PDF
- **BuscaAvancada**: Componente para busca avançada de contratos
- **NotificacaoList**: Componente para exibição de notificações

### Contextos

- **AuthContext**: Gerenciamento de autenticação e autorização
- **NotificacaoContext**: Gerenciamento de notificações
- **ThemeContext**: Gerenciamento do tema da interface

### Rotas

- `/`: Dashboard
- `/login`: Tela de login
- `/contratos`: Lista de contratos
- `/contratos/novo`: Cadastro de novo contrato
- `/contratos/:id`: Detalhes de um contrato
- `/contratos/status`: Gestão de status de contratos
- `/contratos/busca`: Busca avançada de contratos
- `/bolsistas`: Lista de bolsistas
- `/bolsistas/novo`: Cadastro de novo bolsista
- `/bolsistas/:id`: Detalhes de um bolsista
- `/credores`: Lista de credores
- `/credores/novo`: Cadastro de novo credor
- `/credores/:id`: Detalhes de um credor
- `/orcamento`: Gestão orçamentária
- `/documentos`: Geração de documentos
- `/documentos/templates`: Gestão de templates
- `/relatorios`: Geração de relatórios
- `/configuracoes`: Configurações do sistema
- `/perfil`: Perfil do usuário

## Funcionalidades Principais

### Dashboard

O Dashboard apresenta uma visão geral da situação financeira do CCBJ, com os seguintes elementos:

- **Resumo Financeiro**: Valores totais de recursos, contratos e pagamentos
- **Gráficos de Execução**: Visualização da execução orçamentária por setor
- **Contratos Recentes**: Lista dos últimos contratos cadastrados
- **Alertas**: Notificações sobre prazos, pagamentos e disponibilidade orçamentária

### Gestão de Contratos

O módulo de Gestão de Contratos permite:

- Cadastro de novos contratos
- Edição de contratos existentes
- Registro de pagamentos
- Acompanhamento da execução dos contratos
- Geração de documentos relacionados aos contratos

### Sistema de Status de Contratos

O sistema de status de contratos permite:

- Alteração manual de status com registro de motivo
- Verificação automática de status com base em regras predefinidas
- Histórico de alterações de status
- Visualização de contratos por status

### Busca Avançada e Acompanhamento

O módulo de Busca Avançada e Acompanhamento permite:

- Busca de contratos por diversos critérios
- Salvamento de filtros frequentemente utilizados
- Acompanhamento personalizado de contratos
- Notificações sobre atualizações em contratos acompanhados
- Exportação de resultados de busca

### Geração de Documentos

O módulo de Geração de Documentos permite:

- Geração de contratos em PDF
- Geração de fichas de bolsistas em PDF
- Gestão de templates de documentos
- Visualização prévia de documentos
- Download e impressão de documentos

## Segurança

### Autenticação

- Utilização de JWT para autenticação
- Tokens com tempo de expiração
- Renovação automática de tokens
- Armazenamento seguro de tokens no localStorage

### Autorização

- Controle de acesso baseado em perfis
- Verificação de permissões em cada endpoint da API
- Componentes protegidos no frontend

### Proteção de Dados

- Validação de dados em ambos os lados (frontend e backend)
- Sanitização de inputs para prevenir ataques de injeção
- Proteção contra CSRF
- Utilização de HTTPS para comunicação segura

## Implantação

### Requisitos de Sistema

- Sistema operacional: Linux (recomendado Ubuntu 20.04 ou superior)
- Docker e Docker Compose
- Nginx
- PostgreSQL 14.x
- Redis

### Processo de Implantação

1. Clone o repositório do projeto
2. Configure as variáveis de ambiente no arquivo `.env`
3. Execute o comando `docker-compose up -d` para iniciar os containers
4. Execute as migrações do banco de dados com `docker-compose exec backend python manage.py migrate`
5. Crie um superusuário com `docker-compose exec backend python manage.py createsuperuser`
6. Acesse o sistema através do navegador

### Backup e Restauração

- Backup automático diário do banco de dados
- Scripts para restauração de backup
- Exportação de dados em formato CSV

## Manutenção e Suporte

### Logs

- Logs de aplicação armazenados em `/var/log/ccbj_financeiro/`
- Logs de acesso armazenados em `/var/log/nginx/`
- Rotação de logs configurada para manter histórico de 30 dias

### Monitoramento

- Monitoramento de disponibilidade do sistema
- Monitoramento de performance
- Alertas para situações críticas

### Atualizações

- Processo de atualização documentado
- Scripts para atualização automática
- Testes automatizados para validar atualizações

## Considerações Finais

O Sistema de Gestão Financeira do CCBJ foi desenvolvido seguindo as melhores práticas de engenharia de software, com foco em usabilidade, segurança e performance. A arquitetura modular permite a fácil manutenção e evolução do sistema, enquanto as validações implementadas garantem a integridade dos dados e o correto funcionamento das regras de negócio.

A documentação completa, incluindo o manual do usuário, está disponível na pasta `docs/` do projeto.
