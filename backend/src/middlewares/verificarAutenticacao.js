const jwt = require('jsonwebtoken');

const verificarAutenticacao = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) return res.status(401).json({ message: 'Token não fornecido' });

  const token = authHeader.split(' ')[1]; // Bearer <token>

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Token inválido' });

    req.usuarioId = decoded.id;
    next();
  });
};

module.exports = verificarAutenticacao;
