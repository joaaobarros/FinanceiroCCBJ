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
  CircularProgress,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import PrintIcon from '@mui/icons-material/Print';

const PDFGenerator = () => {
  const { API_URL } = useAuth();
  const [loading, setLoading] = useState(false);
  const [gerando, setGerando] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [selectedEntity, setSelectedEntity] = useState(null);
  
  const [templates, setTemplates] = useState([]);
  const [bolsistas, setBolsistas] = useState([]);
  const [contratos, setContratos] = useState([]);
  
  const [documentType, setDocumentType] = useState('contrato');
  const [entityType, setEntityType] = useState('bolsista');
  
  // Carregar dados
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Carregar templates
        const templatesResponse = await axios.get(`${API_URL}/documentos/templates/`);
        setTemplates(templatesResponse.data);
        
        // Carregar bolsistas
        const bolsistasResponse = await axios.get(`${API_URL}/bolsistas/`);
        setBolsistas(bolsistasResponse.data);
        
        // Carregar contratos
        const contratosResponse = await axios.get(`${API_URL}/contratos/`);
        setContratos(contratosResponse.data);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setSnackbar({
          open: true,
          message: 'Erro ao carregar dados. Por favor, tente novamente.',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [API_URL]);
  
  // Filtrar templates por tipo de documento
  const filteredTemplates = templates.filter(template => 
    template.tipo === documentType
  );
  
  // Filtrar entidades por tipo
  const entities = entityType === 'bolsista' ? bolsistas : contratos;
  
  // Abrir diálogo para selecionar template
  const handleOpenDialog = () => {
    setOpenDialog(true);
  };
  
  // Fechar diálogo
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  
  // Alterar tipo de documento
  const handleDocumentTypeChange = (event) => {
    setDocumentType(event.target.value);
    setSelectedTemplate('');
  };
  
  // Alterar tipo de entidade
  const handleEntityTypeChange = (event) => {
    setEntityType(event.target.value);
    setSelectedEntity(null);
  };
  
  // Selecionar template
  const handleTemplateChange = (event) => {
    setSelectedTemplate(event.target.value);
  };
  
  // Selecionar entidade
  const handleEntityChange = (event) => {
    setSelectedEntity(event.target.value);
  };
  
  // Gerar PDF
  const handleGeneratePDF = async () => {
    if (!selectedTemplate || !selectedEntity) {
      setSnackbar({
        open: true,
        message: 'Por favor, selecione um template e uma entidade',
        severity: 'error'
      });
      return;
    }
    
    setGerando(true);
    
    try {
      const response = await axios.post(
        `${API_URL}/documentos/gerar/`,
        {
          template_id: selectedTemplate,
          entidade_tipo: entityType,
          entidade_id: selectedEntity
        },
        {
          responseType: 'blob'
        }
      );
      
      // Criar URL para o blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      
      // Criar link para download
      const link = document.createElement('a');
      link.href = url;
      
      // Nome do arquivo
      const template = templates.find(t => t.id === selectedTemplate);
      const entity = entities.find(e => e.id === selectedEntity);
      const entityName = entityType === 'bolsista' ? entity.nome : entity.nome_curso_acao;
      const fileName = `${template.nome} - ${entityName}.pdf`;
      
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      
      // Limpar
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setSnackbar({
        open: true,
        message: 'Documento gerado com sucesso!',
        severity: 'success'
      });
      
      handleCloseDialog();
    } catch (error) {
      console.error('Erro ao gerar documento:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao gerar documento. Por favor, tente novamente.',
        severity: 'error'
      });
    } finally {
      setGerando(false);
    }
  };
  
  // Fechar snackbar
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Gerador de Documentos
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Gerar Documentos em PDF
        </Typography>
        
        <Typography variant="body1" paragraph>
          Utilize esta ferramenta para gerar documentos em PDF a partir de templates pré-definidos.
          Você pode gerar contratos, fichas e outros documentos para bolsistas e credores.
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 3, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                height: '100%',
                justifyContent: 'space-between'
              }}
            >
              <Box sx={{ width: '100%', mb: 2 }}>
                <Typography variant="h6" gutterBottom align="center">
                  Contratos
                </Typography>
                <Typography variant="body2" paragraph align="center">
                  Gere contratos para bolsistas e credores com base nos modelos disponíveis.
                </Typography>
              </Box>
              
              <Button
                variant="contained"
                color="primary"
                startIcon={<PictureAsPdfIcon />}
                onClick={() => {
                  setDocumentType('contrato');
                  handleOpenDialog();
                }}
                disabled={loading}
              >
                Gerar Contrato
              </Button>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 3, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                height: '100%',
                justifyContent: 'space-between'
              }}
            >
              <Box sx={{ width: '100%', mb: 2 }}>
                <Typography variant="h6" gutterBottom align="center">
                  Fichas
                </Typography>
                <Typography variant="body2" paragraph align="center">
                  Gere fichas de cadastro para bolsistas e credores com base nos modelos disponíveis.
                </Typography>
              </Box>
              
              <Button
                variant="contained"
                color="secondary"
                startIcon={<PictureAsPdfIcon />}
                onClick={() => {
                  setDocumentType('ficha');
                  handleOpenDialog();
                }}
                disabled={loading}
              >
                Gerar Ficha
              </Button>
            </Paper>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Gerenciamento de Templates
          </Typography>
          
          <Typography variant="body1" paragraph>
            Você pode gerenciar os templates disponíveis para geração de documentos.
            É possível adicionar, editar e remover templates conforme necessário.
          </Typography>
          
          <Button
            variant="outlined"
            onClick={() => window.location.href = '/documentos/templates'}
            disabled={loading}
          >
            Gerenciar Templates
          </Button>
        </Box>
      </Paper>
      
      {/* Diálogo para selecionar template e entidade */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Gerar {documentType === 'contrato' ? 'Contrato' : 'Ficha'}
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="template-label">Template</InputLabel>
                  <Select
                    labelId="template-label"
                    value={selectedTemplate}
                    onChange={handleTemplateChange}
                    label="Template"
                  >
                    <MenuItem value="">Selecione um template</MenuItem>
                    {filteredTemplates.map(template => (
                      <MenuItem key={template.id} value={template.id}>
                        {template.nome}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="entity-type-label">Tipo de Entidade</InputLabel>
                  <Select
                    labelId="entity-type-label"
                    value={entityType}
                    onChange={handleEntityTypeChange}
                    label="Tipo de Entidade"
                  >
                    <MenuItem value="bolsista">Bolsista</MenuItem>
                    <MenuItem value="contrato">Contrato</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="entity-label">
                    {entityType === 'bolsista' ? 'Bolsista' : 'Contrato'}
                  </InputLabel>
                  <Select
                    labelId="entity-label"
                    value={selectedEntity || ''}
                    onChange={handleEntityChange}
                    label={entityType === 'bolsista' ? 'Bolsista' : 'Contrato'}
                  >
                    <MenuItem value="">
                      Selecione {entityType === 'bolsista' ? 'um bolsista' : 'um contrato'}
                    </MenuItem>
                    {entities.map(entity => (
                      <MenuItem key={entity.id} value={entity.id}>
                        {entityType === 'bolsista' ? entity.nome : entity.nome_curso_acao}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={gerando}>
            Cancelar
          </Button>
          <Button 
            onClick={handleGeneratePDF} 
            variant="contained" 
            color="primary"
            disabled={!selectedTemplate || !selectedEntity || gerando}
            startIcon={gerando ? <CircularProgress size={20} /> : <PictureAsPdfIcon />}
          >
            {gerando ? 'Gerando...' : 'Gerar PDF'}
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

export default PDFGenerator;
