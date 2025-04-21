import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import ccbjTheme from './theme/ccbjTheme';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Páginas
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import Layout from './components/Layout';
import PerfilUsuario from './pages/usuarios/PerfilUsuario';
import BolsistasForm from './pages/credores/BolsistasForm';
import StatusContratos from './pages/contratos/StatusContratos';
import BuscaAvancada from './pages/contratos/BuscaAvancada';
import PDFGenerator from './pages/documentos/PDFGenerator';
import TemplateManager from './pages/documentos/TemplateManager';

function App() {
  return (
    <ThemeProvider theme={ccbjTheme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="perfil" element={<PerfilUsuario />} />
              <Route path="bolsistas/novo" element={<BolsistasForm />} />
              <Route path="bolsistas/:id" element={<BolsistasForm />} />
              <Route path="contratos/status" element={<StatusContratos />} />
              <Route path="contratos/busca" element={<BuscaAvancada />} />
              <Route path="documentos/gerar" element={<PDFGenerator />} />
              <Route path="documentos/templates" element={<TemplateManager />} />
            </Route>
            
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
