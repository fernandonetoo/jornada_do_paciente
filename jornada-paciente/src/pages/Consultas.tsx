import { useState } from "react";
import BotaoVoltar from "../components/BotaoVoltar";
import Header from "../components/Header";
import Navbar from "../components/Navbar";
import "../pages/forms-medicos.css";

export default function Consultas() {
  const usuario = JSON.parse(
    localStorage.getItem("usuarioLogado") || "null"
  );

  const [busca, setBusca] = useState("");

  let todas: any[] = [];

  try {
    todas = JSON.parse(
      localStorage.getItem("consulta") || "[]"
    );
  } catch {
    todas = [];
  }

  // 🔥 PEGA SOMENTE CONSULTAS DO PACIENTE LOGADO E APLICA A BUSCA
  const consultas = todas
    .filter(
      (c: any) =>
        c.pacienteId === usuario?.cpf ||
        c.pacienteCpf === usuario?.cpf
    )
    .filter((c: any) =>
      c.tipo?.toLowerCase().includes(busca.toLowerCase())
    );

  return (
    <div className="page-medica">
      <Header />

      <div className="page-medica-container" style={{ paddingBottom: "80px" }}>
        
        {/* TOPO */}
        <div className="page-topo">
          <div className="page-titulo">
            <h1>Consultas</h1>
            <p>
              Gerencie suas consultas agendadas e veja seu histórico de atendimentos.
            </p>
          </div>

          <div className="page-badge">
            <strong>{consultas.length}</strong>
            <span>Consultas</span>
          </div>
        </div>

        {/* BUSCA */}
        <div className="form-card">
          <div className="form-group">
            <label className="form-label">Buscar consulta</label>
            <input
              className="form-input"
              placeholder="Buscar por tipo..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
        </div>

        {/* TABELA */}
        <div className="form-card">
          <table className="tabela-moderna">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Data</th>
                <th>Médico</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {consultas.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "20px" }}>
                    Nenhuma consulta encontrada
                  </td>
                </tr>
              ) : (
                consultas.map((c: any, index: number) => (
                  <tr key={index}>
                    <td>
                      <strong>🩺 {c.tipo}</strong>
                    </td>

                    <td>{formatarData(c.dataSolicitacao)}</td>

                    <td>{c.doutor || c.medico || "Não informado"}</td>

                    <td>
                      <span style={getStatusStyle(c.status)}>
                        {c.status}
                      </span>
                    </td>

                    <td>
                      <button className="btn-cancelar">
                        Ver detalhes &gt;
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

      <Navbar />
      <BotaoVoltar />
    </div>
  );
}

// 🔥 FUNÇÕES AUXILIARES

function getStatusStyle(status: string) {
  if (status === "Agendado") {
    return {
      background: "#fef3c7",
      color: "#d97706",
      padding: "6px 12px",
      borderRadius: "999px",
      fontWeight: 600,
      fontSize: "12px",
    };
  }

  if (status === "Realizado" || status === "Concluído") {
    return {
      background: "#d1fae5",
      color: "#059669",
      padding: "6px 12px",
      borderRadius: "999px",
      fontWeight: 600,
      fontSize: "12px",
    };
  }

  if (status === "Cancelado") {
    return {
      background: "#fee2e2",
      color: "#dc2626",
      padding: "6px 12px",
      borderRadius: "999px",
      fontWeight: 600,
      fontSize: "12px",
    };
  }

  if (status === "Em análise" || status === "Em andamento") {
    return {
      background: "#dbeafe",
      color: "#2563eb",
      padding: "6px 12px",
      borderRadius: "999px",
      fontWeight: 600,
      fontSize: "12px",
    };
  }

  return {
    background: "#e5e7eb",
    color: "#374151",
    padding: "6px 12px",
    borderRadius: "999px",
    fontWeight: 600,
    fontSize: "12px",
  };
}

function formatarData(data: string) {
  if (!data || data === "-") return "-";

  // Retorna direto se já estiver no formato brasileiro
  if (data.includes("/")) return data;

  const partes = data.split("-");
  if (partes.length === 3) {
    const [ano, mes, dia] = partes;
    return `${dia}/${mes}/${ano}`;
  }

  return data;
}