import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Grid, 
  Typography, 
  Paper, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  FormHelperText,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import FormField from '../../components/FormField';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

// Validadores
const validadores = {
  cpf: (cpf) => {
    if (!cpf) return true;
    
    // Remover caracteres não numéricos
    cpf = cpf.replace(/\D/g, '');
    
    // Verificar se tem 11 dígitos
    if (cpf.length !== 11) return false;
    
    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(cpf)) return false;
    
    // Validar dígitos verificadores
    let soma = 0;
    let resto;
    
    for (let i = 1; i <= 9; i++) {
      soma = soma + parseInt(cpf.substring(i-1, i)) * (11 - i);
    }
    
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return false;
    
    soma = 0;
    for (let i = 1; i <= 10; i++) {
      soma = soma + parseInt(cpf.substring(i-1, i)) * (12 - i);
    }
    
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(10, 11))) return false;
    
    return true;
  },
  
  cnpj: (cnpj) => {
    if (!cnpj) return true;
    
    // Remover caracteres não numéricos
    cnpj = cnpj.replace(/\D/g, '');
    
    // Verificar se tem 14 dígitos
    if (cnpj.length !== 14) return false;
    
    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(cnpj)) return false;
    
    // Validar dígitos verificadores
    let tamanho = cnpj.length - 2;
    let numeros = cnpj.substring(0, tamanho);
    let digitos = cnpj.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;
    
    for (let i = tamanho; i >= 1; i--) {
      soma += numeros.charAt(tamanho - i) * pos--;
      if (pos < 2) pos = 9;
    }
    
    let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado !== parseInt(digitos.charAt(0))) return false;
    
    tamanho = tamanho + 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;
    
    for (let i = tamanho; i >= 1; i--) {
      soma += numeros.charAt(tamanho - i) * pos--;
      if (pos < 2) pos = 9;
    }
    
    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado !== parseInt(digitos.charAt(1))) return false;
    
    return true;
  },
  
  email: (email) => {
    if (!email) return true;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },
  
  data: (data) => {
    if (!data) return true;
    
    // Verificar formato DD/MM/AAAA
    const re = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!re.test(data)) return false;
    
    // Converter para data
    const [dia, mes, ano] = data.split('/').map(Number);
    
    // Verificar se é uma data válida
    const dataObj = new Date(ano, mes - 1, dia);
    return (
      dataObj.getFullYear() === ano &&
      dataObj.getMonth() === mes - 1 &&
      dataObj.getDate() === dia
    );
  },
  
  // Verificar se data inicial é anterior à data final
  datasConsistentes: (dataInicio, dataFim) => {
    if (!dataInicio || !dataFim) return true;
    
    // Converter para data
    const [diaInicio, mesInicio, anoInicio] = dataInicio.split('/').map(Number);
    const [diaFim, mesFim, anoFim] = dataFim.split('/').map(Number);
    
    const dataInicioObj = new Date(anoInicio, mesInicio - 1, diaInicio);
    const dataFimObj = new Date(anoFim, mesFim - 1, diaFim);
    
    return dataInicioObj <= dataFimObj;
  }
};

// Converter data do formato DD/MM/AAAA para AAAA-MM-DD
const converterDataParaAPI = (data) => {
  if (!data) return null;
  
  const [dia, mes, ano] = data.split('/');
  return `${ano}-${mes}-${dia}`;
};

// Converter data do formato AAAA-MM-DD para DD/MM/AAAA
const converterDataParaFormulario = (data) => {
  if (!data) return '';
  
  const [ano, mes, dia] = data.split('-');
  return `${dia}/${mes}/${ano}`;
};

