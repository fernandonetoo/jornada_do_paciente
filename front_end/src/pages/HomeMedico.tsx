import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ClipboardList, FlaskConical, Users, Video,
  User, Calendar, Activity, ArrowRight, Search,
} from "lucide-react";
import Header1 from "../components/Header1";
import { Input }   from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import PacienteCard from "../components/shared/PacienteCard";

interface Paciente {
  id: number; nome: string; cpf: string;
  idade: string; suspeita: string; criadoEm: string;
}
interface Retorno {
  nomePaciente: string; tipo: string; dataRetorno: string; unidade: string;
}
interface UsuarioLogado {
  nome?: string;
  grupos?: string[];
}
interface Consulta {
  nomePaciente?: string;
  tipo?: string;
  dataRetorno?: string;
  unidade?: string;
}
type ModalTipo = "exame" | "teleconsulta" | null;

const QUICK = [
  { label: "Atendimentos", Icon: ClipboardList, path: "/criaratendimento", iconBg: "bg-[#e8f4f8]",  iconColor: "text-[#0b4f6c]",  borderTop: "#0b4f6c"  },
  { label: "Criar Exame",  Icon: FlaskConical,  path: "/criarexame",       iconBg: "bg-violet-50",  iconColor: "text-violet-600",  borderTop: "#7c3aed"  },
  { label: "Pacientes",    Icon: Users,         path: "/pacientes",        iconBg: "bg-cyan-50",    iconColor: "text-cyan-600",    borderTop: "#0891b2"  },
  { label: "Teleconsulta", Icon: Video,         path: "/criarconsulta",   iconBg: "bg-emerald-50", iconColor: "text-emerald-600", borderTop: "#059669"  },
];

