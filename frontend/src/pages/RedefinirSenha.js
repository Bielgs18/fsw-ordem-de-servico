import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/RedefinirSenha.css';

function RedefinirSenha() {
  const { token: urlToken } = useParams(); // token da URL (se existir)
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setMessage('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      // Verifica se o token vem da URL ou do localStorage
      const token = urlToken || localStorage.getItem('fswToken');

      if (!token) {
        setMessage('Token não encontrado. Faça login novamente ou solicite nova redefinição.');
        setLoading(false);
        return;
      }

      const config = urlToken
        ? {} // token da URL vai no body
        : {
            headers: {
              Authorization: `Bearer ${token}`, // token do localStorage vai no header
            },
          };

      const body = urlToken
        ? { token, newPassword } // estrutura quando vem da URL
        : { novaSenha: newPassword }; // estrutura quando o usuário está logado

      const endpoint = urlToken
        ? 'http://localhost:5000/api/resetar-senha'
        : 'http://localhost:5000/api/usuarios/alterar-senha';

      const response = await axios.post(endpoint, body, config);

      if (response.status === 200) {
        setMessage('Senha redefinida com sucesso!');
        setTimeout(() => {
          localStorage.removeItem('fswToken');
          localStorage.removeItem('fswPerfil');
          navigate('/login');
        }, 2000);
      }
    } catch (error) {
      setMessage(
        error.response?.data?.msg ||
          'Erro ao redefinir a senha. Verifique o token ou tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-wrapper">
      <h2>Redefinir Senha</h2>
      <form onSubmit={handleSubmit} className="reset-form">
        <label htmlFor="newPassword">Nova Senha:</label>
        <input
          id="newPassword"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />

        <label htmlFor="confirmPassword">Confirmar Senha:</label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Redefinindo...' : 'Redefinir'}
        </button>
      </form>
      {message && <p className="reset-message">{message}</p>}
    </div>
  );
}

export default RedefinirSenha;
