// src/pages/Dashboard.js
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Dashboard.css';
import TabelaOrdensServico from '../components/TabelaOrdensServico';

function Dashboard() {
  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <h2 style={{ userSelect: 'none', outline: 'none' }}>Órbita</h2>
        <nav>
          <ul>
            <li><Link to="/usuarios">👥 Usuários</Link></li>
            <li><Link to="/configuracoes-empresa">⚙️ Configurações da Empresa</Link></li>
          </ul>
        </nav>
      </aside>

      <main className="dashboard-content">
        <h1>Ordens de Serviço</h1>
        <TabelaOrdensServico />
      </main>
    </div>
  );
}

export default Dashboard;
