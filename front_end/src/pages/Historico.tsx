import { useState } from "react";
import { ChevronRight } from "lucide-react";
import BotaoVoltar from "../components/BotaoVoltar";
import Header from "../components/Header";
import Navbar from "../components/Navbar";
import StatusBadge from "../components/shared/StatusBadge";
import StatusDateFilters from "../components/shared/StatusDateFilters";
import SearchCard from "../components/shared/SearchCard";
import { matchesDateRange, matchesStatus } from "../lib/filters";
import "../pages/forms-medicos.css";

export default function Diagnosticos() {
  const usuario = JSON.parse(
    localStorage.getItem("usuarioLogado") || "null"
  );

  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [dataInicial, setDataInicial] = useState("");
  const [dataFinal, setDataFinal] = useState("");
  const [selecionado, setSelecionado] = useState<any | null>(null);

  let todos: any[] = [];

  try {
    todos = JSON.parse(
      localStorage.getItem("diagnosticos") || "[]"
    );
  } catch {
    todos = [];
  }

  // 🔥 PEGA SOMENTE DIAGNÓSTICOS DO PACIENTE LOGADO E APLICA A BUSCA
  const diagnosticos = todos
    .filter(
      (d: any) =>
        d.pacienteId === usuario?.cpf ||
        d.pacienteCpf === usuario?.cpf
    )
    .filter((d: any) =>
      d.titulo?.toLowerCase().includes(busca.toLowerCase())
    )
    .filter((d: any) => matchesStatus(d.status, filtroStatus))
    .filter((d: any) =>
      matchesDateRange(d.data || d.dataDiagnostico, dataInicial, dataFinal)
    );

  return (
    <div className="page-medica">
      <Header />

      <div className="page-medica-container" style={{ paddingBottom: "80px" }}>
        
        {/* TOPO */}
        <div className="page-topo">
          <div className="page-titulo">
            <h1>Diagnósticos</h1>
            <p>Visualização do seu histórico e registros médicos.</p>
          </div>

          <div className="page-badge">
            <strong>{diagnosticos.length}</strong>
            <span>Registros</span>
          </div>
        </div>

        {/* BUSCA */}
        <SearchCard
          label="Buscar diagnóstico"
          placeholder="Buscar por nome da condição..."
          value={busca}
          onChange={setBusca}
        />

        <StatusDateFilters
          statusValue={filtroStatus}
          statusOptions={["Ativo", "Em tratamento", "Concluido", "Cancelado"]}
          dateStart={dataInicial}
          dateEnd={dataFinal}
          onStatusChange={setFiltroStatus}
          onDateStartChange={setDataInicial}
          onDateEndChange={setDataFinal}
          onClear={() => {
            setFiltroStatus("");
            setDataInicial("");
            setDataFinal("");
          }}
        />

        {/* TABELA */}
        <div className="form-card">
          <table className="tabela-moderna">
            <thead>
              <tr>
                <th>Diagnóstico</th>
                <th>Data</th>
                <th>Status</th>
                <th>Médico Responsável</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {diagnosticos.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "20px" }}>
                    Nenhum diagnóstico encontrado
                  </td>
                </tr>
              ) : (
                diagnosticos.map((d: any, index: number) => (
                  <tr key={index}>
                    <td>
                      <strong>📋 {d.titulo}</strong>
                    </td>

                    <td>{formatarData(d.data || d.dataDiagnostico)}</td>

                    <td>
                      <StatusBadge status={d.status} />
                    </td>

                    <td>{d.medico || d.medicoNome || "Não informado"}</td>

                    <td>
                      <button 
                        className="btn-ver-detalhes"
                        onClick={() => setSelecionado(d)}
                      >
                        Ver detalhes
                        <ChevronRight size={14} />
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
                <div className="form-icon">📋</div>
                <div>
                  <h2>{selecionado.titulo}</h2>
                  <p>Detalhes do diagnóstico</p>
                </div>
              </div>

              <div className="form-grid" style={{ marginTop: "15px", marginBottom: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
                
                <div style={{ fontSize: "14px", color: "#374151" }}>
                  <p style={{ margin: "5px 0" }}>
                    <strong>Data:</strong> {formatarData(selecionado.data || selecionado.dataDiagnostico)}
                  </p>
                  <p style={{ margin: "5px 0" }}>
                    <strong>Médico:</strong> {selecionado.medico || selecionado.medicoNome || "Não informado"}
                  </p>
                </div>

                <div style={{ background: "#f9fafb", padding: "12px", borderRadius: "8px", borderLeft: "4px solid #0ea5a4" }}>
                  <strong style={{ fontSize: "13px", color: "#0ea5a4", display: "block", marginBottom: "4px" }}>
                    Descrição
                  </strong>
                  <p style={{ margin: 0, fontSize: "14px", color: "#374151", lineHeight: "1.5" }}>
                    {selecionado.descricao || "Sem descrição detalhada."}
                  </p>
                </div>

                <div style={{ background: "#f9fafb", padding: "12px", borderRadius: "8px", borderLeft: "4px solid #0ea5a4" }}>
                  <strong style={{ fontSize: "13px", color: "#0ea5a4", display: "block", marginBottom: "4px" }}>
                    Observações Médicas
                  </strong>
                  <p style={{ margin: 0, fontSize: "14px", color: "#374151", lineHeight: "1.5" }}>
                    {selecionado.observacoes || "Sem observações adicionais."}
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
