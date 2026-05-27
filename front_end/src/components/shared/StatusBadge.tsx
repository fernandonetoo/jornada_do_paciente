type StatusBadgeProps = {
  status?: string;
};

function statusClass(status = "") {
  const normalized = status.toLowerCase();

  if (
    normalized.includes("concluído") ||
    normalized.includes("concluido") ||
    normalized.includes("realizado")
  ) {
    return "status-badge status-badge--success";
  }

  if (
    normalized.includes("agendado") ||
    normalized.includes("andamento")
  ) {
    return "status-badge status-badge--info";
  }

  if (
    normalized.includes("análise") ||
    normalized.includes("analise") ||
    normalized.includes("aguardando") ||
    normalized.includes("pendente")
  ) {
    return "status-badge status-badge--warning";
  }

  if (normalized.includes("cancelado")) {
    return "status-badge status-badge--danger";
  }

  return "status-badge";
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  return <span className={statusClass(status)}>{status || "Sem status"}</span>;
}
