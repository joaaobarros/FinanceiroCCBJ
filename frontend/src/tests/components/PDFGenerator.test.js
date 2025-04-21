import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PDFGenerator from '../../pages/documentos/PDFGenerator';
import axios from 'axios';

// Mock do axios
jest.mock('axios');

// Mock do contexto de autenticação
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    API_URL: 'http://localhost:8000/api/v1',
    currentUser: {
      username: 'testuser',
      perfil: { nivel_acesso: 'admin' }
    }
  })
}));

describe('PDFGenerator Component', () => {
  beforeEach(() => {
    // Limpar todos os mocks antes de cada teste
    jest.clearAllMocks();
    
    // Mock das respostas da API
    axios.get.mockImplementation((url) => {
      if (url.includes('/documentos/templates/')) {
        return Promise.resolve({
          data: [
            { id: 1, nome: 'Contrato Padrão', tipo: 'contrato', descricao: 'Modelo padrão de contrato' },
            { id: 2, nome: 'Ficha de Bolsista', tipo: 'ficha', descricao: 'Modelo de ficha para bolsistas' }
          ]
        });
      } else if (url.includes('/bolsistas/')) {
        return Promise.resolve({
          data: [
            { id: 1, nome: 'João da Silva', cpf: '12345678909', email: 'joao@example.com' },
            { id: 2, nome: 'Maria Souza', cpf: '98765432100', email: 'maria@example.com' }
          ]
        });
      } else if (url.includes('/contratos/')) {
        return Promise.resolve({
          data: [
            { id: 1, nome_curso_acao: 'Curso de Música', valor_total: 12000, data_inicio: '2025-01-01' },
            { id: 2, nome_curso_acao: 'Oficina de Teatro', valor_total: 8000, data_inicio: '2025-02-01' }
          ]
        });
      }
      return Promise.reject(new Error('URL não reconhecida nos mocks'));
    });
  });

  test('renderiza o componente corretamente', async () => {
    render(
      <BrowserRouter>
        <PDFGenerator />
      </BrowserRouter>
    );

    // Verificar se os elementos principais estão presentes
    expect(screen.getByText('Gerador de Documentos')).toBeInTheDocument();
    
    // Aguardar carregamento dos dados
    await waitFor(() => {
      expect(screen.getByText('Contratos')).toBeInTheDocument();
      expect(screen.getByText('Fichas')).toBeInTheDocument();
      expect(screen.getByText('Gerar Contrato')).toBeInTheDocument();
      expect(screen.getByText('Gerar Ficha')).toBeInTheDocument();
    });
  });

  test('abre o diálogo ao clicar em Gerar Contrato', async () => {
    render(
      <BrowserRouter>
        <PDFGenerator />
      </BrowserRouter>
    );

    // Aguardar carregamento dos dados
    await waitFor(() => {
      expect(screen.getByText('Gerar Contrato')).toBeInTheDocument();
    });

    // Clicar no botão para gerar contrato
    fireEvent.click(screen.getByText('Gerar Contrato'));

    // Verificar se o diálogo foi aberto
    await waitFor(() => {
      expect(screen.getByText('Gerar Contrato')).toBeInTheDocument();
      expect(screen.getByText('Template')).toBeInTheDocument();
      expect(screen.getByText('Tipo de Entidade')).toBeInTheDocument();
    });
  });

  test('seleciona template e entidade e gera PDF', async () => {
    // Mock da resposta de sucesso do axios para geração de PDF
    axios.post.mockResolvedValueOnce({
      data: new Blob(['PDF content'], { type: 'application/pdf' })
    });

    // Mock da função URL.createObjectURL
    const mockCreateObjectURL = jest.fn();
    global.URL.createObjectURL = mockCreateObjectURL;
    mockCreateObjectURL.mockReturnValue('blob:http://localhost/mock-pdf-url');

    // Mock da função createElement e appendChild
    const mockAppendChild = jest.fn();
    const mockRemoveChild = jest.fn();
    const mockClick = jest.fn();
    const mockLink = {
      href: '',
      setAttribute: jest.fn(),
      click: mockClick
    };
    
    document.createElement = jest.fn().mockReturnValue(mockLink);
    document.body.appendChild = mockAppendChild;
    document.body.removeChild = mockRemoveChild;

    render(
      <BrowserRouter>
        <PDFGenerator />
      </BrowserRouter>
    );

    // Aguardar carregamento dos dados
    await waitFor(() => {
      expect(screen.getByText('Gerar Contrato')).toBeInTheDocument();
    });

    // Clicar no botão para gerar contrato
    fireEvent.click(screen.getByText('Gerar Contrato'));

    // Aguardar abertura do diálogo
    await waitFor(() => {
      expect(screen.getByText('Selecione um template')).toBeInTheDocument();
    });

    // Selecionar template
    fireEvent.mouseDown(screen.getByLabelText('Template'));
    await waitFor(() => {
      expect(screen.getByText('Contrato Padrão')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Contrato Padrão'));

    // Selecionar entidade
    fireEvent.mouseDown(screen.getByLabelText('Bolsista'));
    await waitFor(() => {
      expect(screen.getByText('João da Silva')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('João da Silva'));

    // Clicar no botão para gerar PDF
    fireEvent.click(screen.getByText('Gerar PDF'));

    // Verificar se o axios.post foi chamado com os dados corretos
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/documentos/gerar/',
        {
          template_id: 1,
          entidade_tipo: 'bolsista',
          entidade_id: 1
        },
        { responseType: 'blob' }
      );
    });

    // Verificar se o link foi criado e clicado
    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(mockLink.setAttribute).toHaveBeenCalledWith('download', expect.any(String));
    expect(mockClick).toHaveBeenCalled();
  });

  test('exibe mensagem de erro quando não seleciona template ou entidade', async () => {
    render(
      <BrowserRouter>
        <PDFGenerator />
      </BrowserRouter>
    );

    // Aguardar carregamento dos dados
    await waitFor(() => {
      expect(screen.getByText('Gerar Contrato')).toBeInTheDocument();
    });

    // Clicar no botão para gerar contrato
    fireEvent.click(screen.getByText('Gerar Contrato'));

    // Aguardar abertura do diálogo
    await waitFor(() => {
      expect(screen.getByText('Selecione um template')).toBeInTheDocument();
    });

    // Clicar no botão para gerar PDF sem selecionar template ou entidade
    fireEvent.click(screen.getByText('Gerar PDF'));

    // Verificar se a mensagem de erro é exibida
    await waitFor(() => {
      expect(screen.getByText('Por favor, selecione um template e uma entidade')).toBeInTheDocument();
    });
  });

  test('trata erros da API ao gerar PDF', async () => {
    // Mock de erro da API
    axios.post.mockRejectedValueOnce(new Error('Erro ao gerar PDF'));

    render(
      <BrowserRouter>
        <PDFGenerator />
      </BrowserRouter>
    );

    // Aguardar carregamento dos dados
    await waitFor(() => {
      expect(screen.getByText('Gerar Contrato')).toBeInTheDocument();
    });

    // Clicar no botão para gerar contrato
    fireEvent.click(screen.getByText('Gerar Contrato'));

    // Aguardar abertura do diálogo
    await waitFor(() => {
      expect(screen.getByText('Selecione um template')).toBeInTheDocument();
    });

    // Selecionar template
    fireEvent.mouseDown(screen.getByLabelText('Template'));
    await waitFor(() => {
      expect(screen.getByText('Contrato Padrão')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Contrato Padrão'));

    // Selecionar entidade
    fireEvent.mouseDown(screen.getByLabelText('Bolsista'));
    await waitFor(() => {
      expect(screen.getByText('João da Silva')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('João da Silva'));

    // Clicar no botão para gerar PDF
    fireEvent.click(screen.getByText('Gerar PDF'));

    // Verificar se a mensagem de erro é exibida
    await waitFor(() => {
      expect(screen.getByText('Erro ao gerar documento. Por favor, tente novamente.')).toBeInTheDocument();
    });
  });
});
