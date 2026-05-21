import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import bgLogin from "../styles/img/background-login.png";
import logo from "../assets/logo2.png";
import { loginBackend } from "../services/backend";

export default function Login() {
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const navigate = useNavigate();

  async function handleLogin() {
    setErro("");
    setLoading(true);

    try {
      const usuario = await loginBackend(email.trim(), senha);

      if (usuario.grupos?.includes("medico_ubs")) { navigate("/homemedico"); return; }
      if (usuario.grupos?.includes("medico_oncologista")) { navigate("/pacientes"); return; }
      if (usuario.grupos?.includes("paciente")) { navigate("/dashboard"); return; }
      if (usuario.grupos?.includes("admin")) { navigate("/admin"); return; }

      setErro("Grupo de usuário não reconhecido.");
    } catch (error: any) {
      setErro(
        error?.response?.data?.message ||
          "Não foi possível fazer login. Verifique seu e-mail/CPF e senha."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      {/* Background */}
      <div
        style={{
          ...styles.bg,
          backgroundImage: `url(${bgLogin})`,
        }}
      />
      <div style={styles.overlay} />

      {/* Card */}
      <div style={styles.card}>
        {/* Logo + título */}
        <div style={styles.header}>
          <img src={logo} alt="Logo" style={styles.logo} />
          <h1 style={styles.title}>Bem-vindo!</h1>
          <p style={styles.subtitle}>Faça login para acessar sua conta</p>
        </div>

        {/* Erro */}
        {erro && (
          <div style={styles.errorBox}>
            <span>{erro}</span>
          </div>
        )}

        {/* Campos */}
        <div style={styles.fieldGroup}>
          <label style={styles.label}>E-mail ou CPF</label>
          <input
            name="email"
            placeholder="Digite seu e-mail ou CPF"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            style={styles.input}
          />
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>Senha</label>
          <div style={styles.passwordWrapper}>
            <input
              name="senha"
              type={mostrarSenha ? "text" : "password"}
              placeholder="Digite sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              style={{ ...styles.input, paddingRight: "48px", marginBottom: 0 }}
            />
            <button
              type="button"
              onClick={() => setMostrarSenha(!mostrarSenha)}
              style={styles.eyeBtn}
              tabIndex={-1}
            >
              {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Esqueceu senha */}
        <div style={styles.forgotRow}>
          <span style={styles.forgotLink}>Esqueceu a senha?</span>
        </div>

        {/* Botão */}
        <button
          id="btn-login"
          style={{
            ...styles.btn,
            opacity: loading ? 0.75 : 1,
            cursor: loading ? "not-allowed" : "pointer",
          }}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <span style={styles.loadingRow}>
              <span style={styles.spinner} />
              Entrando...
            </span>
          ) : (
            "Entrar"
          )}
        </button>

        {/* Cadastro */}
        <p style={styles.registerText}>
          Não possui cadastro?{" "}
          <span onClick={() => navigate("/criar")} style={styles.registerLink}>
            Criar conta
          </span>
        </p>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

const styles: any = {
  page: {
    position: "relative",
    display: "flex",
    alignItems: "center", 
    justifyContent: "center",
    minHeight: "100vh",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },

  bg: {
    position: "fixed",
    inset: 0,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    zIndex: 0,
  },

  overlay: {
    position: "fixed",
    inset: 0,
    background: "linear-gradient(135deg, rgba(11,79,108,0.82) 0%, rgba(4,30,45,0.75) 100%)",
    zIndex: 1,
  },

  card: {
    position: "relative",
    zIndex: 2,
    width: "100%",
    maxWidth: "420px",
    margin: "24px",
    padding: "40px 36px",
    background: "rgba(255,255,255,0.97)",
    borderRadius: "20px",
    boxShadow: "0 24px 64px rgba(0,0,0,0.35)",
  },

  header: {
    textAlign: "center",
    marginBottom: "28px",
  },

  logo: {
    height: "56px",
    objectFit: "contain",
    marginBottom: "16px",
  },

  title: {
    fontSize: "26px",
    fontWeight: "700",
    color: "#0b4f6c",
    margin: "0 0 6px",
    letterSpacing: "-0.3px",
  },

  subtitle: {
    fontSize: "14px",
    color: "#6b7280",
    margin: 0,
  },

  errorBox: {
    background: "#fef2f2",
    border: "1px solid #fca5a5",
    color: "#b91c1c",
    borderRadius: "8px",
    padding: "10px 14px",
    fontSize: "13px",
    marginBottom: "18px",
  },

  fieldGroup: {
    marginBottom: "18px",
  },

  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "6px",
  },

  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1.5px solid #e5e7eb",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
    background: "#f9fafb",
    color: "#111827",
  },

  passwordWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },

  eyeBtn: {
    position: "absolute",
    right: "12px",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#9ca3af",
    display: "flex",
    alignItems: "center",
    padding: "4px",
  },

  forgotRow: {
    textAlign: "right",
    marginBottom: "22px",
    marginTop: "8px",
  },

  forgotLink: {
    fontSize: "13px",
    color: "#3b82f6",
    cursor: "pointer",
    fontWeight: "500",
  },

  btn: {
    width: "100%",
    padding: "13px",
    background: "linear-gradient(135deg, #0b4f6c 0%, #1a7a9e 100%)",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontWeight: "700",
    fontSize: "15px",
    transition: "opacity 0.2s, transform 0.1s",
    letterSpacing: "0.2px",
    boxShadow: "0 4px 14px rgba(11,79,108,0.35)",
  },

  loadingRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
  },

  spinner: {
    width: "16px",
    height: "16px",
    border: "2px solid rgba(255,255,255,0.4)",
    borderTopColor: "#fff",
    borderRadius: "50%",
    display: "inline-block",
    animation: "spin 0.7s linear infinite",
  },

  registerText: {
    marginTop: "22px",
    fontSize: "13px",
    color: "#6b7280",
    textAlign: "center",
  },

  registerLink: {
    color: "#3b82f6",
    fontWeight: "700",
    cursor: "pointer",
  },
};
