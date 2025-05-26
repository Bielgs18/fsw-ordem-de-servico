// backend/src/routes/passwordRoutes.js

const express    = require('express');
const jwt        = require('jsonwebtoken');
const bcrypt     = require('bcryptjs');
const nodemailer = require('nodemailer');
const router     = express.Router();

// Configuração do Nodemailer para envio de e-mail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,  // E-mail de envio (deve ser configurado no .env)
    pass: process.env.MAIL_PASS   // Senha ou App Password (deve ser configurado no .env)
  }
});

/**
 * 1) Enviar link de recuperação de senha
 * POST /api/recuperar-senha
 */
router.post('/recuperar-senha', (req, res) => {
  const db = req.app.get('db');
  const { email } = req.body;

  db.query('SELECT id FROM usuarios WHERE email = ?', [email], (err, results) => {
    if (err) {
      console.error('Erro interno:', err);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
    if (results.length === 0) {
      return res.status(400).json({ message: 'E-mail não encontrado.' });
    }

    const userId = results[0].id;
    const token  = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const resetLink = `http://localhost:3000/resetar-senha/${token}`;

    // Enviar e-mail com o link de recuperação de senha
    transporter.sendMail({
      from: process.env.MAIL_USER,
      to: email,
      subject: 'Recuperação de Senha',
      text: `Clique no link para redefinir sua senha: ${resetLink}`
    }, (mailErr) => {
      if (mailErr) {
        console.error('Erro ao enviar e-mail:', mailErr);
        return res.status(500).json({ message: 'Falha ao enviar e-mail' });
      }
      return res.json({ message: 'Link de recuperação enviado.' });
    });
  });
});

/**
 * 2) Redefinir a senha usando o token
 * POST /api/resetar-senha
 */
router.post('/resetar-senha', (req, res) => {
  const db = req.app.get('db');
  const { token, newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId  = decoded.userId;

    bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
      if (err) {
        console.error('Erro ao gerar hash:', err);
        return res.status(500).json({ message: 'Erro ao redefinir a senha.' });
      }

      const sql = 'UPDATE usuarios SET senha = ?, updatedAt = NOW() WHERE id = ?';
      db.query(sql, [hashedPassword, userId], (updateErr, result) => {
        if (updateErr) {
          console.error('Erro SQL ao atualizar senha:', updateErr);
          return res.status(500).json({ message: 'Erro ao redefinir a senha.' });
        }
        if (result.affectedRows === 0) {
          return res.status(400).json({ message: 'Usuário não encontrado.' });
        }
        return res.json({ message: 'Senha redefinida com sucesso!' });
      });
    });
  } catch (error) {
    console.error('Token inválido ou expirado:', error);
    return res.status(400).json({ message: 'Token inválido ou expirado.' });
  }
});

module.exports = router;
