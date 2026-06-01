import Header from "../components/Header1";
import BotaoVoltar from "../components/BotaoVoltar";
import { useLocation } from "react-router-dom";
import { useState } from "react";
import { Plus, Search, Stethoscope } from "lucide-react";
import "../pages/forms-medicos.css";
import { saveCollection } from "../services/backend";
import { useToast } from "../hooks/useToast";
import { useConfirm } from "../components/shared/useConfirm";
import { matchesStatus } from "../lib/filters";
import { PacienteAtualBanner, NenhumPacienteSelecionado } from "../components/shared/PacienteAtualBanner";
import { usePacienteAtual } from "../hooks/usePacienteAtual";

export default function Diagnostico() {
  const location = useLocation();
  const toast = useToast();
  const { confirm, confirmationModal } = useConfirm();

  const paciente = usePacienteAtual(location.state as any);

  const usuarioLogado = JSON.parse(
    localStorage.getItem(
      "usuarioLogado"
    ) || "null"
  );

  const [mostrarModal, setMostrarModal] =
    useState(false);

  const [busca, setBusca] =
    useState("");
  const [filtroStatus, setFiltroStatus] = useState("");

  const [titulo, setTitulo] =
    useState("");

  const [descricao, setDescricao] =
    useState("");

  const [data, setData] =
    useState("");

  const [status, setStatus] =
    useState("Ativo");

  const [medico, setMedico] =
    useState(
      usuarioLogado?.nome || ""
    );

  const [observacoes, setObservacoes] =
    useState("");

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
              <h1>Diagnósticos</h1>
              <p>Selecione um paciente para gerenciar diagnósticos.</p>
            </div>
          </div>

          <NenhumPacienteSelecionado />
        </div>

        <BotaoVoltar />
      </div>
    );

  const pacienteSelecionado = paciente;

  let todos: any[] = [];

  try {
    todos = JSON.parse(
      localStorage.getItem(
        "diagnosticos"
      ) || "[]"
    );
  } catch {
    todos = [];
  }

  const diagnosticos = todos
    .filter(
      (d: any) =>
        d.pacienteId ===
        paciente.cpf
    )
    .filter((d: any) =>
      d.titulo
        .toLowerCase()
        .includes(
          busca.toLowerCase()
        )
    )
    .filter((d: any) => matchesStatus(d.status, filtroStatus))
    ;

  function limparFormulario() {
    setTitulo("");
    setDescricao("");
    setData("");
    setStatus("Ativo");
    setMedico(
      usuarioLogado?.nome || ""
    );
    setObservacoes("");
    setEditandoIndex(null);
  }

  async function salvarDiagnostico() {
    if (salvando) return;

    if (!titulo || !data) {
      toast.error({
        title: "Erro ao salvar",
        description: "Preencha os campos obrigatórios do diagnóstico.",
      });
      return;
    }

    const novo = {
      titulo,
      descricao,
      data,
      status,
      medico,
      observacoes,
      pacienteId: pacienteSelecionado.cpf,
    };

    const atualizados =
      editandoIndex !== null
        ? todos.map((item, index) =>
            index === editandoIndex
              ? {
                  ...item,
                  ...novo,
                }
              : item
          )
        : [...todos, novo];

    setSalvando(true);

    try {
      await saveCollection("diagnosticos", atualizados);
    } catch {
      toast.error({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o diagnóstico no backend.",
      });
      return;
    } finally {
      setSalvando(false);
    }

    limparFormulario();

    setMostrarModal(false);

    setDataVersion((version) => version + 1);
    toast.success({
      title: editandoIndex !== null ? "Diagnóstico editado" : "Diagnóstico criado",
      description: "Os dados do diagnóstico foram salvos com sucesso.",
    });
  }

  function editarDiagnostico(
    index: number
  ) {
    const diagnostico =
      diagnosticos[index];

    setTitulo(
      diagnostico.titulo || ""
    );

    setDescricao(
      diagnostico.descricao || ""
    );

    setData(
      diagnostico.data || ""
    );

    setStatus(
      diagnostico.status ||
        "Ativo"
    );

    setMedico(
      diagnostico.medico || ""
    );

    setObservacoes(
      diagnostico.observacoes ||
        ""
    );

    const indexReal =
      todos.findIndex(
        (d) =>
          d.titulo ===
            diagnostico.titulo &&
          d.data ===
            diagnostico.data
      );

    setEditandoIndex(indexReal);

    setMostrarModal(true);
  }

  async function excluirDiagnostico(
    index: number
  ) {
    if (excluindoIndex !== null) return;

    const confirmar = await confirm(
      "Deseja excluir este diagnóstico?"
    );

    if (!confirmar) return;

    const diagnostico =
      diagnosticos[index];

    const atualizados =
      todos.filter(
        (d) =>
          !(
            d.titulo ===
              diagnostico.titulo &&
            d.data ===
              diagnostico.data
          )
      );

    setExcluindoIndex(index);

    try {
      await saveCollection("diagnosticos", atualizados);
    } catch {
      toast.error({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o diagnóstico no backend.",
      });
      return;
    } finally {
      setExcluindoIndex(null);
    }

    setDataVersion((version) => version + 1);
    toast.success({
      title: "Diagnóstico excluído",
      description: "O diagnóstico foi removido com sucesso.",
    });
  }

  return (
    <div className="page-medica">
      <Header />

      <div className="page-medica-container">

        {/* TOPO */}
        <div className="page-topo">
          <div className="page-titulo">
            <h1>Diagnósticos</h1>

            <p>
              Gerencie os
              diagnósticos do
              paciente
            </p>
          </div>

          <div className="page-badge page-badge-exames">
            <div className="page-badge-icon">
              <Stethoscope size={22} />
            </div>

            <div>
              <strong>
                {diagnosticos.length}
              </strong>

              <span>
                Diagnosticos cadastrados
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
                Buscar diagnostico
              </label>

              <div className="search-card-input">
                <Search size={17} aria-hidden="true" />
                <input
                  className="form-input"
                  placeholder="Buscar por titulo..."
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
                <option value="Ativo">
                  Ativo
                </option>
                <option value="Em tratamento">
                  Em tratamento
                </option>
                <option value="Concluido">
                  Concluido
                </option>
                <option value="Cancelado">
                  Cancelado
                </option>
              </select>
            </div>

            <div className="form-group form-group-botao-exame">
              <button
                className="btn-salvar btn-novo-exame"
                onClick={() =>
                  setMostrarModal(true)
                }
              >
                <Plus size={16} />
                Novo Diagnostico
              </button>
            </div>
          </div>
        </div>

        {/* BOTAO */}
        {/* TABELA */}
        <div className="tabela-exames-wrapper animate-fade-in">
          <div className="tabela-exames-header">
            <div className="page-badge-icon tabela-exames-header-icon">
              <Stethoscope size={16} />
            </div>

            <span>
              Lista de diagnosticos
            </span>
          </div>

          <table className="tabela-exames-atendimento">
            <thead>
              <tr>
                <th>Titulo</th>
                <th>Data</th>
                <th>Status</th>
                <th>Medico</th>
                <th>Descricao</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {diagnosticos.length ===
              0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      textAlign: "center",
                    }}
                  >
                    Nenhum diagnostico encontrado
                  </td>
                </tr>
              ) : (
                diagnosticos.map(
                  (
                    d: any,
                    i: number
                  ) => (
                    <tr key={i}>
                      <td>
                        {d.titulo}
                      </td>

                      <td>
                        {formatarData(
                          d.data
                        )}
                      </td>

                      <td>
                        <span
                          style={getStatusStyle(
                            d.status
                          )}
                        >
                          {d.status}
                        </span>
                      </td>

                      <td>
                        {d.medico ||
                          "-"}
                      </td>

                      <td>
                        {d.descricao ||
                          "-"}
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
                              editarDiagnostico(
                                i
                              )
                            }
                          >
                            Editar
                          </button>

                          <button
                            className="btn-excluir"
                            disabled={excluindoIndex !== null}
                            onClick={() =>
                              excluirDiagnostico(
                                i
                              )
                            }
                          >
                            {excluindoIndex === i ? "Excluindo..." : "Excluir"}
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
        {mostrarModal && (
          <div className="overlay">

            <div className="modal grande">

              <div className="form-card-header">
                <div>
                  <h2>
                    {editandoIndex !==
                    null
                      ? "Editar Diagnóstico"
                      : "Novo Diagnóstico"}
                  </h2>

                  <p>
                    Preencha os dados
                    do diagnóstico
                  </p>
                </div>
              </div>

              <div className="form-grid">

                <div className="form-group">
                  <label className="form-label">
                    Título
                  </label>

                  <input
                    className="form-input"
                    value={titulo}
                    onChange={(e) =>
                      setTitulo(
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Data
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
                    <option value="Ativo">
                      Ativo
                    </option>

                    <option value="Em tratamento">
                      Em tratamento
                    </option>

                    <option value="Concluído">
                      Concluído
                    </option>

                    <option value="Cancelado">
                      Cancelado
                    </option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Médico Responsável
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

                <div className="form-group full">
                  <label className="form-label">
                    Descrição
                  </label>

                  <textarea
                    className="form-textarea"
                    value={
                      descricao
                    }
                    onChange={(e) =>
                      setDescricao(
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="form-group full">
                  <label className="form-label">
                    Observações
                  </label>

                  <textarea
                    className="form-textarea"
                    value={
                      observacoes
                    }
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

                    setMostrarModal(
                      false
                    );
                  }}
                >
                  Cancelar
                </button>

                <button
                  className="btn-salvar btn-salvar-exame"
                  disabled={salvando}
                  onClick={
                    salvarDiagnostico
                  }
                >
                  {salvando ? "Salvando..." : editandoIndex !==
                  null
                    ? "Salvar alterações"
                    : "Salvar diagnóstico"}
                </button>

              </div>
            </div>
          </div>
        )}

        <BotaoVoltar />
        {confirmationModal}
      </div>
    </div>
  );
}

function getStatusStyle(
  status: string
) {
  if (status === "Ativo") {
    return {
      background: "#dbeafe",
      color: "#2563eb",
      padding: "6px 12px",
      borderRadius: "999px",
      fontWeight: 600,
      fontSize: "12px",
    };
  }

  if (
    status === "Em tratamento"
  ) {
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
    status === "Concluído" ||
    status === "Concluido"
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

  return {
    background: "#fee2e2",
    color: "#dc2626",
    padding: "6px 12px",
    borderRadius: "999px",
    fontWeight: 600,
    fontSize: "12px",
  };
}

function formatarData(
  data: string
) {
  if (!data) return "-";

  const [ano, mes, dia] =
    data.split("-");

  return `${dia}/${mes}/${ano}`;
}
