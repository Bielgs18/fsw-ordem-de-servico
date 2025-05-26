// backend/src/routes/ordemServicoRoutes.js

const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Conexão com o banco de dados
const upload = require('../config/multerConfig');
const fs = require('fs');
const path = require('path');

const ordemServicoController = require('../controllers/ordemServicoController');  // Importa o controller

// Rota para pegar todas as ordens de serviço
router.get('/ordens-servico', (req, res) => {
  const query = `
  SELECT 
    os.*,
    eq.nome_equipamento,
    eq.numero_serie,
    eq.cnpj, 
    eq.email, 
    eq.responsavel
  FROM ordens_servico os
  LEFT JOIN equipamentos eq ON os.id_equipamento = eq.id
`;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: 'Erro ao buscar ordens de serviço' });
    return res.json(results);
  });
});

// Rota para pegar uma ordem de serviço por ID
router.get('/ordens-servico/:id', ordemServicoController.buscarOrdemServicoPorId);


// Rota para atualizar uma ordem de serviço (inclui assinatura e outros campos)
router.put('/ordens-servico/:id',
  upload.fields([
    { name: 'imagens_servico', maxCount: 10 },
    { name: 'assinatura_tecnico', maxCount: 1 },
    { name: 'assinatura_acompanhante', maxCount: 1 }
  ]),
  ordemServicoController.atualizarOrdemServico // Usando o controller com a lógica de assinatura
);

router.delete('/ordens-servico/imagens/:nomeArquivo', (req, res) => {
  const { nomeArquivo } = req.params;

  // Primeiro, pegar o nome do arquivo da imagem no banco
  const querySelect = 'SELECT id, url_imagem FROM ordem_servico_imagens WHERE url_imagem = ?';

  db.query(querySelect, [nomeArquivo], (err, results) => {
    if (err) {
      console.error('Erro ao buscar imagem para exclusão:', err);
      return res.status(500).json({ message: 'Erro interno ao buscar imagem' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Imagem não encontrada' });
    }

    const nomeArquivoBanco = results[0].url_imagem;
    const caminhoArquivo = path.join(__dirname, '..', 'uploads', 'fotos-servico', nomeArquivoBanco);

    // Deletar arquivo físico da pasta
    fs.unlink(caminhoArquivo, (err) => {
      if (err) {
        // Pode ser que o arquivo já não exista, só logar o erro e continuar
        console.warn('Arquivo não encontrado ou erro ao deletar arquivo:', err.message);
      }

      // Depois deletar o registro no banco usando o ID obtido na consulta
      const queryDelete = 'DELETE FROM ordem_servico_imagens WHERE id = ?';

      db.query(queryDelete, [results[0].id], (err) => {
        if (err) {
          console.error('Erro ao deletar imagem no banco:', err);
          return res.status(500).json({ message: 'Erro ao deletar imagem no banco' });
        }

        return res.json({ message: 'Imagem excluída com sucesso' });
      });
    });
  });
});

module.exports = router;
