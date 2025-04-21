from .development import *

# Configurações específicas para testes
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'test_db.sqlite3',
    }
}

# Desabilitar cache para testes
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.dummy.DummyCache',
    }
}

# Configurações de email para testes
EMAIL_BACKEND = 'django.core.mail.backends.locmem.EmailBackend'

# Desabilitar CSRF para testes de API
REST_FRAMEWORK = {
    **REST_FRAMEWORK,
    'TEST_REQUEST_DEFAULT_FORMAT': 'json',
}

# Configurações de senha simplificadas para testes
AUTH_PASSWORD_VALIDATORS = []
