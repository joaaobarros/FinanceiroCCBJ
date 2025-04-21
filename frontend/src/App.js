import React, { useState, useEffect } from 'react';

// Cores baseadas na logo do CCBJ
const ccbjTheme = {
  primary: '#8E24AA', // Roxo/Magenta
  secondary: '#FFC107', // Amarelo
  accent1: '#4CAF50', // Verde
  accent2: '#2196F3', // Azul
  accent3: '#FF5722', // Laranja
  background: '#f5f5f5',
  paper: '#ffffff',
  text: '#333333',
};

// Estilos CSS inline
const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Roboto, sans-serif',
  },
  header: {
    backgroundColor: ccbjTheme.primary,
    color: 'white',
    padding: '20px',
    borderRadius: '4px',
    marginBottom: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: 500,
  },
  card: {
    backgroundColor: ccbjTheme.paper,
    borderRadius: '4px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  button: {
    backgroundColor: ccbjTheme.secondary,
    color: ccbjTheme.text,
    border: 'none',
    borderRadius: '4px',
    padding: '10px 15px',
    cursor: 'pointer',
    fontWeight: 500,
    marginRight: '10px',
  },
  nav: {
    display: 'flex',
    marginBottom: '20px',
  },
  navItem: {
    padding: '10px 15px',
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
  },
  navItemActive: {
    borderBottom: `2px solid ${ccbjTheme.secondary}`,
    fontWeight: 500,
  },
  footer: {
    textAlign: 'center',
    padding: '20px',
    marginTop: '40px',
    borderTop: '1px solid #eee',
    color: '#666',
  },
};

function App() {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    // Simulando uma chamada à API
    setTimeout(() => {
      setMessage('Bem-vindo ao Sistema Financeiro CCBJ!');
      setLoading(false);
    }, 1500);
  }, []);

  const renderContent = () => {
    if (loading) {
      return <p>Carregando...</p>;
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <div style={styles.card}>
            <h2>Dashboard</h2>
            <p>Aqui você poderá visualizar os principais indicadores financeiros do CCBJ.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginTop: '20px' }}>
              {['Contratos Ativos', 'Orçamento Total', 'Valor Executado', 'Saldo Disponível'].map((item) => (
                <div key={item} style={{ 
                  flex: '1 1 200px', 
                  padding: '20px', 
                  backgroundColor: '#f9f9f9', 
                  borderRadius: '4px',
                  borderLeft: `4px solid ${ccbjTheme.primary}`,
                }}>
                  <h3 style={{ margin: '0 0 10px 0' }}>{item}</h3>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>R$ 0,00</p>
                </div>
              ))}
            </div>
          </div>
        );
      case 'contratos':
        return (
          <div style={styles.card}>
            <h2>Gestão de Contratos</h2>
            <p>Aqui você poderá gerenciar os contratos do CCBJ.</p>
            <button style={styles.button}>Novo Contrato</button>
            <div style={{ marginTop: '20px' }}>
              <p>Nenhum contrato cadastrado.</p>
            </div>
          </div>
        );
      case 'orcamento':
        return (
          <div style={styles.card}>
            <h2>Controle Orçamentário</h2>
            <p>Aqui você poderá gerenciar o orçamento do CCBJ.</p>
            <div style={{ marginTop: '20px' }}>
              <p>Dados orçamentários não disponíveis na versão de demonstração.</p>
            </div>
          </div>
        );
      default:
        return <p>Selecione uma opção no menu.</p>;
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>CCBJ Financeiro</h1>
        <p>{message}</p>
      </header>

      <nav style={styles.nav}>
        {['dashboard', 'contratos', 'orcamento'].map((tab) => (
          <div 
            key={tab}
            style={{ 
              ...styles.navItem, 
              ...(activeTab === tab ? styles.navItemActive : {}) 
            }}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </div>
        ))}
      </nav>

      <main>
        {renderContent()}
      </main>

      <footer style={styles.footer}>
        <p>© {new Date().getFullYear()} Centro Cultural Bom Jardim (CCBJ) - Sistema de Gestão Financeira</p>
      </footer>
    </div>
  );
}

export default App;
