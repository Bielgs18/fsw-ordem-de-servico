// src/routes/usuarioRoutes.js
const express = require('express');
const router = express.Router();
const { listarUsuarios } = require('../controllers/usuarioController');
 // se estiver usando token
const verificarAutenticacao = require('../middlewares/verificarAutenticacao');

router.get('/users', verificarAutenticacao, listarUsuarios); // Agora existe GET /api/auth/users

module.exports = router;
