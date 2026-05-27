import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import logo from "../assets/logo2.png";
import { loginBackend } from "../services/backend";
import { useToast } from "../hooks/useToast";

type ApiError = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

export default function Login() {
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const navigate = useNavigate();
  const toast = useToast();

  async function handleLogin() {
    setErro("");
    setLoading(true);

    try {
      const usuario = await loginBackend(email.trim(), senha);
      toast.success({
        title: "Login realizado",
        description: "Entrada confirmada. Redirecionando para sua área.",
      });

      if (usuario.grupos?.includes("medico_ubs")) {
        navigate("/homemedico");
        return;
      }
      if (usuario.grupos?.includes("medico_oncologista")) {
        navigate("/pacientes");
        return;
      }
      if (usuario.grupos?.includes("paciente")) {
        navigate("/dashboard");
        return;
      }
      if (usuario.grupos?.includes("admin")) {
        navigate("/admin");
        return;
      }

      setErro("Grupo de usuário não reconhecido.");
    } catch (error: unknown) {
      const apiError = error as ApiError;
      const message =
        apiError.response?.data?.message ||
        "Não foi possível fazer login. Verifique seu e-mail/CPF e senha.";
      setErro(message);
      toast.error({
        title: "Erro no login",
        description: message,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="login-title">
        <header className="auth-header">
          <img className="auth-logo" src={logo} alt="Jornada do Paciente" />
          <h1 id="login-title" className="auth-title">
            Bem-vindo!
          </h1>
          <p className="auth-subtitle">Faça login para acessar sua conta</p>
        </header>

        {erro && <div className="auth-alert">{erro}</div>}

        <div className="auth-form">
          <label className="auth-field">
            <span className="auth-label">E-mail ou CPF</span>
            <input
              className="auth-input"
              name="email"
              placeholder="Digite seu e-mail ou CPF"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
          </label>

          <label className="auth-field">
            <span className="auth-label">Senha</span>
            <span className="auth-password">
              <input
                className="auth-input"
                name="senha"
                type={mostrarSenha ? "text" : "password"}
                placeholder="Digite sua senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
              <button
                className="auth-icon-button"
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                tabIndex={-1}
                aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
              >
                {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </span>
          </label>

          <div className="auth-action-row">
            <button className="auth-link-button" type="button">
              Esqueceu a senha?
            </button>
          </div>

          <button
            id="btn-login"
            className="auth-submit"
            type="button"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading && <span className="auth-spinner" aria-hidden="true" />}
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </div>

        <p className="auth-footer">
          Não possui cadastro?{" "}
          <button
            className="auth-link-button"
            type="button"
            onClick={() => navigate("/criar")}
          >
            Criar conta
          </button>
        </p>
      </section>
    </main>
  );
}
