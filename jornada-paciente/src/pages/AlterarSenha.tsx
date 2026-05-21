import { useState } from "react";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";
import { changePassword } from "../services/backend";

export default function AlterarSenha() {
  const navigate = useNavigate();

  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  async function handleAlterarSenha() {
    let usuarioLogado = null;

    // ✅ evita quebra do JSON
    try {
      usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado") || "null");
    } catch {
      alert("Erro ao carregar dados. Faça login novamente.");
      return;
    }

    if (!usuarioLogado) {
      alert("Você precisa estar logado!");
      navigate("/");
      return;
    }

    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      alert("Preencha todos os campos!");
      return;
    }

    if (novaSenha !== confirmarSenha) {
      alert("As senhas não coincidem!");
      return;
    }

    try {
      await changePassword(senhaAtual, novaSenha);
      alert("Senha alterada com sucesso!");

      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarSenha("");

      if (usuarioLogado.grupos?.includes("medico_ubs")) {
        navigate("/perfil1");
        return;
      }

      navigate("/perfil");
    } catch (error: any) {
      alert(error?.response?.data?.message || "Não foi possível alterar a senha.");
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f6f7",
      }}
    >
      <Header />

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          paddingTop: "60px",
        }}
      >
        <div
          style={{
            background: "#fff",
            padding: "30px",
            borderRadius: "10px",
            width: "350px",
            textAlign: "center",
            boxShadow: "0 0 10px rgba(0,0,0,0.1)",
          }}
        >
          <h1 style={{ color: "#0b4f6c", marginBottom: "10px" }}>
            Alterar Senha
          </h1>

          <p style={{ fontSize: "14px", color: "#666", marginBottom: "20px" }}>
            Para sua segurança, informe sua senha atual e defina uma nova senha.
          </p>

          <input
            type="password"
            placeholder="Digite sua senha atual"
            value={senhaAtual}
            onChange={(e) => setSenhaAtual(e.target.value)}
            style={inputStyle}
          />

          <input
            type="password"
            placeholder="Digite a nova senha"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            style={inputStyle}
          />

          <input
            type="password"
            placeholder="Confirme a nova senha"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
            style={inputStyle}
          />

          <button 
          style={botaoPrincipal} 
          onClick={handleAlterarSenha}
          
          >
            
            Salvar nova senha
          </button>

          <button
            style={botaoSecundario}
            onClick={() => navigate("/perfil")}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

/* 🎨 ESTILOS */
const inputStyle = {
  width: "100%",
  padding: "10px",
  marginBottom: "10px",
  borderRadius: "5px",
  border: "1px solid #ccc",
};

const botaoPrincipal = {
  width: "100%",
  padding: "10px",
  background: "#0b4f6c",
  color: "#fff",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  marginTop: "10px",
};

const botaoSecundario = {
  width: "100%",
  padding: "10px",
  marginTop: "10px",
  background: "#eee",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
};
