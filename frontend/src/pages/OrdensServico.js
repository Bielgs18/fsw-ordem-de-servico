import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';  // Importando o Link do React Router
import '../styles/OrdensServico.css'; 

const OrdensServico = () => {
  const [ordens, setOrdens] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [tipoVisitaFilter, setTipoVisitaFilter] = useState('');
  const [modalidadeFilter, setModalidadeFilter] = useState('');

  useEffect(() => {
    setOrdens([
      {
        id: 1,
        numero_protocolo: 'PROTOCOLO123',
        nome_solicitante: 'João Silva',
        telefone_solicitante: '11987654321',
        data_abertura: '2025-05-05',
        data_agendamento: '2025-05-10',
        tipo_visita: 'Técnico',
        modalidade: 'Presencial',
        nome_empresa: 'Hospital Santa Clara',
        endereco: 'Rua A, 123',
        problema_reportado: 'Equipamento não liga',
        nome_tecnico: 'Carlos Souza',
        descricao_servico: 'Substituição da fonte de alimentação',
        estado_equipamento: 'Funcional após reparo',
        nome_acompanhante: 'Maria Oliveira',
        status: 'Aguardando Atendimento',
        comentario_observacoes: 'Sem observações adicionais',
        pecas_utilizadas: 'Fonte de alimentação XZY123',
        assinatura_acompanhante: 'assinatura_image_url',
        assinatura_tecnico: 'assinatura_image_url',
        data_finalizacao: '',
      },
      {
        id: 2,
        numero_protocolo: 'PROTOCOLO124',
        nome_solicitante: 'Ana Costa',
        telefone_solicitante: '11998765432',
        data_abertura: '2025-05-03',
        data_agendamento: '2025-05-08',
        tipo_visita: 'Científico',
        modalidade: 'Remoto',
        nome_empresa: 'Clínica Vida',
        endereco: 'Rua B, 456',
        problema_reportado: 'Erro no diagnóstico',
        nome_tecnico: 'Ricardo Lima',
        descricao_servico: 'Análise dos parâmetros de diagnóstico',
        estado_equipamento: 'Sem alteração',
        nome_acompanhante: '',
        status: 'Finalizado',
        comentario_observacoes: 'Serviço concluído com sucesso',
        pecas_utilizadas: '',
        assinatura_acompanhante: '',
        assinatura_tecnico: 'assinatura_image_url',
        data_finalizacao: '2025-05-05',
      }
    ]);
  }, []);

  const handleFilter = () => {
    console.log('Filtrando ordens por:', statusFilter, tipoVisitaFilter, modalidadeFilter);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Ordens de Serviço</h2>
      
      <div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ marginRight: '10px' }}
        >
          <option value="">Filtrar por Status</option>
          <option value="Aguardando Atendimento">Aguardando Atendimento</option>
          <option value="Em Pendencia">Em Pendência</option>
          <option value="Realizado Em Validação">Realizado Em Validação</option>
          <option value="Finalizado">Finalizado</option>
          <option value="Atrasado">Atrasado</option>
        </select>

        <select
          value={tipoVisitaFilter}
          onChange={(e) => setTipoVisitaFilter(e.target.value)}
          style={{ marginRight: '10px' }}
        >
          <option value="">Filtrar por Tipo de Visita</option>
          <option value="Técnico">Técnico</option>
          <option value="Científico">Científico</option>
        </select>

        <select
          value={modalidadeFilter}
          onChange={(e) => setModalidadeFilter(e.target.value)}
          style={{ marginRight: '10px' }}
        >
          <option value="">Filtrar por Modalidade</option>
          <option value="Presencial">Presencial</option>
          <option value="Remoto">Remoto</option>
        </select>

        <button onClick={handleFilter}>Aplicar Filtros</button>
      </div>

      <button
        style={{ marginTop: '20px' }}
      >
        <Link to="/nova-ordem-servico">Nova Ordem de Serviço</Link>
      </button>

      <table border="1" cellPadding="8" style={{ marginTop: '20px', width: '100%' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Protocolo</th>
            <th>Solicitante</th>
            <th>Telefone</th>
            <th>Data Abertura</th>
            <th>Data Agendamento</th>
            <th>Descrição do Serviço</th>
            <th>Status</th>
            <th>Tipo Visita</th>
            <th>Modalidade</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {ordens.map((ordem) => (
            <tr key={ordem.id}>
              <td>{ordem.id}</td>
              <td>{ordem.numero_protocolo}</td>
              <td>{ordem.nome_solicitante}</td>
              <td>{ordem.telefone_solicitante}</td>
              <td>{new Date(ordem.data_abertura).toLocaleDateString()}</td>
              <td>{new Date(ordem.data_agendamento).toLocaleDateString()}</td>
              <td>{ordem.descricao_servico}</td>
              <td>{ordem.status}</td>
              <td>{ordem.tipo_visita}</td>
              <td>{ordem.modalidade}</td>
              <td>
                <Link to={`/ordem-servico/${ordem.id}`}>
                  <button>Ver</button>
                </Link>
                
                <Link to={`/editar/${ordem.id}`} >
                  <button>Editar</button>
                </Link>
                
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrdensServico;
