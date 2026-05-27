import Header1 from "../components/Header1";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { User, Search, Plus, X, ChevronRight, Users } from "lucide-react";
import BotaoVoltar from "@/components/BotaoVoltar";
import { saveCollection } from "../services/backend";
import { useToast } from "../hooks/useToast";

export default function Atendimentos() {
  const navigate = useNavigate();
  const toast = useToast();

  const [pacientes, setPacientes] = useState<any[]>([]);
  const [abrirModal, setAbrirModal] = useState(false);
  const [erros, setErros] = useState<Record<string, string>>({});
  const [salvando, setSalvando] = useState(false);

  const [nome, setNome] = useState("");
  const [idade, setIdade] = useState("");
  const [cpf, setCpf] = useState("");
  const [contato, setContato] = useState("");
  const [endereco, setEndereco] = useState("");
  const [suspeita, setSuspeita] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [cartaoSus, setCartaoSus] = useState("");

  const [busca, setBusca] = useState("");

  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem("usuarioLogado") || "null");
    if (!usuario || !usuario.grupos?.includes("medico_ubs")) {
      navigate("/");
      return;
    }
    setPacientes(JSON.parse(localStorage.getItem("pacientes") || "[]"));
  }, [navigate]);

  const pacientesFiltrados = pacientes.filter((p) =>
    p.nome.toLowerCase().includes(busca.toLowerCase()) ||
    p.cpf?.includes(busca) ||
    p.suspeita?.toLowerCase().includes(busca.toLowerCase())
  );

  function fecharModal() {
    if (salvando) return;

    setAbrirModal(false);
    setErros({});
    setNome(""); setIdade(""); setCpf(""); setContato("");
    setEndereco(""); setSuspeita(""); setDataNascimento(""); setCartaoSus("");
  }

  function validar() {
    const novosErros: Record<string, string> = {};
    if (!nome.trim()) novosErros.nome = "Nome é obrigatório";
    if (!cpf.trim()) novosErros.cpf = "CPF é obrigatório";
    if (!idade.trim()) novosErros.idade = "Idade é obrigatória";
    if (!suspeita.trim()) novosErros.suspeita = "Suspeita clínica é obrigatória";
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  async function salvarPaciente() {
    if (salvando) return;

    if (!validar()) {
      toast.error({
        title: "Erro ao criar paciente",
        description: "Preencha os campos obrigatórios do atendimento.",
      });
      return;
    }

    if (pacientes.find((p) => p.cpf === cpf)) {
      setErros({ cpf: "Já existe um paciente com esse CPF" });
      toast.error({
        title: "Erro ao criar paciente",
        description: "Já existe um paciente cadastrado com esse CPF.",
      });
      return;
    }

    const novo = {
      id: Date.now(), nome, idade, cpf, contato, endereco,
      suspeita, dataNascimento, cartaoSus, medico: "Dr. UBS",
      criadoEm: new Date().toISOString(),
    };

    const atualizados = [novo, ...pacientes];
    setSalvando(true);

    try {
      await saveCollection("pacientes", atualizados);
      setPacientes(atualizados);
      localStorage.setItem("pacienteAtual", JSON.stringify(novo));

      setSalvando(false);
      fecharModal();
      toast.success({
        title: "Paciente criado",
        description: "O atendimento foi cadastrado com sucesso.",
      });
    } catch {
      toast.error({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o atendimento no backend.",
      });
    } finally {
      setSalvando(false);
    }
  }

  function formatarData(iso: string) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("pt-BR");
  }

  function getFoto(cpf: string) {
    const usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");
    const u = usuarios.find((u: any) => u.cpf === cpf);
    return u?.fotoPerfil || u?.foto || "";
  }

  return (
    <div style={s.container}>
      <Header1 />

      <div style={s.content}>
        {/* Cabeçalho da página */}
        <div style={s.pageHeader}>
          <div>
            <h2 style={s.title}>Atendimentos</h2>
            <p style={s.subtitle}>Gerencie e acompanhe todos os pacientes atendidos</p>
          </div>
          <button style={s.btnNovo} onClick={() => setAbrirModal(true)}>
            <Plus size={16} />
            Novo Atendimento
          </button>
        </div>

        {/* Barra de busca + contador */}
        <div style={s.toolbar}>
          <div style={s.searchWrapper}>
            <Search size={16} color="#9ca3af" style={{ flexShrink: 0 }} />
            <input
              placeholder="Buscar por nome, CPF ou suspeita..."
              style={s.inputSearch}
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
          <div style={s.badge}>
            <Users size={14} />
            {pacientesFiltrados.length} paciente{pacientesFiltrados.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Tabela */}
        <div style={s.tableWrapper} className="animate-fade-in">
          <table style={s.table}>
            <thead>
              <tr style={s.thead}>
                <th style={s.th}>Paciente</th>
                <th style={s.th}>CPF</th>
                <th style={s.th}>Idade</th>
                <th style={s.th}>Suspeita Clínica</th>
                <th style={s.th}>Data de Cadastro</th>
                <th style={{ ...s.th, textAlign: "center" }}>Ação</th>
              </tr>
            </thead>
            <tbody>
              {pacientesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={6} style={s.empty}>
                    <User size={40} color="#d1d5db" />
                    <p>Nenhum paciente encontrado</p>
                    {busca && (
                      <span style={{ fontSize: "13px", color: "#9ca3af" }}>
                        Tente buscar por outro termo
                      </span>
                    )}
                  </td>
                </tr>
              ) : (
                pacientesFiltrados.map((p, i) => {
                  const foto = getFoto(p.cpf);
                  return (
                    <tr
                      key={p.id ?? i}
                      style={i % 2 === 0 ? s.trEven : s.trOdd}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#eff6ff")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = i % 2 === 0 ? "#fff" : "#f9fafb")}
                    >
                      <td style={s.td}>
                        <div style={s.cellPaciente}>
                          {foto ? (
                            <img src={foto} alt="Paciente" style={s.avatar} />
                          ) : (
                            <div style={s.avatarIcon}>
                              <User size={20} color="#9ca3af" />
                            </div>
                          )}
                          <span style={s.nomePaciente}>{p.nome}</span>
                        </div>
                      </td>
                      <td style={s.td}>{p.cpf || "—"}</td>
                      <td style={s.td}>{p.idade ? `${p.idade} anos` : "—"}</td>
                      <td style={s.td}>
                        <span style={s.suspeita}>{p.suspeita || "—"}</span>
                      </td>
                      <td style={s.td}>{formatarData(p.criadoEm)}</td>
                      <td style={{ ...s.td, textAlign: "center" }}>
                        <button
                          style={s.btnDetalhes}
                          onClick={() => navigate("/gerenciar", { state: p })}
                        >
                          Ver detalhes
                          <ChevronRight size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <BotaoVoltar/>
      </div>

      {/* MODAL NOVO ATENDIMENTO */}
      {abrirModal && (
        <div style={s.overlay} onClick={(e) => e.target === e.currentTarget && fecharModal()}>
          <div style={s.modal} className="animate-scale-in">
            {/* Header do modal */}
            <div style={s.modalHeader}>
              <div>
                <h3 style={s.modalTitle}>Novo Atendimento</h3>
                <p style={s.modalSubtitle}>Preencha os dados do paciente para iniciar</p>
              </div>
              <button style={s.closeBtn} disabled={salvando} onClick={fecharModal}>
                <X size={20} />
              </button>
            </div>

            <div style={s.modalBody}>
              {/* Seção: Dados Pessoais */}
              <p style={s.sectionLabel}>Dados Pessoais</p>
              <div style={s.grid2}>
                <Field label="Nome completo *" error={erros.nome}>
                  <input
                    placeholder="Ex: João Silva"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    style={fieldStyle(!!erros.nome)}
                  />
                </Field>
                <Field label="CPF *" error={erros.cpf}>
                  <input
                    placeholder="000.000.000-00"
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    style={fieldStyle(!!erros.cpf)}
                  />
                </Field>
                <Field label="Data de nascimento">
                  <input
                    type="date"
                    value={dataNascimento}
                    onChange={(e) => setDataNascimento(e.target.value)}
                    style={fieldStyle(false)}
                  />
                </Field>
                <Field label="Idade *" error={erros.idade}>
                  <input
                    placeholder="Ex: 45"
                    value={idade}
                    onChange={(e) => setIdade(e.target.value)}
                    style={fieldStyle(!!erros.idade)}
                  />
                </Field>
              </div>

              {/* Seção: Contato */}
              <p style={s.sectionLabel}>Contato & Localização</p>
              <div style={s.grid2}>
                <Field label="Telefone">
                  <input
                    placeholder="(00) 00000-0000"
                    value={contato}
                    onChange={(e) => setContato(e.target.value)}
                    style={fieldStyle(false)}
                  />
                </Field>
                <Field label="Cartão SUS">
                  <input
                    placeholder="000 0000 0000 0000"
                    value={cartaoSus}
                    onChange={(e) => setCartaoSus(e.target.value)}
                    style={fieldStyle(false)}
                  />
                </Field>
              </div>
              <Field label="Endereço">
                <input
                  placeholder="Rua, número, bairro, cidade"
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  style={fieldStyle(false)}
                />
              </Field>

              {/* Seção: Clínico */}
              <p style={s.sectionLabel}>Informação Clínica</p>
              <Field label="Suspeita clínica *" error={erros.suspeita}>
                <textarea
                  placeholder="Descreva a suspeita clínica do paciente..."
                  value={suspeita}
                  onChange={(e) => setSuspeita(e.target.value)}
                  rows={3}
                  style={{ ...fieldStyle(!!erros.suspeita), resize: "vertical" }}
                />
              </Field>
            </div>

            {/* Footer do modal */}
            <div style={s.modalFooter}>
              <button style={s.btnCancelar} disabled={salvando} onClick={fecharModal}>
                Cancelar
              </button>
              <button style={s.btnSalvar} disabled={salvando} onClick={salvarPaciente}>
                {salvando ? "Salvando..." : "Iniciar Atendimento"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function Field({
  label, error, children,
}: {
  label: string; error?: string; children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <label style={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>{label}</label>
      {children}
      {error && <span style={{ fontSize: "12px", color: "#dc2626" }}>{error}</span>}
    </div>
  );
}

function fieldStyle(hasError: boolean): React.CSSProperties {
  return {
    padding: "9px 12px",
    borderRadius: "7px",
    border: `1.5px solid ${hasError ? "#dc2626" : "#d1d5db"}`,
    fontSize: "14px",
    outline: "none",
    fontFamily: "Open Sans, Arial, sans-serif",
    width: "100%",
    background: hasError ? "#fef2f2" : "#fff",
    transition: "border-color 0.15s",
  };
}

const s: any = {
  container: { background: "#f5f6f7", minHeight: "100vh", fontFamily: "Open Sans, Arial, sans-serif" },

  content: { padding: "32px 36px", maxWidth: "1100px", margin: "0 auto" },

  pageHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px" },

  title: { fontSize: "26px", fontWeight: 700, color: "#111827", marginBottom: "4px" },

  subtitle: { color: "#6b7280", fontSize: "14px" },

  btnNovo: {
    display: "flex", alignItems: "center", gap: "7px",
    background: "#2563eb", color: "#fff", border: "none",
    padding: "10px 18px", borderRadius: "8px", cursor: "pointer",
    fontSize: "14px", fontWeight: 600, boxShadow: "0 1px 4px rgba(37,99,235,0.3)",
  },

  toolbar: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" },

  searchWrapper: {
    display: "flex", alignItems: "center", gap: "10px",
    background: "#fff", border: "1px solid #e5e7eb",
    borderRadius: "8px", padding: "9px 14px", flex: 1,
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
  },

  inputSearch: { border: "none", outline: "none", fontSize: "14px", width: "100%", fontFamily: "inherit" },

  badge: {
    display: "flex", alignItems: "center", gap: "6px",
    background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe",
    borderRadius: "20px", padding: "6px 14px", fontSize: "13px", fontWeight: 600, whiteSpace: "nowrap",
  },

  tableWrapper: { background: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" },

  table: { width: "100%", borderCollapse: "collapse" },

  thead: { background: "#f8fafc" },

  th: {
    padding: "13px 16px", textAlign: "left", fontSize: "12px",
    fontWeight: 700, color: "#6b7280", textTransform: "uppercase",
    letterSpacing: "0.05em", borderBottom: "1px solid #e5e7eb",
  },

  trEven: { background: "#fff", transition: "background 0.15s" },
  trOdd: { background: "#f9fafb", transition: "background 0.15s" },

  td: { padding: "14px 16px", fontSize: "14px", color: "#374151", borderBottom: "1px solid #f1f5f9" },

  cellPaciente: { display: "flex", alignItems: "center", gap: "12px" },

  avatar: { width: "38px", height: "38px", borderRadius: "50%", objectFit: "cover", border: "2px solid #e5e7eb", flexShrink: 0 },

  avatarIcon: {
    width: "38px", height: "38px", borderRadius: "50%",
    background: "#f3f4f6", display: "flex", alignItems: "center",
    justifyContent: "center", border: "2px solid #e5e7eb", flexShrink: 0,
  },

  nomePaciente: { fontWeight: 600, color: "#111827" },

  suspeita: {
    background: "#fef9c3", color: "#854d0e", borderRadius: "4px",
    padding: "2px 8px", fontSize: "12px", fontWeight: 500,
  },

  btnDetalhes: {
    display: "inline-flex", alignItems: "center", gap: "4px",
    background: "transparent", border: "1.5px solid #2563eb", color: "#2563eb",
    padding: "6px 12px", borderRadius: "6px", cursor: "pointer",
    fontSize: "13px", fontWeight: 600, transition: "all 0.15s",
  },

  empty: { textAlign: "center", padding: "56px 20px", color: "#9ca3af", fontSize: "15px" },

  // Modal
  overlay: {
    position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
    background: "rgba(0,0,0,0.45)", display: "flex",
    alignItems: "center", justifyContent: "center", zIndex: 1000,
  },

  modal: {
    background: "#fff", borderRadius: "14px",
    width: "min(580px, 95vw)", maxHeight: "90vh",
    display: "flex", flexDirection: "column",
    boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
  },

  modalHeader: {
    display: "flex", justifyContent: "space-between", alignItems: "flex-start",
    padding: "22px 24px 16px", borderBottom: "1px solid #f1f5f9",
  },

  modalTitle: { fontSize: "18px", fontWeight: 700, color: "#111827", marginBottom: "2px" },

  modalSubtitle: { fontSize: "13px", color: "#6b7280" },

  closeBtn: {
    background: "#f3f4f6", border: "none", borderRadius: "7px",
    padding: "6px", cursor: "pointer", display: "flex",
    alignItems: "center", justifyContent: "center", color: "#6b7280",
    flexShrink: 0,
  },

  modalBody: {
    padding: "20px 24px", overflowY: "auto",
    display: "flex", flexDirection: "column", gap: "12px",
  },

  sectionLabel: {
    fontSize: "11px", fontWeight: 700, color: "#9ca3af",
    textTransform: "uppercase", letterSpacing: "0.08em",
    marginTop: "6px", marginBottom: "2px",
  },

  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" },

  modalFooter: {
    display: "flex", justifyContent: "flex-end", gap: "10px",
    padding: "16px 24px", borderTop: "1px solid #f1f5f9",
  },

  btnCancelar: {
    background: "#f3f4f6", border: "none", color: "#374151",
    padding: "10px 20px", borderRadius: "8px", cursor: "pointer",
    fontSize: "14px", fontWeight: 600,
  },

  btnSalvar: {
    background: "#16a34a", border: "none", color: "#fff",
    padding: "10px 22px", borderRadius: "8px", cursor: "pointer",
    fontSize: "14px", fontWeight: 600, boxShadow: "0 1px 4px rgba(22,163,74,0.3)",
  },

};
