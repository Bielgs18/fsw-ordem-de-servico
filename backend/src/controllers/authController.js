const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const login = async (req, res) => {
  try {
    console.log('Login iniciado:', req.body);
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ msg: 'Email e senha são obrigatórios' });
    }

    const db = req.app.get('db');

    db.query(
      'SELECT * FROM usuarios WHERE email = ?',
      [email],
      async (err, results) => {
        console.log('Resultado da query:', results);
        if (err) {
          console.error('Erro na consulta ao banco de dados:', err);
          return res.status(500).json({ msg: 'Erro interno ao buscar usuário' });
        }

        if (results.length === 0) {
          console.log('Nenhum usuário encontrado com esse email');
          return res.status(401).json({ msg: 'Usuário não encontrado' });
        }

        const user = results[0];
        console.log('Usuário retornado do banco:', user);
        const senhaCorreta = await bcrypt.compare(senha, user.senha);

        if (!senhaCorreta) {
          return res.status(401).json({ msg: 'Senha incorreta' });
        }

        const token = jwt.sign(
          { id: user.id, email: user.email, nivel_acesso: user.nivel_acesso },
          process.env.JWT_SECRET,
          { expiresIn: '1h' }
        );


        //  Se for o primeiro login, exige troca de senha 
        if (user.precisaTrocarSenha) {
          return res.status(200).json({
            token,
            precisaTrocarSenha: true,
            msg: 'Primeiro login detectado. Alteração de senha necessária.',
            user: {
              id: user.id,
              nome: user.nome,
              email: user.email,
              nivel_acesso: user.nivel_acesso
            }
          });
        }

        //  Login normal
        return res.status(200).json({
          token,
          precisaTrocarSenha: false,
          msg: 'Login realizado com sucesso!',
          user: {
            id: user.id,
            nome: user.nome,
            email: user.email,
            nivel_acesso: user.nivel_acesso
          }
        });
      }
    );
  } catch (error) {
    console.error('Erro no login:', error);
    return res.status(500).json({ msg: 'Erro interno no servidor' });
  }
};

const alterarSenha = async (req, res) => {
  const userId = req.user.id;
  const { novaSenha } = req.body;

  if (!novaSenha) {
    return res.status(400).json({ msg: 'A nova senha é obrigatória.' });
  }

  try {
    const db = req.app.get('db');
    const senhaCriptografada = await bcrypt.hash(novaSenha, 10);

    db.query(
      'UPDATE usuarios SET senha = ?, precisaTrocarSenha = false WHERE id = ?',
      [senhaCriptografada, userId],
      (err, result) => {
        if (err) {
          console.error('Erro ao atualizar senha:', err);
          return res.status(500).json({ msg: 'Erro ao atualizar senha.' });
        }

        return res.status(200).json({ msg: 'Senha atualizada com sucesso!' });
      }
    );
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    return res.status(500).json({ msg: 'Erro interno no servidor.' });
  }
};

module.exports = { login, alterarSenha };
