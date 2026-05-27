import { useState } from "react";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";
import { changePassword } from "../services/backend";
import { useToast } from "../hooks/useToast";

type ApiError = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

export default function AlterarSenha() {
  const navigate = useNavigate();
  const toast = useToast();

  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function handleAlterarSenha() {
    if (salvando) return;

    let usuarioLogado = null;

    try {
      usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado") || "null");
    } catch {
      toast.error({
        title: "Erro ao carregar dados",
        description: "Faça login novamente para alterar sua senha.",
      });
      return;
    }

    if (!usuarioLogado) {
      toast.error({
        title: "Acesso necessário",
        description: "Você precisa estar logado para alterar a senha.",
      });
      navigate("/");
      return;
    }

    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      toast.error({
        title: "Erro ao alterar senha",
        description: "Preencha todos os campos antes de salvar.",
      });
      return;
    }

    if (novaSenha !== confirmarSenha) {
      toast.error({
        title: "Erro ao alterar senha",
        description: "A nova senha e a confirmação não coincidem.",
      });
      return;
    }

    setSalvando(true);

    try {
      await changePassword(senhaAtual, novaSenha);
      toast.success({
        title: "Senha alterada",
        description: "Sua nova senha foi salva com sucesso.",
      });

      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarSenha("");

      if (
        usuarioLogado.grupos?.includes("medico_ubs") ||
        usuarioLogado.grupos?.includes("medico_oncologista") ||
        usuarioLogado.grupos?.includes("admin")
      ) {
        navigate("/perfil1");
        return;
      }

      navigate("/perfil");
    } catch (error: unknown) {
      const apiError = error as ApiError;
      toast.error({
        title: "Erro ao alterar senha",
        description:
          apiError.response?.data?.message ||
          "Não foi possível alterar a senha.",
      });
    } finally {
      setSalvando(false);
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

          <button style={botaoPrincipal} disabled={salvando} onClick={handleAlterarSenha}>
            {salvando ? "Salvando..." : "Salvar nova senha"}
          </button>

          <button style={botaoSecundario} disabled={salvando} onClick={() => navigate("/perfil")}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

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
