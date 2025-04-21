import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  Paper, 
  Button,
  useTheme,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip
} from '@mui/material';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

// Ícones
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DescriptionIcon from '@mui/icons-material/Description';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EventIcon from '@mui/icons-material/Event';

// Dados de exemplo para os gráficos
const dadosExecucao = [
  { nome: 'Gestão', previsto: 1200000, executado: 980000 },
  { nome: 'Adm/Infra', previsto: 800000, executado: 750000 },
  { nome: 'Escola', previsto: 1500000, executado: 1200000 },
  { nome: 'NArTE', previsto: 900000, executado: 700000 },
  { nome: 'Comunicação', previsto: 600000, executado: 580000 },
  { nome: 'Ação Cultural', previsto: 2000000, executado: 1800000 },
];

const dadosStatus = [
  { nome: 'Em Elaboração', valor: 12, cor: '#29ABE2' },
  { nome: 'Assinado', valor: 18, cor: '#FFD100' },
  { nome: 'Em Execução', valor: 45, cor: '#00A651' },
  { nome: 'Concluído', valor: 28, cor: '#8A2090' },
  { nome: 'Cancelado', valor: 5, cor: '#FF6B00' },
];

const dadosMensais = [
  { mes: 'Jan', valor: 250000 },
  { mes: 'Fev', valor: 320000 },
  { mes: 'Mar', valor: 280000 },
  { mes: 'Abr', valor: 360000 },
  { mes: 'Mai', valor: 400000 },
  { mes: 'Jun', valor: 380000 },
];

const contratosRecentes = [
  { id: 1, nome: 'Curso de Música', setor: 'Escola', valor: 'R$ 25.000,00', status: 'Em Execução' },
  { id: 2, nome: 'Oficina de Teatro', setor: 'Ação Cultural', valor: 'R$ 18.500,00', status: 'Assinado' },
  { id: 3, nome: 'Manutenção de Equipamentos', setor: 'Adm/Infra', valor: 'R$ 12.800,00', status: 'Em Elaboração' },
  { id: 4, nome: 'Workshop de Dança', setor: 'NArTE', valor: 'R$ 9.600,00', status: 'Em Execução' },
  { id: 5, nome: 'Campanha Publicitária', setor: 'Comunicação', valor: 'R$ 32.000,00', status: 'Assinado' },
];

const alertas = [
  { id: 1, tipo: 'warning', mensagem: 'Contrato "Workshop de Dança" vence em 3 dias', data: '21/04/2025' },
  { id: 2, tipo: 'error', mensagem: 'Rubrica "Cachês Artísticos" com saldo insuficiente', data: '20/04/2025' },
  { id: 3, tipo: 'info', mensagem: 'Novo contrato "Exposição de Artes" criado', data: '19/04/2025' },
  { id: 4, tipo: 'success', mensagem: 'Pagamento de "Oficina de Teatro" registrado', data: '18/04/2025' },
];

