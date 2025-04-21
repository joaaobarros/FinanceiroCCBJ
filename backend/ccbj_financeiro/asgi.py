"""
ASGI config for ccbj_financeiro project.
"""

import os

from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ccbj_financeiro.settings')

application = get_asgi_application()
