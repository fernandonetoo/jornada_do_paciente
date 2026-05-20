import Header from "../components/Header";
import Card from "../components/Card";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

import {
  CalendarDays,
  FlaskConical,
  ClipboardList,
  Clock,
} from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();

  // 🔥 USUÁRIO LOGADO
  const usuario = JSON.parse(
    localStorage.getItem("usuarioLogado") || "null"
  );

  // 🔥 DATA ATUAL
  const dataAtual = new Date().toLocaleDateString(
    "pt-BR",
    {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    }
  );

  // 🔥 DADOS DO SISTEMA
  const pacientes = JSON.parse(
    localStorage.getItem("pacientes") || "[]"
  );

  const consultas = JSON.parse(
    localStorage.getItem("consulta") || "[]"
  );

  const exames = JSON.parse(
    localStorage.getItem("exames") || "[]"
  );

  const regulacoes = JSON.parse(
    localStorage.getItem("regulacao") || "[]"
  );

  const diagnosticos = JSON.parse(
    localStorage.getItem("diagnosticos") || "[]"
  );

  // 🔥 PACIENTE PELO CPF
  const paciente = pacientes.find(
    (p: any) =>
      String(p.cpf).replace(/\D/g, "") ===
      String(usuario?.cpf).replace(/\D/g, "")
  );

  // 🔥 CARTÃO SUS
  const cartaoSus =
    paciente?.cartaoSus ||
    paciente?.sus ||
    paciente?.cartao_sus ||
    "Não informado";

  // 🔥 FILTRA DADOS DO PACIENTE
  const consultasPaciente = consultas.filter(
    (c: any) => c.pacienteId === paciente?.cpf
  );

  const examesPaciente = exames.filter(
    (e: any) => e.pacienteId === paciente?.cpf
  );

  const regulacoesPaciente = regulacoes.filter(
    (r: any) => r.pacienteId === paciente?.cpf
  );

  const diagnosticosPaciente = diagnosticos.filter(
    (d: any) => d.pacienteId === paciente?.cpf
  );

  return (
    <div style={styles.pagina}>
      <Header />

      <div style={styles.container}>

        {/* HEADER */}
        <div style={styles.topo}>

          <div style={styles.headerUsuario}>
            <h2 style={styles.titulo}>
              Olá, {usuario?.nome}
            </h2>

            <p style={styles.subtitulo}>
              Bem-vindo ao portal do paciente
            </p>
          </div>

          <div style={styles.infoCard}>
            <span style={styles.infoLabel}>
              Cartão SUS
            </span>

            <span style={styles.infoValor}>
              {cartaoSus}
            </span>
          </div>

          <div style={styles.infoCard}>
            <span style={styles.infoLabel}>
              Data de Hoje
            </span>

            <span style={styles.infoValor}>
              {dataAtual}
            </span>
          </div>

        </div>

        {/* GRID */}
        <div style={styles.centro}>
          <div style={styles.gridWrapper}>

            <div style={styles.grid}>

              {/* CONSULTAS */}
              <div style={styles.cardBox}>
                <Card
                  titulo="Consultas Agendadas"
                  valor={consultasPaciente.length}
                  descricao={
                    consultasPaciente.length > 0
                      ? `${
                          consultasPaciente[0]?.tipo ||
                          "Consulta"
                        }`
                      : "Nenhuma consulta cadastrada"
                  }
                  icone={
                    <CalendarDays
                      size={34}
                      color="#0b4f6c"
                    />
                  }
                  onClick={() =>
                    navigate("/consultas")
                  }
                />
              </div>

              {/* EXAMES */}
              <div style={styles.cardBox}>
                <Card
                  titulo="Exames Solicitados"
                  valor={examesPaciente.length}
                  descricao={
                    examesPaciente.length > 0
                      ? `${
                          examesPaciente[0]?.tipo ||
                          "Exame"
                        }`
                      : "Nenhum exame cadastrado"
                  }
                  icone={
                    <FlaskConical
                      size={34}
                      color="#0b4f6c"
                    />
                  }
                  onClick={() =>
                    navigate("/exames")
                  }
                />
              </div>

              {/* ENCAMINHAMENTOS */}
              <div style={styles.cardBox}>
                <Card
                  titulo="Encaminhamentos"
                  valor={regulacoesPaciente.length}
                  descricao={
                    regulacoesPaciente.length > 0
                      ? "Acompanhamento de solicitações"
                      : "Nenhuma regulação cadastrada"
                  }
                  icone={
                    <ClipboardList
                      size={34}
                      color="#0b4f6c"
                    />
                  }
                  onClick={() =>
                    navigate("/regulacao")
                  }
                />
              </div>

              {/* HISTÓRICO */}
              <div style={styles.cardBox}>
                <Card
                  titulo="Diagnósticos Recentes"
                  valor={diagnosticosPaciente.length}
                  descricao={
                    diagnosticosPaciente.length > 0
                      ? "Últimos diagnósticos"
                      : "Nenhum diagnóstico cadastrado"
                  }
                  icone={
                    <Clock
                      size={34}
                      color="#0b4f6c"
                    />
                  }
                  onClick={() =>
                    navigate("/historico")
                  }
                />
              </div>

            </div>
          </div>
        </div>
      </div>

      <Navbar />
    </div>
  );
}

const styles: any = {
  pagina: {
    background: "#f5f5f5",
    minHeight: "100vh",
    paddingBottom: "80px",
  },

  container: {
    padding: "20px 30px",
  },

  topo: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    marginBottom: "40px",
    flexWrap: "wrap",
  },

  headerUsuario: {
    flex: 1,
  },

  titulo: {
    margin: 0,
    fontSize: "30 px",
    fontWeight: 700,
    color: "#1F2937",
  },

  subtitulo: {
    color: "#6b7280",
    marginTop: "10px",
    fontSize: "17px",
  },

  infoCard: {
    background: "#fff",
    padding: "18px 24px",
    borderRadius: "14px",
    minWidth: "240px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
    border: "1px solid #e5e7eb",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },

  infoLabel: {
    fontSize: "14px",
    color: "#6b7280",
  },

  infoValor: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#111827",
  },

  centro: {
    display: "flex",
    justifyContent: "center",
  },

  gridWrapper: {
    width: "100%",
    maxWidth: "1200px",
  },

  grid: {
    marginLeft: "150px",
    display: "grid",
    gridTemplateColumns: "repeat(2, 500px)",
    justifyContent: "center",
    columnGap: "0px",
    rowGap: "60px",
  },

  cardBox: {
    transform: "scale(1.12)",
  },
};