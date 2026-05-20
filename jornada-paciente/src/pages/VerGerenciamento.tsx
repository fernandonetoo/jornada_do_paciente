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

import BotaoVoltar from "@/components/BotaoVoltar";

export default function PacienteDetalhe() {
  const navigate = useNavigate();
  const location = useLocation();

  const paciente = location.state;

  // 🔒 PROTEÇÃO
  useEffect(() => {
    const usuario = JSON.parse(
      localStorage.getItem("usuarioLogado") || "null"
    );

    if (
      !usuario ||
      !usuario.grupos?.includes("medico_oncologista")
    ) {
      navigate("/");
    }
  }, [navigate]);

  if (!paciente) return <h2>Paciente não encontrado</h2>;

  // 🔥 PACIENTES
  const pacientesStorage = JSON.parse(
    localStorage.getItem("pacientes") || "[]"
  );

  // 🔥 USUÁRIOS
  const usuariosStorage = JSON.parse(
    localStorage.getItem("usuarios") || "[]"
  );

  // 🔥 PACIENTE COMPLETO
  const pacienteCompleto = pacientesStorage.find(
    (p: any) =>
      String(p.cpf).replace(/\D/g, "") ===
      String(paciente.cpf).replace(/\D/g, "")
  );

  // 🔥 FOTO
  const usuarioComFoto = usuariosStorage.find(
    (u: any) =>
      String(u.cpf).replace(/\D/g, "") ===
      String(paciente.cpf).replace(/\D/g, "")
  );

  const fotoPerfil =
    usuarioComFoto?.fotoPerfil ||
    usuarioComFoto?.foto ||
    pacienteCompleto?.fotoPerfil ||
    pacienteCompleto?.foto ||
    "";

  return (
    <div style={styles.container}>
      <Header1 />

      <div style={styles.content}>
        {/* HEADER */}
        <div style={styles.headerText}>
          <h1 style={styles.title}>
            Gerenciar Paciente
          </h1>

          <p style={styles.subtitle}>
            Visualize e acompanhe todas as informações do paciente.
          </p>
        </div>

        {/* CARD PACIENTE */}
        <div style={styles.card}>
          {/* FOTO */}
          <div style={styles.avatarContainer}>
            {fotoPerfil ? (
              <img
                src={fotoPerfil}
                alt="Paciente"
                style={styles.avatarImg}
              />
            ) : (
              <div style={styles.avatar}>
                <User
                  size={60}
                  color="#6b7280"
                />
              </div>
            )}
          </div>

          {/* INFO */}
          <div style={styles.infoContainer}>
            <h2 style={styles.nome}>
              {pacienteCompleto?.nome || paciente.nome}
            </h2>

            <div style={styles.infoGrid}>
              <p style={styles.item}>
                <CalendarDays size={16} />

                Nascimento:
                {" "}
                {pacienteCompleto?.dataNascimento ||
                  paciente.dataNascimento ||
                  "-"}
              </p>

              <p style={styles.item}>
                <Cake size={16} />

                Idade:
                {" "}
                {pacienteCompleto?.idade ||
                  paciente.idade ||
                  "-"}{" "}
                anos
              </p>

              <p style={styles.item}>
                <IdCard size={16} />

                CPF:
                {" "}
                {pacienteCompleto?.cpf || paciente.cpf}
              </p>

              <p style={styles.item}>
                <Phone size={16} />

                Contato:
                {" "}
                {pacienteCompleto?.contato ||
                  paciente.contato ||
                  "-"}
              </p>

              <p
                style={{
                  ...styles.item,
                  gridColumn: "span 2",
                }}
              >
                <MapPin size={16} />

                Endereço:
                {" "}
                {pacienteCompleto?.endereco ||
                  paciente.endereco ||
                  "-"}
              </p>
            </div>
          </div>
        </div>

        {/* CARDS */}
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
                Visualizar consultas médicas
              </p>
            </div>

            <button
              onClick={() => {
                navigate("/verconsulta", {
                  state: pacienteCompleto || paciente,
                });

                localStorage.setItem(
                  "pacienteAtual",
                  JSON.stringify(
                    pacienteCompleto || paciente
                  )
                );
              }}
              style={styles.btn}
            >
              Ver →
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
                Resultados e solicitações
              </p>
            </div>

            <button
              onClick={() => {
                navigate("/verexame", {
                  state: pacienteCompleto || paciente,
                });

                localStorage.setItem(
                  "pacienteAtual",
                  JSON.stringify(
                    pacienteCompleto || paciente
                  )
                );
              }}
              style={styles.btn}
            >
              Ver →
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
                Encaminhamentos e solicitações
              </p>
            </div>

            <button
              onClick={() => {
                navigate("/verregulacao", {
                  state: pacienteCompleto || paciente,
                });

                localStorage.setItem(
                  "pacienteAtual",
                  JSON.stringify(
                    pacienteCompleto || paciente
                  )
                );
              }}
              style={styles.btn}
            >
              Ver →
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
                Diagnóstico
              </h3>

              <p style={styles.boxDesc}>
                Histórico e registros médicos
              </p>
            </div>

            <button
              onClick={() => {
                navigate("/criardiagnostico", {
                  state: pacienteCompleto || paciente,
                });

                localStorage.setItem(
                  "pacienteAtual",
                  JSON.stringify(
                    pacienteCompleto || paciente
                  )
                );
              }}
              style={styles.btn}
            >
              Acessar →
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
    fontSize: "28px",
    fontWeight: 600,
    color: "#1f2937",
    marginBottom: "5px",
  },

  subtitle: {
    color: "#6b7280",
    marginBottom: "20px",
  },

  card: {
    display: "flex",
    alignItems: "center",
    gap: "25px",
    background: "#fff",
    padding: "25px",
    borderRadius: "10px",
    border: "1px solid #e5e7eb",
    marginBottom: "30px",
  },

  avatarContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  avatar: {
    width: "140px",
    height: "140px",
    borderRadius: "50%",
    background: "#e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarImg: {
    width: "140px",
    height: "140px",
    borderRadius: "50%",
    objectFit: "cover",
  },

  infoContainer: {
    flex: 1,
  },

  nome: {
    fontSize: "24px",
    fontWeight: 700,
    color: "#111827",
    marginBottom: "18px",
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
    padding: "10px 12px",
    borderRadius: "8px",
    fontSize: "14px",
    color: "#374151",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
    gap: "20px",
  },

  box: {
    padding: "20px",
    borderRadius: "12px",
    minHeight: "160px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
  },

  titleBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "18px",
    fontWeight: 700,
    color: "#111827",
    marginBottom: "10px",
  },

  boxDesc: {
    fontSize: "14px",
    color: "#4b5563",
    lineHeight: "20px",
  },

  btn: {
    alignSelf: "flex-start",
    padding: "10px 18px",
    border: "none",
    background: "#fff",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "14px",
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
    background: "#e5e7eb",
    borderLeft: "5px solid #6b7280",
  },
};