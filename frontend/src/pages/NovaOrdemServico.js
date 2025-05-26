import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';  
import axios from 'axios';
import '../styles/NovaOrdemServico.css';

const NovaOrdemServico = () => {
  const navigate = useNavigate();  
  const [formData, setFormData] = useState({
    numero_protocolo: '',
    nome_solicitante: '',
    telefone_solicitante: '',
    data_abertura: '',
    data_agendamento: '',
    nome_empresa: '',
    endereco: '',
    problema_reportado: '',
    tipo_visita: 'Técnico',
    modalidade: 'Presencial',
    nome_tecnico: '',
    descricao_servico: '',
    estado_equipamento: '',
    pecas_utilizadas: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Enviar os dados para o backend
      const response = await axios.post('http://localhost:5000/api/ordens', formData);
      if (response.status === 201) {
        alert('Ordem de serviço cadastrada com sucesso!');
        navigate('/ordens'); 
      }
    } catch (error) {
      alert('Erro ao cadastrar ordem de serviço!');
      console.error(error);
    }
  };

  return (
    <div className="nova-ordem-container">
      <h2>Cadastrar Nova Ordem de Serviço</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Protocolo:</label>
          <input
            type="text"
            name="numero_protocolo"
            value={formData.numero_protocolo}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Solicitante:</label>
          <input
            type="text"
            name="nome_solicitante"
            value={formData.nome_solicitante}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Telefone:</label>
          <input
            type="text"
            name="telefone_solicitante"
            value={formData.telefone_solicitante}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Data de Abertura:</label>
          <input
            type="date"
            name="data_abertura"
            value={formData.data_abertura}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Data de Agendamento:</label>
          <input
            type="date"
            name="data_agendamento"
            value={formData.data_agendamento}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Empresa:</label>
          <input
            type="text"
            name="nome_empresa"
            value={formData.nome_empresa}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Endereço:</label>
          <input
            type="text"
            name="endereco"
            value={formData.endereco}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Problema Reportado:</label>
          <textarea
            name="problema_reportado"
            value={formData.problema_reportado}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Tipo de Visita:</label>
          <select
            name="tipo_visita"
            value={formData.tipo_visita}
            onChange={handleChange}
            required
          >
            <option value="Técnico">Técnico</option>
            <option value="Suporte">Suporte</option>
          </select>
        </div>
        <div>
          <label>Modalidade:</label>
          <select
            name="modalidade"
            value={formData.modalidade}
            onChange={handleChange}
            required
          >
            <option value="Presencial">Presencial</option>
            <option value="Remoto">Remoto</option>
          </select>
        </div>
        <div>
          <label>Técnico Responsável:</label>
          <input
            type="text"
            name="nome_tecnico"
            value={formData.nome_tecnico}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Descrição do Serviço:</label>
          <textarea
            name="descricao_servico"
            value={formData.descricao_servico}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Estado do Equipamento:</label>
          <input
            type="text"
            name="estado_equipamento"
            value={formData.estado_equipamento}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Peças Utilizadas:</label>
          <input
            type="text"
            name="pecas_utilizadas"
            value={formData.pecas_utilizadas}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit">Cadastrar Ordem</button>
      </form>
    </div>
  );
};

export default NovaOrdemServico;
