const pool = require('../config/db.js');
const path = require('path');

// Função para inserir ou atualizar assinatura na tabela assinaturas_os usando callbacks
function upsertAssinatura(id_ordem, tipo, base64, nome_assinante, callback) {
  console.log(`Processando assinatura ${tipo} da OS ${id_ordem}`);
  if (!base64) return callback(null); // Nada a fazer se não enviar assinatura

  pool.query(
    'SELECT id FROM assinaturas_os WHERE id_ordem_servico = ? AND tipo_assinatura = ?',
    [id_ordem, tipo],
    (err, rows) => {
      if (err) return callback(err);

      if (rows.length > 0) {
        // Atualiza
        pool.query(
          'UPDATE assinaturas_os SET assinatura_base64 = ?, nome_assinante=? WHERE id = ?',
          [base64, nome_assinante, rows[0].id],
          (err) => {
            callback(err);
          }
        );
      } else {
        // Insere nova
        pool.query(
          'INSERT INTO assinaturas_os (id_ordem_servico, tipo_assinatura, nome_assinante, assinatura_base64) VALUES (?, ?, ?, ?)',
          [id_ordem, tipo, nome_assinante, base64],
          (err) => {
            callback(err);
          }
        );
      }
    }
  );
}

// Atualizar uma ordem de serviço existente
exports.atualizarOrdemServico = (req, res) => {

  console.log('Requisição recebida:', req.body);
  const { id } = req.params;

  const {
    descricao_servico,
    estado_equipamento,
    nome_acompanhante,
    status,
    data_finalizacao,
    pecas_utilizadas,
    assinatura_tecnico_base64,
    assinatura_acompanhante_base64
  } = req.body;

  console.log('Status:', status);
  console.log('assinatura_tecnico_base64:', assinatura_tecnico_base64 ? 'Recebida' : 'Vazia');

  // Formata a data_finalizacao recebida, se existir
  let finalizacaoData = null;
  if (data_finalizacao) {
    try {
      const dataObj = new Date(data_finalizacao);
      if (!isNaN(dataObj)) {
        finalizacaoData = dataObj.toISOString().slice(0, 19).replace('T', ' ');
      } else {
        return res.status(400).json({ error: 'Formato de data_finalizacao inválido.' });
      }
    } catch (e) {
      return res.status(400).json({ error: 'Erro ao processar data_finalizacao.' });
    }
  }

  // Atualiza a ordem de serviço
  pool.query(
    `UPDATE ordens_servico
     SET descricao_servico = ?, estado_equipamento = ?, nome_acompanhante = ?,
         status = ?, data_finalizacao = ?, pecas_utilizadas=?
     WHERE id = ?`,
    [
      descricao_servico,
      estado_equipamento,
      nome_acompanhante,
      status,
      finalizacaoData,
      pecas_utilizadas,
      id
    ],
    (err) => {
      if (err) {
        console.error('Erro ao atualizar OS:', err);
        return res.status(500).json({ error: 'Erro ao atualizar ordem de serviço.' });
      }

      // Função para inserir imagens na tabela ordem_servico_imagens usando callback para o final do processo
      function inserirImagens(imagens, callbackImagens) {
        if (!imagens || imagens.length === 0) return callbackImagens(null);

        let count = 0;
        const total = imagens.length;

        imagens.forEach((imagem) => {
          const urlImagem = imagem.filename;
          pool.query(
            'INSERT INTO ordem_servico_imagens (id_ordem_servico, url_imagem) VALUES (?, ?)',
            [id, urlImagem],
            (err) => {
              if (err) return callbackImagens(err);
              count++;
              if (count === total) callbackImagens(null);
            }
          );
        });
      }

      // Atualiza assinaturas só se status for 'aberto'
      if (status === 'aberto') {
        upsertAssinatura(id, 'tecnico', assinatura_tecnico_base64, 'Técnico Responsável', (err) => {
          if (err) {
            console.error('Erro ao atualizar assinatura técnico:', err);
            return res.status(500).json({ error: 'Erro ao atualizar assinatura técnico.' });
          }
          upsertAssinatura(id, 'acompanhante', assinatura_acompanhante_base64, nome_acompanhante, (err) => {
            if (err) {
              console.error('Erro ao atualizar assinatura acompanhante:', err);
              return res.status(500).json({ error: 'Erro ao atualizar assinatura acompanhante.' });
            }

            // Depois das assinaturas, insere as imagens
            inserirImagens(req.files ? req.files['imagens_servico'] : null, (err) => {
              if (err) {
                console.error('Erro ao inserir imagens:', err);
                return res.status(500).json({ error: 'Erro ao inserir imagens.' });
              }
              return res.status(200).json({ message: 'Ordem de serviço atualizada com sucesso.' });
            });
          });
        });
      } else {
        // Se não for status 'aberto', não atualiza assinaturas, só insere imagens
        inserirImagens(req.files ? req.files['imagens_servico'] : null, (err) => {
          if (err) {
            console.error('Erro ao inserir imagens:', err);
            return res.status(500).json({ error: 'Erro ao inserir imagens.' });
          }
          return res.status(200).json({ message: 'Ordem de serviço atualizada com sucesso.' });
        });
      }
    }
  );
};

// Buscar uma ordem de serviço por ID
exports.buscarOrdemServicoPorId = (req, res) => {
  const { id } = req.params;

  pool.query(
    `SELECT os.*, e.numero_serie, e.nome_equipamento, e.cnpj, e.email, e.responsavel
     FROM ordens_servico os
     LEFT JOIN equipamentos e ON os.id_equipamento = e.id
     WHERE os.id = ?`,
    [id],
    (err, rows) => {
      if (err) {
        console.error('Erro ao buscar OS por ID:', err);
        return res.status(500).json({ error: 'Erro ao buscar ordem de serviço.' });
      }

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Ordem de serviço não encontrada.' });
      }

      const ordemServico = rows[0];

      pool.query(
        `SELECT url_imagem FROM ordem_servico_imagens WHERE id_ordem_servico = ?`,
        [id],
        (err, imagensRows) => {
          if (err) {
            console.error('Erro ao buscar imagens da OS:', err);
            return res.status(500).json({ error: 'Erro ao buscar imagens da ordem de serviço.' });
          }

          const baseUrl = 'http://localhost:5000/uploads/fotos-servico/';
          ordemServico.imagens = imagensRows.map(img =>
            img.url_imagem.startsWith('http')
              ? img.url_imagem
              : baseUrl + img.url_imagem
          );


          pool.query(
            'SELECT tipo_assinatura, nome_assinante, assinatura_base64 FROM assinaturas_os WHERE id_ordem_servico = ?',
            [id],
            (err, assinaturasRows) => {
              if (err) {
                console.error('Erro ao buscar assinaturas da OS:', err);
                return res.status(500).json({ error: 'Erro ao buscar assinaturas da ordem de serviço.' });
              }

              ordemServico.assinaturas = {
                tecnico: null,
                acompanhante: null
              };

              assinaturasRows.forEach((assinatura) => {
                ordemServico.assinaturas[assinatura.tipo_assinatura] = {
                  base64: assinatura.assinatura_base64,
                  nome: assinatura.nome_assinante
                }
              });

              return res.status(200).json(ordemServico);
            }
          );
        }
      );
    }
  );
};
