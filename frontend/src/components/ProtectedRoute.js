import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requireAdmin }) => {
  const token = localStorage.getItem('fswToken');
  const perfil = localStorage.getItem('fswPerfil'); // Deve ser salvo após o login

  // Se não há token, redireciona para login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Se rota requer admin e perfil não é admin, redireciona para dashboard
  if (requireAdmin && perfil !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  // Autorizado: renderiza o conteúdo da rota
  return children;
};

export default ProtectedRoute;
