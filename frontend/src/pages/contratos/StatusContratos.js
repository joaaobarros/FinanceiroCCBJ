import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Button, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  Divider,
  Alert,
  Snackbar,
  CircularProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import InfoIcon from '@mui/icons-material/Info';
import HistoryIcon from '@mui/icons-material/History';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const StatusContratos = () => {
  const { API_URL, currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [contratos, setContratos] = useState([]);
  const [selectedContrato, setSelectedContrato] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openHistoricoDialog, setOpenHistoricoDialog] = useState(false);
  const [historicoStatus, setHistoricoStatus] = useState([]);
  const [formData, setFormData] = useState({
    status_contrato: '',
    motivo_alteracao_status: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Carregar contratos
  useEffect(() => {
    const fetchContratos = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_URL}/contratos/`);
        setContratos(response.data);
      } catch (error) {
        console.error('Erro ao carregar contratos:', error);
        setSnackbar({
          open: true,
          message: 'Erro ao carregar contratos. Por favor, tente novamente.',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchContratos();
  }, [API_URL]);
  
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
  
  // Função para obter o ícone do status
  const getStatusIcon = (status) => {
    switch (status) {
      case 'em_elaboracao':
        return <HourglassEmptyIcon fontSize="small" />;
      case 'assinado':
        return <CheckCircleIcon fontSize="small" />;
      case 'em_execucao':
        return <InfoIcon fontSize="small" />;
      case 'concluido':
        return <CheckCircleIcon fontSize="small" />;
      case 'cancelado':
        return <CancelIcon fontSize="small" />;
      case 'suspenso':
        return <PauseCircleIcon fontSize="small" />;
      case 'atrasado':
        return <WarningIcon fontSize="small" />;
      case 'inadimplente':
        return <ErrorIcon fontSize="small" />;
      case 'finalizado_com_pendencias':
        return <WarningIcon fontSize="small" />;
      default:
        return <InfoIcon fontSize="small" />;
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
  
  // Abrir diálogo para alterar status
  const handleOpenDialog = (contrato) => {
    setSelectedContrato(contrato);
    setFormData({
      status_contrato: contrato.status_contrato,
      motivo_alteracao_status: ''
    });
    setOpenDialog(true);
  };
  
  // Fechar diálogo
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  
  // Abrir diálogo de histórico
  const handleOpenHistoricoDialog = async (contrato) => {
    setSelectedContrato(contrato);
    setLoading(true);
    
    try {
      const response = await axios.get(`${API_URL}/contratos/${contrato.id}/historico-status/`);
      setHistoricoStatus(response.data);
    } catch (error) {
      console.error('Erro ao carregar histórico de status:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao carregar histórico de status. Por favor, tente novamente.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
    
    setOpenHistoricoDialog(true);
  };
  
  // Fechar diálogo de histórico
  const handleCloseHistoricoDialog = () => {
    setOpenHistoricoDialog(false);
  };
  
  // Lidar com mudanças nos campos
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Salvar alteração de status
  const handleSaveStatus = async () => {
    if (!formData.motivo_alteracao_status && formData.status_contrato !== selectedContrato.status_contrato) {
      setSnackbar({
        open: true,
        message: 'Por favor, informe o motivo da alteração de status.',
        severity: 'error'
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await axios.patch(
        `${API_URL}/contratos/${selectedContrato.id}/`,
        {
          status_contrato: formData.status_contrato,
          motivo_alteracao_status: formData.motivo_alteracao_status
        }
      );
      
      // Atualizar lista de contratos
      setContratos(prev => 
        prev.map(c => c.id === selectedContrato.id ? response.data : c)
      );
      
      setSnackbar({
        open: true,
        message: 'Status do contrato atualizado com sucesso!',
        severity: 'success'
      });
      
      handleCloseDialog();
    } catch (error) {
      console.error('Erro ao atualizar status do contrato:', error);
      
      let errorMessage = 'Erro ao atualizar status do contrato. Por favor, tente novamente.';
      
      if (error.response && error.response.data) {
        if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.response.data.non_field_errors) {
          errorMessage = error.response.data.non_field_errors[0];
        }
      }
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Verificar status automático de todos os contratos
  const handleVerificarStatusAutomatico = async () => {
    setLoading(true);
    
    try {
      const response = await axios.post(`${API_URL}/contratos/verificar-status/`);
      
      // Atualizar lista de contratos
      setContratos(response.data.contratos);
      
      setSnackbar({
        open: true,
        message: `Verificação concluída! ${response.data.atualizados} contratos foram atualizados.`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Erro ao verificar status dos contratos:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao verificar status dos contratos. Por favor, tente novamente.',
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
            icon={getStatusIcon(params.value)}
            label={formatStatus(params.value)}
            sx={{ 
              backgroundColor: bg, 
              color: color,
              '& .MuiChip-icon': { color }
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
          <Tooltip title="Alterar Status">
            <IconButton 
              color="primary" 
              onClick={() => handleOpenDialog(params.row)}
              size="small"
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Histórico de Status">
            <IconButton 
              color="secondary" 
              onClick={() => handleOpenHistoricoDialog(params.row)}
              size="small"
            >
              <HistoryIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Gestão de Status de Contratos
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">
            Controle de Status de Contratos
          </Typography>
          
          <Button
            variant="contained"
            color="primary"
            onClick={handleVerificarStatusAutomatico}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            Verificar Status Automático
          </Button>
        </Box>
        
        <Typography variant="body1" paragraph>
          Esta tela permite gerenciar o status dos contratos, com validações inteligentes que garantem o bom acompanhamento de cada contrato.
          Você pode alterar manualmente o status de um contrato ou utilizar a verificação automática para atualizar todos os contratos de acordo com as regras de negócio.
        </Typography>
        
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 2, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                bgcolor: '#e3f2fd'
              }}
            >
              <Typography variant="h6" gutterBottom>
                Em Elaboração/Assinado
              </Typography>
              <Typography variant="h4">
                {contratos.filter(c => ['em_elaboracao', 'assinado'].includes(c.status_contrato)).length}
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 2, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                bgcolor: '#e0f7fa'
              }}
            >
              <Typography variant="h6" gutterBottom>
                Em Execução
              </Typography>
              <Typography variant="h4">
                {contratos.filter(c => c.status_contrato === 'em_execucao').length}
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 2, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                bgcolor: '#fff8e1'
              }}
            >
              <Typography variant="h6" gutterBottom>
                Atrasados/Pendentes
              </Typography>
              <Typography variant="h4">
                {contratos.filter(c => ['atrasado', 'inadimplente', 'finalizado_com_pendencias'].includes(c.status_contrato)).length}
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 2, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                bgcolor: '#e8f5e9'
              }}
            >
              <Typography variant="h6" gutterBottom>
                Concluídos
              </Typography>
              <Typography variant="h4">
                {contratos.filter(c => c.status_contrato === 'concluido').length}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
        
        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={contratos}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            checkboxSelection={false}
            disableSelectionOnClick
            loading={loading}
          />
        </Box>
      </Paper>
      
      {/* Diálogo para alterar status */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Alterar Status do Contrato
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Typography variant="subtitle1" gutterBottom>
              Contrato: {selectedContrato?.nome_curso_acao}
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2">
                  <strong>Tipo:</strong> {selectedContrato?.tipo === 'bolsa' ? 'Bolsa' : 
                                         selectedContrato?.tipo === 'servico' ? 'Serviço' : 
                                         selectedContrato?.tipo === 'aquisicao' ? 'Aquisição' : 'Outros'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2">
                  <strong>Setor:</strong> {selectedContrato?.setor?.nome}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2">
                  <strong>Data Início:</strong> {formatDate(selectedContrato?.data_inicio)}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2">
                  <strong>Data Fim:</strong> {formatDate(selectedContrato?.data_fim)}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2">
                  <strong>Valor Total:</strong> {formatCurrency(selectedContrato?.valor_total)}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2">
                  <strong>Total Pago:</strong> {formatCurrency(selectedContrato?.total_pago)}
                </Typography>
              </Grid>
            </Grid>
            
            <Divider sx={{ my: 2 }} />
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="status-label">Status do Contrato</InputLabel>
              <Select
                labelId="status-label"
                name="status_contrato"
                value={formData.status_contrato}
                onChange={handleChange}
                label="Status do Contrato"
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
            
            <TextField
              fullWidth
              label="Motivo da Alteração"
              name="motivo_alteracao_status"
              value={formData.motivo_alteracao_status}
              onChange={handleChange}
              margin="normal"
              multiline
              rows={4}
              required={formData.status_contrato !== selectedContrato?.status_contrato}
              helperText={formData.status_contrato !== selectedContrato?.status_contrato ? 
                "Obrigatório informar o motivo da alteração de status" : ""}
            />
            
            {formData.status_contrato === 'concluido' && selectedContrato?.total_pago < selectedContrato?.valor_total && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                Atenção: Este contrato possui parcelas não pagas. Ao marcar como concluído, você está indicando que não haverá mais pagamentos.
              </Alert>
            )}
            
            {formData.status_contrato === 'em_execucao' && new Date(selectedContrato?.data_fim) < new Date() && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                Atenção: A data de término deste contrato já passou. Considere atualizar a data de término antes de alterar o status para Em Execução.
              </Alert>
            )}
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={loading}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSaveStatus} 
            variant="contained" 
            color="primary"
            disabled={loading || (formData.status_contrato !== selectedContrato?.status_contrato && !formData.motivo_alteracao_status)}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Diálogo para visualizar histórico de status */}
      <Dialog open={openHistoricoDialog} onClose={handleCloseHistoricoDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          Histórico de Status do Contrato
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Typography variant="subtitle1" gutterBottom>
              Contrato: {selectedContrato?.nome_curso_acao}
            </Typography>
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : historicoStatus.length === 0 ? (
              <Typography variant="body1" align="center" sx={{ p: 3 }}>
                Nenhum histórico de alteração de status encontrado.
              </Typography>
            ) : (
              <Box sx={{ mt: 2 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', padding: '12px 8px', borderBottom: '1px solid #ddd' }}>Data</th>
                      <th style={{ textAlign: 'left', padding: '12px 8px', borderBottom: '1px solid #ddd' }}>Status Anterior</th>
                      <th style={{ textAlign: 'left', padding: '12px 8px', borderBottom: '1px solid #ddd' }}>Novo Status</th>
                      <th style={{ textAlign: 'left', padding: '12px 8px', borderBottom: '1px solid #ddd' }}>Usuário</th>
                      <th style={{ textAlign: 'left', padding: '12px 8px', borderBottom: '1px solid #ddd' }}>Motivo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historicoStatus.map((historico, index) => (
                      <tr key={index}>
                        <td style={{ padding: '12px 8px', borderBottom: '1px solid #ddd' }}>
                          {new Date(historico.data_alteracao).toLocaleString('pt-BR')}
                        </td>
                        <td style={{ padding: '12px 8px', borderBottom: '1px solid #ddd' }}>
                          <Chip
                            size="small"
                            label={formatStatus(historico.status_anterior)}
                            sx={{ 
                              backgroundColor: getStatusColor(historico.status_anterior).bg, 
                              color: getStatusColor(historico.status_anterior).color
                            }}
                          />
                        </td>
                        <td style={{ padding: '12px 8px', borderBottom: '1px solid #ddd' }}>
                          <Chip
                            size="small"
                            label={formatStatus(historico.status_novo)}
                            sx={{ 
                              backgroundColor: getStatusColor(historico.status_novo).bg, 
                              color: getStatusColor(historico.status_novo).color
                            }}
                          />
                        </td>
                        <td style={{ padding: '12px 8px', borderBottom: '1px solid #ddd' }}>
                          {historico.usuario?.username || 'Sistema'}
                        </td>
                        <td style={{ padding: '12px 8px', borderBottom: '1px solid #ddd' }}>
                          {historico.motivo || 'Não informado'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            )}
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseHistoricoDialog}>
            Fechar
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

export default StatusContratos;
