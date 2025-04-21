import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Grid, 
  Paper, 
  Avatar,
  Divider,
  Alert
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LockIcon from '@mui/icons-material/Lock';

const PerfilUsuario = () => {
  const { currentUser, API_URL } = useAuth();
  const [formData, setFormData] = useState({
    nome: currentUser?.first_name || '',
    sobrenome: currentUser?.last_name || '',
    email: currentUser?.email || '',
    telefone: currentUser?.perfil?.telefone || '',
  });
  
  const [senhaData, setSenhaData] = useState({
    senhaAtual: '',
    novaSenha: '',
    confirmarSenha: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [senhaMessage, setSenhaMessage] = useState({ type: '', text: '' });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSenhaChange = (e) => {
    const { name, value } = e.target;
    setSenhaData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const response = await fetch(`${API_URL}/usuarios/me/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          first_name: formData.nome,
          last_name: formData.sobrenome,
          email: formData.email,
          perfil: {
            telefone: formData.telefone
          }
        })
      });
      
      if (response.ok) {
        setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
      } else {
        const errorData = await response.json();
        setMessage({ 
          type: 'error', 
          text: errorData.detail || 'Erro ao atualizar perfil. Tente novamente.' 
        });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: 'Erro ao atualizar perfil. Verifique sua conexão e tente novamente.' 
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleSenhaSubmit = async (e) => {
    e.preventDefault();
    
    // Validar senhas
    if (senhaData.novaSenha !== senhaData.confirmarSenha) {
      setSenhaMessage({ type: 'error', text: 'As senhas não coincidem.' });
      return;
    }
    
    if (senhaData.novaSenha.length < 8) {
      setSenhaMessage({ type: 'error', text: 'A senha deve ter pelo menos 8 caracteres.' });
      return;
    }
    
    setLoading(true);
    setSenhaMessage({ type: '', text: '' });
    
    try {
      const response = await fetch(`${API_URL}/auth/change-password/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          old_password: senhaData.senhaAtual,
          new_password: senhaData.novaSenha
        })
      });
      
      if (response.ok) {
        setSenhaMessage({ type: 'success', text: 'Senha alterada com sucesso!' });
        setSenhaData({
          senhaAtual: '',
          novaSenha: '',
          confirmarSenha: '',
        });
      } else {
        const errorData = await response.json();
        setSenhaMessage({ 
          type: 'error', 
          text: errorData.old_password?.[0] || errorData.detail || 'Erro ao alterar senha. Tente novamente.' 
        });
      }
    } catch (error) {
      setSenhaMessage({ 
        type: 'error', 
        text: 'Erro ao alterar senha. Verifique sua conexão e tente novamente.' 
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        Meu Perfil
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar 
              sx={{ 
                width: 100, 
                height: 100, 
                bgcolor: 'primary.main',
                fontSize: '3rem',
                mb: 2
              }}
            >
              {currentUser?.first_name?.charAt(0) || currentUser?.username?.charAt(0) || 'U'}
            </Avatar>
            
            <Typography variant="h6">
              {currentUser?.first_name} {currentUser?.last_name}
            </Typography>
            
            <Typography variant="body2" color="textSecondary">
              {currentUser?.username}
            </Typography>
            
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              {currentUser?.perfil?.nivel_acesso === 'admin' ? 'Administrador' : 
               currentUser?.perfil?.nivel_acesso === 'gestor' ? 'Gestor' : 'Usuário'}
            </Typography>
            
            <Divider sx={{ width: '100%', my: 2 }} />
            
            <Typography variant="body2" color="textSecondary">
              Último acesso: {new Date(currentUser?.last_login || Date.now()).toLocaleString('pt-BR')}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <AccountCircleIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">
                Informações Pessoais
              </Typography>
            </Box>
            
            {message.text && (
              <Alert severity={message.type} sx={{ mb: 2 }}>
                {message.text}
              </Alert>
            )}
            
            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nome"
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    variant="outlined"
                    margin="normal"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Sobrenome"
                    name="sobrenome"
                    value={formData.sobrenome}
                    onChange={handleChange}
                    variant="outlined"
                    margin="normal"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    variant="outlined"
                    margin="normal"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Telefone"
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleChange}
                    variant="outlined"
                    margin="normal"
                  />
                </Grid>
              </Grid>
              
              <Button
                type="submit"
                variant="contained"
                color="primary"
                sx={{ mt: 3 }}
                disabled={loading}
              >
                Salvar Alterações
              </Button>
            </Box>
            
            <Divider sx={{ my: 4 }} />
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <LockIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">
                Alterar Senha
              </Typography>
            </Box>
            
            {senhaMessage.text && (
              <Alert severity={senhaMessage.type} sx={{ mb: 2 }}>
                {senhaMessage.text}
              </Alert>
            )}
            
            <Box component="form" onSubmit={handleSenhaSubmit}>
              <TextField
                fullWidth
                label="Senha Atual"
                name="senhaAtual"
                type="password"
                value={senhaData.senhaAtual}
                onChange={handleSenhaChange}
                variant="outlined"
                margin="normal"
                required
              />
              
              <TextField
                fullWidth
                label="Nova Senha"
                name="novaSenha"
                type="password"
                value={senhaData.novaSenha}
                onChange={handleSenhaChange}
                variant="outlined"
                margin="normal"
                required
                helperText="A senha deve ter pelo menos 8 caracteres"
              />
              
              <TextField
                fullWidth
                label="Confirmar Nova Senha"
                name="confirmarSenha"
                type="password"
                value={senhaData.confirmarSenha}
                onChange={handleSenhaChange}
                variant="outlined"
                margin="normal"
                required
              />
              
              <Button
                type="submit"
                variant="contained"
                color="primary"
                sx={{ mt: 3 }}
                disabled={loading}
              >
                Alterar Senha
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default PerfilUsuario;
