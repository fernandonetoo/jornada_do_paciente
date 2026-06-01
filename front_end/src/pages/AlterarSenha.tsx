import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import logo from "../assets/logo2.jpeg";
import { changePassword } from "../services/backend";
import { useToast } from "../hooks/useToast";

type ApiError = {
  response?: {
    data?: {
      message?: string;
      errors?: {
        novaSenha?: string[];
        senhaAtual?: string[];
      };
    };
  };
};

export default function AlterarSenha() {
  const navigate = useNavigate();
  const toast = useToast();

  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarSenhaAtual, setMostrarSenhaAtual] = useState(false);
  const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  function getUsuarioLogado() {
    try {
      return JSON.parse(localStorage.getItem("usuarioLogado") || "null");
    } catch {
      return null;
    }
  }

  function voltarParaPerfil() {
    const usuarioLogado = getUsuarioLogado();

    if (
      usuarioLogado?.grupos?.includes("medico_ubs") ||
      usuarioLogado?.grupos?.includes("medico_oncologista") ||
      usuarioLogado?.grupos?.includes("admin")
    ) {
      navigate("/perfil1");
      return;
    }

    navigate("/perfil");
  }

  async function handleAlterarSenha() {
    if (salvando) return;

    setErro("");

    const usuarioLogado = getUsuarioLogado();
    if (!usuarioLogado) {
      const message = "Faca login novamente para alterar sua senha.";
      setErro(message);
      toast.error({
        title: "Acesso necessario",
        description: message,
      });
      navigate("/");
      return;
    }

    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      const message = "Preencha todos os campos antes de salvar.";
      setErro(message);
      toast.error({
        title: "Erro ao alterar senha",
        description: message,
      });
      return;
    }

    if (novaSenha !== confirmarSenha) {
      const message = "A nova senha e a confirmacao nao coincidem.";
      setErro(message);
      toast.error({
        title: "Erro ao alterar senha",
        description: message,
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
      voltarParaPerfil();
    } catch (error: unknown) {
      const apiError = error as ApiError;
      const fieldError =
        apiError.response?.data?.errors?.senhaAtual?.[0] ||
        apiError.response?.data?.errors?.novaSenha?.[0];
      const message =
        fieldError ||
        apiError.response?.data?.message ||
        "Nao foi possivel alterar a senha.";

      setErro(message);
      toast.error({
        title: "Erro ao alterar senha",
        description: message,
      });
    } finally {
      setSalvando(false);
    }
  }

  return (
    <main className="auth-page auth-page--plain">
      <section className="auth-card" aria-labelledby="change-password-title">
        <header className="auth-header">
          <img className="auth-logo" src={logo} alt="Jornada do Paciente" />
          <h1 id="change-password-title" className="auth-title">
            Alterar senha
          </h1>
          <p className="auth-subtitle">
            Informe sua senha atual e defina uma nova senha.
          </p>
        </header>

        {erro && <div className="auth-alert">{erro}</div>}

        <div className="auth-form">
          <PasswordField
            label="Senha atual"
            name="senhaAtual"
            placeholder="Digite sua senha atual"
            value={senhaAtual}
            visible={mostrarSenhaAtual}
            onToggleVisible={() => setMostrarSenhaAtual(!mostrarSenhaAtual)}
            onChange={setSenhaAtual}
            onEnter={handleAlterarSenha}
          />

          <PasswordField
            label="Nova senha"
            name="novaSenha"
            placeholder="Digite a nova senha"
            value={novaSenha}
            visible={mostrarNovaSenha}
            onToggleVisible={() => setMostrarNovaSenha(!mostrarNovaSenha)}
            onChange={setNovaSenha}
            onEnter={handleAlterarSenha}
          />

          <PasswordField
            label="Confirmar nova senha"
            name="confirmarSenha"
            placeholder="Confirme a nova senha"
            value={confirmarSenha}
            visible={mostrarConfirmarSenha}
            onToggleVisible={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)}
            onChange={setConfirmarSenha}
            onEnter={handleAlterarSenha}
          />

          <button
            className="auth-submit"
            type="button"
            disabled={salvando}
            onClick={handleAlterarSenha}
          >
            {salvando && <span className="auth-spinner" aria-hidden="true" />}
            {salvando ? "Salvando..." : "Salvar nova senha"}
          </button>
        </div>

        <p className="auth-footer">
          <button
            className="auth-link-button"
            type="button"
            disabled={salvando}
            onClick={voltarParaPerfil}
          >
            Cancelar
          </button>
        </p>
      </section>
    </main>
  );
}

type PasswordFieldProps = {
  label: string;
  name: string;
  placeholder: string;
  value: string;
  visible: boolean;
  onToggleVisible: () => void;
  onChange: (value: string) => void;
  onEnter: () => void;
};

function PasswordField({
  label,
  name,
  placeholder,
  value,
  visible,
  onToggleVisible,
  onChange,
  onEnter,
}: PasswordFieldProps) {
  return (
    <label className="auth-field">
      <span className="auth-label">{label}</span>
      <span className="auth-password">
        <input
          className="auth-input"
          name={name}
          type={visible ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && onEnter()}
        />
        <button
          className="auth-icon-button"
          type="button"
          onClick={onToggleVisible}
          tabIndex={-1}
          aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </span>
    </label>
  );
}
