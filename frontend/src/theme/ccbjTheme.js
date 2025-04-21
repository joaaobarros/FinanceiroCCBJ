/* Tema personalizado para o CCBJ */
import { createTheme } from '@mui/material/styles';

// Cores extraídas da logo do CCBJ
const ccbjColors = {
  primary: {
    main: '#8A2090', // Roxo/Magenta
    light: '#A84CAF',
    dark: '#6A1070',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#FFD100', // Amarelo
    light: '#FFE04D',
    dark: '#D9B000',
    contrastText: '#000000',
  },
  accent1: {
    main: '#FF6B00', // Laranja
    light: '#FF8C3D',
    dark: '#D95A00',
  },
  accent2: {
    main: '#00A651', // Verde
    light: '#3DB97B',
    dark: '#008542',
  },
  accent3: {
    main: '#29ABE2', // Azul
    light: '#5BBFE8',
    dark: '#1E8AB5',
  },
  background: {
    default: '#FAFAFA',
    paper: '#FFFFFF',
    light: '#F5F5F5',
  },
  text: {
    primary: '#333333',
    secondary: '#666666',
    disabled: '#999999',
  },
  error: {
    main: '#D32F2F',
    light: '#EF5350',
    dark: '#C62828',
  },
  warning: {
    main: '#FF9800',
    light: '#FFB74D',
    dark: '#F57C00',
  },
  info: {
    main: '#29ABE2', // Usando o azul da logo
    light: '#5BBFE8',
    dark: '#1E8AB5',
  },
  success: {
    main: '#00A651', // Usando o verde da logo
    light: '#3DB97B',
    dark: '#008542',
  },
};

// Criação do tema personalizado
const ccbjTheme = createTheme({
  palette: {
    primary: ccbjColors.primary,
    secondary: ccbjColors.secondary,
    error: ccbjColors.error,
    warning: ccbjColors.warning,
    info: ccbjColors.info,
    success: ccbjColors.success,
    background: ccbjColors.background,
    text: ccbjColors.text,
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2,
      color: ccbjColors.primary.main,
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
      lineHeight: 1.3,
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
      lineHeight: 1.3,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.4,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    subtitle1: {
      fontWeight: 500,
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    subtitle2: {
      fontWeight: 500,
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      fontWeight: 500,
      fontSize: '0.875rem',
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: ccbjColors.primary.main,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
          },
        },
        containedPrimary: {
          backgroundColor: ccbjColors.primary.main,
          '&:hover': {
            backgroundColor: ccbjColors.primary.dark,
          },
        },
        containedSecondary: {
          backgroundColor: ccbjColors.secondary.main,
          color: ccbjColors.secondary.contrastText,
          '&:hover': {
            backgroundColor: ccbjColors.secondary.dark,
          },
        },
        outlinedPrimary: {
          borderColor: ccbjColors.primary.main,
          color: ccbjColors.primary.main,
          '&:hover': {
            backgroundColor: 'rgba(138, 32, 144, 0.04)',
          },
        },
        outlinedSecondary: {
          borderColor: ccbjColors.secondary.main,
          color: ccbjColors.secondary.main,
          '&:hover': {
            backgroundColor: 'rgba(255, 209, 0, 0.04)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)',
          overflow: 'hidden',
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        root: {
          padding: '16px 24px',
        },
        title: {
          fontSize: '1.25rem',
          fontWeight: 600,
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '24px',
          '&:last-child': {
            paddingBottom: '24px',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontSize: '1.25rem',
          fontWeight: 600,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: ccbjColors.background.paper,
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: ccbjColors.background.light,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          '&.Mui-selected': {
            fontWeight: 600,
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        elevation1: {
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
        },
        elevation2: {
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)',
        },
        elevation3: {
          boxShadow: '0px 6px 16px rgba(0, 0, 0, 0.05)',
        },
        elevation4: {
          boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.05)',
        },
      },
    },
  },
});

export default ccbjTheme;
