import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Grid, 
  Typography, 
  Paper, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';

const TemplateManager = () => {
  const { API_URL } = useAuth();
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    tipo: 'contrato',
    descricao: '',
    conteudo: '',
    ativo: true
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Carregar templates
  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_URL}/documentos/templates/`);
        setTemplates(response.data);
      } catch (error) {
        console.error('Erro ao carregar templates:', error);
        setSnackbar({
          open: true,
          message: 'Erro ao carregar templates. Por favor, tente novamente.',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchTemplates();
  }, [API_URL]);
  
  // Abrir diálogo para adicionar/editar template
  const handleOpenDialog = (template = null) => {
    if (template) {
      setEditingTemplate(template);
      setFormData({
        nome: template.nome,
        tipo: template.tipo,
        descricao: template.descricao,
        conteudo: template.conteudo,
        ativo: template.ativo
      });
    } else {
      setEditingTemplate(null);
      setFormData({
        nome: '',
        tipo: 'contrato',
        descricao: '',
        conteudo: '',
        ativo: true
      });
    }
    
    setOpenDialog(true);
  };
  
  // Fechar diálogo
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  
  // Lidar com mudanças nos campos
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Salvar template
  const handleSaveTemplate = async () => {
    setLoading(true);
    
    try {
      let response;
      
      if (editingTemplate) {
        // Atualizar template existente
        response = await axios.put(
          `${API_URL}/documentos/templates/${editingTemplate.id}/`,
          formData
        );
        
        // Atualizar lista de templates
        setTemplates(prev => 
          prev.map(t => t.id === editingTemplate.id ? response.data : t)
        );
        
        setSnackbar({
          open: true,
          message: 'Template atualizado com sucesso!',
          severity: 'success'
        });
      } else {
        // Criar novo template
        response = await axios.post(
          `${API_URL}/documentos/templates/`,
          formData
        );
        
        // Adicionar à lista de templates
        setTemplates(prev => [...prev, response.data]);
        
        setSnackbar({
          open: true,
          message: 'Template criado com sucesso!',
          severity: 'success'
        });
      }
      
      handleCloseDialog();
    } catch (error) {
      console.error('Erro ao salvar template:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao salvar template. Por favor, tente novamente.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Excluir template
  const handleDeleteTemplate = async (template) => {
    if (!window.confirm(`Tem certeza que deseja excluir o template "${template.nome}"?`)) {
      return;
    }
    
    setLoading(true);
    
    try {
      await axios.delete(`${API_URL}/documentos/templates/${template.id}/`);
      
      // Remover da lista de templates
      setTemplates(prev => prev.filter(t => t.id !== template.id));
      
      setSnackbar({
        open: true,
        message: 'Template excluído com sucesso!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Erro ao excluir template:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao excluir template. Por favor, tente novamente.',
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
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Gerenciamento de Templates
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">
            Templates Disponíveis
          </Typography>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            disabled={loading}
          >
            Novo Template
          </Button>
        </Box>
        
        {loading && templates.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : templates.length === 0 ? (
          <Typography variant="body1" align="center" sx={{ p: 3 }}>
            Nenhum template encontrado. Clique em "Novo Template" para adicionar.
          </Typography>
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '12px 8px', borderBottom: '1px solid #ddd' }}>Nome</th>
                  <th style={{ textAlign: 'left', padding: '12px 8px', borderBottom: '1px solid #ddd' }}>Tipo</th>
                  <th style={{ textAlign: 'left', padding: '12px 8px', borderBottom: '1px solid #ddd' }}>Descrição</th>
                  <th style={{ textAlign: 'center', padding: '12px 8px', borderBottom: '1px solid #ddd' }}>Status</th>
                  <th style={{ textAlign: 'center', padding: '12px 8px', borderBottom: '1px solid #ddd' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {templates.map(template => (
                  <tr key={template.id}>
                    <td style={{ padding: '12px 8px', borderBottom: '1px solid #ddd' }}>
                      {template.nome}
                    </td>
                    <td style={{ padding: '12px 8px', borderBottom: '1px solid #ddd' }}>
                      {template.tipo === 'contrato' ? 'Contrato' : 'Ficha'}
                    </td>
                    <td style={{ padding: '12px 8px', borderBottom: '1px solid #ddd' }}>
                      {template.descricao}
                    </td>
                    <td style={{ textAlign: 'center', padding: '12px 8px', borderBottom: '1px solid #ddd' }}>
                      <span
                        style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          backgroundColor: template.ativo ? '#e6f7e6' : '#ffebee',
                          color: template.ativo ? '#2e7d32' : '#c62828'
                        }}
                      >
                        {template.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center', padding: '12px 8px', borderBottom: '1px solid #ddd' }}>
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenDialog(template)}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteTemplate(template)}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        )}
      </Paper>
      
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Variáveis Disponíveis
        </Typography>
        
        <Typography variant="body1" paragraph>
          Ao criar ou editar templates, você pode usar as seguintes variáveis que serão substituídas pelos dados reais:
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              Variáveis para Bolsistas:
            </Typography>
            
            <ul>
              <li><code>{{bolsista.nome}}</code> - Nome completo do bolsista</li>
              <li><code>{{bolsista.cpf}}</code> - CPF do bolsista</li>
              <li><code>{{bolsista.email}}</code> - Email do bolsista</li>
              <li><code>{{bolsista.telefone}}</code> - Telefone do bolsista</li>
              <li><code>{{bolsista.endereco}}</code> - Endereço completo</li>
              <li><code>{{bolsista.banco}}</code> - Banco</li>
              <li><code>{{bolsista.agencia}}</code> - Agência bancária</li>
              <li><code>{{bolsista.conta}}</code> - Conta bancária</li>
            </ul>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              Variáveis para Contratos:
            </Typography>
            
            <ul>
              <li><code>{{contrato.nome}}</code> - Nome/título do contrato</li>
              <li><code>{{contrato.valor}}</code> - Valor total do contrato</li>
              <li><code>{{contrato.valor_extenso}}</code> - Valor por extenso</li>
              <li><code>{{contrato.data_inicio}}</code> - Data de início</li>
              <li><code>{{contrato.data_fim}}</code> - Data de término</li>
              <li><code>{{contrato.setor}}</code> - Setor responsável</li>
              <li><code>{{contrato.responsavel}}</code> - Nome do responsável</li>
              <li><code>{{contrato.parcelas}}</code> - Número de parcelas</li>
              <li><code>{{contrato.valor_parcela}}</code> - Valor de cada parcela</li>
            </ul>
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Variáveis Gerais:
            </Typography>
            
            <ul>
              <li><code>{{data_atual}}</code> - Data atual no formato DD/MM/AAAA</li>
              <li><code>{{hora_atual}}</code> - Hora atual no formato HH:MM</li>
              <li><code>{{usuario}}</code> - Nome do usuário que está gerando o documento</li>
            </ul>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Diálogo para adicionar/editar template */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingTemplate ? 'Editar Template' : 'Novo Template'}
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={8}>
                <TextField
                  fullWidth
                  label="Nome do Template"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  margin="normal"
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="tipo-label">Tipo de Documento</InputLabel>
                  <Select
                    labelId="tipo-label"
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleChange}
                    label="Tipo de Documento"
                  >
                    <MenuItem value="contrato">Contrato</MenuItem>
                    <MenuItem value="ficha">Ficha</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Descrição"
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleChange}
                  margin="normal"
                  multiline
                  rows={2}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Conteúdo do Template"
                  name="conteudo"
                  value={formData.conteudo}
                  onChange={handleChange}
                  margin="normal"
                  multiline
                  rows={15}
                  required
                  placeholder="Digite o conteúdo do template aqui. Use as variáveis disponíveis para inserir dados dinâmicos."
                  helperText="Use as variáveis listadas na seção 'Variáveis Disponíveis' para inserir dados dinâmicos."
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="ativo-label">Status</InputLabel>
                  <Select
                    labelId="ativo-label"
                    name="ativo"
                    value={formData.ativo}
                    onChange={handleChange}
                    label="Status"
                  >
                    <MenuItem value={true}>Ativo</MenuItem>
                    <MenuItem value={false}>Inativo</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={loading}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSaveTemplate} 
            variant="contained" 
            color="primary"
            disabled={!formData.nome || !formData.conteudo || loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Salvando...' : 'Salvar'}
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

export default TemplateManager;