export default function HomeMedico() {
  const navigate = useNavigate();
  const [usuario] = useState<UsuarioLogado | null>(() => readUsuario());
  const [pacientes] = useState<Paciente[]>(() => readCollection<Paciente>("pacientes"));
  const [retornos] = useState<Retorno[]>(() => readRetornos());
  const [modalTipo, setModalTipo] = useState<ModalTipo>(null);
  const [busca,     setBusca]     = useState("");

  useEffect(() => {
    if (!usuario || !usuario.grupos?.includes("medico_ubs")) {
      navigate("/");
    }
  }, [navigate, usuario]);

  const hoje = new Date().toLocaleDateString("pt-BR", {
    weekday: "long", day: "2-digit", month: "long", year: "numeric",
  });

  const ultimos  = [...pacientes].sort((a, b) => b.id - a.id).slice(0, 10);
  const filtrados = pacientes.filter(
    (p) =>
      p.nome.toLowerCase().includes(busca.toLowerCase()) ||
      p.cpf.includes(busca)
  );

  function abrirModal(tipo: ModalTipo) { setBusca(""); setModalTipo(tipo); }
  function fecharModal() { setModalTipo(null); setBusca(""); }

  function handleQuick(label: string, path: string) {
    if (label === "Criar Exame")  { abrirModal("exame");        return; }
    if (label === "Teleconsulta") { abrirModal("teleconsulta"); return; }
    navigate(path);
  }

  function selecionarPaciente(p: Paciente) {
    localStorage.setItem("pacienteAtual", JSON.stringify(p));
    fecharModal();
    if (modalTipo === "exame")        navigate("/criarexame",     { state: p });
    if (modalTipo === "teleconsulta") navigate("/criarconsulta", { state: p });
  }

  function fmt(iso: string) {
    if (!iso) return "—";
    try { return new Date(iso).toLocaleDateString("pt-BR"); } catch { return iso; }
  }

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      <Header1 />

      <main className="max-w-7xl mx-auto px-6 py-7">

        {/* ── BOAS-VINDAS ── */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <p className="text-2xl font-bold text-slate-900 mb-1">
              Olá, {usuario?.nome || "Médico"}! 👋
            </p>
            <p className="text-sm text-slate-500 capitalize">{hoje}</p>
          </div>

          {/* Stat card */}
          <div className="flex items-center gap-4 bg-white rounded-2xl px-5 py-4 border border-slate-200 shadow-sm">
            <div className="w-11 h-11 rounded-xl bg-[#e8f4f8] flex items-center justify-center shrink-0">
              <Activity size={22} className="text-[#0b4f6c]" />
            </div>
            <div>
              <span className="block text-2xl font-extrabold text-[#0b4f6c] leading-none">
                {pacientes.length}
              </span>
              <span className="block text-xs text-slate-500 mt-1">Total de Atendimentos</span>
            </div>
          </div>
        </div>

        {/* ── QUICK LINKS ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-7">
          {QUICK.map(({ label, Icon, path, iconBg, iconColor, borderTop }) => (
            <button
              key={label}
              onClick={() => handleQuick(label, path)}
              className="flex items-center gap-3 bg-white rounded-2xl px-4 py-4 border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-px transition-all duration-150 text-left w-full"
              style={{ borderTop: `3px solid ${borderTop}` }}
            >
              <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
                <Icon size={19} className={iconColor} />
              </div>
              <span className="flex-1 text-sm font-semibold text-slate-700">{label}</span>
              <ArrowRight size={15} className="text-slate-400 shrink-0" />
            </button>
          ))}
        </div>

        {/* ── SPLIT 70 / 30 ── */}
        <div className="flex flex-col lg:flex-row gap-5 items-start">

          {/* 70% — TABELA DE PACIENTES */}
          <div className="w-full lg:w-[70%] bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* header */}
            <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-[#e8f4f8] flex items-center justify-center shrink-0">
                <Users size={16} className="text-[#0b4f6c]" />
              </div>
              <span className="flex-1 text-[15px] font-bold text-slate-900">Últimos Pacientes</span>
              <button
                onClick={() => navigate("/pacientes")}
                className="text-xs font-semibold text-blue-500 hover:text-blue-700 transition-colors"
              >
                Ver todos →
              </button>
            </div>

            {/* table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50">
                    <TableHead className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Paciente</TableHead>
                    <TableHead className="hidden md:table-cell text-[11px] font-bold text-slate-400 uppercase tracking-wide">CPF</TableHead>
                    <TableHead className="hidden md:table-cell text-[11px] font-bold text-slate-400 uppercase tracking-wide">Idade</TableHead>
                    <TableHead className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Suspeita</TableHead>
                    <TableHead className="hidden lg:table-cell text-[11px] font-bold text-slate-400 uppercase tracking-wide">Cadastro</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ultimos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-slate-400 text-sm py-12">
                        Nenhum paciente cadastrado ainda.
                      </TableCell>
                    </TableRow>
                  ) : (
                    ultimos.map((p, i) => (
                      <TableRow
                        key={p.id}
                        className={`hover:bg-blue-50/50 transition-colors ${i % 2 === 1 ? "bg-slate-50/60" : "bg-white"}`}
                      >
                        <TableCell className="py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                              <User size={14} className="text-slate-400" />
                            </div>
                            <span className="font-semibold text-[13px] text-slate-900">{p.nome}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-[13px] text-slate-500">{p.cpf}</TableCell>
                        <TableCell className="hidden md:table-cell text-[13px] text-slate-500">{p.idade} anos</TableCell>
                        <TableCell>
                          <span className="bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">
                            {p.suspeita}
                          </span>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-[13px] text-slate-400">{fmt(p.criadoEm)}</TableCell>
                        <TableCell>
                          <button
                            onClick={() => {
                              localStorage.setItem("pacienteAtual", JSON.stringify(p));
                              navigate("/gerenciar", { state: p });
                            }}
                            className="text-xs font-medium text-slate-600 border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50 transition-colors"
                          >
                            Detalhes
                          </button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* 30% — RETORNOS */}
          <div className="w-full lg:w-[30%] bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
                <Calendar size={16} className="text-violet-600" />
              </div>
              <span className="text-[15px] font-bold text-slate-900">Retornos Agendados</span>
            </div>

            <div className="p-3 flex flex-col gap-2.5">
              {retornos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2">
                  <Calendar size={34} className="text-slate-200" />
                  <p className="text-sm text-slate-400">Nenhum retorno agendado.</p>
                </div>
              ) : (
                retornos.slice(0, 10).map((r, i) => (
                  <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                    <div className="flex items-start justify-between gap-2 mb-2 flex-wrap">
                      <span className="font-semibold text-[13px] text-slate-900">{r.nomePaciente}</span>
                      <span className="bg-violet-50 text-violet-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                        {r.dataRetorno}
                      </span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <span className="bg-slate-100 text-slate-500 text-[11px] px-2.5 py-0.5 rounded-full">{r.tipo}</span>
                      {r.unidade && <span className="text-[11px] text-slate-400">{r.unidade}</span>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ── MODAL SELECIONAR PACIENTE ── */}
      <Dialog open={modalTipo !== null} onOpenChange={(open: boolean) => !open && fecharModal()}>
        <DialogContent className="p-0 gap-0 max-w-md rounded-2xl overflow-hidden">
          <DialogHeader className="px-5 pt-5 pb-4 border-b border-slate-100">
            <DialogTitle className="text-base font-bold text-slate-900">
              {modalTipo === "exame" ? "Criar Exame" : "Solicitar Teleconsulta"}
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500 mt-0.5">
              Selecione o paciente para continuar
            </DialogDescription>
          </DialogHeader>

          {/* Busca */}
          <div className="px-4 py-3 border-b border-slate-100 relative">
            <Search
              size={16}
              className="absolute top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              style={{ left: 30 }}
            />
            <Input
              autoFocus
              placeholder="Buscar por nome ou CPF..."
              value={busca}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBusca(e.target.value)}
              className="h-11 bg-slate-50 border-slate-200 text-sm rounded-xl"
              style={{ paddingLeft: 42 }}
            />
          </div>

          {/* Lista */}
          <div className="overflow-y-auto max-h-80 p-3 flex flex-col gap-1.5">
            {filtrados.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <User size={28} className="text-slate-300" />
                <p className="text-sm text-slate-400">Nenhum paciente encontrado.</p>
              </div>
            ) : (
              filtrados.map((p) => (
                <PacienteCard
                  key={p.id}
                  nome={p.nome}
                  cpf={p.cpf}
                  idade={p.idade}
                  suspeita={p.suspeita}
                  actionLabel="Selecionar"
                  onClick={() => selecionarPaciente(p)}
                />
              ))
            )}
          </div>

          {/* Rodapé */}
          <div className="px-4 py-3 border-t border-slate-100 bg-slate-50">
            <button
              onClick={fecharModal}
              className="w-full py-2 text-sm font-medium text-slate-500 rounded-xl hover:bg-slate-200 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function readUsuario() {
  try {
    return JSON.parse(localStorage.getItem("usuarioLogado") || "null") as UsuarioLogado | null;
  } catch {
    return null;
  }
}

function readCollection<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]") as T[];
  } catch {
    return [];
  }
}

function readRetornos() {
  return readCollection<Consulta>("consulta")
    .filter((consulta) => consulta.dataRetorno?.trim())
    .map((consulta) => ({
      nomePaciente: consulta.nomePaciente || "—",
      tipo: consulta.tipo || "Consulta",
      dataRetorno: consulta.dataRetorno || "",
      unidade: consulta.unidade || "",
    }));
}
