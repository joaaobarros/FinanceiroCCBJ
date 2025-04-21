import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import jwtDecode from 'jwt-decode';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // API base URL
  const API_URL = process.env.NODE_ENV === 'production' 
    ? 'https://api.ccbj.com.br/api/v1' 
    : 'http://localhost:8000/api/v1';

  // Configurar axios com token de autenticação
  const setupAxiosInterceptors = (token) => {
    axios.defaults.baseURL = API_URL;
    
    axios.interceptors.request.use(
      (config) => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          logout();
          navigate('/login');
        }
        return Promise.reject(error);
      }
    );
  };

  // Verificar se o token está expirado
  const isTokenExpired = (token) => {
    try {
      const decoded = jwtDecode(token);
      return decoded.exp < Date.now() / 1000;
    } catch (error) {
      return true;
    }
  };

  // Inicializar autenticação
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (token && !isTokenExpired(token)) {
          setupAxiosInterceptors(token);
          
          // Obter informações do usuário
          const response = await axios.get(`${API_URL}/auth/me/`);
          setCurrentUser(response.data);
        } else if (refreshToken && !isTokenExpired(refreshToken)) {
          // Tentar renovar o token
          const response = await axios.post(`${API_URL}/auth/token/refresh/`, {
            refresh: refreshToken
          });
          
          localStorage.setItem('token', response.data.access);
          setupAxiosInterceptors(response.data.access);
          
          // Obter informações do usuário
          const userResponse = await axios.get(`${API_URL}/auth/me/`);
          setCurrentUser(userResponse.data);
        } else {
          // Limpar tokens expirados
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
        }
      } catch (error) {
        console.error('Erro ao inicializar autenticação:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [navigate]);

  // Login
  const login = async (username, password) => {
    try {
      setError(null);
      const response = await axios.post(`${API_URL}/auth/token/`, {
        username,
        password
      });
      
      const { access, refresh } = response.data;
      
      localStorage.setItem('token', access);
      localStorage.setItem('refreshToken', refresh);
      
      setupAxiosInterceptors(access);
      
      // Obter informações do usuário
      const userResponse = await axios.get(`${API_URL}/auth/me/`);
      setCurrentUser(userResponse.data);
      
      return true;
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      setError(error.response?.data?.detail || 'Erro ao fazer login. Verifique suas credenciais.');
      return false;
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setCurrentUser(null);
    navigate('/login');
  };

  // Verificar se o usuário tem permissão
  const hasPermission = (permission) => {
    if (!currentUser || !currentUser.perfil) return false;
    
    const { nivel_acesso } = currentUser.perfil;
    
    if (nivel_acesso === 'admin') return true;
    
    if (permission === 'gestor' && (nivel_acesso === 'gestor' || nivel_acesso === 'admin')) {
      return true;
    }
    
    return false;
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    logout,
    hasPermission,
    API_URL
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
