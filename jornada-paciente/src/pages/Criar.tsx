import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import bgLogin from "../styles/img/background-login.png";
import logo from "../assets/logo2.png";

export default function CreateAccount() {
  const navigate = useNavigate();

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
      return;
    }

    const erroSenha = validarSenha();
    if (erroSenha) {
      setErro(erroSenha);
      return;
    }

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");
    const existe = usuarios.find((u: any) => u.email === email.trim().toLowerCase());

    if (existe) {
      setErro("Já existe uma conta com este e-mail.");
      setLoading(false);
      return;
    }

    const novoUsuario = {
      nome,
      cpf,
      data,
      email: email.trim().toLowerCase(),
      senha,
      tipo: "paciente",
      grupos: ["paciente"],
    };

    usuarios.push(novoUsuario);
    localStorage.setItem("usuarios", JSON.stringify(usuarios));

    setLoading(false);
    navigate("/");
  }

  return (
    <div style={styles.page}>
      <div style={{ ...styles.bg, backgroundImage: `url(${bgLogin})` }} />
      <div style={styles.overlay} />

      <div style={styles.card}>
        <div style={styles.header}>
          <img src={logo} alt="Logo" style={styles.logo} />
          <h1 style={styles.title}>Criar conta</h1>
          <p style={styles.subtitle}>Preencha os dados para se cadastrar</p>
        </div>

        {erro && (
          <div style={styles.errorBox}>
            <span>{erro}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Nome completo</label>
            <input
              name="nome"
              placeholder="Digite seu nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>CPF</label>
            <input
              name="cpf"
              placeholder="000.000.000-00"
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Data de nascimento</label>
            <input
              name="data"
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>E-mail</label>
            <input
              name="email"
              type="email"
              placeholder="Digite seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Senha</label>
            <div style={styles.passwordWrapper}>
              <input
                name="senha"
                type={mostrarSenha ? "text" : "password"}
                placeholder="Crie uma senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
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

            {senha && (
              <ul style={styles.requisitos}>
                <li style={{ color: requisitos.tamanho ? "#16a34a" : "#9ca3af" }}>
                  {requisitos.tamanho ? "✓" : "○"} Mínimo 6 caracteres
                </li>
                <li style={{ color: requisitos.letra ? "#16a34a" : "#9ca3af" }}>
                  {requisitos.letra ? "✓" : "○"} Contém letras
                </li>
                <li style={{ color: requisitos.numero ? "#16a34a" : "#9ca3af" }}>
                  {requisitos.numero ? "✓" : "○"} Contém números
                </li>
              </ul>
            )}
          </div>

          <button
            id="btn-criar-conta"
            type="submit"
            style={{
              ...styles.btn,
              opacity: loading ? 0.75 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
            disabled={loading}
          >
            {loading ? (
              <span style={styles.loadingRow}>
                <span style={styles.spinner} />
                Criando conta...
              </span>
            ) : (
              "Criar conta"
            )}
          </button>
        </form>

        <p style={styles.loginText}>
          Já tem conta?{" "}
          <span onClick={() => navigate("/")} style={styles.loginLink}>
            Fazer login
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

  requisitos: {
    listStyle: "none",
    padding: "8px 0 0",
    margin: 0,
    fontSize: "12px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
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

  loginText: {
    marginTop: "22px",
    fontSize: "13px",
    color: "#6b7280",
    textAlign: "center",
  },

  loginLink: {
    color: "#3b82f6",
    fontWeight: "700",
    cursor: "pointer",
  },
};
