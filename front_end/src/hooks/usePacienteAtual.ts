import { useEffect, useState } from "react";

export type PacienteAtual = {
  nome?: string;
  cpf?: string;
  idade?: string | number;
  foto?: string;
  fotoPerfil?: string;
  suspeita?: string;
  queixa?: string;
  queixaPrincipal?: string;
  tipo?: string;
  [key: string]: any;
};

export function salvarPacienteAtual(paciente: PacienteAtual | null | undefined) {
  if (!paciente) return;

  localStorage.setItem("pacienteAtual", JSON.stringify(paciente));
}

export function usePacienteAtual(pacienteRecebido?: PacienteAtual | null) {
  const [paciente, setPaciente] = useState<PacienteAtual | null>(() => {
    return pacienteRecebido || lerPacienteAtual();
  });

  useEffect(() => {
    if (!pacienteRecebido) return;

    salvarPacienteAtual(pacienteRecebido);
    setPaciente(pacienteRecebido);
  }, [pacienteRecebido]);

  return paciente;
}

function lerPacienteAtual() {
  try {
    return JSON.parse(localStorage.getItem("pacienteAtual") || "null");
  } catch {
    return null;
  }
}
