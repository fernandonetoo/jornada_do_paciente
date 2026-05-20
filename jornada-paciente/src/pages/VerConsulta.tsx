import Header1 from "../components/Header1";
import BotaoVoltar from "../components/BotaoVoltar";
import { useLocation } from "react-router-dom";
import { useState } from "react";
import "../pages/forms-medicos.css";
import { User } from "lucide-react";

export default function Consultas() {
  const location = useLocation();

  const paciente =
    location.state ||
    JSON.parse(
      localStorage.getItem("pacienteAtual") || "null"
    );

  const [busca, setBusca] = useState("");

  if (!paciente)
    return <h2>Paciente não encontrado</h2>;

  let todas: any[] = [];

  try {
    todas = JSON.parse(
      localStorage.getItem("consulta") || "[]"
    );
  } catch {
    todas = [];
  }

  const consultas = todas
    .filter(
      (c: any) =>
        c.pacienteId === paciente.cpf
    )
    .filter((c: any) =>
      c.tipo
        .toLowerCase()
        .includes(busca.toLowerCase())
    );

  return (
    <div className="page-medica">
      <Header1 />

      <div className="page-medica-container">

        {/* TOPO */}
        <div className="page-topo">
          <div className="page-titulo">
            <h1>Consultas</h1>

            <p>
              Visualização das consultas do paciente
            </p>
          </div>

          <div className="page-badge">
            <strong>
              {consultas.length}
            </strong>

            <span>
              Consultas cadastradas
            </span>
          </div>
        </div>

        {/* PACIENTE */}
        <div className="form-card">
          <div className="form-card-header">
            <div>
              <h2>Paciente</h2>

              <p>
                Informações do paciente selecionado
              </p>
            </div>
          </div>

          <div className="card-paciente">

            <div className="card-avatar">
              {paciente.foto ? (
                <img
                  src={paciente.foto}
                  alt={paciente.nome}
                />
              ) : (
                <div className="avatar-placeholder">
                  <User size={38} />
                </div>
              )}
            </div>

            <div>
              <strong>
                {paciente.nome}
              </strong>

              <span>
                CPF: {paciente.cpf}
              </span>

              <span>
                Idade: {paciente.idade} anos
              </span>
            </div>
          </div>
        </div>

        {/* BUSCA */}
        <div className="form-card">
          <div className="form-group">
            <label className="form-label">
              Buscar consulta
            </label>

            <input
              className="form-input"
              placeholder="Buscar por tipo..."
              value={busca}
              onChange={(e) =>
                setBusca(e.target.value)
              }
            />
          </div>
        </div>

        {/* TABELA */}
        <div className="form-card">
          <table className="tabela-moderna">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Solicitação</th>
                <th>Realização</th>
                <th>Hora</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {consultas.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    Nenhuma consulta encontrada
                  </td>
                </tr>
              ) : (
                consultas.map((c: any, i: number) => (
                  <tr key={i}>
                    <td>{c.tipo}</td>

                    <td>
                      {formatarData(
                        c.dataSolicitacao
                      )}
                    </td>

                    <td>
                      {formatarData(
                        c.dataRealizacao
                      )}
                    </td>

                    <td>
                      {c.hora || "-"}
                    </td>

                    <td>
                      <span
                        style={getStatusStyle(
                          c.status
                        )}
                      >
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))
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

  if (
    status === "Realizado" ||
    status === "Concluído"
  ) {
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
    background: "#dbeafe",
    color: "#2563eb",
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