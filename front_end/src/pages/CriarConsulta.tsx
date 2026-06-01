import Header from "../components/Header1";
import { useLocation } from "react-router-dom";
import { useState } from "react";
import { Plus, Search, Video } from "lucide-react";
import BotaoVoltar from "../components/BotaoVoltar";
import "../pages/forms-medicos.css";
import { saveCollection } from "../services/backend";
import { useToast } from "../hooks/useToast";
import { useConfirm } from "../components/shared/useConfirm";
import { matchesStatus } from "../lib/filters";
import { PacienteAtualBanner, NenhumPacienteSelecionado } from "../components/shared/PacienteAtualBanner";
import { usePacienteAtual } from "../hooks/usePacienteAtual";

export default function Consultas() {
  const location = useLocation();
  const toast = useToast();
  const { confirm, confirmationModal } = useConfirm();

  const paciente = usePacienteAtual(location.state as any);

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
  const [filtroStatus, setFiltroStatus] = useState("");

  const [editandoIndex, setEditandoIndex] =
    useState<number | null>(null);
  const [, setDataVersion] = useState(0);
  const [salvando, setSalvando] = useState(false);
  const [excluindoIndex, setExcluindoIndex] = useState<number | null>(null);

  if (!paciente)
    return (
      <div className="page-medica">
        <Header />

        <div className="page-medica-container">
          <div className="page-topo">
            <div className="page-titulo">
              <h1>Teleconsultas</h1>
              <p>Selecione um paciente para gerenciar teleconsultas.</p>
            </div>
          </div>

          <NenhumPacienteSelecionado />
        </div>

        <BotaoVoltar />
      </div>
    );

  const pacienteSelecionado = paciente;

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
    )
    .filter((c: any) => matchesStatus(c.status, filtroStatus));

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
    if (salvando) return;

    if (!tipo || !data || !dataRetorno) {
      toast.error({
        title: "Erro ao salvar",
        description: "Preencha os campos obrigatórios da teleconsulta.",
      });
      return;
    }

    const nova = {
      tipo,
      dataSolicitacao: data,
      dataRetorno,
      medico,
      horario,
      unidade,
      observacoes,
      status,
      pacienteId: pacienteSelecionado.cpf,
    };

    const atualizadas =
      editandoIndex !== null
        ? todas.map((item, index) =>
            index === editandoIndex ? nova : item
          )
        : [...todas, nova];

    setSalvando(true);

    try {
      await saveCollection("consulta", atualizadas);
    } catch {
      toast.error({
        title: "Erro ao salvar",
        description: "Não foi possível salvar a consulta no backend.",
      });
      return;
    } finally {
      setSalvando(false);
    }

    limparFormulario();

    setMostrarForm(false);
    setDataVersion((version) => version + 1);
    toast.success({
      title: editandoIndex !== null ? "Consulta editada" : "Consulta criada",
      description: "Os dados da teleconsulta foram salvos com sucesso.",
    });
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

    const indexReal = todas.findIndex(
      (c) =>
        c.tipo === consulta.tipo &&
        c.dataSolicitacao ===
          consulta.dataSolicitacao
    );

    setEditandoIndex(indexReal);

    setMostrarForm(true);
  }

  async function excluirConsulta(index: number) {
    if (excluindoIndex !== null) return;

    const confirmar = await confirm({
      title: "Excluir consulta?",
      description: "Essa teleconsulta sera removida do historico do paciente.",
      confirmLabel: "Excluir",
      tone: "danger",
    });

    if (!confirmar) return;

    const consulta = consultas[index];
    const atualizadas = todas.filter((item) => item !== consulta);

    setExcluindoIndex(index);

    try {
      await saveCollection("consulta", atualizadas);
    } catch {
      toast.error({
        title: "Erro ao excluir",
        description: "Não foi possível excluir a consulta no backend.",
      });
      return;
    } finally {
      setExcluindoIndex(null);
    }

    setDataVersion((version) => version + 1);
    toast.success({
      title: "Consulta excluída",
      description: "A teleconsulta foi removida com sucesso.",
    });
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

          <div className="page-badge page-badge-exames page-badge-teleconsulta">
            <div className="page-badge-icon">
              <Video size={22} />
            </div>

            <div>
              <strong>
                {consultas.length}
              </strong>

              <span>
                Consultas cadastradas
              </span>
            </div>
          </div>
        </div>

        <PacienteAtualBanner paciente={paciente} />

        {/* BUSCA */}
        <div className="form-card">
          <div className="form-grid form-grid-busca-exame">
            <div className="form-group">
              <label className="form-label">
                Buscar consulta
              </label>

              <div className="search-card-input">
                <Search size={17} aria-hidden="true" />
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

            <div className="form-group">
              <label className="form-label">
                Status
              </label>

              <select
                className="form-input select-status-exame"
                value={filtroStatus}
                onChange={(e) =>
                  setFiltroStatus(e.target.value)
                }
              >
                <option value="">
                  Todos os status
                </option>
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

            <div className="form-group form-group-botao-exame">
              <button
                className="btn-salvar btn-nova-teleconsulta"
                onClick={() =>
                  setMostrarForm(true)
                }
              >
                <Plus size={16} />
                Nova Teleconsulta
              </button>
            </div>
          </div>
        </div>

        {/* BOTÃO */}
        {/* TABELA */}
        <div className="tabela-exames-wrapper animate-fade-in">
          <div className="tabela-exames-header tabela-consultas-header">
            <div className="page-badge-icon tabela-exames-header-icon">
              <Video size={16} />
            </div>

            <span>
              Lista de teleconsultas
            </span>
          </div>

          <table className="tabela-exames-atendimento">
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
                  <td
                    colSpan={5}
                    style={{
                      textAlign: "center",
                    }}
                  >
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
                            justifyContent:
                              "flex-end",
                            flexWrap: "wrap",
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
                            className="btn-excluir"
                            disabled={excluindoIndex !== null}
                            onClick={() =>
                              excluirConsulta(
                                index
                              )
                            }
                          >
                            {excluindoIndex === index ? "Excluindo..." : "Excluir"}
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
                    Unidade básica de saúde
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
                  className="btn-cancelar btn-cancelar-modal"
                  disabled={salvando}
                  onClick={() => {
                    limparFormulario();

                    setMostrarForm(false);
                  }}
                >
                  Cancelar
                </button>

                <button
                  className="btn-salvar btn-salvar-consulta"
                  disabled={salvando}
                  onClick={salvarConsulta}
                >
                  {salvando ? "Salvando..." : "Salvar consulta"}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      <BotaoVoltar />
      {confirmationModal}
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
