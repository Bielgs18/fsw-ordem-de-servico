import React from 'react';
import ReactDOM from 'react-dom/client'; // Usado no React 18+
import App from './App'; // Importa o componente App que você já criou
import './index.css'; // Caso você tenha um arquivo de estilos global

// Criação do root e renderização do App dentro do id 'root' no HTML
const root = ReactDOM.createRoot(document.getElementById('root'));

// Renderizando o aplicativo dentro do root
root.render(
  <React.StrictMode>
    <App /> {/* Renderiza o componente App */}
  </React.StrictMode>
);
