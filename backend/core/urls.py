from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)
from .views import (
    usuario_views,
    estrutura_views,
    credores_views,
    contratos_views,
    sistema_views,
)

# Configuração dos routers
router = DefaultRouter()

# Usuários e Autenticação
router.register(r'usuarios', usuario_views.UsuarioViewSet)
router.register(r'perfis', usuario_views.PerfilViewSet)

# Estrutura Organizacional
router.register(r'setores', estrutura_views.SetorViewSet)
router.register(r'programas', estrutura_views.ProgramaViewSet)
router.register(r'fontes-recursos', estrutura_views.FonteRecursoViewSet)
router.register(r'metas', estrutura_views.MetaViewSet)
router.register(r'atividades', estrutura_views.AtividadeViewSet)
router.register(r'rubricas', estrutura_views.RubricaViewSet)
router.register(r'alocacoes-recursos', estrutura_views.AlocacaoRecursoViewSet)
router.register(r'transferencias-recursos', estrutura_views.TransferenciaRecursoViewSet)

# Credores e Bolsistas
router.register(r'credores', credores_views.CredorViewSet)
router.register(r'bolsistas', credores_views.BolsistaViewSet)

# Contratos e Pagamentos
router.register(r'contratos', contratos_views.ContratoViewSet)
router.register(r'parcelas-contratos', contratos_views.ParcelaContratoViewSet)
router.register(r'historicos-processos', contratos_views.HistoricoProcessoViewSet)
router.register(r'movimentos-financeiros', contratos_views.MovimentoFinanceiroViewSet)

# Sistema
router.register(r'configuracoes', sistema_views.ConfiguracaoSistemaViewSet)
router.register(r'notificacoes', sistema_views.NotificacaoViewSet)
router.register(r'relatorios', sistema_views.RelatorioGeradoViewSet)
router.register(r'projecoes-orcamentarias', sistema_views.ProjecaoOrcamentariaViewSet)

# URLs da API
urlpatterns = [
    # Autenticação JWT
    path('auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    
    # Endpoints de usuário
    path('auth/me/', usuario_views.UserInfoView.as_view(), name='user_info'),
    path('auth/change-password/', usuario_views.ChangePasswordView.as_view(), name='change_password'),
    
    # Dashboard
    path('dashboard/resumo/', sistema_views.DashboardResumoView.as_view(), name='dashboard_resumo'),
    path('dashboard/contratos/', sistema_views.DashboardContratosView.as_view(), name='dashboard_contratos'),
    path('dashboard/financeiro/', sistema_views.DashboardFinanceiroView.as_view(), name='dashboard_financeiro'),
    
    # Relatórios
    path('relatorios/contratos/', sistema_views.RelatorioContratosView.as_view(), name='relatorio_contratos'),
    path('relatorios/financeiro/', sistema_views.RelatorioFinanceiroView.as_view(), name='relatorio_financeiro'),
    path('relatorios/bolsistas/', sistema_views.RelatorioBolsistasView.as_view(), name='relatorio_bolsistas'),
    
    # Verificações
    path('verificacoes/disponibilidade-orcamentaria/', 
         contratos_views.VerificacaoDisponibilidadeOrcamentariaView.as_view(), 
         name='verificacao_disponibilidade_orcamentaria'),
    path('verificacoes/sobreposicao-bolsista/', 
         credores_views.VerificacaoSobreposicaoBolsistaView.as_view(), 
         name='verificacao_sobreposicao_bolsista'),
    
    # Rotas do router
    path('', include(router.urls)),
]
