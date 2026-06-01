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
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";

import BotaoVoltar from "../components/BotaoVoltar";
import { NenhumPacienteSelecionado } from "../components/shared/PacienteAtualBanner";
import { usePacienteAtual } from "../hooks/usePacienteAtual";

export default function PacienteDetalhe() {
  const navigate = useNavigate();

  const location = useLocation();

  const paciente = usePacienteAtual(location.state as any);

  useEffect(() => {
    const usuario = JSON.parse(
      localStorage.getItem("usuarioLogado") || "null"
    );

    if (!usuario || !usuario.grupos?.includes("medico_ubs")) {
      navigate("/");
    }
  }, [navigate]);

  if (!paciente)
    return (
      <div style={styles.container}>
        <Header1 />

        <div style={styles.content}>
          <div style={styles.headerText}>
            <h1 style={styles.title}>
              Gerenciar Paciente
            </h1>

            <p style={styles.subtitle}>
              Selecione um paciente para visualizar e gerenciar informações.
            </p>
          </div>

          <NenhumPacienteSelecionado />
        </div>

        <BotaoVoltar />
      </div>
    );

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

  const suspeitaPaciente =
    paciente.suspeita ||
    paciente.queixaPrincipal ||
    paciente.queixa ||
    paciente.tipo ||
    "";

  // CONSULTAS
  const consultas = JSON.parse(
    localStorage.getItem("consulta") || "[]"
  ).filter((c: any) => c.pacienteId === paciente.cpf);

  // EXAMES
  const exames = JSON.parse(
    localStorage.getItem("exames") || "[]"
  ).filter((e: any) => e.pacienteId === paciente.cpf);

  // ENCAMINHAMENTOS
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
                  color="#9ca3af"
                />
              </div>
            )}
          </div>

          {/* INFO */}
          <div style={styles.infoContainer}>
            <span style={styles.pacienteLabel}>
              Paciente selecionado
            </span>

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

              {suspeitaPaciente && (
                <p
                  style={{
                    ...styles.item,
                    gridColumn: "span 2",
                  }}
                >
                  Suspeita:
                  {suspeitaPaciente}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            className="btn-cancelar"
            style={styles.voltarPacientes}
            onClick={() => navigate("/pacientes")}
          >
            <ChevronLeft size={16} />
            Voltar para pacientes
          </button>
        </div>

        {/* MÓDULOS */}
        <div style={styles.grid}>
          {/* ENCAMINHAMENTOS */}
          <div
            style={{
              ...styles.box,
              ...styles.regulacao,
            }}
          >
            <div>
              <h3 style={styles.titleBox}>
                <ClipboardList size={18} />
                Encaminhamentos
              </h3>

              <p style={styles.boxDesc}>
                {regulacoes.length} encaminhamentos
              </p>
            </div>

            <button
              onClick={() =>
                {
                  localStorage.setItem(
                    "pacienteAtual",
                    JSON.stringify(paciente)
                  );

                  navigate("/criarregulacao", {
                    state: paciente,
                  });
                }
              }
              style={styles.btn}
            >
              <Plus size={16} />
              Adicionar
            </button>
          </div>

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
                Tele-consulta
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
              <Plus size={16} />
              Adicionar
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
                {
                  localStorage.setItem(
                    "pacienteAtual",
                    JSON.stringify(paciente)
                  );

                  navigate("/criarexame", {
                    state: paciente,
                  });
                }
              }
              style={styles.btn}
            >
              <Plus size={16} />
              Adicionar
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
                {
                  localStorage.setItem(
                    "pacienteAtual",
                    JSON.stringify(paciente)
                  );

                  navigate("/VerDiagnostico", {
                    state: paciente,
                  });
                }
              }
              style={styles.btn}
            >
              Ver
              <ChevronRight size={16} />
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
    gap: "16px",
    background: "#fff",
    padding: "25px",
    borderRadius: "16px",
    border: "1px solid #bfdbfe",
    borderLeft: "5px solid #0b4f6c",
    marginBottom: "25px",
    alignItems: "flex-start",
    boxShadow: "0 1px 2px rgba(15, 23, 42, 0.06)",
  },

  avatarContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: "23px",
  },

  avatar: {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    background: "#f3f4f6",
    border: "2px solid #e5e7eb",
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
    minWidth: 0,
  },

  pacienteLabel: {
    display: "block",
    marginBottom: "4px",
    color: "#0b4f6c",
    fontSize: "11px",
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: 0,
  },

  nome: {
    marginBottom: "14px",
    fontSize: "24px",
    lineHeight: 1.25,
    fontWeight: 800,
    color: "#0f172a",
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
    minHeight: "42px",
    background: "#f1f5f9",
    padding: "12px 14px",
    borderRadius: "999px",
    color: "#475569",
    fontSize: "14px",
    fontWeight: 700,
    lineHeight: 1.35,
  },

  voltarPacientes: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    flex: "0 0 auto",
    marginTop: 0,
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
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "7px",
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
