import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Button, 
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Tooltip,
  Divider,
  Snackbar,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import { DataGrid } from '@mui/x-data-grid';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

// Ícones
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import VisibilityIcon from '@mui/icons-material/Visibility';
import GetAppIcon from '@mui/icons-material/GetApp';

const BuscaAvancada = () => {
  const { API_URL, currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [contratos, setContratos] = useState([]);
  const [totalContratos, setTotalContratos] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [filtrosSalvos, setFiltrosSalvos] = useState([]);
  const [acompanhamentos, setAcompanhamentos] = useState([]);
  const [openSalvarFiltroDialog, setOpenSalvarFiltroDialog] = useState(false);
  const [openConfigAcompDialog, setOpenConfigAcompDialog] = useState(false);
  const [selectedContrato, setSelectedContrato] = useState(null);
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Estado para filtros
  const [filtros, setFiltros] = useState({
    setor: '',
    fonte_recurso: '',
    meta: '',
    atividade: '',
    rubrica: '',
    status_contrato: [],
    tipo_contrato: [],
    data_inicio_de: null,
    data_inicio_ate: null,
    data_fim_de: null,
    data_fim_ate: null,
    valor_minimo: '',
    valor_maximo: '',
    texto_busca: '',
    ordenacao: '-data_inicio'
  });
  
  // Estado para salvar filtro
  const [filtroSalvo, setFiltroSalvo] = useState({
    nome: '',
    descricao: ''
  });
  
  // Estado para configuração de acompanhamento
  const [configAcomp, setConfigAcomp] = useState({
    notificar_mudanca_status: true,
    notificar_pagamentos: true,
    notificar_prazos: true,
    notificar_por_email: false,
    notas_pessoais: ''
  });
  
  // Dados para selects
  const [dadosSelects, setDadosSelects] = useState({
    setores: [],
    fontes_recursos: [],
    metas: [],
    atividades: [],
    rubricas: []
  });
  
  // Carregar dados iniciais
  useEffect(() => {
    const fetchDadosIniciais = async () => {
      setLoading(true);
      try {
        // Carregar dados para selects
        const [
          setoresRes,
          fontesRes,
          metasRes,
          atividadesRes,
          rubricasRes,
          filtrosSalvosRes,
          acompanhamentosRes
        ] = await Promise.all([
          axios.get(`${API_URL}/setores/`),
          axios.get(`${API_URL}/fontes-recursos/`),
          axios.get(`${API_URL}/metas/`),
          axios.get(`${API_URL}/atividades/`),
          axios.get(`${API_URL}/rubricas/`),
          axios.get(`${API_URL}/filtros-salvos/`),
          axios.get(`${API_URL}/acompanhamentos/`)
        ]);
        
        setDadosSelects({
          setores: setoresRes.data,
          fontes_recursos: fontesRes.data,
          metas: metasRes.data,
          atividades: atividadesRes.data,
          rubricas: rubricasRes.data
        });
        
        setFiltrosSalvos(filtrosSalvosRes.data);
        
        // Mapear acompanhamentos para um objeto de fácil acesso
        const acompMap = {};
        acompanhamentosRes.data.forEach(acomp => {
          acompMap[acomp.contrato.id] = acomp;
        });
        setAcompanhamentos(acompMap);
        
        // Buscar contratos iniciais
        await buscarContratos();
      } catch (error) {
        console.error('Erro ao carregar dados iniciais:', error);
        setSnackbar({
          open: true,
          message: 'Erro ao carregar dados iniciais. Por favor, tente novamente.',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchDadosIniciais();
  }, [API_URL]);
  
  // Buscar contratos com filtros
  const buscarContratos = async () => {
    setLoading(true);
    
    try {
      // Preparar parâmetros de filtro
      const params = {
        page: page + 1,
        page_size: pageSize,
        ordering: filtros.ordenacao
      };
      
      // Adicionar filtros não vazios
      if (filtros.setor) params.setor = filtros.setor;
      if (filtros.fonte_recurso) params.fonte_recurso = filtros.fonte_recurso;
      if (filtros.meta) params.meta = filtros.meta;
      if (filtros.atividade) params.atividade = filtros.atividade;
      if (filtros.rubrica) params.rubrica = filtros.rubrica;
      if (filtros.status_contrato.length > 0) params.status_contrato = filtros.status_contrato.join(',');
      if (filtros.tipo_contrato.length > 0) params.tipo_contrato = filtros.tipo_contrato.join(',');
      if (filtros.data_inicio_de) params.data_inicio_de = filtros.data_inicio_de.toISOString().split('T')[0];
      if (filtros.data_inicio_ate) params.data_inicio_ate = filtros.data_inicio_ate.toISOString().split('T')[0];
      if (filtros.data_fim_de) params.data_fim_de = filtros.data_fim_de.toISOString().split('T')[0];
      if (filtros.data_fim_ate) params.data_fim_ate = filtros.data_fim_ate.toISOString().split('T')[0];
      if (filtros.valor_minimo) params.valor_minimo = filtros.valor_minimo;
      if (filtros.valor_maximo) params.valor_maximo = filtros.valor_maximo;
      if (filtros.texto_busca) params.texto_busca = filtros.texto_busca;
      
      const response = await axios.get(`${API_URL}/contratos/buscar/`, { params });
      
      setContratos(response.data.results);
      setTotalContratos(response.data.count);
    } catch (error) {
      console.error('Erro ao buscar contratos:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao buscar contratos. Por favor, tente novamente.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Lidar com mudança de página
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };
  
  // Lidar com mudança de tamanho de página
  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setPage(0);
  };
  
  // Lidar com mudanças nos filtros
  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };
  
  // Lidar com mudanças em filtros de múltipla seleção
  const handleMultiSelectChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };
  
  // Lidar com mudanças em datas
  const handleDateChange = (name, date) => {
    setFiltros(prev => ({ ...prev, [name]: date }));
  };
  
  // Limpar filtros
  const handleLimparFiltros = () => {
    setFiltros({
      setor: '',
      fonte_recurso: '',
      meta: '',
      atividade: '',
      rubrica: '',
      status_contrato: [],
      tipo_contrato: [],
      data_inicio_de: null,
      data_inicio_ate: null,
      data_fim_de: null,
      data_fim_ate: null,
      valor_minimo: '',
      valor_maximo: '',
      texto_busca: '',
      ordenacao: '-data_inicio'
    });
  };
  
  // Aplicar filtro salvo
  const handleAplicarFiltroSalvo = (filtro) => {
    const novoFiltro = {
      setor: filtro.setor || '',
      fonte_recurso: filtro.fonte_recurso || '',
      meta: filtro.meta || '',
      atividade: filtro.atividade || '',
      rubrica: filtro.rubrica || '',
      status_contrato: filtro.status_contrato ? filtro.status_contrato.split(',') : [],
      tipo_contrato: filtro.tipo_contrato ? filtro.tipo_contrato.split(',') : [],
      data_inicio_de: filtro.data_inicio_de ? new Date(filtro.data_inicio_de) : null,
      data_inicio_ate: filtro.data_inicio_ate ? new Date(filtro.data_inicio_ate) : null,
      data_fim_de: filtro.data_fim_de ? new Date(filtro.data_fim_de) : null,
      data_fim_ate: filtro.data_fim_ate ? new Date(filtro.data_fim_ate) : null,
      valor_minimo: filtro.valor_minimo || '',
      valor_maximo: filtro.valor_maximo || '',
      texto_busca: filtro.texto_busca || '',
      ordenacao: filtro.ordenacao || '-data_inicio'
    };
    
    setFiltros(novoFiltro);
    setPageSize(filtro.itens_por_pagina || 25);
    setPage(0);
    
    // Buscar contratos com o novo filtro
    setTimeout(() => {
      buscarContratos();
    }, 100);
  };
  
  // Abrir diálogo para salvar filtro
  const handleOpenSalvarFiltroDialog = () => {
    setFiltroSalvo({
      nome: '',
      descricao: ''
    });
    setOpenSalvarFiltroDialog(true);
  };
  
  // Fechar diálogo de salvar filtro
  const handleCloseSalvarFiltroDialog = () => {
    setOpenSalvarFiltroDialog(false);
  };
  
  // Lidar com mudanças no formulário de salvar filtro
  const handleFiltroSalvoChange = (e) => {
    const { name, value } = e.target;
    setFiltroSalvo(prev => ({ ...prev, [name]: value }));
  };
  
  // Salvar filtro
  const handleSalvarFiltro = async () => {
    if (!filtroSalvo.nome) {
      setSnackbar({
        open: true,
        message: 'Por favor, informe um nome para o filtro.',
        severity: 'error'
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Preparar dados do filtro
      const filtroData = {
        ...filtroSalvo,
        setor: filtros.setor,
        fonte_recurso: filtros.fonte_recurso,
        meta: filtros.meta,
        atividade: filtros.atividade,
        rubrica: filtros.rubrica,
        status_contrato: filtros.status_contrato.length > 0 ? filtros.status_contrato.join(',') : null,
        tipo_contrato: filtros.tipo_contrato.length > 0 ? filtros.tipo_contrato.join(',') : null,
        data_inicio_de: filtros.data_inicio_de ? filtros.data_inicio_de.toISOString().split('T')[0] : null,
        data_inicio_ate: filtros.data_inicio_ate ? filtros.data_inicio_ate.toISOString().split('T')[0] : null,
        data_fim_de: filtros.data_fim_de ? filtros.data_fim_de.toISOString().split('T')[0] : null,
        data_fim_ate: filtros.data_fim_ate ? filtros.data_fim_ate.toISOString().split('T')[0] : null,
        valor_minimo: filtros.valor_minimo || null,
        valor_maximo: filtros.valor_maximo || null,
        texto_busca: filtros.texto_busca,
        ordenacao: filtros.ordenacao,
        itens_por_pagina: pageSize
      };
      
      const response = await axios.post(`${API_URL}/filtros-salvos/`, filtroData);
      
      // Adicionar novo filtro à lista
      setFiltrosSalvos(prev => [...prev, response.data]);
      
      setSnackbar({
        open: true,
        message: 'Filtro salvo com sucesso!',
        severity: 'success'
      });
      
      handleCloseSalvarFiltroDialog();
    } catch (error) {
      console.error('Erro ao salvar filtro:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao salvar filtro. Por favor, tente novamente.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Excluir filtro salvo
  const handleExcluirFiltroSalvo = async (filtroId) => {
    if (!window.confirm('Tem certeza que deseja excluir este filtro salvo?')) {
      return;
    }
    
    setLoading(true);
    
    try {
      await axios.delete(`${API_URL}/filtros-salvos/${filtroId}/`);
      
      // Remover filtro da lista
      setFiltrosSalvos(prev => prev.filter(f => f.id !== filtroId));
      
      setSnackbar({
        open: true,
        message: 'Filtro excluído com sucesso!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Erro ao excluir filtro:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao excluir filtro. Por favor, tente novamente.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Abrir diálogo de configuração de acompanhamento
  const handleOpenConfigAcompDialog = (contrato) => {
    setSelectedContrato(contrato);
    
    // Verificar se já existe acompanhamento para este contrato
    const acompExistente = acompanhamentos[contrato.id];
    
    if (acompExistente) {
      setConfigAcomp({
        notificar_mudanca_status: acompExistente.notificar_mudanca_status,
        notificar_pagamentos: acompExistente.notificar_pagamentos,
        notificar_prazos: acompExistente.notificar_prazos,
        notificar_por_email: acompExistente.notificar_por_email,
        notas_pessoais: acompExistente.notas_pessoais || ''
      });
    } else {
      setConfigAcomp({
        notificar_mudanca_status: true,
        notificar_pagamentos: true,
        notificar_prazos: true,
        notificar_por_email: false,
        notas_pessoais: ''
      });
    }
    
    setOpenConfigAcompDialog(true);
  };
  
  // Fechar diálogo de configuração de acompanhamento
  const handleCloseConfigAcompDialog = () => {
    setOpenConfigAcompDialog(false);
  };
  
  // Lidar com mudanças na configuração de acompanhamento
  const handleConfigAcompChange = (e) => {
    const { name, value, checked } = e.target;
    const newValue = e.target.type === 'checkbox' ? checked : value;
    setConfigAcomp(prev => ({ ...prev, [name]: newValue }));
  };
  
  // Salvar configuração de acompanhamento
  const handleSalvarAcompanhamento = async () => {
    setLoading(true);
    
    try {
      const acompExistente = acompanhamentos[selectedContrato.id];
      
      if (acompExistente) {
        // Atualizar acompanhamento existente
        const response = await axios.patch(
          `${API_URL}/acompanhamentos/${acompExistente.id}/`,
          configAcomp
        );
        
        // Atualizar na lista de acompanhamentos
        setAcompanhamentos(prev => ({
          ...prev,
          [selectedContrato.id]: response.data
        }));
        
        setSnackbar({
          open: true,
          message: 'Configurações de acompanhamento atualizadas com sucesso!',
          severity: 'success'
        });
      } else {
        // Criar novo acompanhamento
        const response = await axios.post(
          `${API_URL}/acompanhamentos/`,
          {
            ...configAcomp,
            contrato: selectedContrato.id
          }
        );
        
        // Adicionar à lista de acompanhamentos
        setAcompanhamentos(prev => ({
          ...prev,
          [selectedContrato.id]: response.data
        }));
        
        setSnackbar({
          open: true,
          message: 'Contrato adicionado aos acompanhamentos com sucesso!',
          severity: 'success'
        });
      }
      
      handleCloseConfigAcompDialog();
    } catch (error) {
      console.error('Erro ao salvar acompanhamento:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao salvar acompanhamento. Por favor, tente novamente.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Remover acompanhamento
  const handleRemoverAcompanhamento = async (contratoId) => {
    if (!window.confirm('Tem certeza que deseja remover este contrato dos seus acompanhamentos?')) {
      return;
    }
    
    setLoading(true);
    
    try {
      const acompExistente = acompanhamentos[contratoId];
      
      if (acompExistente) {
        await axios.delete(`${API_URL}/acompanhamentos/${acompExistente.id}/`);
        
        // Remover da lista de acompanhamentos
        const newAcompanhamentos = { ...acompanhamentos };
        delete newAcompanhamentos[contratoId];
        setAcompanhamentos(newAcompanhamentos);
        
        setSnackbar({
          open: true,
          message: 'Contrato removido dos acompanhamentos com sucesso!',
          severity: 'success'
        });
      }
    } catch (error) {
      console.error('Erro ao remover acompanhamento:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao remover acompanhamento. Por favor, tente novamente.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Exportar resultados
  const handleExportarResultados = async () => {
    setLoading(true);
    
    try {
      // Preparar parâmetros de filtro
      const params = {
        format: 'xlsx',
        ...filtros
      };
      
      // Converter arrays para strings
      if (params.status_contrato && params.status_contrato.length > 0) {
        params.status_contrato = params.status_contrato.join(',');
      }
      if (params.tipo_contrato && params.tipo_contrato.length > 0) {
        params.tipo_contrato = params.tipo_contrato.join(',');
      }
      
      // Converter datas para strings
      if (params.data_inicio_de) params.data_inicio_de = params.data_inicio_de.toISOString().split('T')[0];
      if (params.data_inicio_ate) params.data_inicio_ate = params.data_inicio_ate.toISOString().split('T')[0];
      if (params.data_fim_de) params.data_fim_de = params.data_fim_de.toISOString().split('T')[0];
      if (params.data_fim_ate) params.data_fim_ate = params.data_fim_ate.toISOString().split('T')[0];
      
      const response = await axios.get(`${API_URL}/contratos/exportar/`, {
        params,
        responseType: 'blob'
      });
      
      // Criar URL para o blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      
      // Criar link para download
      const link = document.createElement('a');
      link.href = url;
      
      // Nome do arquivo
      const fileName = `contratos_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      
      // Limpar
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setSnackbar({
        open: true,
        message: 'Exportação concluída com sucesso!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Erro ao exportar resultados:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao exportar resultados. Por favor, tente novamente.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Fechar snackbar
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };
  
  // Função para formatar valores monetários
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  
  // Função para formatar datas
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };
  
  // Função para obter a cor do chip de status
  const getStatusColor = (status) => {
    switch (status) {
      case 'em_elaboracao':
        return { bg: '#e3f2fd', color: '#1976d2' };
      case 'assinado':
        return { bg: '#e8f5e9', color: '#2e7d32' };
      case 'em_execucao':
        return { bg: '#e0f7fa', color: '#0097a7' };
      case 'concluido':
        return { bg: '#e8f5e9', color: '#2e7d32' };
      case 'cancelado':
        return { bg: '#ffebee', color: '#c62828' };
      case 'suspenso':
        return { bg: '#fff8e1', color: '#f57f17' };
      case 'atrasado':
        return { bg: '#fff8e1', color: '#f57f17' };
      case 'inadimplente':
        return { bg: '#ffebee', color: '#c62828' };
      case 'finalizado_com_pendencias':
        return { bg: '#fce4ec', color: '#c2185b' };
      default:
        return { bg: '#f5f5f5', color: '#757575' };
    }
  };
  
  // Função para formatar o status
  const formatStatus = (status) => {
    switch (status) {
      case 'em_elaboracao':
        return 'Em Elaboração';
      case 'assinado':
        return 'Assinado';
      case 'em_execucao':
        return 'Em Execução';
      case 'concluido':
        return 'Concluído';
      case 'cancelado':
        return 'Cancelado';
      case 'suspenso':
        return 'Suspenso';
      case 'atrasado':
        return 'Atrasado';
      case 'inadimplente':
        return 'Inadimplente';
      case 'finalizado_com_pendencias':
        return 'Finalizado com Pendências';
      default:
        return status;
    }
  };
  
  // Colunas para o DataGrid
  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'nome_curso_acao', headerName: 'Nome/Título', width: 250 },
    { 
      field: 'tipo', 
      headerName: 'Tipo', 
      width: 120,
      valueFormatter: (params) => {
        switch (params.value) {
          case 'bolsa': return 'Bolsa';
          case 'servico': return 'Serviço';
          case 'aquisicao': return 'Aquisição';
          case 'outros': return 'Outros';
          default: return params.value;
        }
      }
    },
    { 
      field: 'setor', 
      headerName: 'Setor', 
      width: 150,
      valueGetter: (params) => params.row.setor?.nome || ''
    },
    { 
      field: 'data_inicio', 
      headerName: 'Início', 
      width: 110,
      valueFormatter: (params) => formatDate(params.value)
    },
    { 
      field: 'data_fim', 
      headerName: 'Término', 
      width: 110,
      valueFormatter: (params) => formatDate(params.value)
    },
    { 
      field: 'valor_total', 
      headerName: 'Valor Total', 
      width: 130,
      valueFormatter: (params) => formatCurrency(params.value)
    },
    { 
      field: 'total_pago', 
      headerName: 'Total Pago', 
      width: 130,
      valueFormatter: (params) => formatCurrency(params.value)
    },
    { 
      field: 'status_contrato', 
      headerName: 'Status', 
      width: 200,
      renderCell: (params) => {
        const { bg, color } = getStatusColor(params.value);
        return (
          <Chip
            label={formatStatus(params.value)}
            sx={{ 
              backgroundColor: bg, 
              color: color
            }}
          />
        );
      }
    },
    {
      field: 'actions',
      headerName: 'Ações',
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Ver Detalhes">
            <IconButton 
              color="primary" 
              onClick={() => window.location.href = `/contratos/${params.row.id}`}
              size="small"
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          {acompanhamentos[params.row.id] ? (
            <Tooltip title="Configurar Acompanhamento">
              <IconButton 
                color="secondary" 
                onClick={() => handleOpenConfigAcompDialog(params.row)}
                size="small"
              >
                <NotificationsActiveIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title="Adicionar aos Acompanhamentos">
              <IconButton 
                onClick={() => handleOpenConfigAcompDialog(params.row)}
                size="small"
              >
                <BookmarkBorderIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      )
    }
  ];
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Busca Avançada e Acompanhamento
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">
            Filtros Avançados
          </Typography>
          
          <Box>
            <Button
              variant="outlined"
              color="primary"
              onClick={handleOpenSalvarFiltroDialog}
              startIcon={<SaveIcon />}
              sx={{ mr: 1 }}
              disabled={loading}
            >
              Salvar Filtro
            </Button>
            
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleLimparFiltros}
              sx={{ mr: 1 }}
              disabled={loading}
            >
              Limpar
            </Button>
            
            <Button
              variant="contained"
              color="primary"
              onClick={buscarContratos}
              startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
              disabled={loading}
            >
              Buscar
            </Button>
          </Box>
        </Box>
        
        <Accordion defaultExpanded>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="filtros-salvos-content"
            id="filtros-salvos-header"
          >
            <Typography>Filtros Salvos</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {filtrosSalvos.length === 0 ? (
              <Typography variant="body2" color="textSecondary">
                Nenhum filtro salvo. Utilize o botão "Salvar Filtro" para criar um novo.
              </Typography>
            ) : (
              <Grid container spacing={2}>
                {filtrosSalvos.map(filtro => (
                  <Grid item xs={12} sm={6} md={4} key={filtro.id}>
                    <Paper 
                      elevation={3} 
                      sx={{ 
                        p: 2, 
                        display: 'flex', 
                        flexDirection: 'column',
                        height: '100%'
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {filtro.nome}
                        </Typography>
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleExcluirFiltroSalvo(filtro.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      
                      {filtro.descricao && (
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                          {filtro.descricao}
                        </Typography>
                      )}
                      
                      <Box sx={{ flexGrow: 1 }}>
                        {filtro.setor && (
                          <Typography variant="body2" sx={{ mb: 0.5 }}>
                            <strong>Setor:</strong> {filtro.setor}
                          </Typography>
                        )}
                        
                        {filtro.fonte_recurso && (
                          <Typography variant="body2" sx={{ mb: 0.5 }}>
                            <strong>Fonte:</strong> {filtro.fonte_recurso}
                          </Typography>
                        )}
                        
                        {filtro.status_contrato && (
                          <Typography variant="body2" sx={{ mb: 0.5 }}>
                            <strong>Status:</strong> {filtro.status_contrato.split(',').map(s => formatStatus(s)).join(', ')}
                          </Typography>
                        )}
                      </Box>
                      
                      <Button 
                        variant="contained" 
                        color="primary"
                        size="small"
                        onClick={() => handleAplicarFiltroSalvo(filtro)}
                        sx={{ mt: 2, alignSelf: 'flex-end' }}
                      >
                        Aplicar
                      </Button>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            )}
          </AccordionDetails>
        </Accordion>
        
        <Accordion defaultExpanded>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="filtros-content"
            id="filtros-header"
          >
            <Typography>Filtros de Busca</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Busca por texto"
                  name="texto_busca"
                  value={filtros.texto_busca}
                  onChange={handleFiltroChange}
                  placeholder="Buscar por nome, responsável, etc."
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth>
                  <InputLabel id="setor-label">Setor</InputLabel>
                  <Select
                    labelId="setor-label"
                    name="setor"
                    value={filtros.setor}
                    onChange={handleFiltroChange}
                    label="Setor"
                  >
                    <MenuItem value="">Todos</MenuItem>
                    {dadosSelects.setores.map(setor => (
                      <MenuItem key={setor.id} value={setor.id}>
                        {setor.nome}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth>
                  <InputLabel id="fonte-recurso-label">Fonte de Recurso</InputLabel>
                  <Select
                    labelId="fonte-recurso-label"
                    name="fonte_recurso"
                    value={filtros.fonte_recurso}
                    onChange={handleFiltroChange}
                    label="Fonte de Recurso"
                  >
                    <MenuItem value="">Todas</MenuItem>
                    {dadosSelects.fontes_recursos.map(fonte => (
                      <MenuItem key={fonte.id} value={fonte.id}>
                        {fonte.nome}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth>
                  <InputLabel id="meta-label">Meta</InputLabel>
                  <Select
                    labelId="meta-label"
                    name="meta"
                    value={filtros.meta}
                    onChange={handleFiltroChange}
                    label="Meta"
                  >
                    <MenuItem value="">Todas</MenuItem>
                    {dadosSelects.metas.map(meta => (
                      <MenuItem key={meta.id} value={meta.id}>
                        {meta.nome}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth>
                  <InputLabel id="atividade-label">Atividade</InputLabel>
                  <Select
                    labelId="atividade-label"
                    name="atividade"
                    value={filtros.atividade}
                    onChange={handleFiltroChange}
                    label="Atividade"
                  >
                    <MenuItem value="">Todas</MenuItem>
                    {dadosSelects.atividades.map(atividade => (
                      <MenuItem key={atividade.id} value={atividade.id}>
                        {atividade.nome}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth>
                  <InputLabel id="rubrica-label">Rubrica</InputLabel>
                  <Select
                    labelId="rubrica-label"
                    name="rubrica"
                    value={filtros.rubrica}
                    onChange={handleFiltroChange}
                    label="Rubrica"
                  >
                    <MenuItem value="">Todas</MenuItem>
                    {dadosSelects.rubricas.map(rubrica => (
                      <MenuItem key={rubrica.id} value={rubrica.id}>
                        {rubrica.nome}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth>
                  <InputLabel id="status-contrato-label">Status do Contrato</InputLabel>
                  <Select
                    labelId="status-contrato-label"
                    name="status_contrato"
                    multiple
                    value={filtros.status_contrato}
                    onChange={handleMultiSelectChange}
                    label="Status do Contrato"
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip 
                            key={value} 
                            label={formatStatus(value)} 
                            size="small"
                            sx={{ 
                              backgroundColor: getStatusColor(value).bg, 
                              color: getStatusColor(value).color
                            }}
                          />
                        ))}
                      </Box>
                    )}
                  >
                    <MenuItem value="em_elaboracao">Em Elaboração</MenuItem>
                    <MenuItem value="assinado">Assinado</MenuItem>
                    <MenuItem value="em_execucao">Em Execução</MenuItem>
                    <MenuItem value="concluido">Concluído</MenuItem>
                    <MenuItem value="cancelado">Cancelado</MenuItem>
                    <MenuItem value="suspenso">Suspenso</MenuItem>
                    <MenuItem value="atrasado">Atrasado</MenuItem>
                    <MenuItem value="inadimplente">Inadimplente</MenuItem>
                    <MenuItem value="finalizado_com_pendencias">Finalizado com Pendências</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth>
                  <InputLabel id="tipo-contrato-label">Tipo de Contrato</InputLabel>
                  <Select
                    labelId="tipo-contrato-label"
                    name="tipo_contrato"
                    multiple
                    value={filtros.tipo_contrato}
                    onChange={handleMultiSelectChange}
                    label="Tipo de Contrato"
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip 
                            key={value} 
                            label={value === 'bolsa' ? 'Bolsa' : 
                                   value === 'servico' ? 'Serviço' : 
                                   value === 'aquisicao' ? 'Aquisição' : 'Outros'} 
                            size="small"
                          />
                        ))}
                      </Box>
                    )}
                  >
                    <MenuItem value="bolsa">Bolsa</MenuItem>
                    <MenuItem value="servico">Serviço</MenuItem>
                    <MenuItem value="aquisicao">Aquisição</MenuItem>
                    <MenuItem value="outros">Outros</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth>
                  <InputLabel id="ordenacao-label">Ordenação</InputLabel>
                  <Select
                    labelId="ordenacao-label"
                    name="ordenacao"
                    value={filtros.ordenacao}
                    onChange={handleFiltroChange}
                    label="Ordenação"
                  >
                    <MenuItem value="-data_inicio">Data de Início (mais recente)</MenuItem>
                    <MenuItem value="data_inicio">Data de Início (mais antiga)</MenuItem>
                    <MenuItem value="-data_fim">Data de Término (mais recente)</MenuItem>
                    <MenuItem value="data_fim">Data de Término (mais antiga)</MenuItem>
                    <MenuItem value="-valor_total">Valor Total (maior)</MenuItem>
                    <MenuItem value="valor_total">Valor Total (menor)</MenuItem>
                    <MenuItem value="nome_curso_acao">Nome (A-Z)</MenuItem>
                    <MenuItem value="-nome_curso_acao">Nome (Z-A)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                  <DatePicker
                    label="Data Início (De)"
                    value={filtros.data_inicio_de}
                    onChange={(date) => handleDateChange('data_inicio_de', date)}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                  <DatePicker
                    label="Data Início (Até)"
                    value={filtros.data_inicio_ate}
                    onChange={(date) => handleDateChange('data_inicio_ate', date)}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                  <DatePicker
                    label="Data Término (De)"
                    value={filtros.data_fim_de}
                    onChange={(date) => handleDateChange('data_fim_de', date)}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                  <DatePicker
                    label="Data Término (Até)"
                    value={filtros.data_fim_ate}
                    onChange={(date) => handleDateChange('data_fim_ate', date)}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Valor Mínimo"
                  name="valor_minimo"
                  value={filtros.valor_minimo}
                  onChange={handleFiltroChange}
                  type="number"
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>R$</Typography>
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Valor Máximo"
                  name="valor_maximo"
                  value={filtros.valor_maximo}
                  onChange={handleFiltroChange}
                  type="number"
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>R$</Typography>
                  }}
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
        
        <Box sx={{ mt: 3, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Resultados ({totalContratos})
          </Typography>
          
          <Button
            variant="outlined"
            color="primary"
            onClick={handleExportarResultados}
            startIcon={<GetAppIcon />}
            disabled={loading || contratos.length === 0}
          >
            Exportar Resultados
          </Button>
        </Box>
        
        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={contratos}
            columns={columns}
            pagination
            pageSize={pageSize}
            rowsPerPageOptions={[10, 25, 50, 100]}
            rowCount={totalContratos}
            paginationMode="server"
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            page={page}
            loading={loading}
            disableSelectionOnClick
          />
        </Box>
      </Paper>
      
      {/* Diálogo para salvar filtro */}
      <Dialog open={openSalvarFiltroDialog} onClose={handleCloseSalvarFiltroDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Salvar Filtro
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Nome do Filtro"
              name="nome"
              value={filtroSalvo.nome}
              onChange={handleFiltroSalvoChange}
              margin="normal"
              required
            />
            
            <TextField
              fullWidth
              label="Descrição (opcional)"
              name="descricao"
              value={filtroSalvo.descricao}
              onChange={handleFiltroSalvoChange}
              margin="normal"
              multiline
              rows={2}
            />
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseSalvarFiltroDialog} disabled={loading}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSalvarFiltro} 
            variant="contained" 
            color="primary"
            disabled={loading || !filtroSalvo.nome}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Diálogo para configuração de acompanhamento */}
      <Dialog open={openConfigAcompDialog} onClose={handleCloseConfigAcompDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {acompanhamentos[selectedContrato?.id] ? 'Configurar Acompanhamento' : 'Adicionar aos Acompanhamentos'}
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            {selectedContrato && (
              <>
                <Typography variant="subtitle1" gutterBottom>
                  Contrato: {selectedContrato.nome_curso_acao}
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle1" gutterBottom>
                  Configurações de Notificação
                </Typography>
                
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={configAcomp.notificar_mudanca_status}
                      onChange={handleConfigAcompChange}
                      name="notificar_mudanca_status"
                    />
                  }
                  label="Notificar mudanças de status"
                />
                
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={configAcomp.notificar_pagamentos}
                      onChange={handleConfigAcompChange}
                      name="notificar_pagamentos"
                    />
                  }
                  label="Notificar pagamentos"
                />
                
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={configAcomp.notificar_prazos}
                      onChange={handleConfigAcompChange}
                      name="notificar_prazos"
                    />
                  }
                  label="Notificar prazos"
                />
                
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={configAcomp.notificar_por_email}
                      onChange={handleConfigAcompChange}
                      name="notificar_por_email"
                    />
                  }
                  label="Receber notificações por e-mail"
                />
                
                <TextField
                  fullWidth
                  label="Notas Pessoais"
                  name="notas_pessoais"
                  value={configAcomp.notas_pessoais}
                  onChange={handleConfigAcompChange}
                  margin="normal"
                  multiline
                  rows={3}
                />
                
                {acompanhamentos[selectedContrato.id] && (
                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => {
                        handleCloseConfigAcompDialog();
                        handleRemoverAcompanhamento(selectedContrato.id);
                      }}
                    >
                      Remover dos Acompanhamentos
                    </Button>
                  </Box>
                )}
              </>
            )}
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseConfigAcompDialog} disabled={loading}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSalvarAcompanhamento} 
            variant="contained" 
            color="primary"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar para mensagens */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BuscaAvancada;
