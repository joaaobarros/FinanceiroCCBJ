# Requisitos do Sistema de Gestão Financeira para o CCBJ

## 1. Visão Geral

O Centro Cultural Bom Jardim (CCBJ) necessita de um sistema de consolidação e acompanhamento financeiro para a execução de contratos, permitindo o monitoramento detalhado de cada compra, aquisição, contratação e outras operações financeiras. O sistema deve garantir a boa execução orçamentária dos projetos, fornecendo informações sobre prazos, disponibilidades e limites orçamentários.

## 2. Requisitos Funcionais

### 2.1 Gestão de Usuários e Permissões
- Implementar diferentes níveis de acesso:
  - Administradores: acesso total ao sistema
  - Gestores de setor: acesso à gestão financeira do seu setor
  - Usuários de consulta: apenas visualização de dashboard e consultas
- Registro de ações dos usuários para auditoria

### 2.2 Estrutura Organizacional
- Centros de custo (setores):
  - Gestão
  - Adm/Infra
  - Escola
  - NArTE
  - Comunicação
  - Ação Cultural

### 2.3 Gestão Financeira
- Cadastro de fontes de recursos
- Estruturação hierárquica:
  - Metas
  - Atividades (submetas)
  - Rubricas (itens de custeio)
- Atribuição de valores de cada fonte para os setores responsáveis
- Controle de saldo disponível por rubrica/meta/fonte/setor
- Impedimento de novas solicitações quando não houver disponibilidade orçamentária
- Transferência de recursos entre setores (com autorização)

### 2.4 Cadastro de Credores e Bolsistas
- Cadastro de credores (Pessoa Jurídica)
- Cadastro de bolsistas de cursos
- Vinculação entre ações, bolsas e credores
- Impedimento de cadastro de bolsistas com cadastros ativos (verificação de sobreposição de datas)

### 2.5 Gestão de Contratos
- Cadastro de contratos com os seguintes campos:
  - Nome do curso/ação
  - Status do processo
  - Histórico do processo
  - Setor
  - Programa (caso haja)
  - Nome do bolsista
  - Contatos (telefone/email)
  - Responsável
  - Datas de início e término do contrato
  - Atividade (no CG cuja rubrica de pagamento está contida)
  - Item de custeio (rubrica para pagamento)
  - Meta (no CG cuja rubrica de pagamento está contida)
  - Valor do contrato
  - Quantidade de parcelas
  - Observações sobre parcelas
  - Total pago
  - Informações de pagamento por parcela (até 12 parcelas)

### 2.6 Gestão de Bolsistas
- Cadastro de bolsistas com os seguintes campos:
  - Nome do cargo/função/apresentação/curso
  - Natureza
  - Número do esboço de contratação
  - Status do contrato
  - Histórico do processo
  - Setor
  - Programa (caso haja)
  - Contratado(a)
  - Contatos (telefone/email)
  - Credor (responsável pela execução)
  - Datas de início e término do contrato
  - Atividade (no CG cuja rubrica de pagamento está contida)
  - Item de custeio (rubrica para pagamento)
  - Meta (no CG cuja rubrica de pagamento está contida)
  - Valor do contrato
  - Quantidade de parcelas
  - Observações sobre parcelas
  - Total pago
  - Informações de pagamento por parcela (até 12 parcelas)

### 2.7 Dashboard e Relatórios
- Visualização de gastos, saldos e quantidade de contratos
- Identificação de déficits
- Gráficos interativos e tabelas para geração de insights
- Relatórios personalizáveis
- Exportação de dados em diferentes formatos

### 2.8 Fluxo de Caixa
- Registro de entradas e saídas
- Projeção de fluxo de caixa
- Identificação de erros de preenchimento
- Rastreamento de responsáveis por preenchimentos incorretos

## 3. Requisitos Não-Funcionais

### 3.1 Usabilidade
- Interface intuitiva e responsiva
- Guia de uso integrado (manual de utilização e boas práticas)
- Tutorial passo a passo durante o uso da ferramenta
- Seção específica de ajuda e documentação

### 3.2 Segurança
- Autenticação segura
- Criptografia de dados sensíveis
- Backup automático de dados
- Registro de atividades (logs)

### 3.3 Desempenho
- Tempo de resposta rápido
- Capacidade de lidar com múltiplos usuários simultâneos
- Otimização para diferentes dispositivos

### 3.4 Manutenibilidade
- Código bem documentado
- Arquitetura modular
- Facilidade de atualização e expansão

## 4. Melhorias Sugeridas

- Notificações automáticas para prazos de contratos
- Integração com sistemas de email para alertas
- Módulo de aprovação de despesas com workflow configurável
- Geração automática de relatórios periódicos
- Histórico de alterações em contratos e orçamentos
- Calendário financeiro integrado
- Módulo de previsão orçamentária baseado em histórico
