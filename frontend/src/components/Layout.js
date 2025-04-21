import React from 'react';
import { 
  Box, 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Divider, 
  Avatar, 
  Menu, 
  MenuItem, 
  Badge,
  Collapse,
  useTheme
} from '@mui/material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Ícones
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import DescriptionIcon from '@mui/icons-material/Description';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpIcon from '@mui/icons-material/Help';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SearchIcon from '@mui/icons-material/Search';
import ListAltIcon from '@mui/icons-material/ListAlt';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TemplateIcon from '@mui/icons-material/InsertDriveFile';
import BarChartIcon from '@mui/icons-material/BarChart';
import LogoutIcon from '@mui/icons-material/Logout';

const drawerWidth = 280;

const Layout = () => {
  const theme = useTheme();
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [open, setOpen] = React.useState(true);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = React.useState(null);
  
  // Estado para submenus
  const [contratosOpen, setContratosOpen] = React.useState(false);
  const [cadastrosOpen, setCadastrosOpen] = React.useState(false);
  const [orcamentoOpen, setOrcamentoOpen] = React.useState(false);
  const [documentosOpen, setDocumentosOpen] = React.useState(false);
  const [relatoriosOpen, setRelatoriosOpen] = React.useState(false);
  
  // Verificar caminho atual para expandir submenus automaticamente
  React.useEffect(() => {
    const path = location.pathname;
    if (path.includes('/contratos')) setContratosOpen(true);
    if (path.includes('/bolsistas') || path.includes('/credores')) setCadastrosOpen(true);
    if (path.includes('/orcamento')) setOrcamentoOpen(true);
    if (path.includes('/documentos')) setDocumentosOpen(true);
    if (path.includes('/relatorios')) setRelatoriosOpen(true);
  }, [location.pathname]);
  
  const handleDrawerOpen = () => {
    setOpen(true);
  };
  
  const handleDrawerClose = () => {
    setOpen(false);
  };
  
  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleNotificationsMenuOpen = (event) => {
    setNotificationsAnchorEl(event.currentTarget);
  };
  
  const handleNotificationsMenuClose = () => {
    setNotificationsAnchorEl(null);
  };
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const handleNavigate = (path) => {
    navigate(path);
  };
  
  // Toggle para submenus
  const handleToggleContratos = () => {
    setContratosOpen(!contratosOpen);
  };
  
  const handleToggleCadastros = () => {
    setCadastrosOpen(!cadastrosOpen);
  };
  
  const handleToggleOrcamento = () => {
    setOrcamentoOpen(!orcamentoOpen);
  };
  
  const handleToggleDocumentos = () => {
    setDocumentosOpen(!documentosOpen);
  };
  
  const handleToggleRelatorios = () => {
    setRelatoriosOpen(!relatoriosOpen);
  };
  
  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* AppBar */}
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: theme.zIndex.drawer + 1,
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          ...(open && {
            marginLeft: drawerWidth,
            width: `calc(100% - ${drawerWidth}px)`,
            transition: theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          }),
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{
              marginRight: 5,
              ...(open && { display: 'none' }),
            }}
          >
            <MenuIcon />
          </IconButton>
          
          {/* Logo e título */}
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            {!open && (
              <Box 
                component="img" 
                src="/logo-ccbj.png" 
                alt="CCBJ Logo" 
                sx={{ 
                  height: 40, 
                  marginRight: 2 
                }} 
              />
            )}
            <Typography variant="h6" noWrap component="div">
              Sistema de Gestão Financeira
            </Typography>
          </Box>
          
          {/* Ícones da direita */}
          <Box sx={{ display: 'flex' }}>
            <IconButton 
              color="inherit"
              onClick={handleNotificationsMenuOpen}
            >
              <Badge badgeContent={3} color="secondary">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            
            <IconButton
              edge="end"
              aria-label="account of current user"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <Avatar 
                sx={{ 
                  width: 32, 
                  height: 32,
                  bgcolor: theme.palette.secondary.main,
                  color: theme.palette.secondary.contrastText
                }}
              >
                {currentUser?.username?.charAt(0).toUpperCase() || 'U'}
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      
      {/* Menu de perfil */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/perfil'); }}>
          <ListItemIcon>
            <AccountCircleIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Meu Perfil" />
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Sair" />
        </MenuItem>
      </Menu>
      
      {/* Menu de notificações */}
      <Menu
        anchorEl={notificationsAnchorEl}
        open={Boolean(notificationsAnchorEl)}
        onClose={handleNotificationsMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: { width: 320, maxHeight: 400 }
        }}
      >
        <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="subtitle1" fontWeight="bold">
            Notificações
          </Typography>
        </Box>
        
        <MenuItem onClick={handleNotificationsMenuClose} sx={{ py: 2 }}>
          <Box>
            <Typography variant="subtitle2" fontWeight="bold">
              Contrato atualizado
            </Typography>
            <Typography variant="body2" color="text.secondary">
              O contrato "Curso de Música" teve seu status alterado para "Em Execução".
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Há 5 minutos
            </Typography>
          </Box>
        </MenuItem>
        
        <MenuItem onClick={handleNotificationsMenuClose} sx={{ py: 2 }}>
          <Box>
            <Typography variant="subtitle2" fontWeight="bold">
              Pagamento registrado
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Foi registrado um pagamento no valor de R$ 2.500,00 para o contrato "Oficina de Teatro".
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Há 2 horas
            </Typography>
          </Box>
        </MenuItem>
        
        <MenuItem onClick={handleNotificationsMenuClose} sx={{ py: 2 }}>
          <Box>
            <Typography variant="subtitle2" fontWeight="bold" color="error.main">
              Alerta de prazo
            </Typography>
            <Typography variant="body2" color="text.secondary">
              O contrato "Workshop de Dança" vence em 3 dias.
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Há 1 dia
            </Typography>
          </Box>
        </MenuItem>
        
        <Box sx={{ p: 1, textAlign: 'center', borderTop: `1px solid ${theme.palette.divider}` }}>
          <Typography 
            variant="body2" 
            color="primary" 
            sx={{ cursor: 'pointer', fontWeight: 'medium' }}
            onClick={() => {
              handleNotificationsMenuClose();
              navigate('/notificacoes');
            }}
          >
            Ver todas as notificações
          </Typography>
        </Box>
      </Menu>
      
      {/* Drawer */}
      <Drawer
        variant="permanent"
        open={open}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderRight: `1px solid ${theme.palette.divider}`,
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            ...(!open && {
              overflowX: 'hidden',
              width: theme.spacing(7),
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
              }),
            }),
          },
        }}
      >
        <Toolbar
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: [1],
          }}
        >
          {/* Logo no drawer */}
          <Box sx={{ display: 'flex', alignItems: 'center', pl: 1 }}>
            <Box 
              component="img" 
              src="/logo-ccbj.png" 
              alt="CCBJ Logo" 
              sx={{ 
                height: 40, 
                marginRight: 1 
              }} 
            />
            <Typography variant="h6" color="primary" fontWeight="bold">
              CCBJ
            </Typography>
          </Box>
          
          <IconButton onClick={handleDrawerClose}>
            <ChevronLeftIcon />
          </IconButton>
        </Toolbar>
        
        <Divider />
        
        <List component="nav" sx={{ px: 1 }}>
          {/* Dashboard */}
          <ListItem 
            button 
            onClick={() => handleNavigate('/')}
            selected={location.pathname === '/'}
            sx={{ 
              borderRadius: 2,
              mb: 0.5,
              '&.Mui-selected': {
                backgroundColor: `${theme.palette.primary.light}20`,
                '&:hover': {
                  backgroundColor: `${theme.palette.primary.light}30`,
                },
              },
            }}
          >
            <ListItemIcon>
              <DashboardIcon color={location.pathname === '/' ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItem>
          
          {/* Contratos */}
          <ListItem 
            button 
            onClick={handleToggleContratos}
            sx={{ 
              borderRadius: 2,
              mb: 0.5,
              ...(location.pathname.includes('/contratos') && {
                backgroundColor: `${theme.palette.primary.light}20`,
                '&:hover': {
                  backgroundColor: `${theme.palette.primary.light}30`,
                },
              }),
            }}
          >
            <ListItemIcon>
              <DescriptionIcon color={location.pathname.includes('/contratos') ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText primary="Contratos" />
            {contratosOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          
          <Collapse in={contratosOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem 
                button 
                onClick={() => handleNavigate('/contratos/novo')}
                selected={location.pathname === '/contratos/novo'}
                sx={{ 
                  pl: 4,
                  borderRadius: 2,
                  mb: 0.5,
                  '&.Mui-selected': {
                    backgroundColor: `${theme.palette.primary.light}20`,
                    '&:hover': {
                      backgroundColor: `${theme.palette.primary.light}30`,
                    },
                  },
                }}
              >
                <ListItemIcon>
                  <AssignmentIcon fontSize="small" color={location.pathname === '/contratos/novo' ? 'primary' : 'inherit'} />
                </ListItemIcon>
                <ListItemText primary="Novo Contrato" />
              </ListItem>
              
              <ListItem 
                button 
                onClick={() => handleNavigate('/contratos/lista')}
                selected={location.pathname === '/contratos/lista'}
                sx={{ 
                  pl: 4,
                  borderRadius: 2,
                  mb: 0.5,
                  '&.Mui-selected': {
                    backgroundColor: `${theme.palette.primary.light}20`,
                    '&:hover': {
                      backgroundColor: `${theme.palette.primary.light}30`,
                    },
                  },
                }}
              >
                <ListItemIcon>
                  <ListAltIcon fontSize="small" color={location.pathname === '/contratos/lista' ? 'primary' : 'inherit'} />
                </ListItemIcon>
                <ListItemText primary="Listar Contratos" />
              </ListItem>
              
              <ListItem 
                button 
                onClick={() => handleNavigate('/contratos/status')}
                selected={location.pathname === '/contratos/status'}
                sx={{ 
                  pl: 4,
                  borderRadius: 2,
                  mb: 0.5,
                  '&.Mui-selected': {
                    backgroundColor: `${theme.palette.primary.light}20`,
                    '&:hover': {
                      backgroundColor: `${theme.palette.primary.light}30`,
                    },
                  },
                }}
              >
                <ListItemIcon>
                  <AssignmentIcon fontSize="small" color={location.pathname === '/contratos/status' ? 'primary' : 'inherit'} />
                </ListItemIcon>
                <ListItemText primary="Status de Contratos" />
              </ListItem>
              
              <ListItem 
                button 
                onClick={() => handleNavigate('/contratos/busca')}
                selected={location.pathname === '/contratos/busca'}
                sx={{ 
                  pl: 4,
                  borderRadius: 2,
                  mb: 0.5,
                  '&.Mui-selected': {
                    backgroundColor: `${theme.palette.primary.light}20`,
                    '&:hover': {
                      backgroundColor: `${theme.palette.primary.light}30`,
                    },
                  },
                }}
              >
                <ListItemIcon>
                  <SearchIcon fontSize="small" color={location.pathname === '/contratos/busca' ? 'primary' : 'inherit'} />
                </ListItemIcon>
                <ListItemText primary="Busca Avançada" />
              </ListItem>
            </List>
          </Collapse>
          
          {/* Cadastros */}
          <ListItem 
            button 
            onClick={handleToggleCadastros}
            sx={{ 
              borderRadius: 2,
              mb: 0.5,
              ...((location.pathname.includes('/bolsistas') || location.pathname.includes('/credores')) && {
                backgroundColor: `${theme.palette.primary.light}20`,
                '&:hover': {
                  backgroundColor: `${theme.palette.primary.light}30`,
                },
              }),
            }}
          >
            <ListItemIcon>
              <PeopleIcon color={(location.pathname.includes('/bolsistas') || location.pathname.includes('/credores')) ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText primary="Cadastros" />
            {cadastrosOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          
          <Collapse in={cadastrosOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem 
                button 
                onClick={() => handleNavigate('/bolsistas/novo')}
                selected={location.pathname === '/bolsistas/novo'}
                sx={{ 
                  pl: 4,
                  borderRadius: 2,
                  mb: 0.5,
                  '&.Mui-selected': {
                    backgroundColor: `${theme.palette.primary.light}20`,
                    '&:hover': {
                      backgroundColor: `${theme.palette.primary.light}30`,
                    },
                  },
                }}
              >
                <ListItemIcon>
                  <PeopleIcon fontSize="small" color={location.pathname === '/bolsistas/novo' ? 'primary' : 'inherit'} />
                </ListItemIcon>
                <ListItemText primary="Novo Bolsista" />
              </ListItem>
              
              <ListItem 
                button 
                onClick={() => handleNavigate('/bolsistas')}
                selected={location.pathname === '/bolsistas' && location.pathname !== '/bolsistas/novo'}
                sx={{ 
                  pl: 4,
                  borderRadius: 2,
                  mb: 0.5,
                  '&.Mui-selected': {
                    backgroundColor: `${theme.palette.primary.light}20`,
                    '&:hover': {
                      backgroundColor: `${theme.palette.primary.light}30`,
                    },
                  },
                }}
              >
                <ListItemIcon>
                  <ListAltIcon fontSize="small" color={(location.pathname === '/bolsistas' && location.pathname !== '/bolsistas/novo') ? 'primary' : 'inherit'} />
                </ListItemIcon>
                <ListItemText primary="Listar Bolsistas" />
              </ListItem>
              
              <ListItem 
                button 
                onClick={() => handleNavigate('/credores/novo')}
                selected={location.pathname === '/credores/novo'}
                sx={{ 
                  pl: 4,
                  borderRadius: 2,
                  mb: 0.5,
                  '&.Mui-selected': {
                    backgroundColor: `${theme.palette.primary.light}20`,
                    '&:hover': {
                      backgroundColor: `${theme.palette.primary.light}30`,
                    },
                  },
                }}
              >
                <ListItemIcon>
                  <PeopleIcon fontSize="small" color={location.pathname === '/credores/novo' ? 'primary' : 'inherit'} />
                </ListItemIcon>
                <ListItemText primary="Novo Credor" />
              </ListItem>
              
              <ListItem 
                button 
                onClick={() => handleNavigate('/credores')}
                selected={location.pathname === '/credores' && location.pathname !== '/credores/novo'}
                sx={{ 
                  pl: 4,
                  borderRadius: 2,
                  mb: 0.5,
                  '&.Mui-selected': {
                    backgroundColor: `${theme.palette.primary.light}20`,
                    '&:hover': {
                      backgroundColor: `${theme.palette.primary.light}30`,
                    },
                  },
                }}
              >
                <ListItemIcon>
                  <ListAltIcon fontSize="small" color={(location.pathname === '/credores' && location.pathname !== '/credores/novo') ? 'primary' : 'inherit'} />
                </ListItemIcon>
                <ListItemText primary="Listar Credores" />
              </ListItem>
            </List>
          </Collapse>
          
          {/* Orçamento */}
          <ListItem 
            button 
            onClick={handleToggleOrcamento}
            sx={{ 
              borderRadius: 2,
              mb: 0.5,
              ...(location.pathname.includes('/orcamento') && {
                backgroundColor: `${theme.palette.primary.light}20`,
                '&:hover': {
                  backgroundColor: `${theme.palette.primary.light}30`,
                },
              }),
            }}
          >
            <ListItemIcon>
              <AccountBalanceWalletIcon color={location.pathname.includes('/orcamento') ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText primary="Orçamento" />
            {orcamentoOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          
          <Collapse in={orcamentoOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem 
                button 
                onClick={() => handleNavigate('/orcamento/fontes')}
                selected={location.pathname === '/orcamento/fontes'}
                sx={{ 
                  pl: 4,
                  borderRadius: 2,
                  mb: 0.5,
                  '&.Mui-selected': {
                    backgroundColor: `${theme.palette.primary.light}20`,
                    '&:hover': {
                      backgroundColor: `${theme.palette.primary.light}30`,
                    },
                  },
                }}
              >
                <ListItemIcon>
                  <AccountBalanceWalletIcon fontSize="small" color={location.pathname === '/orcamento/fontes' ? 'primary' : 'inherit'} />
                </ListItemIcon>
                <ListItemText primary="Fontes de Recurso" />
              </ListItem>
              
              <ListItem 
                button 
                onClick={() => handleNavigate('/orcamento/alocacao')}
                selected={location.pathname === '/orcamento/alocacao'}
                sx={{ 
                  pl: 4,
                  borderRadius: 2,
                  mb: 0.5,
                  '&.Mui-selected': {
                    backgroundColor: `${theme.palette.primary.light}20`,
                    '&:hover': {
                      backgroundColor: `${theme.palette.primary.light}30`,
                    },
                  },
                }}
              >
                <ListItemIcon>
                  <AccountBalanceWalletIcon fontSize="small" color={location.pathname === '/orcamento/alocacao' ? 'primary' : 'inherit'} />
                </ListItemIcon>
                <ListItemText primary="Alocação de Recursos" />
              </ListItem>
              
              <ListItem 
                button 
                onClick={() => handleNavigate('/orcamento/transferencia')}
                selected={location.pathname === '/orcamento/transferencia'}
                sx={{ 
                  pl: 4,
                  borderRadius: 2,
                  mb: 0.5,
                  '&.Mui-selected': {
                    backgroundColor: `${theme.palette.primary.light}20`,
                    '&:hover': {
                      backgroundColor: `${theme.palette.primary.light}30`,
                    },
                  },
                }}
              >
                <ListItemIcon>
                  <AccountBalanceWalletIcon fontSize="small" color={location.pathname === '/orcamento/transferencia' ? 'primary' : 'inherit'} />
                </ListItemIcon>
                <ListItemText primary="Transferência de Recursos" />
              </ListItem>
              
              <ListItem 
                button 
                onClick={() => handleNavigate('/orcamento/saldos')}
                selected={location.pathname === '/orcamento/saldos'}
                sx={{ 
                  pl: 4,
                  borderRadius: 2,
                  mb: 0.5,
                  '&.Mui-selected': {
                    backgroundColor: `${theme.palette.primary.light}20`,
                    '&:hover': {
                      backgroundColor: `${theme.palette.primary.light}30`,
                    },
                  },
                }}
              >
                <ListItemIcon>
                  <AccountBalanceWalletIcon fontSize="small" color={location.pathname === '/orcamento/saldos' ? 'primary' : 'inherit'} />
                </ListItemIcon>
                <ListItemText primary="Consulta de Saldos" />
              </ListItem>
            </List>
          </Collapse>
          
          {/* Documentos */}
          <ListItem 
            button 
            onClick={handleToggleDocumentos}
            sx={{ 
              borderRadius: 2,
              mb: 0.5,
              ...(location.pathname.includes('/documentos') && {
                backgroundColor: `${theme.palette.primary.light}20`,
                '&:hover': {
                  backgroundColor: `${theme.palette.primary.light}30`,
                },
              }),
            }}
          >
            <ListItemIcon>
              <PictureAsPdfIcon color={location.pathname.includes('/documentos') ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText primary="Documentos" />
            {documentosOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          
          <Collapse in={documentosOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem 
                button 
                onClick={() => handleNavigate('/documentos/gerar')}
                selected={location.pathname === '/documentos/gerar'}
                sx={{ 
                  pl: 4,
                  borderRadius: 2,
                  mb: 0.5,
                  '&.Mui-selected': {
                    backgroundColor: `${theme.palette.primary.light}20`,
                    '&:hover': {
                      backgroundColor: `${theme.palette.primary.light}30`,
                    },
                  },
                }}
              >
                <ListItemIcon>
                  <PictureAsPdfIcon fontSize="small" color={location.pathname === '/documentos/gerar' ? 'primary' : 'inherit'} />
                </ListItemIcon>
                <ListItemText primary="Gerar Documentos" />
              </ListItem>
              
              <ListItem 
                button 
                onClick={() => handleNavigate('/documentos/templates')}
                selected={location.pathname === '/documentos/templates'}
                sx={{ 
                  pl: 4,
                  borderRadius: 2,
                  mb: 0.5,
                  '&.Mui-selected': {
                    backgroundColor: `${theme.palette.primary.light}20`,
                    '&:hover': {
                      backgroundColor: `${theme.palette.primary.light}30`,
                    },
                  },
                }}
              >
                <ListItemIcon>
                  <TemplateIcon fontSize="small" color={location.pathname === '/documentos/templates' ? 'primary' : 'inherit'} />
                </ListItemIcon>
                <ListItemText primary="Templates" />
              </ListItem>
            </List>
          </Collapse>
          
          {/* Relatórios */}
          <ListItem 
            button 
            onClick={handleToggleRelatorios}
            sx={{ 
              borderRadius: 2,
              mb: 0.5,
              ...(location.pathname.includes('/relatorios') && {
                backgroundColor: `${theme.palette.primary.light}20`,
                '&:hover': {
                  backgroundColor: `${theme.palette.primary.light}30`,
                },
              }),
            }}
          >
            <ListItemIcon>
              <BarChartIcon color={location.pathname.includes('/relatorios') ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText primary="Relatórios" />
            {relatoriosOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          
          <Collapse in={relatoriosOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem 
                button 
                onClick={() => handleNavigate('/relatorios/orcamentario')}
                selected={location.pathname === '/relatorios/orcamentario'}
                sx={{ 
                  pl: 4,
                  borderRadius: 2,
                  mb: 0.5,
                  '&.Mui-selected': {
                    backgroundColor: `${theme.palette.primary.light}20`,
                    '&:hover': {
                      backgroundColor: `${theme.palette.primary.light}30`,
                    },
                  },
                }}
              >
                <ListItemIcon>
                  <BarChartIcon fontSize="small" color={location.pathname === '/relatorios/orcamentario' ? 'primary' : 'inherit'} />
                </ListItemIcon>
                <ListItemText primary="Execução Orçamentária" />
              </ListItem>
              
              <ListItem 
                button 
                onClick={() => handleNavigate('/relatorios/contratos')}
                selected={location.pathname === '/relatorios/contratos'}
                sx={{ 
                  pl: 4,
                  borderRadius: 2,
                  mb: 0.5,
                  '&.Mui-selected': {
                    backgroundColor: `${theme.palette.primary.light}20`,
                    '&:hover': {
                      backgroundColor: `${theme.palette.primary.light}30`,
                    },
                  },
                }}
              >
                <ListItemIcon>
                  <BarChartIcon fontSize="small" color={location.pathname === '/relatorios/contratos' ? 'primary' : 'inherit'} />
                </ListItemIcon>
                <ListItemText primary="Contratos por Setor" />
              </ListItem>
              
              <ListItem 
                button 
                onClick={() => handleNavigate('/relatorios/pagamentos')}
                selected={location.pathname === '/relatorios/pagamentos'}
                sx={{ 
                  pl: 4,
                  borderRadius: 2,
                  mb: 0.5,
                  '&.Mui-selected': {
                    backgroundColor: `${theme.palette.primary.light}20`,
                    '&:hover': {
                      backgroundColor: `${theme.palette.primary.light}30`,
                    },
                  },
                }}
              >
                <ListItemIcon>
                  <BarChartIcon fontSize="small" color={location.pathname === '/relatorios/pagamentos' ? 'primary' : 'inherit'} />
                </ListItemIcon>
                <ListItemText primary="Pagamentos" />
              </ListItem>
              
              <ListItem 
                button 
                onClick={() => handleNavigate('/relatorios/personalizados')}
                selected={location.pathname === '/relatorios/personalizados'}
                sx={{ 
                  pl: 4,
                  borderRadius: 2,
                  mb: 0.5,
                  '&.Mui-selected': {
                    backgroundColor: `${theme.palette.primary.light}20`,
                    '&:hover': {
                      backgroundColor: `${theme.palette.primary.light}30`,
                    },
                  },
                }}
              >
                <ListItemIcon>
                  <BarChartIcon fontSize="small" color={location.pathname === '/relatorios/personalizados' ? 'primary' : 'inherit'} />
                </ListItemIcon>
                <ListItemText primary="Relatórios Personalizados" />
              </ListItem>
            </List>
          </Collapse>
          
          <Divider sx={{ my: 1 }} />
          
          {/* Configurações */}
          <ListItem 
            button 
            onClick={() => handleNavigate('/configuracoes')}
            selected={location.pathname === '/configuracoes'}
            sx={{ 
              borderRadius: 2,
              mb: 0.5,
              '&.Mui-selected': {
                backgroundColor: `${theme.palette.primary.light}20`,
                '&:hover': {
                  backgroundColor: `${theme.palette.primary.light}30`,
                },
              },
            }}
          >
            <ListItemIcon>
              <SettingsIcon color={location.pathname === '/configuracoes' ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText primary="Configurações" />
          </ListItem>
          
          {/* Ajuda */}
          <ListItem 
            button 
            onClick={() => handleNavigate('/ajuda')}
            selected={location.pathname === '/ajuda'}
            sx={{ 
              borderRadius: 2,
              mb: 0.5,
              '&.Mui-selected': {
                backgroundColor: `${theme.palette.primary.light}20`,
                '&:hover': {
                  backgroundColor: `${theme.palette.primary.light}30`,
                },
              },
            }}
          >
            <ListItemIcon>
              <HelpIcon color={location.pathname === '/ajuda' ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText primary="Ajuda" />
          </ListItem>
        </List>
      </Drawer>
      
      {/* Conteúdo principal */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: 3,
          backgroundColor: theme.palette.background.default,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
