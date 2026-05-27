import { ArrowLeft, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { PacienteAtual } from "../../hooks/usePacienteAtual";
import "../../pages/forms-medicos.css";

type PacienteAtualBannerProps = {
  paciente: PacienteAtual;
  voltarPara?: string;
};

export function PacienteAtualBanner({
  paciente,
  voltarPara = "/pacientes",
}: PacienteAtualBannerProps) {
  const navigate = useNavigate();
  const foto = paciente.foto || paciente.fotoPerfil || "";
  const suspeita =
    paciente.suspeita ||
    paciente.queixaPrincipal ||
    paciente.queixa ||
    paciente.tipo ||
    "";

  return (
    <section className="paciente-atual-banner" aria-label="Paciente selecionado">
      <div className="paciente-atual-avatar">
        {foto ? (
          <img src={String(foto)} alt={paciente.nome ? String(paciente.nome) : "Paciente"} />
        ) : (
          <User size={30} />
        )}
      </div>

      <div className="paciente-atual-info">
        <span className="paciente-atual-label">Paciente selecionado</span>

        <strong>{paciente.nome || "Nome nao informado"}</strong>

        <div className="paciente-atual-meta">
          {paciente.cpf && <span>CPF: {String(paciente.cpf)}</span>}
          {paciente.idade && <span>{String(paciente.idade)} anos</span>}
          {suspeita && <span>Suspeita: {String(suspeita)}</span>}
        </div>
      </div>

      <button
        type="button"
        className="btn-cancelar paciente-atual-trocar"
        onClick={() => navigate(voltarPara)}
      >
        <ArrowLeft size={16} />
        Voltar para pacientes
      </button>
    </section>
  );
}

export function NenhumPacienteSelecionado() {
  const navigate = useNavigate();

  return (
    <section className="paciente-vazio">
      <div className="paciente-vazio-icon">
        <User size={34} />
      </div>

      <div>
        <h2>Nenhum paciente selecionado</h2>
        <p>Escolha um paciente antes de preencher ou visualizar dados medicos.</p>
      </div>

      <button type="button" className="btn-salvar" onClick={() => navigate("/pacientes")}>
        Ir para Pacientes
      </button>
    </section>
  );
}
