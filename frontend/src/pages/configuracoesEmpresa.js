import { useState } from "react";
import "../styles/ConfiguracoesEmpresa.css"; // ajuste o caminho se necessário

export default function ConfiguracoesEmpresa() {
  const [form, setForm] = useState({
    nome: "",
    endereco: "",
    email: "",
    telefone: "",
    celular: "",
    logo: null,
  });

  const [logoPreview, setLogoPreview] = useState(null);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "logo" && files.length > 0) {
      const file = files[0];
      setForm({ ...form, logo: file });
      setLogoPreview(URL.createObjectURL(file));
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Dados enviados:", form);
    alert("Configurações salvas (simulado)");
    // aqui você pode usar fetch ou axios para enviar ao backend
  };

  return (
    <div className="config-container">
      <h2 className="config-title">Configurações da Empresa</h2>
      <form onSubmit={handleSubmit} className="config-form">
        <label>Nome da empresa:</label>
        <input name="nome" type="text" value={form.nome} onChange={handleChange} required />

        <label>Endereço:</label>
        <input name="endereco" type="text" value={form.endereco} onChange={handleChange} required />

        <label>E-mail:</label>
        <input name="email" type="email" value={form.email} onChange={handleChange} required />

        <label>Telefone:</label>
        <input name="telefone" type="text" value={form.telefone} onChange={handleChange} required />

        <label>Celular:</label>
        <input name="celular" type="text" value={form.celular} onChange={handleChange} required />

        <label>Logo da empresa:</label>
        <input name="logo" type="file" accept="image/*" onChange={handleChange} />

        {logoPreview && <img src={logoPreview} alt="Prévia da logo" className="logo-preview" />}

        <button type="submit">Salvar</button>
      </form>
    </div>
  );
}
