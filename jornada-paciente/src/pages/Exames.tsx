import { useState } from "react";
import BotaoVoltar from "../components/BotaoVoltar";
import Header from "../components/Header";
import Navbar from "../components/Navbar";
import "../pages/forms-medicos.css";

export default function Exames() {
  const usuario = JSON.parse(
    localStorage.getItem("usuarioLogado") || "null"
  );

  const [busca, setBusca] = useState("");

  let todos: any[] = [];

  try {
    todos = JSON.parse(
      localStorage.getItem("exames") || "[]"
    );
  } catch {
    todos = [];
  }

  // 🔥 PEGA SOMENTE EXAMES DO PACIENTE LOGADO E APLICA A BUSCA
  const exames = todos
    .filter(
      (e: any) =>
        e.pacienteId === usuario?.cpf ||
        e.pacienteCpf === usuario?.cpf
    )
    .filter((e: any) =>
      e.tipo?.toLowerCase().includes(busca.toLowerCase())
    );

  return (
    <div className="page-medica">
      <Header />

      <div className="page-medica-container" style={{ paddingBottom: "80px" }}>
        
        {/* TOPO */}
        <div className="page-topo">
          <div className="page-titulo">
            <h1>Exames</h1>
            <p>
              Acompanhe seus exames solicitados, agendados e resultados.
            </p>
          </div>

          <div className="page-badge">
            <strong>{exames.length}</strong>
            <span>Exames</span>
          </div>
        </div>

        {/* BUSCA */}
        <div className="form-card">
          <div className="form-group">
            <label className="form-label">Buscar exame</label>
            <input
              className="form-input"
              placeholder="Buscar por tipo de exame..."
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
                <th>Exame</th>
                <th>Data</th>
                <th>Local/Médico</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {exames.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "20px" }}>
                    Nenhum exame encontrado
                  </td>
                </tr>
              ) : (
                exames.map((e: any, index: number) => (
                  <tr key={index}>
                    <td>
                      <strong>🧪 {e.tipo}</strong>
                    </td>

                    <td>{formatarData(e.dataSolicitacao)}</td>

                    <td>{e.local || e.doutor || "Não informado"}</td>

                    <td>
                      <span style={getStatusStyle(e.status)}>
                        {e.status}
                      </span>
                    </td>

                    <td>
                      {e.status === "Concluído" || e.status === "Realizado" ? (
                        <button 
                          className="btn-salvar" 
                          style={{ padding: "6px 12px", fontSize: "12px", background: "#059669" }}
                        >
                          Ver resultado
                        </button>
                      ) : (
                        <button className="btn-cancelar">
                          Ver detalhes &gt;
                        </button>
                      )}
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
  if (status === "Pendente") {
    return {
      background: "#fef3c7",
      color: "#d97706",
      padding: "6px 12px",
      borderRadius: "999px",
      fontWeight: 600,
      fontSize: "12px",
    };
  }

  if (status === "Agendado") {
    return {
      background: "#dbeafe",
      color: "#2563eb",
      padding: "6px 12px",
      borderRadius: "999px",
      fontWeight: 600,
      fontSize: "12px",
    };
  }

  if (status === "Concluído" || status === "Realizado") {
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
  if (!data || data === "-") return "Sem data";

  // Retorna direto se já estiver no formato brasileiro
  if (data.includes("/")) return data;

  const partes = data.split("-");
  if (partes.length === 3) {
    const [ano, mes, dia] = partes;
    return `${dia}/${mes}/${ano}`;
  }

  return data;
}