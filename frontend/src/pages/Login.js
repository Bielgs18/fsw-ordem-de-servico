import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro('');

    try {
      const { data } = await axios.post(
        'http://localhost:5000/api/auth/login',
        { email, senha }
      );

      console.log('Resposta do backend:', data);
      
      console.log('Perfil salvo no localStorage:', data.user.nivel_acesso);
      localStorage.setItem('fswToken', data.token);
      localStorage.setItem('fswPerfil', data.user.nivel_acesso);

      if (data.precisaTrocarSenha == true || data.precisaTrocarSenha ===1) {
        navigate('/RedefinirSenha');
      } else {
        navigate('/dashboard');
      }

    } catch (err) {
      setErro(err.response?.data?.msg || 'Email ou Senha incorretos! Tente novamente.');
    }
  };

  return (
    <div className="login-wrapper">
      <h1 className='logo'>Órbita</h1>
      <div className="login-container">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">E‑mail:</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="seu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group password-group">
            <label htmlFor="senha">Senha:</label>
            <div className="password-wrapper">
              <input
                type={showSenha ? 'text' : 'password'}
                id="senha"
                name="senha"
                placeholder="••••••••"
                value={senha}
                onChange={e => setSenha(e.target.value)}
                required
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowSenha(prev => !prev)}
                aria-label={showSenha ? 'Esconder senha' : 'Mostrar senha'}
              >
                {showSenha ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                    <path fill="#555" d="M12 5c-7 0-11 7-11 7s4 7 11 7 11-7 11-7-4-7-11-7zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10z"/>
                    <circle fill="#555" cx="12" cy="12" r="2.5"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                    <path fill="#555" d="M12 5c-7 0-11 7-11 7 1.406 2.174 3.633 3.859 6.223 4.649l-1.486 1.486c-1.742-.67-3.21-1.887-4.394-3.44 0 0 4-7 11-7 1.75 0 3.404.409 4.912 1.142l-1.514 1.514c-.993-.417-2.05-.656-3.398-.656zm-3.182.382l-1.579-1.579c1.658-.59 3.453-.803 5.182-.803 7 0 11 7 11 7s-1.303 2.016-3.042 3.655l-1.498-1.498c1.203-1.064 1.958-2.258 1.958-2.258s-4-7-11-7c-1.304 0-2.598.173-3.321.483zm-4.818 1.618l1.482 1.482c-.63.793-1.093 1.68-1.396 2.502 0 0 4 7 11 7 1.578 0 3.051-.302 4.424-.916l1.513 1.513c-1.416.623-2.938.903-4.571.903-7 0-11-7-11-7 1.141-1.738 2.775-2.958 4.568-3.582zm4.182 1.618a3.5 3.5 0 0 1 3.472 3.946l-3.946-3.472z"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {erro && <p className="login-error">{erro}</p>}

          <button type="submit">Entrar</button>
        </form>
        <a href="/recuperar-senha">Esqueceu a senha?</a>
      </div>
    </div>
  );
};

export default Login;
