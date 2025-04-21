from django.urls import path
from core.views.acompanhamento_views import (
    AcompanhamentoProcessoViewSet,
    NotificacaoViewSet,
    FiltroSalvoViewSet,
    MarcarNotificacaoLidaView,
    BuscarContratosView
)
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'acompanhamentos', AcompanhamentoProcessoViewSet, basename='acompanhamento')
router.register(r'notificacoes', NotificacaoViewSet, basename='notificacao')
router.register(r'filtros-salvos', FiltroSalvoViewSet, basename='filtro-salvo')

urlpatterns = [
    path('notificacoes/<int:pk>/marcar-lida/', MarcarNotificacaoLidaView.as_view(), name='marcar-notificacao-lida'),
    path('contratos/buscar/', BuscarContratosView.as_view(), name='buscar-contratos'),
]

urlpatterns += router.urls
