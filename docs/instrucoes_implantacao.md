# Instruções de Implantação - Sistema de Gestão Financeira CCBJ

Este documento contém instruções detalhadas para implantar o Sistema de Gestão Financeira do CCBJ em um ambiente de produção.

## Requisitos do Sistema

- Docker e Docker Compose
- Acesso à internet para download de imagens Docker
- Mínimo de 2GB de RAM e 20GB de espaço em disco
- Portas 80, 8000 e 5432 disponíveis

## Estrutura de Arquivos

O pacote contém os seguintes diretórios:

- `backend/`: Código-fonte do backend Django
- `frontend/`: Código-fonte do frontend React
- `docs/`: Documentação do sistema
- `deploy/`: Scripts e arquivos de configuração para implantação

## Passos para Implantação

### 1. Preparação do Ambiente

1. Instale o Docker e Docker Compose:

```bash
# Para Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
sudo apt-get update
sudo apt-get install -y docker-ce docker-compose
```

2. Verifique se o Docker está funcionando corretamente:

```bash
sudo docker run hello-world
```

### 2. Configuração do Sistema

1. Extraia o arquivo compactado em um diretório de sua escolha:

```bash
mkdir -p /opt/ccbj_financeiro
tar -xzvf ccbj_financeiro_sistema.tar.gz -C /opt/ccbj_financeiro
cd /opt/ccbj_financeiro
```

2. Configure as variáveis de ambiente (opcional):

```bash
# Edite o arquivo docker-compose.yml para personalizar as configurações
nano deploy/docker-compose.yml
```

### 3. Implantação do Sistema

1. Execute o script de implantação:

```bash
cd deploy
chmod +x deploy.sh
./deploy.sh
```

2. Aguarde a conclusão da implantação. O script realizará as seguintes ações:
   - Construir as imagens Docker
   - Iniciar os containers
   - Executar migrações do banco de dados
   - Carregar dados de exemplo

### 4. Acesso ao Sistema

Após a conclusão da implantação, o sistema estará disponível nos seguintes endereços:

- Frontend: `http://seu-servidor:3000`
- Backend API: `http://seu-servidor:8000/api/v1`

Credenciais de acesso padrão:
- Usuário: `admin`
- Senha: `admin123`

**Importante**: Altere a senha do usuário admin após o primeiro acesso.

## Configurações Adicionais

### Configuração de Produção

Para um ambiente de produção, recomendamos as seguintes configurações adicionais:

1. Configure um servidor web (Nginx) como proxy reverso:

```bash
# Exemplo de configuração Nginx
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

2. Configure HTTPS com Let's Encrypt:

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d seu-dominio.com
```

3. Configure backups automáticos do banco de dados:

```bash
# Adicione ao crontab
0 2 * * * docker exec ccbj_financeiro_db_1 pg_dump -U ccbj_user ccbj_financeiro > /backup/ccbj_financeiro_$(date +\%Y\%m\%d).sql
```

### Personalização do Sistema

1. Para personalizar a aparência do sistema, edite o arquivo de tema:

```bash
nano frontend/src/theme/ccbjTheme.js
```

2. Para adicionar ou modificar funcionalidades, consulte a documentação técnica em `docs/documentacao_tecnica.md`.

## Solução de Problemas

### Logs do Sistema

Para visualizar os logs dos containers:

```bash
# Logs do backend
docker logs -f ccbj_financeiro_backend_1

# Logs do frontend
docker logs -f ccbj_financeiro_frontend_1

# Logs do banco de dados
docker logs -f ccbj_financeiro_db_1
```

### Problemas Comuns

1. **Erro de conexão com o banco de dados**:
   - Verifique se o container do PostgreSQL está em execução
   - Verifique as credenciais no arquivo `docker-compose.yml`

2. **Erro ao acessar o frontend**:
   - Verifique se o container do frontend está em execução
   - Verifique se a variável `REACT_APP_API_URL` está configurada corretamente

3. **Erro nas migrações do Django**:
   - Execute manualmente as migrações:
   ```bash
   docker exec -it ccbj_financeiro_backend_1 python manage.py migrate
   ```

## Suporte

Para suporte adicional, consulte a documentação completa em `docs/` ou entre em contato com a equipe de desenvolvimento.

---

© 2025 Centro Cultural Bom Jardim (CCBJ) - Todos os direitos reservados
