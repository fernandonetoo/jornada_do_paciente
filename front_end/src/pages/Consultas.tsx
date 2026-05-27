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

type Consulta = {
  pacienteId?: string;
  pacienteCpf?: string;
  tipo?: string;
  dataSolicitacao?: string;
  doutor?: string;
  medico?: string;
  status?: string;
};

export default function Consultas() {
  const usuario = JSON.parse(
    localStorage.getItem("usuarioLogado") || "null"
  ) as UsuarioLogado | null;

  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [dataInicial, setDataInicial] = useState("");
  const [dataFinal, setDataFinal] = useState("");
  const todas = readCollection<Consulta>("consulta");

  const consultas = todas
    .filter(
      (consulta) =>
        consulta.pacienteId === usuario?.cpf ||
        consulta.pacienteCpf === usuario?.cpf
    )
    .filter((consulta) =>
      String(consulta.tipo || "").toLowerCase().includes(busca.toLowerCase())
    )
    .filter((consulta) => matchesStatus(consulta.status, filtroStatus))
    .filter((consulta) =>
      matchesDateRange(consulta.dataSolicitacao, dataInicial, dataFinal)
    );

  const columns: DataTableColumn<Consulta>[] = [
    {
      key: "tipo",
      header: "Tipo",
      render: (consulta) => <strong>{consulta.tipo || "Não informado"}</strong>,
    },
    {
      key: "data",
      header: "Data",
      render: (consulta) => formatarData(consulta.dataSolicitacao),
    },
    {
      key: "medico",
      header: "Médico",
      render: (consulta) => consulta.doutor || consulta.medico || "Não informado",
    },
    {
      key: "status",
      header: "Status",
      render: (consulta) => <StatusBadge status={consulta.status} />,
    },
    {
      key: "acoes",
      header: "Ações",
      render: () => <button className="btn-cancelar">Ver detalhes &gt;</button>,
    },
  ];

  return (
    <div className="page-medica">
      <Header />

      <div className="page-medica-container">
        <PageHeader
          title="Consultas"
          description="Gerencie suas consultas agendadas e veja seu histórico de atendimentos."
          badgeValue={consultas.length}
          badgeLabel="Consultas"
        />

        <SearchCard
          label="Buscar consulta"
          placeholder="Buscar por tipo..."
          value={busca}
          onChange={setBusca}
        />

        <StatusDateFilters
          statusValue={filtroStatus}
          statusOptions={["Agendado", "Realizado", "Cancelado", "Em andamento"]}
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
          data={consultas}
          emptyMessage="Nenhuma consulta encontrada"
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
  if (!data || data === "-") return "-";
  if (data.includes("/")) return data;

  const partes = data.split("-");
  if (partes.length === 3) {
    const [ano, mes, dia] = partes;
    return `${dia}/${mes}/${ano}`;
  }

  return data;
}
