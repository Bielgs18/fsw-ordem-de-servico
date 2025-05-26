const express = require('express');
const router = express.Router();
const db = require('../config/db'); // ajuste o caminho se o seu arquivo de conexão for diferente
const verificarAutenticacao = require('../middlewares/verificarAutenticacao');

// GET comentários de uma ordem de serviço
router.get('/:ordemId', verificarAutenticacao, async (req, res) => {
  const { ordemId } = req.params;
  try {
    const [comentarios] = await db.query(`
      SELECT c.*, u.nome AS nome_usuario
      FROM comentarios c
      JOIN usuarios u ON u.id = c.id_usuario
      WHERE c.id_referencia = ?
      ORDER BY c.criado_em ASC
    `, [ordemId]);

    res.json(comentarios);
  } catch (error) {
    console.error('Erro ao buscar comentários:', error);
    res.status(500).json({ error: 'Erro ao buscar comentários' });
  }
});

// POST novo comentário
router.post('/', verificarAutenticacao, async (req, res) => {
  const { id_referencia, comentario } = req.body;
  const id_usuario = req.usuario.id;

  if (!id_referencia || !comentario) {
    return res.status(400).json({ error: 'Dados incompletos' });
  }

  try {
    await db.query(`
      INSERT INTO comentarios (id_usuario, id_referencia, comentario, criado_por)
      VALUES (?, ?, ?, ?)
    `, [id_usuario, id_referencia, comentario, id_usuario]);

    res.status(201).json({ message: 'Comentário adicionado com sucesso' });
  } catch (error) {
    console.error('Erro ao inserir comentário:', error);
    res.status(500).json({ error: 'Erro ao salvar comentário' });
  }
});

module.exports = router;
