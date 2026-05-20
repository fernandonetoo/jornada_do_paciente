import { useEffect, useState } from "react";
import Header from "../components/Header1";
import BotaoVoltar from "../components/BotaoVoltar";
import { useLocation, useNavigate } from "react-router-dom";
import "../pages/forms-medicos.css";
import { User } from "lucide-react";

export default function Exames() {
  const navigate = useNavigate();

  useEffect(() => {
    const usuario = JSON.parse(
      localStorage.getItem("usuarioLogado") || "null"
    );

    if (
      !usuario ||
      !usuario.grupos?.includes(
        "medico_oncologista"
      )
    ) {
      navigate("/");
    }
  }, [navigate]);

  const location = useLocation();

  const paciente =
    location.state ||
    JSON.parse(
      localStorage.getItem("pacienteAtual") ||
        "null"
    );

  const [busca, setBusca] =
    useState("");

  if (!paciente)
    return <h2>Paciente não encontrado</h2>;

  let todos: any[] = [];

  try {
    todos = JSON.parse(
      localStorage.getItem("exames") ||
        "[]"
    );
  } catch {
    todos = [];
  }

  const exames = todos
    .filter(
      (e: any) =>
        e.pacienteId === paciente.cpf
    )
    .filter((e: any) =>
      e.tipo
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
            <h1>Exames</h1>

            <p>
              Visualização dos exames
              registrados
            </p>
          </div>

          <div className="page-badge">
            <strong>
              {exames.length}
            </strong>

            <span>
              Exames cadastrados
            </span>
          </div>
        </div>

        {/* PACIENTE */}
        <div className="form-card">

          <div className="form-card-header">
            <div>
              <h2>Paciente</h2>

              <p>
                Informações do paciente
                selecionado
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
                -CPF: {paciente.cpf}
              </span>

              
            </div>
          </div>
        </div>

        {/* BUSCA */}
        <div className="form-card">
          <div className="form-group">

            <label className="form-label">
              Buscar exame
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
                <th>Laboratório</th>
              </tr>
            </thead>

            <tbody>
              {exames.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    Nenhum exame encontrado
                  </td>
                </tr>
              ) : (
                exames.map(
                  (
                    e: any,
                    i: number
                  ) => (
                    <tr key={i}>
                      <td>{e.tipo}</td>

                      <td>
                        {formatarData(
                          e.dataSolicitacao
                        )}
                      </td>

                      <td>
                        {formatarData(
                          e.dataRealizacao
                        )}
                      </td>

                      <td>
                        {e.hora || "-"}
                      </td>

                      <td>
                        <span
                          style={getStatusStyle(
                            e.status
                          )}
                        >
                          {e.status}
                        </span>
                      </td>

                      <td>
                        {e.laboratorio ||
                          "-"}
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