import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/OrdensServico.css';

const TabelaOrdensServico = () => {
  const [ordens, setOrdens] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [tipoVisitaFilter, setTipoVisitaFilter] = useState('');
  const [modalidadeFilter, setModalidadeFilter] = useState('');

  useEffect(() => {
    async function fetchOrdens() {
      try {
        const response = await axios.get('http://localhost:5000/api/ordens-servico');
        setOrdens(response.data);
      } catch (error) {
        console.error('Erro ao buscar ordens de serviço:', error);
      }
    }

    fetchOrdens();
  }, []);

  const ordensFiltradas = ordens.filter((ordem) => {
    return (
      (statusFilter === '' || ordem.status === statusFilter) &&
      (tipoVisitaFilter === '' || ordem.tipo_visita === tipoVisitaFilter) &&
      (modalidadeFilter === '' || ordem.modalidade === modalidadeFilter)
    );
  });

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">Filtrar por Status</option>
          <option value="Aguardando Atendimento">Aguardando Atendimento</option>
          <option value="Em Pendencia">Com Pendência</option>
          <option value="Realizado Em Validação">Realizado Em Validação</option>
          <option value="Finalizado">Finalizado</option>
          <option value="Atrasado">Atrasado</option>
          <option value="Cancelado">Cancelado</option>
        </select>

        <select value={tipoVisitaFilter} onChange={(e) => setTipoVisitaFilter(e.target.value)} style={{ marginLeft: '10px' }}>
          <option value="">Filtrar por Tipo de Visita</option>
          <option value="Técnico">Técnico</option>
          <option value="Científico">Científico</option>
        </select>

        <select value={modalidadeFilter} onChange={(e) => setModalidadeFilter(e.target.value)} style={{ marginLeft: '10px' }}>
          <option value="">Filtrar por Modalidade</option>
          <option value="Presencial">Presencial</option>
          <option value="Remoto">Remoto</option>
        </select>
      </div>

      <table className="tabela-ordens-servico" border="1" cellPadding="8" width="100%">
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Solicitante</th>
            <th>Protocolo</th>
            <th>Técnico</th>
            <th>Abertura</th>
            <th>Visita</th>
            <th>Tipo de Visita</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {ordensFiltradas.length > 0 ? (
            ordensFiltradas.map((ordem) => (
              <tr key={ordem.id}>
                <td>{ordem.nome_empresa}</td>
                <td>{ordem.nome_solicitante}</td>
                <td>{ordem.numero_protocolo}</td>
                <td>{ordem.nome_tecnico}</td>
                <td>{ordem.data_abertura}</td>
                <td>{ordem.data_agendamento}</td>
                <td>{ordem.tipo_visita}</td>
                <td>{ordem.status}</td>
                <td>
                  <Link to={`/ordem-servico/${ordem.id}`}><button>Validar</button></Link>
                  <Link to={`/editar/${ordem.id}`}><button>Atender OS</button></Link>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="9" style={{ textAlign: 'center' }}>Nenhuma ordem encontrada com os filtros selecionados.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TabelaOrdensServico;
