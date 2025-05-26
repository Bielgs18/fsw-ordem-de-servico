// backend/src/routes/authRoutes.js
const express = require('express');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const router  = express.Router();
const { authenticateJWT, checkAdmin } = require('../middlewares/auth');
const { listarUsuarios } = require('../controllers/usuarioController');

// Rota para login
router.post('/login', async (req, res) => {
  const { email, senha } = req.body;
  const db = req.app.get('db');

  db.query(
    'SELECT * FROM usuarios WHERE email = ?',
    [email],
    async (err, results) => {
      if (err) return res.status(500).json({ message: 'Erro interno do servidor' });
      if (results.length === 0) return res.status(400).json({ message: 'Usuário não encontrado' });

      const user = results[0];
      const senhaValida = await bcrypt.compare(senha, user.senha);
      if (!senhaValida) return res.status(400).json({ message: 'Senha incorreta' });

      const token = jwt.sign(
        { id: user.id, email: user.email, nivel_acesso: user.nivel_acesso },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      return res.json({
        token,
        user: { id: user.id, email: user.email, nivel_acesso: user.nivel_acesso }
      });
    }
  );
});

// Rota para redefinir senha
router.post('/redefinir-senha', async (req, res) => {
  const { email, senhaAtual, novaSenha } = req.body;
  const db = req.app.get('db');

  db.query('SELECT * FROM usuarios WHERE email = ?', [email], async (err, results) => {
    if (err) return res.status(500).json({ message: 'Erro interno do servidor' });
    if (results.length === 0) return res.status(400).json({ message: 'Usuário não encontrado' });

    const user = results[0];
    const senhaValida = await bcrypt.compare(senhaAtual, user.senha);
    if (!senhaValida) return res.status(400).json({ message: 'Senha atual incorreta' });

    const hashNovaSenha = await bcrypt.hash(novaSenha, 10);
    db.query(
      'UPDATE usuarios SET senha = ?, atualizado_em = NOW() WHERE id = ?',
      [hashNovaSenha, user.id],
      (updateErr) => {
        if (updateErr) return res.status(500).json({ message: 'Falha ao atualizar senha' });
        res.json({ message: 'Senha atualizada com sucesso' });
      }
    );
  });
});

// Rota para registro de novo usuário — somente administradores
router.post(
  '/register',
  authenticateJWT,
  checkAdmin,
  async (req, res) => {
    const db = req.app.get('db');
    const { nome, email, senha, nivel_acesso } = req.body;

    if (!['admin', 'tecnico', 'usuario'].includes(nivel_acesso)) {
      return res.status(400).json({ message: 'Nível de acesso inválido' });
    }

    db.query('SELECT id FROM usuarios WHERE email = ?', [email], async (err, results) => {
      if (err) return res.status(500).json({ message: 'Erro interno do servidor' });
      if (results.length) return res.status(400).json({ message: 'E‑mail já cadastrado' });

      const hash = await bcrypt.hash(senha, 10);
      const sql = `
        INSERT INTO usuarios
          (nome, email, senha, nivel_acesso, criado_em, atualizado_em)
        VALUES (?,?,?,?,NOW(),NOW())
      `;
      db.query(sql, [nome, email, hash, nivel_acesso], insertErr => {
        if (insertErr) {
          console.error(insertErr);
          return res.status(500).json({ message: 'Falha ao criar usuário' });
        }
        res.status(201).json({ message: 'Usuário criado com sucesso' });
      });
    });
  }
);

// GET all users (admin only)
router.get(
  '/users',
  authenticateJWT,
  checkAdmin,
  (req, res) => {
    const db = req.app.get('db');
    db.query(
      'SELECT id, nome, email, nivel_acesso, criado_em, atualizado_em FROM usuarios',
      (err, results) => {
        if (err) {
          console.error('Erro ao executar query:', err);
          return res.status(500).json({ message: 'Erro ao listar usuários' });
        }
        res.json(results);
      }
    );
  }
);

// PUT (update) user by id (admin only)
router.put(
  '/users/:id',
  authenticateJWT,
  checkAdmin,
  async (req, res) => {
    const db = req.app.get('db');
    const { id } = req.params;
    const { nome, email, senha, nivel_acesso } = req.body;

    const fields = ['nome = ?', 'email = ?', 'nivel_acesso = ?'];
    const values = [nome, email, nivel_acesso];

    if (senha) {
      const hash = await bcrypt.hash(senha, 10);
      fields.push('senha = ?');
      values.push(hash);
    }

    values.push(id);
    const sql = `UPDATE usuarios SET ${fields.join(', ')}, atualizado_em = NOW() WHERE id = ?`;

    db.query(sql, values, err => {
      if (err) return res.status(500).json({ message: 'Erro ao atualizar usuário' });
      res.json({ message: 'Usuário atualizado com sucesso' });
    });
  }
);

// DELETE user by id (admin only)
router.delete(
  '/users/:id',
  authenticateJWT,
  checkAdmin,
  (req, res) => {
    const db = req.app.get('db');
    const { id } = req.params;

    db.query('DELETE FROM usuarios WHERE id = ?', [id], err => {
      if (err) return res.status(500).json({ message: 'Erro ao excluir usuário' });
      res.json({ message: 'Usuário excluído com sucesso' });
    });
  }
);

module.exports = router;
