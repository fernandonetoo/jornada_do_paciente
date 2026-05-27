import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import logo from "../assets/logo2.png";
import { registerPaciente } from "../services/backend";
import { useToast } from "../hooks/useToast";

type ApiError = {
  response?: {
    data?: {
      message?: string;
      errors?: {
        email?: string[];
        cpf?: string[];
        senha?: string[];
      };
    };
  };
};

export default function CreateAccount() {
  const navigate = useNavigate();
  const toast = useToast();

  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [data, setData] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const requisitos = {
    tamanho: senha.length >= 6,
    letra: /[A-Za-z]/.test(senha),
    numero: /[0-9]/.test(senha),
  };

  function validarSenha() {
    if (!requisitos.tamanho) return "A senha deve ter no mínimo 6 caracteres";
    if (!requisitos.letra) return "A senha deve conter letras";
    if (!requisitos.numero) return "A senha deve conter números";
    return "";
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro("");

    if (!nome || !cpf || !data || !email || !senha) {
      setErro("Preencha todos os campos.");
      toast.error({
        title: "Erro ao criar conta",
        description: "Preencha todos os campos obrigatórios.",
      });
      return;
    }

    const erroSenha = validarSenha();
    if (erroSenha) {
      setErro(erroSenha);
      toast.error({
        title: "Erro ao criar conta",
        description: erroSenha,
      });
      return;
    }

    setLoading(true);
    try {
      await registerPaciente({
        nome,
        cpf,
        data,
        email: email.trim().toLowerCase(),
        senha,
      });
      toast.success({
        title: "Conta criada",
        description: "Cadastro realizado com sucesso. Faça login para continuar.",
      });
      navigate("/");
    } catch (error: unknown) {
      const apiError = error as ApiError;
      const errors = apiError.response?.data?.errors;
      const message =
        errors?.email?.[0] ||
          errors?.cpf?.[0] ||
          errors?.senha?.[0] ||
          apiError.response?.data?.message ||
          "Não foi possível criar a conta.";
      setErro(message);
      toast.error({
        title: "Erro ao criar conta",
        description: message,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="create-account-title">
        <header className="auth-header">
          <img className="auth-logo" src={logo} alt="Jornada do Paciente" />
          <h1 id="create-account-title" className="auth-title">
            Criar conta
          </h1>
          <p className="auth-subtitle">Preencha os dados para se cadastrar</p>
        </header>

        {erro && <div className="auth-alert">{erro}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-field">
            <span className="auth-label">Nome completo</span>
            <input
              className="auth-input"
              name="nome"
              placeholder="Digite seu nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </label>

          <label className="auth-field">
            <span className="auth-label">CPF</span>
            <input
              className="auth-input"
              name="cpf"
              placeholder="000.000.000-00"
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
            />
          </label>

          <label className="auth-field">
            <span className="auth-label">Data de nascimento</span>
            <input
              className="auth-input"
              name="data"
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
            />
          </label>

          <label className="auth-field">
            <span className="auth-label">E-mail</span>
            <input
              className="auth-input"
              name="email"
              type="email"
              placeholder="Digite seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label className="auth-field">
            <span className="auth-label">Senha</span>
            <span className="auth-password">
              <input
                className="auth-input"
                name="senha"
                type={mostrarSenha ? "text" : "password"}
                placeholder="Crie uma senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
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

            {senha && (
              <ul className="auth-requirements">
                <li
                  className={
                    requisitos.tamanho
                      ? "auth-requirement is-valid"
                      : "auth-requirement"
                  }
                >
                  {requisitos.tamanho ? "OK" : "--"} Mínimo 6 caracteres
                </li>
                <li
                  className={
                    requisitos.letra
                      ? "auth-requirement is-valid"
                      : "auth-requirement"
                  }
                >
                  {requisitos.letra ? "OK" : "--"} Contém letras
                </li>
                <li
                  className={
                    requisitos.numero
                      ? "auth-requirement is-valid"
                      : "auth-requirement"
                  }
                >
                  {requisitos.numero ? "OK" : "--"} Contém números
                </li>
              </ul>
            )}
          </label>

          <button
            id="btn-criar-conta"
            className="auth-submit"
            type="submit"
            disabled={loading}
          >
            {loading && <span className="auth-spinner" aria-hidden="true" />}
            {loading ? "Criando conta..." : "Criar conta"}
          </button>
        </form>

        <p className="auth-footer">
          Já tem conta?{" "}
          <button
            className="auth-link-button"
            type="button"
            onClick={() => navigate("/")}
          >
            Fazer login
          </button>
        </p>
      </section>
    </main>
  );
}
