import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import html2pdf from 'html2pdf.js';
import '../styles/OrdemServicoValidar.css';

const OrdemServicoValidar = () => {
  const { id } = useParams();
  const [ordem, setOrdem] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [novasImagensArquivos, setNovasImagensArquivos] = useState([]); // arquivos novos para upload

  useEffect(() => {
    // Buscar dados da ordem e comentários do backend
    const buscarDados = async () => {
      try {
        const respostaOrdem = await fetch(`/api/ordens/${id}`);
        if (!respostaOrdem.ok) throw new Error('Erro ao buscar ordem');
        const dadosOrdem = await respostaOrdem.json();

        const respostaComentarios = await fetch(`/api/ordens/${id}/comentarios`);
        if (!respostaComentarios.ok) throw new Error('Erro ao buscar comentários');
        const dadosComentarios = await respostaComentarios.json();

        setOrdem(dadosOrdem);
        setComentarios(dadosComentarios);
      } catch (error) {
        console.error(error);
        alert('Erro ao carregar dados da ordem.');
      }
    };

    buscarDados();
  }, [id]);

  const handleChange = (e) => {
    setOrdem({ ...ordem, [e.target.name]: e.target.value });
  };

  // Handle para selecionar arquivos de imagem
  const handleUploadImagens = (e) => {
    const arquivosSelecionados = Array.from(e.target.files);
    setNovasImagensArquivos((prev) => [...prev, ...arquivosSelecionados]);
  };

  // Remover imagem existente (URL) pelo índice
  const removerImagemExistente = (index) => {
    const novasImagens = ordem.imagens_servico.filter((_, i) => i !== index);
    setOrdem({ ...ordem, imagens_servico: novasImagens });
  };

  // Remover imagem nova (arquivo) pelo índice
  const removerImagemNova = (index) => {
    const novasImagens = novasImagensArquivos.filter((_, i) => i !== index);
    setNovasImagensArquivos(novasImagens);
  };

  const gerarPDF = () => {
    const options = {
      margin: 0.5,
      filename: `Ordem_Serviço_${ordem.numero_protocolo}.pdf`,
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
    };

    const ordemServicoElement = document.getElementById('ordem-servico-detalhe');
    html2pdf().from(ordemServicoElement).set(options).save();
  };

  const salvarAlteracoes = async () => {
    try {
      const dataAtual = new Date().toISOString().split('T')[0];
      const ordemAtualizada = {
        ...ordem,
        data_finalizacao: ordem.data_finalizacao || dataAtual,
        // aqui pode incluir outras atualizações necessárias
      };

      // Para enviar imagens novas, criar um FormData
      const formData = new FormData();
      formData.append('ordem', JSON.stringify(ordemAtualizada));

      novasImagensArquivos.forEach((arquivo) => {
        formData.append('imagens_servico', arquivo);
      });

      // Requisição para atualizar ordem no backend
      const resposta = await fetch(`/api/ordens/${id}`, {
        method: 'PUT', // ou PATCH conforme sua API
        body: formData,
      });

      if (!resposta.ok) throw new Error('Erro ao salvar alterações');

      const dadosAtualizados = await resposta.json();
      setOrdem(dadosAtualizados);
      setNovasImagensArquivos([]);
      alert('Alterações salvas com sucesso!');
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar alterações.');
    }
  };

  if (!ordem) return <p>Carregando...</p>;

  return (
    <div className="ordem-servico-container" id="ordem-servico-detalhe">
      <h2>Validação da Ordem de Serviço</h2>

      <section className="informacoes-orbita">
        <h4>Informações da Oportunidade (via Órbita App)</h4>
        <p><strong>Protocolo:</strong> {ordem.numero_protocolo}</p>
        <p><strong>Solicitante:</strong> {ordem.nome_solicitante}</p>
        <p><strong>Telefone:</strong> {ordem.telefone_solicitante}</p>
        <p><strong>Data de Abertura:</strong> {ordem.data_abertura}</p>
        <p><strong>Data de Agendamento:</strong> {ordem.data_agendamento}</p>
        <p><strong>Empresa:</strong> {ordem.nome_empresa}</p>
        <p><strong>Endereço:</strong> {ordem.endereco}</p>
        <p><strong>Problema Reportado:</strong> {ordem.problema_reportado}</p>
        <p><strong>Tipo de Visita:</strong> {ordem.tipo_visita}</p>
        <p><strong>Modalidade:</strong> {ordem.modalidade}</p>
        <p><strong>Técnico:</strong> {ordem.nome_tecnico}</p>
      </section>

      <section className="dados-tecnicos">
        <h4>Dados Técnicos (editáveis para validação)</h4>

        <label>
          <strong>Descrição do Serviço:</strong>
          <textarea name="descricao_servico" value={ordem.descricao_servico} onChange={handleChange} />
        </label>

        <label>
          <strong>Estado do Equipamento:</strong>
          <input type="text" name="estado_equipamento" value={ordem.estado_equipamento} onChange={handleChange} />
        </label>

        <label>
          <strong>Peças Utilizadas:</strong>
          <input type="text" name="pecas_utilizadas" value={ordem.pecas_utilizadas} onChange={handleChange} />
        </label>

        <label>
          <strong>Status:</strong>
          <select name="status" value={ordem.status} onChange={handleChange}>
            <option value="Finalizado">Finalizado</option>
            <option value="Em Validação">Em Validação</option>
            <option value="Pendente">Pendente</option>
          </select>
        </label>

        <p><strong>Data de Finalização:</strong> {ordem.data_finalizacao || 'Não definida ainda'}</p>
      </section>

      <section className="imagens-servico">
        <h4>Imagens do Serviço</h4>
        <div className="imagens">
          {/* Imagens já salvas (URLs) */}
          {ordem.imagens_servico && ordem.imagens_servico.map((url, index) => (
            <div key={`existente-${index}`} style={{ display: 'inline-block', position: 'relative', margin: '0 10px' }}>
              <img src={url} alt={`Imagem existente ${index + 1}`} width="150" />
              <button
                type="button"
                onClick={() => removerImagemExistente(index)}
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  backgroundColor: 'red',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  cursor: 'pointer',
                }}
                title="Remover imagem existente"
              >
                &times;
              </button>
            </div>
          ))}

          {/* Previews das imagens novas (arquivos) */}
          {novasImagensArquivos.map((arquivo, index) => {
            const url = URL.createObjectURL(arquivo);
            return (
              <div key={`novo-${index}`} style={{ display: 'inline-block', position: 'relative', margin: '0 10px' }}>
                <img src={url} alt={`Nova imagem ${index + 1}`} width="150" />
                <button
                  type="button"
                  onClick={() => removerImagemNova(index)}
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    backgroundColor: 'red',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    cursor: 'pointer',
                  }}
                  title="Remover nova imagem"
                >
                  &times;
                </button>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: '10px' }}>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleUploadImagens}
          />
        </div>
      </section>

      <section className="assinaturas">
        <h4>Assinaturas</h4>
        <div className="assinatura">
          <p><strong>Técnico:</strong></p>
          <img src={ordem.assinatura_tecnico} alt="Assinatura Técnico" height="100" />
        </div>
        <div className="assinatura">
          <p><strong>Acompanhante:</strong></p>
          <img src={ordem.assinatura_acompanhante} alt="Assinatura Acompanhante" height="100" />
        </div>
      </section>

      <section className="historico-comentarios">
        <h4>Histórico de Comentários</h4>
        {comentarios.length > 0 ? (
          <ul>
            {comentarios.map((c, index) => (
              <li key={index}>
                <strong>{c.autor}</strong> ({c.data}): {c.mensagem}
              </li>
            ))}
          </ul>
        ) : (
          <p>Nenhum comentário registrado.</p>
        )}
      </section>

      <div className="botoes-acao">
        <button onClick={salvarAlteracoes}>Salvar Alterações</button>
        <button onClick={gerarPDF}>Gerar PDF</button>
      </div>
    </div>
  );
};

export default OrdemServicoValidar;
