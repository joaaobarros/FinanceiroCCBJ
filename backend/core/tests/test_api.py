import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from core.models import Usuario, Perfil, Setor, Bolsista, Contrato

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def admin_user():
    user = Usuario.objects.create_user(
        username='admin',
        email='admin@ccbj.com.br',
        password='senha123',
        first_name='Admin',
        last_name='CCBJ'
    )
    Perfil.objects.create(
        usuario=user,
        nivel_acesso='admin',
        telefone='85999999999'
    )
    return user

@pytest.fixture
def gestor_user():
    user = Usuario.objects.create_user(
        username='gestor',
        email='gestor@ccbj.com.br',
        password='senha123',
        first_name='Gestor',
        last_name='CCBJ'
    )
    Perfil.objects.create(
        usuario=user,
        nivel_acesso='gestor',
        telefone='85988888888'
    )
    return user

@pytest.fixture
def usuario_comum():
    user = Usuario.objects.create_user(
        username='usuario',
        email='usuario@ccbj.com.br',
        password='senha123',
        first_name='Usuário',
        last_name='Comum'
    )
    Perfil.objects.create(
        usuario=user,
        nivel_acesso='usuario',
        telefone='85977777777'
    )
    return user

@pytest.fixture
def setor():
    return Setor.objects.create(
        nome='Gestão',
        descricao='Setor de Gestão',
        ativo=True
    )

@pytest.fixture
def bolsista():
    return Bolsista.objects.create(
        nome='João da Silva',
        cpf='12345678900',
        email='joao@example.com',
        telefone='85966666666',
        ativo=True
    )

@pytest.mark.django_db
class TestAutenticacao:
    def test_login_sucesso(self, api_client, admin_user):
        url = reverse('token_obtain_pair')
        data = {
            'username': 'admin',
            'password': 'senha123'
        }
        response = api_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_200_OK
        assert 'access' in response.data
        assert 'refresh' in response.data

    def test_login_falha(self, api_client):
        url = reverse('token_obtain_pair')
        data = {
            'username': 'usuario_inexistente',
            'password': 'senha_errada'
        }
        response = api_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_refresh_token(self, api_client, admin_user):
        # Primeiro, obter o token
        url = reverse('token_obtain_pair')
        data = {
            'username': 'admin',
            'password': 'senha123'
        }
        response = api_client.post(url, data, format='json')
        refresh_token = response.data['refresh']
        
        # Agora, tentar renovar o token
        url = reverse('token_refresh')
        data = {
            'refresh': refresh_token
        }
        response = api_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_200_OK
        assert 'access' in response.data

@pytest.mark.django_db
class TestPermissoes:
    def test_admin_acesso_usuarios(self, api_client, admin_user):
        # Autenticar como admin
        api_client.force_authenticate(user=admin_user)
        
        # Tentar acessar lista de usuários
        url = reverse('usuario-list')
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK

    def test_usuario_comum_sem_acesso_usuarios(self, api_client, usuario_comum):
        # Autenticar como usuário comum
        api_client.force_authenticate(user=usuario_comum)
        
        # Tentar acessar lista de usuários
        url = reverse('usuario-list')
        response = api_client.get(url)
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_gestor_acesso_setores(self, api_client, gestor_user):
        # Autenticar como gestor
        api_client.force_authenticate(user=gestor_user)
        
        # Tentar acessar lista de setores
        url = reverse('setor-list')
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK

@pytest.mark.django_db
class TestBolsistas:
    def test_criar_bolsista(self, api_client, admin_user):
        # Autenticar como admin
        api_client.force_authenticate(user=admin_user)
        
        # Criar bolsista
        url = reverse('bolsista-list')
        data = {
            'nome': 'Maria Silva',
            'cpf': '98765432100',
            'email': 'maria@example.com',
            'telefone': '85955555555',
            'ativo': True
        }
        response = api_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['nome'] == 'Maria Silva'
        assert response.data['cpf'] == '98765432100'

    def test_listar_bolsistas(self, api_client, admin_user, bolsista):
        # Autenticar como admin
        api_client.force_authenticate(user=admin_user)
        
        # Listar bolsistas
        url = reverse('bolsista-list')
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) >= 1
        assert response.data[0]['nome'] == bolsista.nome

    def test_atualizar_bolsista(self, api_client, admin_user, bolsista):
        # Autenticar como admin
        api_client.force_authenticate(user=admin_user)
        
        # Atualizar bolsista
        url = reverse('bolsista-detail', args=[bolsista.id])
        data = {
            'nome': 'João Silva Atualizado',
            'cpf': bolsista.cpf,
            'email': bolsista.email,
            'telefone': bolsista.telefone,
            'ativo': bolsista.ativo
        }
        response = api_client.put(url, data, format='json')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['nome'] == 'João Silva Atualizado'

    def test_excluir_bolsista(self, api_client, admin_user, bolsista):
        # Autenticar como admin
        api_client.force_authenticate(user=admin_user)
        
        # Excluir bolsista
        url = reverse('bolsista-detail', args=[bolsista.id])
        response = api_client.delete(url)
        assert response.status_code == status.HTTP_204_NO_CONTENT
        
        # Verificar se foi excluído
        response = api_client.get(url)
        assert response.status_code == status.HTTP_404_NOT_FOUND

@pytest.mark.django_db
class TestValidacoes:
    def test_cpf_invalido(self, api_client, admin_user):
        # Autenticar como admin
        api_client.force_authenticate(user=admin_user)
        
        # Tentar criar bolsista com CPF inválido
        url = reverse('bolsista-list')
        data = {
            'nome': 'Teste CPF Inválido',
            'cpf': '11111111111',  # CPF inválido (todos os dígitos iguais)
            'email': 'teste@example.com',
            'telefone': '85944444444',
            'ativo': True
        }
        response = api_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'cpf' in response.data

    def test_email_invalido(self, api_client, admin_user):
        # Autenticar como admin
        api_client.force_authenticate(user=admin_user)
        
        # Tentar criar bolsista com email inválido
        url = reverse('bolsista-list')
        data = {
            'nome': 'Teste Email Inválido',
            'cpf': '12345678909',
            'email': 'email_invalido',  # Email inválido
            'telefone': '85933333333',
            'ativo': True
        }
        response = api_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'email' in response.data

    def test_sobreposicao_datas_bolsista(self, api_client, admin_user, bolsista, setor):
        # Autenticar como admin
        api_client.force_authenticate(user=admin_user)
        
        # Criar um contrato para o bolsista
        url = reverse('contrato-list')
        data = {
            'tipo': 'bolsa',
            'nome_curso_acao': 'Curso de Teste',
            'status_processo': 'em_andamento',
            'setor': setor.id,
            'bolsista': bolsista.id,
            'data_inicio': '2025-01-01',
            'data_fim': '2025-12-31',
            'valor_total': 12000.00,
            'quantidade_parcelas': 12
        }
        response = api_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        
        # Tentar criar outro contrato com datas sobrepostas
        data = {
            'tipo': 'bolsa',
            'nome_curso_acao': 'Outro Curso',
            'status_processo': 'em_andamento',
            'setor': setor.id,
            'bolsista': bolsista.id,
            'data_inicio': '2025-06-01',
            'data_fim': '2026-05-31',
            'valor_total': 12000.00,
            'quantidade_parcelas': 12
        }
        response = api_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'bolsista' in response.data or 'non_field_errors' in response.data