const Dashboard = () => {
  const theme = useTheme();
  
  // Função para formatar valores monetários
  const formatarValor = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2
    }).format(valor);
  };
  
  // Função para determinar a cor do status
  const getStatusColor = (status) => {
    switch (status) {
      case 'Em Elaboração':
        return theme.palette.info.main;
      case 'Assinado':
        return theme.palette.secondary.main;
      case 'Em Execução':
        return theme.palette.success.main;
      case 'Concluído':
        return theme.palette.primary.main;
      case 'Cancelado':
        return theme.palette.error.main;
      default:
        return theme.palette.text.secondary;
    }
  };
  
  // Função para determinar o ícone do alerta
  const getAlertIcon = (tipo) => {
    switch (tipo) {
      case 'warning':
        return <WarningIcon sx={{ color: theme.palette.warning.main }} />;
      case 'error':
        return <WarningIcon sx={{ color: theme.palette.error.main }} />;
      case 'info':
        return <DescriptionIcon sx={{ color: theme.palette.info.main }} />;
      case 'success':
        return <CheckCircleIcon sx={{ color: theme.palette.success.main }} />;
      default:
        return <DescriptionIcon />;
    }
  };
  
  return (
    <Container maxWidth="xl" sx={{ mt: 2 }}>
      {/* Cabeçalho */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" color="primary" fontWeight="bold" gutterBottom>
          Dashboard Financeiro
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Centro Cultural Bom Jardim - Visão Geral
        </Typography>
      </Box>
      
      {/* Cards de resumo */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              height: '100%',
              borderTop: `4px solid ${theme.palette.primary.main}`,
              transition: 'transform 0.3s',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
              },
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="h6" color="text.secondary">
                  Total de Recursos
                </Typography>
                <Avatar sx={{ bgcolor: `${theme.palette.primary.main}20`, color: theme.palette.primary.main }}>
                  <AccountBalanceWalletIcon />
                </Avatar>
              </Box>
              <Typography variant="h4" component="div" fontWeight="bold">
                R$ 11.101.585,03
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <TrendingUpIcon sx={{ color: theme.palette.success.main, mr: 0.5, fontSize: '1rem' }} />
                <Typography variant="body2" color="success.main">
                  +5% em relação ao período anterior
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              height: '100%',
              borderTop: `4px solid ${theme.palette.secondary.main}`,
              transition: 'transform 0.3s',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
              },
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="h6" color="text.secondary">
                  Total em Contratos
                </Typography>
                <Avatar sx={{ bgcolor: `${theme.palette.secondary.main}20`, color: theme.palette.secondary.main }}>
                  <DescriptionIcon />
                </Avatar>
              </Box>
              <Typography variant="h4" component="div" fontWeight="bold">
                R$ 10.052.227,81
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <TrendingUpIcon sx={{ color: theme.palette.success.main, mr: 0.5, fontSize: '1rem' }} />
                <Typography variant="body2" color="success.main">
                  +3.2% em relação ao período anterior
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              height: '100%',
              borderTop: `4px solid ${theme.palette.success.main}`,
              transition: 'transform 0.3s',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
              },
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="h6" color="text.secondary">
                  Valores Pagos
                </Typography>
                <Avatar sx={{ bgcolor: `${theme.palette.success.main}20`, color: theme.palette.success.main }}>
                  <CheckCircleIcon />
                </Avatar>
              </Box>
              <Typography variant="h4" component="div" fontWeight="bold">
                R$ 9.917.783,41
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <TrendingUpIcon sx={{ color: theme.palette.success.main, mr: 0.5, fontSize: '1rem' }} />
                <Typography variant="body2" color="success.main">
                  +8.7% em relação ao período anterior
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              height: '100%',
              borderTop: `4px solid ${theme.palette.info.main}`,
              transition: 'transform 0.3s',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
              },
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="h6" color="text.secondary">
                  Saldo Disponível
                </Typography>
                <Avatar sx={{ bgcolor: `${theme.palette.info.main}20`, color: theme.palette.info.main }}>
                  <AccountBalanceWalletIcon />
                </Avatar>
              </Box>
              <Typography variant="h4" component="div" fontWeight="bold">
                R$ 1.049.357,22
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <TrendingDownIcon sx={{ color: theme.palette.error.main, mr: 0.5, fontSize: '1rem' }} />
                <Typography variant="body2" color="error.main">
                  -12.3% em relação ao período anterior
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Gráficos e tabelas */}
      <Grid container spacing={3}>
        {/* Gráfico de execução orçamentária */}
        <Grid item xs={12} md={8}>
          <Paper 
            sx={{ 
              p: 3, 
              height: '100%',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              borderRadius: 3
            }}
          >
            <Typography variant="h6" gutterBottom>
              Execução Orçamentária por Setor
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <ResponsiveContainer width="100%" height={350}>
              <BarChart
                data={dadosExecucao}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nome" />
                <YAxis tickFormatter={(value) => `R$ ${value/1000}k`} />
                <Tooltip 
                  formatter={(value) => formatarValor(value)}
                  labelFormatter={(label) => `Setor: ${label}`}
                />
                <Legend />
                <Bar dataKey="previsto" name="Valor Previsto" fill={theme.palette.secondary.main} />
                <Bar dataKey="executado" name="Valor Executado" fill={theme.palette.primary.main} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        {/* Gráfico de status de contratos */}
        <Grid item xs={12} md={4}>
          <Paper 
            sx={{ 
              p: 3, 
              height: '100%',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              borderRadius: 3
            }}
          >
            <Typography variant="h6" gutterBottom>
              Status de Contratos
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={dadosStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="valor"
                  nameKey="nome"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {dadosStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.cor} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value} contratos`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        {/* Gráfico de pagamentos mensais */}
        <Grid item xs={12} md={6}>
          <Paper 
            sx={{ 
              p: 3, 
              height: '100%',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              borderRadius: 3
            }}
          >
            <Typography variant="h6" gutterBottom>
              Pagamentos Mensais
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={dadosMensais}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis tickFormatter={(value) => `R$ ${value/1000}k`} />
                <Tooltip formatter={(value) => formatarValor(value)} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="valor" 
                  name="Valor Pago" 
                  stroke={theme.palette.primary.main} 
                  activeDot={{ r: 8 }} 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        {/* Contratos recentes */}
        <Grid item xs={12} md={6}>
          <Paper 
            sx={{ 
              p: 3, 
              height: '100%',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              borderRadius: 3
            }}
          >
            <Typography variant="h6" gutterBottom>
              Contratos Recentes
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <List>
              {contratosRecentes.map((contrato) => (
                <ListItem 
                  key={contrato.id}
                  sx={{ 
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    py: 1.5,
                    '&:last-child': {
                      borderBottom: 'none'
                    }
                  }}
                >
                  <ListItemIcon>
                    <AssignmentIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={contrato.nome}
                    secondary={
                      <React.Fragment>
                        <Typography component="span" variant="body2" color="text.secondary">
                          {contrato.setor} • {contrato.valor}
                        </Typography>
                      </React.Fragment>
                    }
                  />
                  <Chip 
                    label={contrato.status} 
                    size="small"
                    sx={{ 
                      backgroundColor: `${getStatusColor(contrato.status)}20`,
                      color: getStatusColor(contrato.status),
                      fontWeight: 'medium'
                    }}
                  />
                </ListItem>
              ))}
            </List>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
              <Button variant="outlined" color="primary">
                Ver Todos os Contratos
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        {/* Alertas */}
        <Grid item xs={12}>
          <Paper 
            sx={{ 
              p: 3,
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              borderRadius: 3
            }}
          >
            <Typography variant="h6" gutterBottom>
              Alertas e Notificações
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              {alertas.map((alerta) => (
                <Grid item xs={12} sm={6} md={3} key={alerta.id}>
                  <Card 
                    sx={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      height: '100%',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                      borderRadius: 2,
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateY(-3px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      },
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        {getAlertIcon(alerta.tipo)}
                        <Typography variant="subtitle2" sx={{ ml: 1 }}>
                          {alerta.data}
                        </Typography>
                      </Box>
                      <Typography variant="body1">
                        {alerta.mensagem}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
