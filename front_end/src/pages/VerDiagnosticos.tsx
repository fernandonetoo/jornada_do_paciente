import Header from "../components/Header1";
import { useLocation } from "react-router-dom";
import { useState } from "react";
import BotaoVoltar from "../components/BotaoVoltar";
import "../pages/forms-medicos.css";
import { PacienteAtualBanner, NenhumPacienteSelecionado } from "../components/shared/PacienteAtualBanner";
import { usePacienteAtual } from "../hooks/usePacienteAtual";
import SearchCard from "../components/shared/SearchCard";

export default function Diagnosticos() {
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
              <h1>Diagnósticos</h1>
              <p>Selecione um paciente para visualizar diagnósticos.</p>
            </div>
          </div>

          <NenhumPacienteSelecionado />
        </div>

        <BotaoVoltar />
      </div>
    );

  let todos: any[] = [];

  try {
    todos = JSON.parse(
      localStorage.getItem("diagnosticos") || "[]"
    );
  } catch {
    todos = [];
  }

  const diagnosticos = todos
    .filter(
      (d: any) =>
        d.pacienteId === paciente.cpf
    )
    .filter((d: any) =>
      d.titulo
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
            <h1>Diagnósticos</h1>

            <p>
              Visualização dos diagnósticos
              registrados do paciente
            </p>
          </div>

          <div className="page-badge">
            <strong>
              {diagnosticos.length}
            </strong>

            <span>
              Diagnósticos cadastrados
            </span>
          </div>
        </div>

        <PacienteAtualBanner paciente={paciente} />

        {/* BUSCA */}
        <SearchCard
          label="Buscar diagnóstico"
          placeholder="Buscar por título..."
          value={busca}
          onChange={setBusca}
        />

        {/* LISTA */}
        {diagnosticos.length === 0 ? (
          <div className="form-card">
            <p
              style={{
                color: "#6b7280",
                textAlign: "center",
              }}
            >
              Nenhum diagnóstico encontrado
            </p>
          </div>
        ) : (
          diagnosticos.map(
            (d: any, i: number) => (
              <div
                key={i}
                className="form-card"
                style={{
                  marginBottom: 20,
                }}
              >
                <div className="form-card-header">
                  <div>
                    <h2>{d.titulo}</h2>

                    <p>
                      Diagnóstico registrado
                    </p>
                  </div>

                  <span
                    style={{
                      background:
                        "#dbeafe",
                      color: "#2563eb",
                      padding:
                        "6px 12px",
                      borderRadius:
                        "999px",
                      fontWeight: 600,
                      fontSize: "12px",
                    }}
                  >
                    {formatarData(d.data)}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection:
                      "column",
                    gap: 18,
                  }}
                >

                  <div>
                    <label className="form-label">
                      Descrição
                    </label>

                    <div
                      style={{
                        background:
                          "#f9fafb",
                        padding: 15,
                        borderRadius: 10,
                        border:
                          "1px solid #e5e7eb",
                        color: "#374151",
                      }}
                    >
                      {d.descricao ||
                        "Não informado"}
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(220px, 1fr))",
                      gap: 15,
                    }}
                  >

                    <div>
                      <label className="form-label">
                        Médico Responsável
                      </label>

                      <div
                        style={{
                          background:
                            "#f9fafb",
                          padding: 15,
                          borderRadius:
                            10,
                          border:
                            "1px solid #e5e7eb",
                          color:
                            "#374151",
                        }}
                      >
                        {d.medico ||
                          "Não informado"}
                      </div>
                    </div>

                    <div>
                      <label className="form-label">
                        Data do Diagnóstico
                      </label>

                      <div
                        style={{
                          background:
                            "#f9fafb",
                          padding: 15,
                          borderRadius:
                            10,
                          border:
                            "1px solid #e5e7eb",
                          color:
                            "#374151",
                        }}
                      >
                        {formatarData(
                          d.data
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="form-label">
                      Observações
                    </label>

                    <div
                      style={{
                        background:
                          "#f9fafb",
                        padding: 15,
                        borderRadius: 10,
                        border:
                          "1px solid #e5e7eb",
                        color: "#374151",
                        minHeight: 80,
                      }}
                    >
                      {d.observacoes ||
                        "Nenhuma observação registrada"}
                    </div>
                  </div>
                </div>
              </div>
            )
          )
        )}

        <BotaoVoltar />
      </div>
    </div>
  );
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
