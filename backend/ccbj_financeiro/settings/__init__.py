from .base import *

# Carrega as configurações com base no ambiente
import os

# Determina qual arquivo de configuração usar com base na variável de ambiente
environment = os.environ.get('DJANGO_ENVIRONMENT', 'development')

if environment == 'production':
    from .production import *
elif environment == 'testing':
    from .testing import *
else:
    from .development import *

# Cria diretório de logs se não existir
logs_dir = os.path.join(BASE_DIR, 'logs')
if not os.path.exists(logs_dir):
    os.makedirs(logs_dir)
