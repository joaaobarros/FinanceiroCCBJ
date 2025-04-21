import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ccbj_financeiro.settings.demo')

application = get_wsgi_application()
