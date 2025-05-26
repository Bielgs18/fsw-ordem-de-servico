// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Importação das páginas
import Login from './pages/Login';
import RecuperarSenha from './pages/RecuperarSenha';
import RedefinirSenha from './pages/RedefinirSenha';
import Dashboard from './pages/Dashboard';
import Usuarios from './pages/Usuarios';
import OrdensServico from './pages/OrdensServico';
import OrdemServicoValidar from './pages/OrdemServicoValidar';
import OrdemServicoAtender from './pages/OrdemServicoAtender';
import NovaOrdemServico from './pages/NovaOrdemServico';
import ConfiguracoesEmpresa from './pages/configuracoesEmpresa'; // <- nova importação

// Importação do componente ProtectedRoute
import ProtectedRoute from './components/ProtectedRoute';


function App() {
  return (
    <Router>
      <Routes>
        {/* Redireciona raiz para /login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Rotas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/recuperar-senha" element={<RecuperarSenha />} />
        <Route path="/resetar-senha/:token" element={<RedefinirSenha />} />

        {/* Rotas protegidas */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/usuarios"
          element={
            <ProtectedRoute requireAdmin={true}>
              <Usuarios />
            </ProtectedRoute>
          }
        />

        <Route
          path="/ordensservico"
          element={
            <ProtectedRoute>
              <OrdensServico />
            </ProtectedRoute>
          }
        />

        <Route
          path="/ordem-servico/:id"
          element={
            <ProtectedRoute>
              <OrdemServicoValidar />
            </ProtectedRoute>
          }
        />

        <Route
          path="/editar/:id"
          element={
            <ProtectedRoute>
              <OrdemServicoAtender />
            </ProtectedRoute>
          }
        />

        <Route
          path="/nova-ordem-servico"
          element={
            <ProtectedRoute>
              <NovaOrdemServico />
            </ProtectedRoute>
          }
        />

        <Route
          path="/configuracoes-empresa"
          element={
            <ProtectedRoute>
              <ConfiguracoesEmpresa />
            </ProtectedRoute>
          }
        />

        {/* Rota coringa */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
