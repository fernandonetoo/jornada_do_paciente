import Header from "../components/Header1";
import { useLocation } from "react-router-dom";
import { useState } from "react";
import BotaoVoltar from "../components/BotaoVoltar";
import "../pages/forms-medicos.css";
import { User } from "lucide-react";

export default function Regulacao() {
  const location = useLocation();

  const paciente =
    location.state ||
    JSON.parse(
      localStorage.getItem("pacienteAtual") ||
        "null"
    );

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

  const [medicoSelecionado, setMedicoSelecionado] =
    useState<any>(null);

  const [editandoIndex, setEditandoIndex] =
    useState<number | null>(null);

  if (!paciente)
    return <h2>Paciente não encontrado</h2>;

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

  function salvarRegulacao() {
    if (
      !tipo ||
      !data ||
      !hora ||
      !medicoSelecionado
    ) {
      alert(
        "Preencha todos os campos obrigatórios!"
      );
      return;
    }

    const nova = {
      id: Date.now(),

      tipo,

      dataSolicitacao: data,

      hora,

      status,

      observacoes,

      pacienteId: paciente.cpf,

      pacienteNome: paciente.nome,

      pacienteIdade: paciente.idade,

      medicoEmail:
        medicoSelecionado.email,

      medicoNome:
        medicoSelecionado.nome,

      criadoPor:
        usuarioLogado?.nome ||
        "UBS",
    };

    if (editandoIndex !== null) {
      todas[editandoIndex] = {
        ...todas[editandoIndex],
        ...nova,
      };
    } else {
      todas.push(nova);
    }

    localStorage.setItem(
      "regulacao",
      JSON.stringify(todas)
    );

    limparFormulario();

    setMostrarForm(false);
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

  function excluirRegulacao(
    index: number
  ) {
    const confirmar = confirm(
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

    localStorage.setItem(
      "regulacao",
      JSON.stringify(atualizadas)
    );

    window.location.reload();
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

        {/* PACIENTE */}
        <div className="form-card">

          <div className="form-card-header">
            <div>
              <h2>Paciente</h2>

              <p>
                Informações do
                paciente selecionado
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
                Idade:{" "}
                {paciente.idade} anos
              </span>
            </div>

          </div>
        </div>

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
                            onClick={() =>
                              excluirRegulacao(
                                i
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
                  onClick={
                    salvarRegulacao
                  }
                >
                  {editandoIndex !==
                  null
                    ? "Salvar alterações"
                    : "Salvar regulação"}
                </button>

              </div>

            </div>
          </div>
        )}

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