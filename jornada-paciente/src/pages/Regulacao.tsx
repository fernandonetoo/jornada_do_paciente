import { useState } from "react";
import BotaoVoltar from "../components/BotaoVoltar";
import Header from "../components/Header";
import Navbar from "../components/Navbar";
import "../pages/forms-medicos.css";

export default function RegulacaoPage() {
  const usuario = JSON.parse(
    localStorage.getItem("usuarioLogado") || "null"
  );

  const [busca, setBusca] = useState("");
  const [selecionado, setSelecionado] = useState<any | null>(null);

  let todas: any[] = [];

  try {
    todas = JSON.parse(
      localStorage.getItem("regulacao") || "[]"
    );
  } catch {
    todas = [];
  }

  // 🔥 PEGA SOMENTE REGULAÇÕES DO PACIENTE LOGADO E APLICA A BUSCA
  const regulacoes = todas
    .filter(
      (r: any) =>
        r.pacienteId === usuario?.cpf ||
        r.pacienteCpf === usuario?.cpf
    )
    .filter((r: any) =>
      r.tipo?.toLowerCase().includes(busca.toLowerCase())
    );

  return (
    <div className="page-medica">
      <Header />

      <div className="page-medica-container" style={{ paddingBottom: "80px" }}>
        
        {/* TOPO */}
        <div className="page-topo">
          <div className="page-titulo">
            <h1>Regulação</h1>
            <p>Acompanhe suas solicitações de encaminhamento e vagas.</p>
          </div>

          <div className="page-badge">
            <strong>{regulacoes.length}</strong>
            <span>Regulações</span>
          </div>
        </div>

        {/* BUSCA */}
        <div className="form-card">
          <div className="form-group">
            <label className="form-label">Buscar regulação</label>
            <input
              className="form-input"
              placeholder="Buscar por especialidade ou tipo..."
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
                <th>Solicitação</th>
                <th>Data</th>
                <th>Médico Solicitante</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {regulacoes.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "20px" }}>
                    Nenhuma regulação encontrada
                  </td>
                </tr>
              ) : (
                regulacoes.map((item: any, index: number) => (
                  <tr key={index}>
                    <td>
                      <strong>📄 {item.tipo}</strong>
                    </td>

                    <td>{formatarData(item.dataSolicitacao)}</td>

                    <td>{item.medicoNome || "Não informado"}</td>

                    <td>
                      <span style={getStatusStyle(item.status)}>
                        {item.status}
                      </span>
                    </td>

                    <td>
                      <button 
                        className="btn-cancelar"
                        onClick={() => setSelecionado(item)}
                      >
                        Ver detalhes &gt;
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* MODAL DE DETALHES */}
        {selecionado && (
          <div className="overlay">
            <div className="modal">
              <div className="form-card-header">
                <div className="form-icon">📄</div>
                <div>
                  <h2>Detalhes da Regulação</h2>
                  <p>{selecionado.tipo}</p>
                </div>
              </div>

              <div className="form-grid" style={{ marginTop: "15px", marginBottom: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ fontSize: "14px", color: "#374151" }}>
                  <p style={{ margin: "5px 0" }}>
                    <strong>Médico Solicitante:</strong> {selecionado.medicoNome || "Não informado"}
                  </p>
                  <p style={{ margin: "5px 0" }}>
                    <strong>Data da Solicitação:</strong> {formatarData(selecionado.dataSolicitacao)}
                  </p>
                  <p style={{ margin: "5px 0" }}>
                    <strong>Paciente:</strong> {selecionado.pacienteNome || usuario?.nome || "Não informado"}
                  </p>
                  <p style={{ margin: "5px 0", display: "flex", alignItems: "center", gap: "8px" }}>
                    <strong>Status Atual:</strong> 
                    <span style={getStatusStyle(selecionado.status)}>
                      {selecionado.status}
                    </span>
                  </p>
                </div>
              </div>

              <div className="form-actions">
                <button
                  className="btn-salvar"
                  onClick={() => setSelecionado(null)}
                  style={{ width: "100%" }}
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      <Navbar />
      <BotaoVoltar />
    </div>
  );
}

// 🔥 FUNÇÕES AUXILIARES

function getStatusStyle(status: string) {
  if (status === "Em análise") {
    return {
      background: "#fef3c7",
      color: "#d97706",
      padding: "6px 12px",
      borderRadius: "999px",
      fontWeight: 600,
      fontSize: "12px",
    };
  }

  if (status === "Aguardando vaga") {
    return {
      background: "#fde68a",
      color: "#b45309",
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

  if (status === "Concluído") {
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

  if (data.includes("/")) return data;

  const partes = data.split("-");
  if (partes.length === 3) {
    const [ano, mes, dia] = partes;
    return `${dia}/${mes}/${ano}`;
  }

  return data;
}