import Header from "../components/Header1";
import { useLocation } from "react-router-dom";
import { useState } from "react";
import BotaoVoltar from "../components/BotaoVoltar";
import "../pages/forms-medicos.css";
import { saveCollection } from "../services/backend";
import { useToast } from "../hooks/useToast";
import { useConfirm } from "../components/shared/useConfirm";
import StatusDateFilters from "../components/shared/StatusDateFilters";
import { matchesDateRange, matchesStatus } from "../lib/filters";
import { PacienteAtualBanner, NenhumPacienteSelecionado } from "../components/shared/PacienteAtualBanner";
import { usePacienteAtual } from "../hooks/usePacienteAtual";

export default function Exames() {
  const location = useLocation();
  const toast = useToast();
  const { confirm, confirmationModal } = useConfirm();

  const paciente = usePacienteAtual(location.state as any);

  const usuarioLogado = JSON.parse(
    localStorage.getItem(
      "usuarioLogado"
    ) || "null"
  );

  const [mostrarForm, setMostrarForm] =
    useState(false);

  const [tipo, setTipo] = useState("");
  const [data, setData] = useState("");
  const [laboratorio, setLaboratorio] =
    useState("");
  const [observacoes, setObservacoes] =
    useState("");
  const [hora, setHora] = useState("");

  const [status, setStatus] =
    useState("Agendado");

  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [dataInicial, setDataInicial] = useState("");
  const [dataFinal, setDataFinal] = useState("");

  const [
    mostrarResultado,
    setMostrarResultado,
  ] = useState(false);

  const [resultadoTexto, setResultadoTexto] =
    useState("");

  const [dataResultado, setDataResultado] =
    useState("");

  const [
    observacaoResultado,
    setObservacaoResultado,
  ] = useState("");

  const [exameAtual, setExameAtual] =
    useState<any>(null);

  const [editandoIndex, setEditandoIndex] =
    useState<number | null>(null);
  const [, setDataVersion] = useState(0);
  const [salvando, setSalvando] = useState(false);
  const [salvandoResultado, setSalvandoResultado] = useState(false);
  const [excluindoIndex, setExcluindoIndex] = useState<number | null>(null);

  if (!paciente)
    return (
      <div className="page-medica">
        <Header />

        <div className="page-medica-container">
          <div className="page-topo">
            <div className="page-titulo">
              <h1>Exames</h1>
              <p>Selecione um paciente para gerenciar exames.</p>
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
    )
    .filter((e: any) => matchesStatus(e.status, filtroStatus))
    .filter((e: any) =>
      matchesDateRange(e.dataSolicitacao, dataInicial, dataFinal)
    );

  function limparFormulario() {
    setTipo("");
    setData("");
    setHora("");
    setStatus("Agendado");
    setLaboratorio("");
    setObservacoes("");
    setEditandoIndex(null);
  }

  async function salvarExame() {
    if (salvando) return;

    if (!tipo || !data || !hora) {
      toast.error({
        title: "Erro ao salvar",
        description: "Preencha os campos obrigatórios do exame.",
      });
      return;
    }

    const novo = {
      tipo,
      dataSolicitacao: data,
      hora,
      status,
      dataRealizacao: "-",
      laboratorio,
      observacoes,
      pacienteId: pacienteSelecionado.cpf,
      resultado: "",
      observacaoResultado: "",
      medicoResponsavel:
        usuarioLogado?.nome ||
        "Não informado",
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
      await saveCollection("exames", atualizados);
    } catch {
      toast.error({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o exame no backend.",
      });
      return;
    } finally {
      setSalvando(false);
    }

    limparFormulario();

    setMostrarForm(false);
    setDataVersion((version) => version + 1);
    toast.success({
      title: editandoIndex !== null ? "Exame editado" : "Exame criado",
      description: "Os dados do exame foram salvos com sucesso.",
    });
  }

  function editarExame(index: number) {
    const exame = exames[index];

    setTipo(exame.tipo || "");

    setData(
      exame.dataSolicitacao || ""
    );

    setHora(exame.hora || "");

    setStatus(
      exame.status || "Agendado"
    );

    setLaboratorio(
      exame.laboratorio || ""
    );

    setObservacoes(
      exame.observacoes || ""
    );

    const indexReal = todos.findIndex(
      (e) =>
        e.tipo === exame.tipo &&
        e.dataSolicitacao ===
          exame.dataSolicitacao
    );

    setEditandoIndex(indexReal);

    setMostrarForm(true);
  }

  async function excluirExame(index: number) {
    if (excluindoIndex !== null) return;

    const confirmar = await confirm({
      title: "Excluir exame?",
      description: "Esse exame sera removido do historico do paciente.",
      confirmLabel: "Excluir",
      tone: "danger",
    });

    if (!confirmar) return;

    const exame = exames[index];
    const atualizados = todos.filter((item) => item !== exame);

    setExcluindoIndex(index);

    try {
      await saveCollection("exames", atualizados);
    } catch {
      toast.error({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o exame no backend.",
      });
      return;
    } finally {
      setExcluindoIndex(null);
    }

    setDataVersion((version) => version + 1);
    toast.success({
      title: "Exame excluído",
      description: "O exame foi removido com sucesso.",
    });
  }

  async function salvarResultado() {
    if (salvandoResultado) return;

    if (
      !resultadoTexto ||
      !dataResultado ||
      !observacaoResultado
    ) {
      toast.error({
        title: "Erro ao salvar resultado",
        description: "Preencha todos os campos do resultado.",
      });
      return;
    }

    const atualizados = todos.map(
      (e: any) => {
        if (
          e.pacienteId ===
            exameAtual.pacienteId &&
          e.tipo === exameAtual.tipo &&
          e.dataSolicitacao ===
            exameAtual.dataSolicitacao
        ) {
          return {
            ...e,

            status: "Concluído",

            dataRealizacao:
              dataResultado,

            resultado:
              resultadoTexto,

            observacaoResultado,

            medicoResultado:
              usuarioLogado?.nome ||
              "Não informado",
          };
        }

        return e;
      }
    );

    setSalvandoResultado(true);

    try {
      await saveCollection("exames", atualizados);
    } catch {
      toast.error({
        title: "Erro ao salvar resultado",
        description: "Não foi possível salvar o resultado no backend.",
      });
      return;
    } finally {
      setSalvandoResultado(false);
    }

    setMostrarResultado(false);

    setResultadoTexto("");

    setDataResultado("");

    setObservacaoResultado("");

    setDataVersion((version) => version + 1);
    toast.success({
      title: "Resultado salvo",
      description: "O resultado do exame foi registrado com sucesso.",
    });
  }

  return (
    <div className="page-medica">
      <Header />

      <div className="page-medica-container">

        {/* TOPO */}
        <div className="page-topo">
          <div className="page-titulo">
            <h1>Exames</h1>

            <p>
              Gerencie exames e
              resultados do paciente
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

        <PacienteAtualBanner paciente={paciente} />

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

        {/* BOTÃO */}
        <StatusDateFilters
          statusValue={filtroStatus}
          statusOptions={["Agendado", "Em andamento", "Concluido", "Cancelado"]}
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
            + Novo Exame
          </button>
        </div>

        {/* TABELA */}
        <div className="form-card">
          <table className="tabela-moderna">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Data</th>
                <th>Hora</th>
                <th>Status</th>
                <th>Médico</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {exames.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    Nenhum exame cadastrado
                  </td>
                </tr>
              ) : (
                exames.map((e, i) => (
                  <tr key={i}>
                    <td>{e.tipo}</td>

                    <td>
                      {formatarData(
                        e.dataSolicitacao
                      )}
                    </td>

                    <td>{e.hora}</td>

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
                      {
                        e.medicoResponsavel
                      }
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
                            editarExame(i)
                          }
                        >
                          Editar
                        </button>

                        <button
                          className="btn-cancelar"
                          onClick={() => {
                            setExameAtual(
                              e
                            );

                            setMostrarResultado(
                              true
                            );
                          }}
                        >
                          Resultado
                        </button>

                        <button
                          className="btn-excluir"
                          disabled={excluindoIndex !== null}
                          onClick={() =>
                            excluirExame(i)
                          }
                        >
                          {excluindoIndex === i ? "Excluindo..." : "Excluir"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* MODAL */}
        {mostrarForm && (
          <div className="overlay">

            <div className="modal grande">

              <div className="form-card-header">
                <div>
                  <h2>
                    {editandoIndex !==
                    null
                      ? "Editar Exame"
                      : "Novo Exame"}
                  </h2>

                  <p>
                    Preencha os dados
                    do exame
                  </p>
                </div>
              </div>

              <div className="form-grid">

                <div className="form-group">
                  <label className="form-label">
                    Tipo do exame
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
                    Horário
                  </label>

                  <input
                    type="time"
                    className="form-input"
                    value={hora}
                    onChange={(e) =>
                      setHora(
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
                    <option value="Agendado">
                      Agendado
                    </option>

                    <option value="Em andamento">
                      Em andamento
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
                    Laboratório
                  </label>

                  <input
                    className="form-input"
                    value={laboratorio}
                    onChange={(e) =>
                      setLaboratorio(
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Médico Responsável
                  </label>

                  <input
                    disabled
                    className="form-input"
                    value={
                      usuarioLogado?.nome ||
                      ""
                    }
                  />
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
                  disabled={salvando}
                  onClick={() => {
                    limparFormulario();

                    setMostrarForm(
                      false
                    );
                  }}
                >
                  Cancelar
                </button>

                <button
                  className="btn-salvar"
                  disabled={salvando}
                  onClick={salvarExame}
                >
                  {salvando ? "Salvando..." : editandoIndex !== null
                    ? "Salvar alterações"
                    : "Salvar exame"}
                </button>

              </div>
            </div>
          </div>
        )}

        {/* RESULTADO */}
        {mostrarResultado && (
          <div className="overlay">
            <div className="modal grande">

              <div className="form-card-header">
                <div>
                  <h2>
                    Resultado do Exame
                  </h2>

                  <p>
                    Preencha os dados
                    do resultado
                  </p>
                </div>
              </div>

              <div className="form-grid">

                <div className="form-group">
                  <label className="form-label">
                    Resultado
                  </label>

                  <input
                    className="form-input"
                    value={
                      resultadoTexto
                    }
                    onChange={(e) =>
                      setResultadoTexto(
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Data Resultado
                  </label>

                  <input
                    type="date"
                    className="form-input"
                    value={
                      dataResultado
                    }
                    onChange={(e) =>
                      setDataResultado(
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
                      observacaoResultado
                    }
                    onChange={(e) =>
                      setObservacaoResultado(
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>

              <div className="form-actions">

                <button
                  className="btn-cancelar"
                  disabled={salvandoResultado}
                  onClick={() =>
                    setMostrarResultado(
                      false
                    )
                  }
                >
                  Cancelar
                </button>

                <button
                  className="btn-salvar"
                  disabled={salvandoResultado}
                  onClick={
                    salvarResultado
                  }
                >
                  {salvandoResultado ? "Salvando..." : "Salvar resultado"}
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
