#!/bin/bash

# Script para implantar o sistema CCBJ Financeiro em um ambiente de demonstração

echo "Iniciando implantação do sistema CCBJ Financeiro..."

# Verificar se o Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "Docker não encontrado. Instalando Docker..."
    sudo apt-get update
    sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
    sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
    sudo apt-get update
    sudo apt-get install -y docker-ce
fi

# Verificar se o Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo "Docker Compose não encontrado. Instalando Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Criar diretório para a logo
mkdir -p /home/ubuntu/ccbj_financeiro/frontend/public
cp /home/ubuntu/upload/1000043467.png /home/ubuntu/ccbj_financeiro/frontend/public/logo-ccbj.png

# Tornar o script de seed_data executável
chmod +x /home/ubuntu/ccbj_financeiro/backend/scripts/seed_data.sh

# Construir e iniciar os containers
cd /home/ubuntu/ccbj_financeiro/deploy
docker-compose up -d

# Aguardar a inicialização dos serviços
echo "Aguardando a inicialização dos serviços..."
sleep 30

# Executar migrações do Django
echo "Executando migrações do banco de dados..."
docker-compose exec backend python manage.py migrate

# Carregar dados de exemplo
echo "Carregando dados de exemplo..."
docker-compose exec backend bash scripts/seed_data.sh

# Obter o IP público da máquina
PUBLIC_IP=$(curl -s ifconfig.me)

echo "Implantação concluída com sucesso!"
echo "O sistema está disponível nos seguintes endereços:"
echo "Backend: http://$PUBLIC_IP:8000"
echo "Frontend: http://$PUBLIC_IP:3000"
echo ""
echo "Credenciais de acesso:"
echo "Usuário: admin"
echo "Senha: admin123"
