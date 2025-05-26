// src/controllers/usuarioController.js
const db = require('../config/db'); // Importando a conexão do banco

// Função para listar usuários
const listarUsuarios = async (req, res) => {
    console.log('Iniciando a consulta ao banco de dados...'); // Log para depuração
  try {
    const [usuarios] = await db.promise().query('SELECT id, nome, email, nivel_acesso FROM usuarios');
    console.log('Usuários encontrados:', usuarios); // Verifique os dados retornados
    res.status(200).json(usuarios); // Retorna a lista de usuários em formato JSON
  } catch (error) {
    console.error('Erro ao listar usuários:', error); // Exibe o erro no console
    res.status(500).json({ mensagem: 'Erro ao buscar usuários.' }); // Retorna erro 500
  }
};

module.exports = {
  listarUsuarios
};
