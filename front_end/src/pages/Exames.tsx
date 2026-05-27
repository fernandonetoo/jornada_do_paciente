import { useState } from "react";
import BotaoVoltar from "../components/BotaoVoltar";
import Header from "../components/Header";
import Navbar from "../components/Navbar";
import DataTable, { type DataTableColumn } from "../components/shared/DataTable";
import PageHeader from "../components/shared/PageHeader";
import SearchCard from "../components/shared/SearchCard";
import StatusBadge from "../components/shared/StatusBadge";
import StatusDateFilters from "../components/shared/StatusDateFilters";
import { matchesDateRange, matchesStatus } from "../lib/filters";
import "../pages/forms-medicos.css";

type UsuarioLogado = {
  cpf?: string;
};

type Exame = {
  pacienteId?: string;
  pacienteCpf?: string;
  tipo?: string;
  dataSolicitacao?: string;
  local?: string;
  doutor?: string;
  status?: string;
};

export default function Exames() {
  const usuario = JSON.parse(
    localStorage.getItem("usuarioLogado") || "null"
  ) as UsuarioLogado | null;

  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [dataInicial, setDataInicial] = useState("");
  const [dataFinal, setDataFinal] = useState("");
  const todos = readCollection<Exame>("exames");

  const exames = todos
    .filter(
      (exame) =>
        exame.pacienteId === usuario?.cpf ||
        exame.pacienteCpf === usuario?.cpf
    )
    .filter((exame) =>
      String(exame.tipo || "").toLowerCase().includes(busca.toLowerCase())
    )
    .filter((exame) => matchesStatus(exame.status, filtroStatus))
    .filter((exame) =>
      matchesDateRange(exame.dataSolicitacao, dataInicial, dataFinal)
    );

  const columns: DataTableColumn<Exame>[] = [
    {
      key: "exame",
      header: "Exame",
      render: (exame) => <strong>{exame.tipo || "Não informado"}</strong>,
    },
    {
      key: "data",
      header: "Data",
      render: (exame) => formatarData(exame.dataSolicitacao),
    },
    {
      key: "local",
      header: "Local/Médico",
      render: (exame) => exame.local || exame.doutor || "Não informado",
    },
    {
      key: "status",
      header: "Status",
      render: (exame) => <StatusBadge status={exame.status} />,
    },
    {
      key: "acoes",
      header: "Ações",
      render: (exame) =>
        exame.status === "Concluído" || exame.status === "Realizado" ? (
          <button className="btn-salvar compact-action">Ver resultado</button>
        ) : (
          <button className="btn-cancelar">Ver detalhes &gt;</button>
        ),
    },
  ];

  return (
    <div className="page-medica">
      <Header />

      <div className="page-medica-container">
        <PageHeader
          title="Exames"
          description="Acompanhe seus exames solicitados, agendados e resultados."
          badgeValue={exames.length}
          badgeLabel="Exames"
        />

        <SearchCard
          label="Buscar exame"
          placeholder="Buscar por tipo de exame..."
          value={busca}
          onChange={setBusca}
        />

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

        <DataTable
          columns={columns}
          data={exames}
          emptyMessage="Nenhum exame encontrado"
        />
      </div>

      <Navbar />
      <BotaoVoltar />
    </div>
  );
}

function readCollection<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]") as T[];
  } catch {
    return [];
  }
}

function formatarData(data?: string) {
  if (!data || data === "-") return "Sem data";
  if (data.includes("/")) return data;

  const partes = data.split("-");
  if (partes.length === 3) {
    const [ano, mes, dia] = partes;
    return `${dia}/${mes}/${ano}`;
  }

  return data;
}
