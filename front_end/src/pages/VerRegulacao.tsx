import Header from "../components/Header1";
import BotaoVoltar from "../components/BotaoVoltar";
import { useLocation } from "react-router-dom";
import { useState } from "react";
import "../pages/forms-medicos.css";
import { PacienteAtualBanner, NenhumPacienteSelecionado } from "../components/shared/PacienteAtualBanner";
import { usePacienteAtual } from "../hooks/usePacienteAtual";
import SearchCard from "../components/shared/SearchCard";

export default function Regulacoes() {
  const location = useLocation();

  const paciente = usePacienteAtual(location.state as any);

  const [busca, setBusca] = useState("");

  if (!paciente)
    return (
      <div className="page-medica">
        <Header />

        <div className="page-medica-container">
          <div className="page-topo">
            <div className="page-titulo">
              <h1>Regulações</h1>
              <p>Selecione um paciente para visualizar regulações.</p>
            </div>
          </div>

          <NenhumPacienteSelecionado />
        </div>

        <BotaoVoltar />
      </div>
    );

  let todas: any[] = [];

  try {
    todas = JSON.parse(
      localStorage.getItem("regulacao") || "[]"
    );
  } catch {
    todas = [];
  }

  const regulacoes = todas
    .filter(
      (r: any) =>
        r.pacienteId === paciente.cpf
    )
    .filter((r: any) =>
      r.tipo
        .toLowerCase()
        .includes(busca.toLowerCase())
    );

  return (
    <div className="page-medica">
      <Header />

      <div className="page-medica-container">

        {/* TOPO */}
        <div className="page-topo">
          <div className="page-titulo">
            <h1>Regulações</h1>

            <p>
              Visualização das regulações
              solicitadas do paciente
            </p>
          </div>

          <div className="page-badge">
            <strong>
              {regulacoes.length}
            </strong>

            <span>
              Regulações cadastradas
            </span>
          </div>
        </div>

        <PacienteAtualBanner paciente={paciente} />

        {/* BUSCA */}
        <SearchCard
          label="Buscar regulação"
          placeholder="Buscar por tipo..."
          value={busca}
          onChange={setBusca}
        />

        {/* TABELA */}
        <div className="form-card">
          <table className="tabela-moderna">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Solicitação</th>
                <th>Status</th>
                <th>Médico</th>
                <th>Resposta</th>
              </tr>
            </thead>

            <tbody>
              {regulacoes.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    Nenhuma regulação encontrada
                  </td>
                </tr>
              ) : (
                regulacoes.map(
                  (r: any, i: number) => (
                    <tr key={i}>
                      <td>{r.tipo}</td>

                      <td>
                        {formatarData(
                          r.dataSolicitacao
                        )}
                      </td>

                      <td>
                        <span
                          style={getStatusStyle(
                            r.status
                          )}
                        >
                          {r.status}
                        </span>
                      </td>

                      <td>
                        {r.medicoNome || "-"}
                      </td>

                      <td>
                        {formatarData(
                          r.dataResposta
                        )}
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>

        <BotaoVoltar />
      </div>
    </div>
  );
}

function getStatusStyle(
  status: string
) {
  if (status === "Em análise") {
    return {
      background: "#dbeafe",
      color: "#2563eb",
      padding: "6px 12px",
      borderRadius: "999px",
      fontWeight: 600,
      fontSize: "12px",
    };
  }

  if (status === "Aprovado") {
    return {
      background: "#d1fae5",
      color: "#059669",
      padding: "6px 12px",
      borderRadius: "999px",
      fontWeight: 600,
      fontSize: "12px",
    };
  }

  if (status === "Negado") {
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
    background: "#f3f4f6",
    color: "#374151",
    padding: "6px 12px",
    borderRadius: "999px",
    fontWeight: 600,
    fontSize: "12px",
  };
}

function formatarData(
  data: string
) {
  if (!data || data === "-")
    return "-";

  const [ano, mes, dia] =
    data.split("-");

  return `${dia}/${mes}/${ano}`;
}
