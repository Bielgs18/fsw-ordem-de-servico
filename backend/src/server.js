// backend/src/server.js

const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path'); 

dotenv.config();

const authRoutes = require('./routes/authRoutes');
const passwordRoutes = require('./routes/passwordRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const ordemServicoRoutes = require('./routes/ordemServicoRoutes');
const comentarioRoutes = require('./routes/comentarioRoutes');
// const equipamentoRoutes = require('./routes/equipamentoRoutes'); // Removido do escopo

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));

//  Middleware para servir arquivos da pasta uploads
app.use('/uploads/fotos-servico', express.static(path.resolve(__dirname, '..', 'uploads/fotos-servico')));

// Conexão com o MySQL
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

db.connect(err => {
  if (err) {
    console.error('Erro na conexão com o MySQL:', err);
  } else {
    console.log('Conectado ao MySQL');
  }
});

app.set('db', db);

// Rotas principais
app.use('/api/auth', authRoutes);
app.use('/api', passwordRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api', ordemServicoRoutes);
app.use('/api/comentarios', comentarioRoutes);
// app.use('/api/equipamentos', equipamentoRoutes); // Equipamentos removidos

// Rota de login
app.post('/api/login', async (req, res) => {
  const { email, senha } = req.body;

  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) return res.status(500).json({ message: 'Erro interno do servidor' });

    if (results.length === 0) {
      return res.status(400).json({ message: 'Usuário não encontrado' });
    }

    const user = results[0];
    const senhaValida = await bcrypt.compare(senha, user.senha);
    if (!senhaValida) {
      return res.status(400).json({ message: 'Senha incorreta' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, nivel_acesso: user.nivel_acesso },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.json({ token });
  });
});

// Middleware de erro
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err.stack || err);
  res.status(500).json({ msg: 'Erro interno no servidor' });
});

// Inicialização do servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
