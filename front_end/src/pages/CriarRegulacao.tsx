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

export default function Regulacao() {
  const location = useLocation();
  const toast = useToast();
  const { confirm, confirmationModal } = useConfirm();

  const paciente = usePacienteAtual(location.state as any);

  const usuarioLogado = JSON.parse(
    localStorage.getItem(
      "usuarioLogado"
    ) || "null"
  );

  const usuarios = JSON.parse(
    localStorage.getItem("usuarios") ||
      "[]"
  );

  const medicosOncologistas =
    usuarios.filter(
      (u: any) =>
        u.grupos &&
        u.grupos.includes(
          "medico_oncologista"
        )
    );

  const [mostrarForm, setMostrarForm] =
    useState(false);

  const [tipo, setTipo] = useState("");
  const [data, setData] = useState("");
  const [hora, setHora] = useState("");
  const [status, setStatus] =
    useState("Em análise");

  const [observacoes, setObservacoes] =
    useState("");

  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [dataInicial, setDataInicial] = useState("");
  const [dataFinal, setDataFinal] = useState("");

  const [medicoSelecionado, setMedicoSelecionado] =
    useState<any>(null);

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
              <h1>Regulação</h1>
              <p>Selecione um paciente para gerenciar regulações.</p>
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
      localStorage.getItem(
        "regulacao"
      ) || "[]"
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
    )
    .filter((r: any) => matchesStatus(r.status, filtroStatus))
    .filter((r: any) =>
      matchesDateRange(r.dataSolicitacao, dataInicial, dataFinal)
    );

  function limparFormulario() {
    setTipo("");
    setData("");
    setHora("");
    setStatus("Em análise");
    setObservacoes("");
    setMedicoSelecionado(null);
    setEditandoIndex(null);
  }

  async function salvarRegulacao() {
    if (salvando) return;

    if (
      !tipo ||
      !data ||
      !hora ||
      !medicoSelecionado
    ) {
      toast.error({
        title: "Erro ao salvar",
        description: "Preencha todos os campos obrigatórios da regulação.",
      });
      return;
    }

    const nova = {
      id: Date.now(),

      tipo,

      dataSolicitacao: data,

      hora,

      status,

      observacoes,

      pacienteId: pacienteSelecionado.cpf,

      pacienteNome: pacienteSelecionado.nome,

      pacienteIdade: pacienteSelecionado.idade,

      medicoEmail:
        medicoSelecionado.email,

      medicoNome:
        medicoSelecionado.nome,

      criadoPor:
        usuarioLogado?.nome ||
        "UBS",
    };

    const atualizadas =
      editandoIndex !== null
        ? todas.map((item, index) =>
            index === editandoIndex
              ? {
                  ...item,
                  ...nova,
                }
              : item
          )
        : [...todas, nova];

    setSalvando(true);

    try {
      await saveCollection("regulacao", atualizadas);
    } catch {
      toast.error({
        title: "Erro ao salvar",
        description: "Não foi possível salvar a regulação no backend.",
      });
      return;
    } finally {
      setSalvando(false);
    }

    limparFormulario();

    setMostrarForm(false);
    setDataVersion((version) => version + 1);
    toast.success({
      title: editandoIndex !== null ? "Regulação editada" : "Regulação criada",
      description: "A solicitação de regulação foi salva com sucesso.",
    });
  }

  function editarRegulacao(
    index: number
  ) {
    const regulacao =
      regulacoes[index];

    setTipo(regulacao.tipo || "");

    setData(
      regulacao.dataSolicitacao ||
        ""
    );

    setHora(regulacao.hora || "");

    setStatus(
      regulacao.status ||
        "Em análise"
    );

    setObservacoes(
      regulacao.observacoes || ""
    );

    const medico =
      medicosOncologistas.find(
        (m: any) =>
          m.email ===
          regulacao.medicoEmail
      );

    setMedicoSelecionado(medico);

    const indexReal =
      todas.findIndex(
        (r) =>
          r.id === regulacao.id
      );

    setEditandoIndex(indexReal);

    setMostrarForm(true);
  }

  async function excluirRegulacao(
    index: number
  ) {
    if (excluindoIndex !== null) return;

    const confirmar = await confirm(
      "Deseja excluir essa regulação?"
    );

    if (!confirmar) return;

    const regulacao =
      regulacoes[index];

    const atualizadas =
      todas.filter(
        (r: any) =>
          r.id !== regulacao.id
      );

    setExcluindoIndex(index);

    try {
      await saveCollection("regulacao", atualizadas);
    } catch {
      toast.error({
        title: "Erro ao excluir",
        description: "Não foi possível excluir a regulação no backend.",
      });
      return;
    } finally {
      setExcluindoIndex(null);
    }

    setDataVersion((version) => version + 1);
    toast.success({
      title: "Regulação excluída",
      description: "A solicitação de regulação foi removida com sucesso.",
    });
  }

  return (
    <div className="page-medica">
      <Header />

      <div className="page-medica-container">

        {/* TOPO */}
        <div className="page-topo">

          <div className="page-titulo">
            <h1>Regulação</h1>

            <p>
              Gerencie solicitações
              de regulação do
              paciente
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
        <div className="form-card">

          <div className="form-group">
            <label className="form-label">
              Buscar regulação
            </label>

            <input
              className="form-input"
              placeholder="Buscar por tipo..."
              value={busca}
              onChange={(e) =>
                setBusca(
                  e.target.value
                )
              }
            />
          </div>

        </div>

        {/* BOTÃO */}
        <StatusDateFilters
          statusValue={filtroStatus}
          statusOptions={["Em analise", "Aprovado", "Negado", "Pendente"]}
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
            + Nova Regulação
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
                <th>Médico</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>

            <tbody>

              {regulacoes.length ===
              0 ? (
                <tr>
                  <td colSpan={6}>
                    Nenhuma regulação cadastrada
                  </td>
                </tr>
              ) : (
                regulacoes.map(
                  (r, i) => (
                    <tr key={i}>

                      <td>
                        {r.tipo}
                      </td>

                      <td>
                        {formatarData(
                          r.dataSolicitacao
                        )}
                      </td>

                      <td>
                        {r.hora}
                      </td>

                      <td>
                        {
                          r.medicoNome
                        }
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
                              editarRegulacao(
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
                              excluirRegulacao(
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
        {mostrarForm && (
          <div className="overlay">

            <div className="modal grande">

              <div className="form-card-header">

                <div>
                  <h2>
                    {editandoIndex !==
                    null
                      ? "Editar Regulação"
                      : "Nova Regulação"}
                  </h2>

                  <p>
                    Preencha os dados
                    da regulação
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
                    <option value="Em análise">
                      Em análise
                    </option>

                    <option value="Aprovado">
                      Aprovado
                    </option>

                    <option value="Negado">
                      Negado
                    </option>

                    <option value="Pendente">
                      Pendente
                    </option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Médico Oncologista
                  </label>

                  <select
                    className="form-input"
                    value={
                      medicoSelecionado?.email ||
                      ""
                    }
                    onChange={(e) => {

                      const medico =
                        medicosOncologistas.find(
                          (m: any) =>
                            m.email ===
                            e.target.value
                        );

                      setMedicoSelecionado(
                        medico
                      );
                    }}
                  >

                    <option value="">
                      Selecione o médico
                    </option>

                    {medicosOncologistas.map(
                      (m: any) => (
                        <option
                          key={m.email}
                          value={m.email}
                        >
                          {m.nome}
                        </option>
                      )
                    )}

                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Criado por
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
                  onClick={
                    salvarRegulacao
                  }
                >
                  {salvando ? "Salvando..." : editandoIndex !==
                  null
                    ? "Salvar alterações"
                    : "Salvar regulação"}
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
