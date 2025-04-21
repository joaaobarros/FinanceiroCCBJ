# CCBJ Financeiro - Versão Demo

Esta é uma versão de demonstração do Sistema de Gestão Financeira do CCBJ, adaptada para implantação em serviços gratuitos como Render.

## Instruções para implantação no Render

1. Crie uma conta no Render (https://render.com)
2. Conecte sua conta do GitHub ou faça upload deste repositório
3. Use o arquivo render.yaml para configurar os serviços
4. Implante os serviços

## Após a implantação

1. Acesse o backend e execute o script de dados de exemplo:
   ```
   python manage.py shell < scripts/seed_data.sh
   ```

2. Acesse o frontend através da URL fornecida pelo Render

## Credenciais de acesso

- Usuário: admin
- Senha: admin123

## Funcionalidades disponíveis na versão demo

- Dashboard interativo para acompanhamento financeiro
- Gestão completa de contratos e bolsistas
- Controle orçamentário com verificação de disponibilidade
- Sistema avançado de status de contratos
- Acompanhamento personalizado de processos
- Geração de documentos em PDF
- Filtros avançados para busca
- Interface personalizada com a identidade visual do CCBJ

## Limitações da versão demo

- Utiliza SQLite em vez de PostgreSQL
- Capacidade de armazenamento limitada
- Pode ficar inativo após períodos sem uso (limitação do plano gratuito do Render)
- Algumas funcionalidades avançadas podem ter desempenho reduzido
