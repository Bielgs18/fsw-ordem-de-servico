// backend/src/middlewares/auth.js
const jwt = require('jsonwebtoken');

function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  console.log('Auth Header:', authHeader);
  const token = authHeader && authHeader.split(' ')[1];

  if (!authHeader) return res.status(401).json({ message: 'Token ausente' });

  
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // payload deve conter: { id, email, perfil }
    next();
  } catch {
    return res.status(401).json({ message: 'Token inválido' });
  }
}

// Apenas administradores
function checkAdmin(req, res, next) {
  if (req.user.nivel_acesso !== 'admin') {
    return res.status(403).json({ message: 'Acesso restrito a administradores' });
  }
  next();
}

// Para múltiplos perfis permitidos
function authorizeRoles(...perfisPermitidos) {
  return (req, res, next) => {
    const usuario = req.user;
    if (!usuario || !perfisPermitidos.includes(usuario.nivel_acesso)) {
      return res.status(403).json({ message: 'Acesso não autorizado para este perfil' });
    }
    next();
  };
}

module.exports = { authenticateJWT, checkAdmin, authorizeRoles };
