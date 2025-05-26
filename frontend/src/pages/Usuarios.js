// frontend/src/pages/Usuarios.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/Usuarios.css';

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({ nome: '', email: '', senha: '', nivel_acesso: 'usuario' });
  const [showModal, setShowModal] = useState(false);

  const token = localStorage.getItem('fswToken');
  const headers = { Authorization: `Bearer ${token}` };

  // Carrega a lista de usuários
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('fswToken');
  
      if (!token) {
        console.error('Token não encontrado no localStorage.');
        return;
      }
  
      const response = await axios.get('http://localhost:5000/api/auth/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
  
      console.log('Resposta da API:', response.data);
      setUsuarios(response.data);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error.response?.data || error.message);
    }
  };
  
  

  useEffect(() => { fetchUsers(); }, []);

  // Abre modal para criar novo
  const startCreate = () => {
    setEditUser(null);
    setForm({ nome: '', email: '', senha: '', nivel_acesso: 'usuario' });
    setShowModal(true);
  };

  // Abre modal para editar existente
  const startEdit = (user) => {
    setEditUser(user);
    setForm({ nome: user.nome, email: user.email, senha: '', nivel_acesso: user.nivel_acesso });
    setShowModal(true);
  };

  // Deleta usuário
  const handleDelete = async (id) => {
    if (!window.confirm('Excluir este usuário?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/auth/users/${id}`, { headers });
      fetchUsers();
    } catch (err) {
      console.error('Erro ao excluir usuário:', err);
    }
  };

  // Trata mudanças do formulário
  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  // Submete criação ou edição
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editUser) {
        await axios.put(
          `http://localhost:5000/api/auth/users/${editUser.id}`,
          form,
          { headers }
        );
      } else {
        await axios.post(
          `http://localhost:5000/api/auth/register`,
          form,
          { headers }
        );
      }
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      console.error('Erro ao salvar usuário:', err);
    }
  };

  return (
    <div className="usuarios-page">
      <div className="usuarios-card">
        <h2>Usuários</h2>
        <table className="usuarios-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>E‑mail</th>
              <th>Nivel de Acesso</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map(u => (
              <tr key={u.id}>
                <td>{u.nome}</td>
                <td>{u.email}</td>
                <td>{u.nivel_acesso}</td>
                <td>
                  <button className="btn-primary" onClick={() => startEdit(u)}>Editar</button>
                  <button className="btn-secondary" onClick={() => handleDelete(u.id)}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className="btn-primary" onClick={startCreate}>+ Novo Usuário</button>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{editUser ? 'Editar Usuário' : 'Criar Usuário'}</h3>
            <form onSubmit={handleSubmit}>
              <input
                name="nome"
                placeholder="Nome"
                value={form.nome}
                onChange={handleChange}
                required
              />
              <input
                name="email"
                type="email"
                placeholder="E‑mail"
                value={form.email}
                onChange={handleChange}
                required
              />
              <input
                name="senha"
                type="password"
                placeholder={editUser ? 'Nova Senha (opcional)' : 'Senha'}
                value={form.senha}
                onChange={handleChange}
                required={!editUser}
              />
              <select name="nivel_acesso" value={form.nivel_acesso} onChange={handleChange}>
                <option value="usuario">Usuário</option>
                <option value="tecnico">Técnico</option>
                <option value="admin">Admin</option>
              </select>
              <div className="modal-actions">
                <button type="submit" className="btn-primary">
                  {editUser ? 'Salvar' : 'Criar'}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