const BolsistasForm = () => {
  const { API_URL } = useAuth();
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Estado do formulário
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    email: '',
    telefone: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    banco: '',
    agencia: '',
    conta: '',
    pix: '',
    observacoes: '',
    ativo: true
  });
  
  // Estado dos erros
  const [errors, setErrors] = useState({});
  
  // Lidar com mudanças nos campos
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpar erro do campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };
  
  // Validar formulário
  const validarFormulario = () => {
    const novosErros = {};
    
    // Validar campos obrigatórios
    if (!formData.nome) novosErros.nome = 'Nome é obrigatório';
    if (!formData.cpf) novosErros.cpf = 'CPF é obrigatório';
    if (!formData.email) novosErros.email = 'Email é obrigatório';
    if (!formData.telefone) novosErros.telefone = 'Telefone é obrigatório';
    
    // Validar CPF
    if (formData.cpf && !validadores.cpf(formData.cpf)) {
      novosErros.cpf = 'CPF inválido';
    }
    
    // Validar email
    if (formData.email && !validadores.email(formData.email)) {
      novosErros.email = 'Email inválido';
    }
    
    setErrors(novosErros);
    return Object.keys(novosErros).length === 0;
  };
  
  // Enviar formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      setSnackbar({
        open: true,
        message: 'Por favor, corrija os erros no formulário',
        severity: 'error'
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Preparar dados para API
      const dadosAPI = {
        ...formData,
        cpf: formData.cpf.replace(/\D/g, ''),
        telefone: formData.telefone.replace(/\D/g, ''),
        cep: formData.cep ? formData.cep.replace(/\D/g, '') : ''
      };
      
      // Enviar para API
      const response = await axios.post(`${API_URL}/bolsistas/`, dadosAPI);
      
      setSnackbar({
        open: true,
        message: 'Bolsista cadastrado com sucesso!',
        severity: 'success'
      });
      
      // Limpar formulário
      setFormData({
        nome: '',
        cpf: '',
        email: '',
        telefone: '',
        endereco: '',
        cidade: '',
        estado: '',
        cep: '',
        banco: '',
        agencia: '',
        conta: '',
        pix: '',
        observacoes: '',
        ativo: true
      });
      
    } catch (error) {
      console.error('Erro ao cadastrar bolsista:', error);
      
      // Tratar erros da API
      if (error.response && error.response.data) {
        const apiErrors = error.response.data;
        const formErrors = {};
        
        // Mapear erros da API para campos do formulário
        Object.keys(apiErrors).forEach(key => {
          formErrors[key] = Array.isArray(apiErrors[key]) 
            ? apiErrors[key][0] 
            : apiErrors[key];
        });
        
        setErrors(formErrors);
      }
      
      setSnackbar({
        open: true,
        message: 'Erro ao cadastrar bolsista. Verifique os dados e tente novamente.',
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
        Cadastrar Bolsista
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {/* Informações Pessoais */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Informações Pessoais
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormField
                label="Nome Completo"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                required
                error={errors.nome}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormField
                type="cpf"
                label="CPF"
                name="cpf"
                value={formData.cpf}
                onChange={handleChange}
                required
                error={errors.cpf}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormField
                type="email"
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                error={errors.email}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormField
                type="telefone"
                label="Telefone"
                name="telefone"
                value={formData.telefone}
                onChange={handleChange}
                required
                error={errors.telefone}
              />
            </Grid>
            
            {/* Endereço */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Endereço
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <FormField
                label="Endereço"
                name="endereco"
                value={formData.endereco}
                onChange={handleChange}
                error={errors.endereco}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormField
                label="Cidade"
                name="cidade"
                value={formData.cidade}
                onChange={handleChange}
                error={errors.cidade}
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <FormControl fullWidth error={!!errors.estado}>
                <InputLabel id="estado-label">Estado</InputLabel>
                <Select
                  labelId="estado-label"
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  label="Estado"
                >
                  <MenuItem value="">Selecione</MenuItem>
                  <MenuItem value="AC">Acre</MenuItem>
                  <MenuItem value="AL">Alagoas</MenuItem>
                  <MenuItem value="AP">Amapá</MenuItem>
                  <MenuItem value="AM">Amazonas</MenuItem>
                  <MenuItem value="BA">Bahia</MenuItem>
                  <MenuItem value="CE">Ceará</MenuItem>
                  <MenuItem value="DF">Distrito Federal</MenuItem>
                  <MenuItem value="ES">Espírito Santo</MenuItem>
                  <MenuItem value="GO">Goiás</MenuItem>
                  <MenuItem value="MA">Maranhão</MenuItem>
                  <MenuItem value="MT">Mato Grosso</MenuItem>
                  <MenuItem value="MS">Mato Grosso do Sul</MenuItem>
                  <MenuItem value="MG">Minas Gerais</MenuItem>
                  <MenuItem value="PA">Pará</MenuItem>
                  <MenuItem value="PB">Paraíba</MenuItem>
                  <MenuItem value="PR">Paraná</MenuItem>
                  <MenuItem value="PE">Pernambuco</MenuItem>
                  <MenuItem value="PI">Piauí</MenuItem>
                  <MenuItem value="RJ">Rio de Janeiro</MenuItem>
                  <MenuItem value="RN">Rio Grande do Norte</MenuItem>
                  <MenuItem value="RS">Rio Grande do Sul</MenuItem>
                  <MenuItem value="RO">Rondônia</MenuItem>
                  <MenuItem value="RR">Roraima</MenuItem>
                  <MenuItem value="SC">Santa Catarina</MenuItem>
                  <MenuItem value="SP">São Paulo</MenuItem>
                  <MenuItem value="SE">Sergipe</MenuItem>
                  <MenuItem value="TO">Tocantins</MenuItem>
                </Select>
                {errors.estado && <FormHelperText>{errors.estado}</FormHelperText>}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <FormField
                label="CEP"
                name="cep"
                value={formData.cep}
                onChange={handleChange}
                error={errors.cep}
                inputProps={{ maxLength: 9 }}
              />
            </Grid>
            
            {/* Dados Bancários */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Dados Bancários
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <FormField
                label="Banco"
                name="banco"
                value={formData.banco}
                onChange={handleChange}
                error={errors.banco}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <FormField
                label="Agência"
                name="agencia"
                value={formData.agencia}
                onChange={handleChange}
                error={errors.agencia}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <FormField
                label="Conta"
                name="conta"
                value={formData.conta}
                onChange={handleChange}
                error={errors.conta}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormField
                label="Chave PIX"
                name="pix"
                value={formData.pix}
                onChange={handleChange}
                error={errors.pix}
              />
            </Grid>
            
            {/* Observações */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Observações
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <FormField
                label="Observações"
                name="observacoes"
                value={formData.observacoes}
                onChange={handleChange}
                error={errors.observacoes}
                multiline
                rows={4}
              />
            </Grid>
            
            {/* Status */}
            <Grid item xs={12}>
              <FormControl fullWidth error={!!errors.ativo}>
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
                {errors.ativo && <FormHelperText>{errors.ativo}</FormHelperText>}
              </FormControl>
            </Grid>
            
            {/* Botões */}
            <Grid item xs={12} sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                sx={{ mr: 2 }}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                Salvar
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
      
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

export default BolsistasForm;
