FROM python:3.10-slim

WORKDIR /app

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements e instalar dependências Python
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copiar o código do projeto
COPY . /app/

# Expor a porta que o Gunicorn vai usar
EXPOSE 8000

# Comando para iniciar o servidor
CMD ["gunicorn", "ccbj_financeiro.wsgi:application", "--bind", "0.0.0.0:8000"]
