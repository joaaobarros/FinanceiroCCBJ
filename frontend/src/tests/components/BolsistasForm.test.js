import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import BolsistasForm from '../../pages/credores/BolsistasForm';
import axios from 'axios';

// Mock do axios
jest.mock('axios');

// Mock do contexto de autenticação
jest.mock('../../contexts/AuthContext', () => ({
  AuthProvider: ({ children }) => children,
  useAuth: () => ({
    API_URL: 'http://localhost:8000/api/v1',
    currentUser: {
      username: 'testuser',
      perfil: { nivel_acesso: 'admin' }
    }
  })
}));

describe('BolsistasForm Component', () => {
  beforeEach(() => {
    // Limpar todos os mocks antes de cada teste
    jest.clearAllMocks();
  });

  test('renderiza o formulário corretamente', () => {
    render(
      <BrowserRouter>
        <BolsistasForm />
      </BrowserRouter>
    );

    // Verificar se os elementos principais estão presentes
    expect(screen.getByText('Cadastrar Bolsista')).toBeInTheDocument();
    expect(screen.getByText('Informações Pessoais')).toBeInTheDocument();
    expect(screen.getByLabelText(/Nome Completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/CPF/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Telefone/i)).toBeInTheDocument();
    expect(screen.getByText('Salvar')).toBeInTheDocument();
  });

  test('exibe erros para campos obrigatórios não preenchidos', async () => {
    render(
      <BrowserRouter>
        <BolsistasForm />
      </BrowserRouter>
    );

    // Clicar no botão salvar sem preencher os campos
    fireEvent.click(screen.getByText('Salvar'));

    // Verificar se as mensagens de erro são exibidas
    await waitFor(() => {
      expect(screen.getByText('Nome é obrigatório')).toBeInTheDocument();
      expect(screen.getByText('CPF é obrigatório')).toBeInTheDocument();
      expect(screen.getByText('Email é obrigatório')).toBeInTheDocument();
      expect(screen.getByText('Telefone é obrigatório')).toBeInTheDocument();
    });
  });

  test('valida CPF inválido', async () => {
    render(
      <BrowserRouter>
        <BolsistasForm />
      </BrowserRouter>
    );

    // Preencher com CPF inválido
    fireEvent.change(screen.getByLabelText(/CPF/i), {
      target: { value: '111.111.111-11' }
    });

    // Preencher outros campos obrigatórios
    fireEvent.change(screen.getByLabelText(/Nome Completo/i), {
      target: { value: 'João da Silva' }
    });
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'joao@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/Telefone/i), {
      target: { value: '(85) 99999-9999' }
    });

    // Clicar no botão salvar
    fireEvent.click(screen.getByText('Salvar'));

    // Verificar se a mensagem de erro de CPF inválido é exibida
    await waitFor(() => {
      expect(screen.getByText('CPF inválido')).toBeInTheDocument();
    });
  });

  test('valida email inválido', async () => {
    render(
      <BrowserRouter>
        <BolsistasForm />
      </BrowserRouter>
    );

    // Preencher com email inválido
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'email_invalido' }
    });

    // Preencher outros campos obrigatórios
    fireEvent.change(screen.getByLabelText(/Nome Completo/i), {
      target: { value: 'João da Silva' }
    });
    fireEvent.change(screen.getByLabelText(/CPF/i), {
      target: { value: '123.456.789-09' }
    });
    fireEvent.change(screen.getByLabelText(/Telefone/i), {
      target: { value: '(85) 99999-9999' }
    });

    // Clicar no botão salvar
    fireEvent.click(screen.getByText('Salvar'));

    // Verificar se a mensagem de erro de email inválido é exibida
    await waitFor(() => {
      expect(screen.getByText('Email inválido')).toBeInTheDocument();
    });
  });

  test('envia formulário com dados válidos', async () => {
    // Mock da resposta de sucesso do axios
    axios.post.mockResolvedValueOnce({
      data: {
        id: 1,
        nome: 'João da Silva',
        cpf: '12345678909',
        email: 'joao@example.com',
        telefone: '85999999999',
        ativo: true
      }
    });

    render(
      <BrowserRouter>
        <BolsistasForm />
      </BrowserRouter>
    );

    // Preencher todos os campos obrigatórios com dados válidos
    fireEvent.change(screen.getByLabelText(/Nome Completo/i), {
      target: { value: 'João da Silva' }
    });
    fireEvent.change(screen.getByLabelText(/CPF/i), {
      target: { value: '123.456.789-09' }
    });
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'joao@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/Telefone/i), {
      target: { value: '(85) 99999-9999' }
    });

    // Clicar no botão salvar
    fireEvent.click(screen.getByText('Salvar'));

    // Verificar se o axios.post foi chamado com os dados corretos
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/bolsistas/',
        expect.objectContaining({
          nome: 'João da Silva',
          cpf: '12345678909',
          email: 'joao@example.com',
          telefone: '85999999999',
          ativo: true
        })
      );
    });

    // Verificar se a mensagem de sucesso é exibida
    await waitFor(() => {
      expect(screen.getByText('Bolsista cadastrado com sucesso!')).toBeInTheDocument();
    });
  });

  test('trata erros da API', async () => {
    // Mock de erro da API
    axios.post.mockRejectedValueOnce({
      response: {
        data: {
          cpf: ['CPF já cadastrado no sistema.']
        },
        status: 400
      }
    });

    render(
      <BrowserRouter>
        <BolsistasForm />
      </BrowserRouter>
    );

    // Preencher todos os campos obrigatórios
    fireEvent.change(screen.getByLabelText(/Nome Completo/i), {
      target: { value: 'João da Silva' }
    });
    fireEvent.change(screen.getByLabelText(/CPF/i), {
      target: { value: '123.456.789-09' }
    });
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'joao@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/Telefone/i), {
      target: { value: '(85) 99999-9999' }
    });

    // Clicar no botão salvar
    fireEvent.click(screen.getByText('Salvar'));

    // Verificar se a mensagem de erro da API é exibida
    await waitFor(() => {
      expect(screen.getByText('CPF já cadastrado no sistema.')).toBeInTheDocument();
    });
  });
});
