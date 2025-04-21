from django.urls import path
from .views import index, dashboard

urlpatterns = [
    path('', index, name='index'),  # Esta linha é importante para a rota raiz
    path('dashboard/', dashboard, name='dashboard'),
    # outras rotas...
]
