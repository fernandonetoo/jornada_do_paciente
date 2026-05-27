import { User } from "lucide-react";

type PacienteCardProps = {
  nome: string;
  cpf?: string;
  idade?: string | number;
  suspeita?: string;
  foto?: string;
  actionLabel?: string;
  onClick?: () => void;
};

export default function PacienteCard({
  nome,
  cpf,
  idade,
  suspeita,
  foto,
  actionLabel = "Selecionar",
  onClick,
}: PacienteCardProps) {
  const content = (
    <>
      <div className="card-avatar">
        {foto ? (
          <img src={foto} alt={nome} />
        ) : (
          <div className="avatar-placeholder">
            <User size={18} />
          </div>
        )}
      </div>

      <div className="paciente-card-body">
        <strong>{nome}</strong>
        <span>
          {[cpf && `CPF: ${cpf}`, idade && `${idade} anos`, suspeita]
            .filter(Boolean)
            .join(" · ")}
        </span>
      </div>

      {onClick && <span className="paciente-card-action">{actionLabel}</span>}
    </>
  );

  if (onClick) {
    return (
      <button className="card-paciente paciente-card-clickable" type="button" onClick={onClick}>
        {content}
      </button>
    );
  }

  return <div className="card-paciente">{content}</div>;
}
