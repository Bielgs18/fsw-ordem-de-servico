import React, { useState } from 'react';
import axios from 'axios';

function RecuperarSenha() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/recuperar-senha', { email });
      setMessage('Um link de recuperação foi enviado para o seu e-mail.');
    } catch (error) {
      setMessage('Erro ao enviar o e-mail. Tente novamente.');
    }
  };

  return (
    <div>
      <h2>Recuperação de Senha</h2>
      <form onSubmit={handleSubmit}>
        <label>
          E-mail:
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <button type="submit">Recuperar</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default RecuperarSenha;
