import Header1 from "../components/Header1";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

import {
  CalendarDays,
  FlaskConical,
  ClipboardList,
  Clock,
  IdCard,
  Phone,
  MapPin,
  Cake,
  User,
} from "lucide-react";

import BotaoVoltar from "../components/BotaoVoltar";

export default function PacienteDetalhe() {
  const navigate = useNavigate();

  const location = useLocation();

  const paciente = location.state;

  useEffect(() => {
    const usuario = JSON.parse(
      localStorage.getItem("usuarioLogado") || "null"
    );

    if (!usuario || !usuario.grupos?.includes("medico_ubs")) {
      navigate("/");
    }
  }, [navigate]);

  // FOTO PACIENTE
  const usuarios = JSON.parse(
    localStorage.getItem("usuarios") || "[]"
  );

  const usuarioPaciente = usuarios.find(
    (u: any) => u.cpf === paciente.cpf
  );

  const fotoPaciente =
    usuarioPaciente?.foto ||
    paciente?.foto ||
    "";

  // CONSULTAS
  const consultas = JSON.parse(
    localStorage.getItem("consulta") || "[]"
  ).filter((c: any) => c.pacienteId === paciente.cpf);

  // EXAMES
  const exames = JSON.parse(
    localStorage.getItem("exames") || "[]"
  ).filter((e: any) => e.pacienteId === paciente.cpf);

  // REGULAÇÕES
  const regulacoes = JSON.parse(
    localStorage.getItem("regulacao") || "[]"
  ).filter((r: any) => r.pacienteId === paciente.cpf);

  // DIAGNÓSTICOS
  const diagnosticos = JSON.parse(
    localStorage.getItem("diagnosticos") || "[]"
  ).filter((d: any) => d.pacienteId === paciente.cpf);

  return (
    <div style={styles.container}>
      <Header1 />

      <div style={styles.content}>
        {/* TÍTULO */}
        <div style={styles.headerText}>
          <h1 style={styles.title}>
            Gerenciar Paciente
          </h1>

          <p style={styles.subtitle}>
            Visualize e gerencie as informações do paciente.
          </p>
        </div>

        {/* CARD PACIENTE */}
        <div style={styles.card}>
          {/* FOTO */}
          <div style={styles.avatarContainer}>
            {fotoPaciente ? (
              <img
                src={fotoPaciente}
                alt="Paciente"
                style={styles.avatarImg}
              />
            ) : (
              <div style={styles.avatar}>
                <User
                  size={45}
                  color="#6b7280"
                />
              </div>
            )}
          </div>

          {/* INFO */}
          <div style={styles.infoContainer}>
            <h2 style={styles.nome}>
              {paciente.nome}
            </h2>

            <div style={styles.infoGrid}>
              <p style={styles.item}>
                <CalendarDays size={16} />
                Nascimento:
                {paciente.dataNascimento}
              </p>

              <p style={styles.item}>
                <Cake size={16} />
                Idade:
                {paciente.idade} anos
              </p>

              <p style={styles.item}>
                <IdCard size={16} />
                CPF:
                {paciente.cpf}
              </p>

              <p style={styles.item}>
                <Phone size={16} />
                Contato:
                {paciente.contato}
              </p>

              <p
                style={{
                  ...styles.item,
                  gridColumn: "span 2",
                }}
              >
                <MapPin size={16} />
                Endereço:
                {paciente.endereco}
              </p>
            </div>
          </div>
        </div>

        {/* MÓDULOS */}
        <div style={styles.grid}>
          {/* CONSULTAS */}
          <div
            style={{
              ...styles.box,
              ...styles.consulta,
            }}
          >
            <div>
              <h3 style={styles.titleBox}>
                <CalendarDays size={18} />
                Tele-Consulta
              </h3>

              <p style={styles.boxDesc}>
                {consultas.length} consultas cadastradas
              </p>
            </div>

            <button
              onClick={() => {
                navigate("/criarconsulta", {
                  state: paciente,
                });

                localStorage.setItem(
                  "pacienteAtual",
                  JSON.stringify(paciente)
                );
              }}
              style={styles.btn}
            >
              + Adicionar
            </button>
          </div>

          {/* EXAMES */}
          <div
            style={{
              ...styles.box,
              ...styles.exame,
            }}
          >
            <div>
              <h3 style={styles.titleBox}>
                <FlaskConical size={18} />
                Exames
              </h3>

              <p style={styles.boxDesc}>
                {exames.length} exames cadastrados
              </p>
            </div>

            <button
              onClick={() =>
                navigate("/criarexame", {
                  state: paciente,
                })
              }
              style={styles.btn}
            >
              + Adicionar
            </button>
          </div>

          {/* REGULAÇÃO */}
          <div
            style={{
              ...styles.box,
              ...styles.regulacao,
            }}
          >
            <div>
              <h3 style={styles.titleBox}>
                <ClipboardList size={18} />
                Regulação
              </h3>

              <p style={styles.boxDesc}>
                {regulacoes.length} regulações
              </p>
            </div>

            <button
              onClick={() =>
                navigate("/criarregulacao", {
                  state: paciente,
                })
              }
              style={styles.btn}
            >
              + Adicionar
            </button>
          </div>

          {/* DIAGNÓSTICO */}
          <div
            style={{
              ...styles.box,
              ...styles.historico,
            }}
          >
            <div>
              <h3 style={styles.titleBox}>
                <Clock size={18} />
                Diagnósticos
              </h3>

              <p style={styles.boxDesc}>
                {diagnosticos.length} diagnósticos
              </p>
            </div>

            <button
              onClick={() =>
                navigate("/VerDiagnostico", {
                  state: paciente,
                })
              }
              style={styles.btn}
            >
              Ver →
            </button>
          </div>
        </div>
      </div>

      <BotaoVoltar />
    </div>
  );
}

