import Header1 from "../components/Header1";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import {
  User,
  Users,
  ChevronRight,
  Activity,
  Calendar,
} from "lucide-react";
import BotaoVoltar from "@/components/BotaoVoltar";
import "../pages/forms-medicos.css";
import SearchCard from "../components/shared/SearchCard";

export default function Pacientes() {
  const navigate = useNavigate();
  const [busca, setBusca] = useState("");

  const usuario = JSON.parse(localStorage.getItem("usuarioLogado") || "null");
  const isUbs = usuario?.grupos?.includes("medico_ubs");

  useEffect(() => {
    if (
      !usuario ||
      (!usuario.grupos?.includes("medico_oncologista") &&
        !usuario.grupos?.includes("medico_ubs"))
    ) {
      navigate("/");
    }
  }, [navigate]);

  const pacientes: any[] = useMemo(() => {
    if (isUbs) {
      return JSON.parse(localStorage.getItem("pacientes") || "[]");
    }

    const regulacoes = JSON.parse(localStorage.getItem("regulacao") || "[]");
    const usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");

    return regulacoes
      .filter((r: any) => r.medicoEmail === usuario?.email)
      .map((r: any) => {
        const u = usuarios.find(
          (u: any) =>
            String(u.cpf).replace(/\D/g, "") ===
            String(r.pacienteId).replace(/\D/g, "")
        );

        return {
          nome: r.pacienteNome,
          idade: r.pacienteIdade,
          cpf: r.pacienteId,
          suspeita: r.tipo,
          medico: r.medicoNome,
          criadoEm: r.criadoEm || "",
          foto: u?.foto || u?.fotoPerfil || r.foto || r.fotoPerfil || "",
        };
      });
  }, [isUbs, usuario?.email]);

  const filtrados = pacientes.filter(
    (p) =>
      p.nome?.toLowerCase().includes(busca.toLowerCase()) ||
      p.cpf?.includes(busca) ||
      p.suspeita?.toLowerCase().includes(busca.toLowerCase())
  );

  function getFoto(cpf: string) {
    if (!isUbs) return "";

    const usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");

    const cpfLimpo = String(cpf || "").replace(/\D/g, "");
    const u = usuarios.find(
      (u: any) => String(u.cpf || "").replace(/\D/g, "") === cpfLimpo
    );

    return u?.foto || u?.fotoPerfil || "";
  }

  function fmt(iso: string) {
    if (!iso) return "—";

    try {
      return new Date(iso).toLocaleDateString("pt-BR");
    } catch {
      return iso;
    }
  }

  function verDetalhes(p: any) {
    localStorage.setItem("pacienteAtual", JSON.stringify(p));

    navigate(isUbs ? "/gerenciar" : "/vergerenciamento", {
      state: p,
    });
  }

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      <Header1 />

      <main className="max-w-7xl mx-auto px-6 py-7">
        {/* TOPO */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-7">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-1">
              Pacientes
            </h1>

            <p className="text-sm text-slate-500">
              {isUbs
                ? "Gerencie os pacientes cadastrados pela UBS"
                : "Pacientes encaminhados para oncologia"}
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white rounded-2xl px-5 py-4 border border-slate-200 shadow-sm">
            <div className="w-11 h-11 rounded-xl bg-[#e8f4f8] flex items-center justify-center shrink-0">
              <Users size={22} className="text-[#0b4f6c]" />
            </div>

            <div>
              <span className="block text-2xl font-extrabold text-[#0b4f6c] leading-none">
                {filtrados.length}
              </span>

              <span className="block text-xs text-slate-500 mt-1">
                Pacientes encontrados
              </span>
            </div>
          </div>
        </div>

        {/* CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center">
                <Users size={18} className="text-cyan-600" />
              </div>

              <div>
                <p className="text-sm text-slate-500">Total</p>
                <h3 className="text-2xl font-bold text-slate-800">
                  {pacientes.length}
                </h3>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <Activity size={18} className="text-emerald-600" />
              </div>

              <div>
                <p className="text-sm text-slate-500">Com suspeita</p>
                <h3 className="text-2xl font-bold text-slate-800">
                  {
                    pacientes.filter((p) => p.suspeita)?.length
                  }
                </h3>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
                <Calendar size={18} className="text-violet-600" />
              </div>

              <div>
                <p className="text-sm text-slate-500">Hoje</p>
                <h3 className="text-lg font-bold text-slate-800">
                  {new Date().toLocaleDateString("pt-BR")}
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* BUSCA */}
        <SearchCard
          label="Buscar paciente"
          placeholder="Buscar por nome, cpf ou suspeita..."
          value={busca}
          onChange={setBusca}
        />

        {/* TABELA */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-[#e8f4f8] flex items-center justify-center shrink-0">
              <Users size={16} className="text-[#0b4f6c]" />
            </div>

            <span className="flex-1 text-[15px] font-bold text-slate-900">
              Lista de Pacientes
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  <th className="text-left text-[11px] uppercase tracking-wide text-slate-400 font-bold px-5 py-4">
                    Paciente
                  </th>

                  <th className="hidden md:table-cell text-left text-[11px] uppercase tracking-wide text-slate-400 font-bold px-5 py-4">
                    CPF
                  </th>

                  <th className="hidden md:table-cell text-left text-[11px] uppercase tracking-wide text-slate-400 font-bold px-5 py-4">
                    Idade
                  </th>

                  <th className="text-left text-[11px] uppercase tracking-wide text-slate-400 font-bold px-5 py-4">
                    Suspeita
                  </th>

                  {!isUbs && (
                    <th className="hidden lg:table-cell text-left text-[11px] uppercase tracking-wide text-slate-400 font-bold px-5 py-4">
                      Médico
                    </th>
                  )}

                  <th className="hidden lg:table-cell text-left text-[11px] uppercase tracking-wide text-slate-400 font-bold px-5 py-4">
                    Cadastro
                  </th>

                  <th className="px-5 py-4" />
                </tr>
              </thead>

              <tbody>
                {filtrados.length === 0 ? (
                  <tr>
                    <td
                      colSpan={isUbs ? 6 : 7}
                      className="text-center py-16"
                    >
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                          <User size={28} className="text-slate-400" />
                        </div>

                        <h3 className="text-slate-700 font-semibold mb-1">
                          Nenhum paciente encontrado
                        </h3>

                        <p className="text-sm text-slate-400">
                          Tente realizar uma nova busca.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtrados.map((p, i) => {
                    const foto = isUbs
                      ? p.foto || p.fotoPerfil || getFoto(p.cpf)
                      : p.foto || p.fotoPerfil;

                    return (
                      <tr
                        key={p.id ?? p.cpf ?? i}
                        className={`transition-colors hover:bg-blue-50/50 ${
                          i % 2 === 0 ? "bg-white" : "bg-slate-50/60"
                        }`}
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            {foto ? (
                              <img
                                src={foto}
                                alt="Paciente"
                                className="w-10 h-10 rounded-full object-cover border border-slate-200"
                              />
                            ) : (
                              <div className="w-[38px] h-[38px] rounded-full bg-[#f3f4f6] border-2 border-[#e5e7eb] flex items-center justify-center shrink-0">
                                <User size={20} className="text-[#9ca3af]" />
                              </div>
                            )}

                            <div>
                              <p className="font-semibold text-[14px] text-slate-900">
                                {p.nome}
                              </p>

                              <p className="text-xs text-slate-400">
                                Paciente cadastrado
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="hidden md:table-cell px-5 py-4 text-[13px] text-slate-500">
                          {p.cpf || "—"}
                        </td>

                        <td className="hidden md:table-cell px-5 py-4 text-[13px] text-slate-500">
                          {p.idade ? `${p.idade} anos` : "—"}
                        </td>

                        <td className="px-5 py-4">
                          <span className="bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1 rounded-full">
                            {p.suspeita || "Não informado"}
                          </span>
                        </td>

                        {!isUbs && (
                          <td className="hidden lg:table-cell px-5 py-4 text-[13px] text-slate-500">
                            {p.medico || "—"}
                          </td>
                        )}

                        <td className="hidden lg:table-cell px-5 py-4 text-[13px] text-slate-400">
                          {fmt(p.criadoEm)}
                        </td>

                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => verDetalhes(p)}
                            className="btn-ver-detalhes"
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
        </div>
        <BotaoVoltar />
      </main>
    </div>
  );
}
