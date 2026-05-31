import { useState } from "react";
import { ChevronRight } from "lucide-react";
import BotaoVoltar from "../components/BotaoVoltar";
import Header from "../components/Header";
import Navbar from "../components/Navbar";
import DataTable, { type DataTableColumn } from "../components/shared/DataTable";
import ModalForm from "../components/shared/ModalForm";
import PageHeader from "../components/shared/PageHeader";
import SearchCard from "../components/shared/SearchCard";
import StatusBadge from "../components/shared/StatusBadge";
import StatusDateFilters from "../components/shared/StatusDateFilters";
import { matchesDateRange, matchesStatus } from "../lib/filters";
import "../pages/forms-medicos.css";

type UsuarioLogado = {
  cpf?: string;
  nome?: string;
};

type Regulacao = {
  pacienteId?: string;
  pacienteCpf?: string;
  pacienteNome?: string;
  tipo?: string;
  dataSolicitacao?: string;
  medicoNome?: string;
  status?: string;
};

export default function RegulacaoPage() {
  const usuario = JSON.parse(
    localStorage.getItem("usuarioLogado") || "null"
  ) as UsuarioLogado | null;

  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [dataInicial, setDataInicial] = useState("");
  const [dataFinal, setDataFinal] = useState("");
  const [selecionado, setSelecionado] = useState<Regulacao | null>(null);
  const todas = readCollection<Regulacao>("regulacao");

  const regulacoes = todas
    .filter(
      (regulacao) =>
        regulacao.pacienteId === usuario?.cpf ||
        regulacao.pacienteCpf === usuario?.cpf
    )
    .filter((regulacao) =>
      String(regulacao.tipo || "").toLowerCase().includes(busca.toLowerCase())
    )
    .filter((regulacao) => matchesStatus(regulacao.status, filtroStatus))
    .filter((regulacao) =>
      matchesDateRange(regulacao.dataSolicitacao, dataInicial, dataFinal)
    );

  const columns: DataTableColumn<Regulacao>[] = [
    {
      key: "solicitacao",
      header: "Solicitação",
      render: (regulacao) => <strong>{regulacao.tipo || "Não informado"}</strong>,
    },
    {
      key: "data",
      header: "Data",
      render: (regulacao) => formatarData(regulacao.dataSolicitacao),
    },
    {
      key: "medico",
      header: "Médico Solicitante",
      render: (regulacao) => regulacao.medicoNome || "Não informado",
    },
    {
      key: "status",
      header: "Status",
      render: (regulacao) => <StatusBadge status={regulacao.status} />,
    },
    {
      key: "acoes",
      header: "Ações",
      render: (regulacao) => (
        <button className="btn-ver-detalhes" onClick={() => setSelecionado(regulacao)}>
          Ver detalhes
          <ChevronRight size={14} />
        </button>
      ),
    },
  ];

  return (
    <div className="page-medica">
      <Header />

      <div className="page-medica-container">
        <PageHeader
          title="Regulação"
          description="Acompanhe suas solicitações de encaminhamento e vagas."
          badgeValue={regulacoes.length}
          badgeLabel="Regulações"
        />

        <SearchCard
          label="Buscar regulação"
          placeholder="Buscar por especialidade ou tipo..."
          value={busca}
          onChange={setBusca}
        />

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

        <DataTable
          columns={columns}
          data={regulacoes}
          emptyMessage="Nenhuma regulação encontrada"
        />

        <ModalForm
          open={selecionado !== null}
          title="Detalhes da Regulação"
          description={selecionado?.tipo}
          icon="DOC"
          onClose={() => setSelecionado(null)}
        >
          {selecionado && (
            <div className="modal-detail-list">
              <p>
                <strong>Médico Solicitante:</strong>{" "}
                {selecionado.medicoNome || "Não informado"}
              </p>
              <p>
                <strong>Data da Solicitação:</strong>{" "}
                {formatarData(selecionado.dataSolicitacao)}
              </p>
              <p>
                <strong>Paciente:</strong>{" "}
                {selecionado.pacienteNome || usuario?.nome || "Não informado"}
              </p>
              <p className="modal-detail-row">
                <strong>Status Atual:</strong>
                <StatusBadge status={selecionado.status} />
              </p>
            </div>
          )}
        </ModalForm>
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