const styles: any = {
  container: {
    background: "#f5f6f7",
    minHeight: "100vh",
    fontFamily: "'Open Sans', sans-serif",
  },

  content: {
    padding: "30px",
    maxWidth: "1100px",
    margin: "0 auto",
  },

  headerText: {
    marginBottom: "25px",
  },

  title: {
    color: "#1f2937",
    fontSize: "28px",
    fontWeight: 700,
    marginBottom: "5px",
  },

  subtitle: {
    color: "#6b7280",
  },

  card: {
    display: "flex",
    gap: "25px",
    background: "#fff",
    padding: "25px",
    borderRadius: "10px",
    border: "1px solid #e5e7eb",
    marginBottom: "25px",
    alignItems: "center",
  },

  avatarContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  avatar: {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    background: "#e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarImg: {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    objectFit: "cover",
  },

  infoContainer: {
    flex: 1,
  },

  nome: {
    marginBottom: "15px",
    fontSize: "24px",
    fontWeight: 700,
    color: "#111827",
  },

  infoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },

  item: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "#f9fafb",
    padding: "12px",
    borderRadius: "8px",
    color: "#374151",
    fontSize: "14px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "20px",
  },

  box: {
    padding: "20px",
    borderRadius: "10px",
    minHeight: "170px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    border: "1px solid #e5e7eb",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
  },

  titleBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "18px",
    fontWeight: 700,
    color: "#1f2937",
  },

  boxDesc: {
    fontSize: "14px",
    color: "#4b5563",
    marginTop: "10px",
    lineHeight: 1.5,
  },

  btn: {
    padding: "10px",
    border: "none",
    background: "#fff",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
    transition: "0.2s",
  },

  consulta: {
    background: "#dbeafe",
    borderLeft: "5px solid #2563eb",
  },

  exame: {
    background: "#fef3c7",
    borderLeft: "5px solid #f59e0b",
  },

  regulacao: {
    background: "#d1fae5",
    borderLeft: "5px solid #10b981",
  },

  historico: {
    background: "#ede9fe",
    borderLeft: "5px solid #7c3aed",
  },
};