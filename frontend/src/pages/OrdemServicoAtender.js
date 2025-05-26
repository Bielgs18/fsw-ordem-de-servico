import React, { useState, useEffect } from 'react';
import CampoAssinatura from '../components/CampoAssinatura';
import  {jwtDecode} from 'jwt-decode';

const OrdemServicoAtender = ({ match }) => {
  const [ordem, setOrdem] = useState({
    descricao_servico: '',
    estado_equipamento: '',
    pecas_utilizadas: '',
    nome_acompanhante: '',
    imagens_servico: [],
    status: '',
    comentarios_observacoes: [],
    novo_comentario: '',
    data_finalizacao: '',
    assinatura_tecnico: '',
    assinatura_acompanhante: ''
  });

  const [dadosOrbita, setDadosOrbita] = useState({
    numero_protocolo: '',
    nome_solicitante: '',
    telefone_solicitante: '',
    data_abertura: '',
    data_agendamento: '',
    nome_empresa: '',
    endereco: '',
    problema_reportado: '',
    tipo_visita: '',
    modalidade: '',
    nome_tecnico: '',
    numero_serie: '',
    nome_equipamento: '',
    cnpj: '',
    email: '',


  });


  const [statusSalvo, setStatusSalvo] = useState(''); // novo estado para guardar status salvo
  const [usuarioLogado, setUsuarioLogado] = useState('Usuário Desconhecido');
  const ordemId = match?.params?.id || '1';
  const [comentariosDb, setComentariosDb] = useState([]);


  const token = localStorage.getItem('token');
  if (token) {
    try {
      const decoded = jwtDecode(token);
      const nome = decoded.nome || decoded.username || decoded.email || 'Usuário Desconhecido'
      setUsuarioLogado(nome);
    } catch {
      setUsuarioLogado('Usuário Desconhecido');
      // token inválido ou não decodificável
    }
  }

  const carregarComentarios = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/comentarios/${ordemId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Erro ao carregar comentários');

      const data = await response.json();
      setComentariosDb(data);
    } catch (error) {
      console.error('Erro ao buscar comentários do banco:', error);
    }
  };



  useEffect(() => {
    const carregarDados = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/ordens-servico/${ordemId}`);
        if (!response.ok) throw new Error('Erro ao carregar ordem');

        const data = await response.json();

        setOrdem({
          descricao_servico: data.descricao_servico || '',
          estado_equipamento: data.estado_equipamento || '',
          pecas_utilizadas: data.pecas_utilizadas || '',
          nome_acompanhante: data.nome_acompanhante || '',
          imagens_servico: Array.isArray(data.imagens) ? data.imagens : [],
          status: data.status || '',
          comentarios_observacoes: data.comentarios_observacoes ? JSON.parse(data.comentarios_observacoes) : [],
          novo_comentario: '',
          data_finalizacao: data.data_finalizacao || null,
          assinatura_tecnico: data.assinatura_tecnico || '',
          assinatura_acompanhante: data.assinatura_acompanhante || ''
        });

        setStatusSalvo(data.status || '');

        setDadosOrbita({
          numero_protocolo: data.numero_protocolo,
          nome_solicitante: data.nome_solicitante,
          telefone_solicitante: data.telefone_solicitante,
          data_abertura: data.data_abertura,
          data_agendamento: data.data_agendamento,
          nome_empresa: data.nome_empresa,
          endereco: data.endereco,
          problema_reportado: data.problema_reportado,
          tipo_visita: data.tipo_visita,
          modalidade: data.modalidade,
          nome_tecnico: data.nome_tecnico,
          numero_serie: data.numero_serie,
          nome_equipamento: data.nome_equipamento,
          cnpj: data.cnpj,
          email: data.email,
          responsavel: data.responsavel
        });

        await carregarComentarios(); // <- Correto aqui, dentro do try
      } catch (err) {
        console.error('Erro ao carregar dados da ordem:', err);
      }
    };

    carregarDados();
  }, [ordemId]);


  // Função para determinar se pode editar assinatura com base no status salvo
  const podeEditarAssinatura = () => {
    return statusSalvo.toLowerCase().trim() === 'aberto';
  };


  const deletarImagem = async (imagemUrl) => {
    try {
      // Extrai só o nome do arquivo da URL (se vier com full url)
      const nomeArquivo = imagemUrl.split('/').pop();

      const response = await fetch(`http://localhost:5000/api/ordens-servico/imagens/${nomeArquivo}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Erro ao deletar imagem');

      // Atualiza o estado removendo a imagem deletada
      setOrdem(prev => ({
        ...prev,
        imagens_servico: prev.imagens_servico.filter(img => img !== imagemUrl)
      }));

    } catch (error) {
      console.error('Erro ao deletar imagem:', error);
      alert('Não foi possível deletar a imagem.');
    }
  };


  // Salva a ordem no backend (exclui imagens e outros dados complexos para esse save simples)
  const salvarAssinatura = (campo, novaAssinatura) => {
    console.log(`Salvando assinatura em ${campo}`, novaAssinatura);
    setOrdem(prev => ({
      ...prev,
      [campo]: novaAssinatura
    }));
  };



  const autoSave = async (dadosAtualizados) => {
    try {
      const dadosParaSalvar = { ...dadosAtualizados };
      delete dadosParaSalvar.assinatura_tecnico;
      delete dadosParaSalvar.assinatura_acompanhante;

      await fetch(`http://localhost:5000/api/ordens-servico/${ordemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosAtualizados)
      });
    } catch (err) {
      console.error('Erro no auto-save:', err);
    }
  };

  const handleChange = (e) => {
    const updated = { ...ordem, [e.target.name]: e.target.value };
    if (e.target.name === 'status') {
      updated.data_finalizacao = new Date().toISOString();
    }
    setOrdem(updated);
    autoSave(updated);
  };

  const handleAddComentario = async () => {
    if (!ordem.novo_comentario.trim()) return;
    const novoComentario = {
      id_referencia: ordemId,
      comentario: ordem.novo_comentario
    };
    try {
      const response = await fetch(`http://localhost:5000/api/comentarios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(novoComentario)
      });

      if (!response.ok) throw new Error('Erro ao adicionar comentário');

      const comentariosAtualizados = await response.json(); // backend deve retornar lista atualizada

      setOrdem(prev => ({
        ...prev,
        comentarios_observacoes: comentariosAtualizados,
        novo_comentario: ''
      }));

    } catch (error) {
      alert('Erro ao salvar comentário');
      console.error(error);
    }
    await carregarComentarios(); // atualizar lista após inserir
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const updated = { ...ordem, imagens_servico: [...ordem.imagens_servico, ...files] };
    setOrdem(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('Assinatura Técnico:', ordem.assinatura_tecnico);
    console.log('Assinatura Acompanhante:', ordem.assinatura_acompanhante);

    const formData = new FormData();
    formData.append('descricao_servico', ordem.descricao_servico);
    formData.append('estado_equipamento', ordem.estado_equipamento);
    formData.append('pecas_utilizadas', ordem.pecas_utilizadas);
    formData.append('nome_acompanhante', ordem.nome_acompanhante);
    formData.append('status', ordem.status);
    formData.append('comentarios_observacoes', JSON.stringify(ordem.comentarios_observacoes));
    formData.append('novo_comentario', ordem.novo_comentario);
    formData.append('data_finalizacao', ordem.data_finalizacao ? new Date(ordem.data_finalizacao).toISOString() : '');
    formData.append('assinatura_tecnico_base64', ordem.assinatura_tecnico);
    formData.append('assinatura_acompanhante_base64', ordem.assinatura_acompanhante);

    for (const img of ordem.imagens_servico) {
      formData.append('imagens_servico', img);
    }

    try {
      const response = await fetch(`http://localhost:5000/api/ordens-servico/${ordemId}`, {
        method: 'PUT',
        body: formData
      });

      if (response.ok) {
        alert('Ordem de serviço atualizada com sucesso!');
        setStatusSalvo(ordem.status); // atualiza o status salvo só depois do save
      } else {
        alert('Erro ao salvar a ordem de serviço.');
        console.error(await response.text());
      }
    } catch (error) {
      console.error('Erro ao enviar ordem:', error);
      alert('Erro ao conectar com o servidor.');
    }
  };

  return (
    <div className="container">
      <h2>Editar Ordem de Serviço</h2>

      <fieldset className="dados-orbita">
        <legend>Dados do Órbita App</legend>
        <p><strong>Número de Protocolo:</strong> {dadosOrbita.numero_protocolo}</p>
        <p><strong>Nome do Solicitante:</strong> {dadosOrbita.nome_solicitante}</p>
        <p><strong>Telefone do Solicitante:</strong> {dadosOrbita.telefone_solicitante}</p>
        <p><strong>Data da Abertura:</strong> {dadosOrbita.data_abertura}</p>
        <p><strong>Data do Agendamento:</strong> {dadosOrbita.data_agendamento}</p>
        <p><strong>Número de Série:</strong> {dadosOrbita.numero_serie}</p>
        <p><strong>Nome do Equipamento:</strong> {dadosOrbita.nome_equipamento}</p>
        <p><strong>Nome da Empresa:</strong> {dadosOrbita.nome_empresa}</p>
        <p><strong>CNPJ:</strong> {dadosOrbita.cnpj}</p>
        <p><strong>Endereço:</strong> {dadosOrbita.endereco}</p>
        <p><strong>Email:</strong> {dadosOrbita.email}</p>
        <p><strong>Responsável:</strong> {dadosOrbita.responsavel}</p>
        <p><strong>Problema Reportado:</strong> {dadosOrbita.problema_reportado}</p>
        <p><strong>Tipo de Visita:</strong> {dadosOrbita.tipo_visita}</p>
        <p><strong>Modalidade:</strong> {dadosOrbita.modalidade}</p>
        <p><strong>Nome do Técnico:</strong> {dadosOrbita.nome_tecnico}</p>


      </fieldset>

      <form onSubmit={handleSubmit}>

        <div>
          <label>Descrição do Serviço:</label>
          <textarea name="descricao_servico" value={ordem.descricao_servico} onChange={handleChange} />
        </div>

        <div>
          <label>Estado do Equipamento:</label>
          <input type="text" name="estado_equipamento" value={ordem.estado_equipamento} onChange={handleChange} />
        </div>
        <div>
          <label>Peças Utilizadas:</label>
          <textarea name="pecas_utilizadas" value={ordem.pecas_utilizadas} onChange={handleChange} />
        </div>

        <div>
          <label>Nome do Acompanhante:</label>
          <input type="text" name="nome_acompanhante" value={ordem.nome_acompanhante} onChange={handleChange} />
        </div>

        <div>
          <label>Status:</label>
          <select name="status" value={ordem.status} onChange={handleChange}>
            <option value="">Selecione</option>
            <option value="aberto">Aberto</option>
            <option value="em andamento">Em andamento</option>
            <option value="executado em validacao">executado em Validação</option>
            <option value="finalizado">Finalizado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>

        <div>
          <label>Imagens do Serviço:</label>
          <input type="file" multiple accept="image/*" onChange={handleImageChange} />
        </div>

        <div className="imagens-preview">
          {ordem.imagens_servico.length === 0 && <p>Nenhuma imagem adicionada.</p>}

          {ordem.imagens_servico.map((img, index) => {
            // Imagem já salva (string: nome do arquivo)
            if (typeof img === 'string') {
              return (
                <div key={index} style={{ display: 'inline-block', position: 'relative', marginRight: 10 }}>
                  <img
                    key={index}
                    src={img}
                    alt={`Imagem salva ${index + 1}`}
                    style={{ width: 150 }}
                  />
                  <button
                    onClick={() => deletarImagem(img)}
                    style={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      backgroundColor: 'red',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: 24,
                      height: 24,
                      cursor: 'pointer'
                    }}

                    title="Excluir imagem"
                  >
                    &times;
                  </button>
                </div>
              );
            }
            // Imagem nova (tipo File)
            if (img instanceof File) {
              return (
                <img
                  key={index}
                  src={URL.createObjectURL(img)}
                  alt={`Imagem nova ${index + 1}`}
                  style={{ width: 150, marginRight: 10 }}
                />
              );
            }

            return null;
          })}
        </div>

        {/* Campo Assinatura Técnico */}
        <div>
          <label>Assinatura do Técnico:</label>
          <CampoAssinatura
            disabled={!podeEditarAssinatura()}
            imagemInicial={ordem.assinatura_tecnico}
            onSalvar={(novaAssinatura) => salvarAssinatura('assinatura_tecnico', novaAssinatura)}
          />
        </div>

        {/* Campo Assinatura Acompanhante */}
        <div>
          <label>Assinatura do Acompanhante:</label>
          <CampoAssinatura
            disabled={!podeEditarAssinatura()}
            imagemInicial={ordem.assinatura_acompanhante}
            onSalvar={(novaAssinatura) => salvarAssinatura('assinatura_acompanhante', novaAssinatura)}
          />
        </div>

        <div>
          <label>Comentários / Observações:</label>
          <textarea
            name="novo_comentario"
            value={ordem.novo_comentario}
            onChange={handleChange}
            placeholder="Digite um comentário"
          />
          <button type="button" onClick={handleAddComentario}>Adicionar Comentário</button>
          <ul>
            {comentariosDb.map((c, i) => (
              <li key={i}>
                <strong>{c.nome_usuario || 'Desconhecido'}</strong>
                ({new Date(c.criado_em).toLocaleString()}): {c.comentario}
              </li>
            ))}
          </ul>

        </div>

        <button type="submit">Salvar Ordem</button>
      </form>
    </div>
  );
};

export default OrdemServicoAtender; 