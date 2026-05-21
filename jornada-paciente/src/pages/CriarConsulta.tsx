import Header from "../components/Header1";
import { useLocation } from "react-router-dom";
import { useState } from "react";
import BotaoVoltar from "../components/BotaoVoltar";
import "../pages/forms-medicos.css";
import { saveCollection } from "../services/backend";

export default function Consultas() {
  const location = useLocation();

  const paciente =
    location.state ||
    JSON.parse(
      localStorage.getItem("pacienteAtual") ||
        "null"
    );

  const [mostrarForm, setMostrarForm] =
    useState(false);

  const [tipo, setTipo] = useState("");
  const [data, setData] = useState("");
  const [dataRetorno, setDataRetorno] =
    useState("");
  const [medico, setMedico] =
    useState("");
  const [horario, setHorario] =
    useState("");
  const [unidade, setUnidade] =
    useState("");
  const [observacoes, setObservacoes] =
    useState("");

  const [status, setStatus] =
    useState("Agendado");

  const [busca, setBusca] = useState("");

  const [mostrarSucesso, setMostrarSucesso] =
    useState(false);

  const [editandoIndex, setEditandoIndex] =
    useState<number | null>(null);

  if (!paciente)
    return <h2>Paciente não encontrado</h2>;

  let todas: any[] = [];

  try {
    todas = JSON.parse(
      localStorage.getItem("consulta") ||
        "[]"
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

  function limparFormulario() {
    setTipo("");
    setData("");
    setDataRetorno("");
    setMedico("");
    setHorario("");
    setUnidade("");
    setObservacoes("");
    setStatus("Agendado");
    setEditandoIndex(null);
  }

  async function salvarConsulta() {
    if (!tipo || !data || !dataRetorno) {
      alert(
        "Preencha os campos obrigatórios!"
      );
      return;
    }

    const nova = {
      id:
        editandoIndex !== null
          ? todas[editandoIndex]?.id || Date.now()
          : Date.now(),
      tipo,
      dataSolicitacao: data,
      dataRetorno,
      medico,
      horario,
      unidade,
      observacoes,
      status,
      pacienteId: paciente.cpf,
      nomePaciente: paciente.nome,
    };

    if (editandoIndex !== null) {
      todas[editandoIndex] = nova;
    } else {
      todas.push(nova);
    }

    try {
      await saveCollection("consulta", todas);
    } catch {
      alert("Não foi possível salvar a consulta no backend.");
      return;
    }

    limparFormulario();

    setMostrarForm(false);
    setMostrarSucesso(true);
  }

  function editarConsulta(index: number) {
    const consulta = consultas[index];

    setTipo(consulta.tipo);
    setData(consulta.dataSolicitacao);

    setDataRetorno(
      consulta.dataRetorno || ""
    );

    setMedico(consulta.medico || "");

    setHorario(
      consulta.horario || ""
    );

    setUnidade(
      consulta.unidade || ""
    );

    setObservacoes(
      consulta.observacoes || ""
    );

    setStatus(
      consulta.status || "Agendado"
    );

    const indexReal = consulta.id
      ? todas.findIndex((c) => c.id === consulta.id)
      : todas.findIndex(
          (c) =>
            c.tipo === consulta.tipo &&
            c.dataSolicitacao ===
              consulta.dataSolicitacao &&
            c.pacienteId === consulta.pacienteId
        );

    setEditandoIndex(indexReal);

    setMostrarForm(true);
  }

  async function excluirConsulta(index: number) {
    const confirmar = confirm(
      "Deseja excluir essa consulta?"
    );

    if (!confirmar) return;

    const consulta = consultas[index];
    const atualizadas = consulta?.id
      ? todas.filter((c: any) => c.id !== consulta.id)
      : todas.filter(
          (c: any) =>
            !(
              c.tipo === consulta.tipo &&
              c.dataSolicitacao === consulta.dataSolicitacao &&
              c.pacienteId === consulta.pacienteId
            )
        );

    try {
      await saveCollection("consulta", atualizadas);
    } catch {
      alert("Não foi possível excluir a consulta no backend.");
      return;
    }

    window.location.reload();
  }

  return (
    <div className="page-medica">
      <Header />

      <div className="page-medica-container">
        {/* TOPO */}
        <div className="page-topo">
          <div className="page-titulo">
            <h1>Teleconsultas</h1>

            <p>
              Gerencie teleconsultas e
              acompanhamentos do paciente.
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
            <div className="card-avatar">
              {paciente.foto ? (
                <img
                  src={paciente.foto}
                  alt=""
                />
              ) : (
                "👤"
              )}
            </div>

            <div>
              <h2>Paciente</h2>

              <p>
                Informações do paciente
                selecionado
              </p>
            </div>
          </div>

          <div className="card-paciente">
            <div>
              <strong>
                {paciente.nome}
              </strong>

              <span>
                CPF: {paciente.cpf}
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

        {/* BOTÃO */}
        <div
          style={{
            display: "flex",
            justifyContent:
              "flex-end",
            marginBottom: 20,
          }}
        >
          <button
            className="btn-salvar"
            onClick={() =>
              setMostrarForm(true)
            }
          >
            + Nova Teleconsulta
          </button>
        </div>

        {/* TABELA */}
        <div className="form-card">
          <table className="tabela-moderna">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Solicitação</th>
                <th>Retorno</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {consultas.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    Nenhuma consulta
                    cadastrada
                  </td>
                </tr>
              ) : (
                consultas.map(
                  (consulta, index) => (
                    <tr key={index}>
                      <td>
                        {consulta.tipo}
                      </td>

                      <td>
                        {formatarData(
                          consulta.dataSolicitacao
                        )}
                      </td>

                      <td>
                        {formatarData(
                          consulta.dataRetorno
                        )}
                      </td>

                      <td>
                        <span
                          style={getStatusStyle(
                            consulta.status
                          )}
                        >
                          {
                            consulta.status
                          }
                        </span>
                      </td>

                      <td>
                        <div
                          style={{
                            display:
                              "flex",
                            gap: 10,
                          }}
                        >
                          <button
                            className="btn-cancelar"
                            onClick={() =>
                              editarConsulta(
                                index
                              )
                            }
                          >
                            Editar
                          </button>

                          <button
                            className="btn-cancelar"
                            onClick={() =>
                              excluirConsulta(
                                index
                              )
                            }
                          >
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>

        {/* MODAL */}
        {mostrarForm && (
          <div className="overlay">
            <div className="modal">
              <div className="form-card-header">
                <div className="form-icon">
                  📋
                </div>

                <div>
                  <h2>
                    {editandoIndex !==
                    null
                      ? "Editar Teleconsulta"
                      : "Nova Teleconsulta"}
                  </h2>

                  <p>
                    Preencha os dados
                    da consulta
                  </p>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">
                    Tipo
                  </label>

                  <input
                    className="form-input"
                    value={tipo}
                    onChange={(e) =>
                      setTipo(
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Data Solicitação
                  </label>

                  <input
                    type="date"
                    className="form-input"
                    value={data}
                    onChange={(e) =>
                      setData(
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Data Retorno
                  </label>

                  <input
                    type="date"
                    className="form-input"
                    value={dataRetorno}
                    onChange={(e) =>
                      setDataRetorno(
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Médico
                  </label>

                  <input
                    className="form-input"
                    value={medico}
                    onChange={(e) =>
                      setMedico(
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Horário
                  </label>

                  <input
                    type="time"
                    className="form-input"
                    value={horario}
                    onChange={(e) =>
                      setHorario(
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Unidade
                  </label>

                  <input
                    className="form-input"
                    value={unidade}
                    onChange={(e) =>
                      setUnidade(
                        e.target.value
                      )
                    }
                  />
                </div>

                {/* STATUS */}
                <div className="form-group">
                  <label className="form-label">
                    Status
                  </label>

                  <select
                    className="form-input"
                    value={status}
                    onChange={(e) =>
                      setStatus(
                        e.target.value
                      )
                    }
                  >
                    <option value="Agendado">
                      Agendado
                    </option>

                    <option value="Realizado">
                      Realizado
                    </option>

                    <option value="Cancelado">
                      Cancelado
                    </option>

                    <option value="Em andamento">
                      Em andamento
                    </option>
                  </select>
                </div>

                <div className="form-group full">
                  <label className="form-label">
                    Observações
                  </label>

                  <textarea
                    className="form-textarea"
                    value={observacoes}
                    onChange={(e) =>
                      setObservacoes(
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  className="btn-cancelar"
                  onClick={() => {
                    limparFormulario();

                    setMostrarForm(false);
                  }}
                >
                  Cancelar
                </button>

                <button
                  className="btn-salvar"
                  onClick={salvarConsulta}
                >
                  Salvar consulta
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SUCESSO */}
        {mostrarSucesso && (
          <div className="overlay">
            <div className="successModal">
              <h2 className="successTitle">
                Consulta salva com
                sucesso!
              </h2>

              <button
                className="btn-salvar"
                onClick={() =>
                  setMostrarSucesso(
                    false
                  )
                }
              >
                OK
              </button>
            </div>
          </div>
        )}
      </div>

      <BotaoVoltar />
    </div>
  );
}

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

  if (status === "Realizado") {
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

  if (status === "Em andamento") {
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
  if (!data || data === "-")
    return "-";

  const [ano, mes, dia] =
    data.split("-");

  return `${dia}/${mes}/${ano}`;
}
