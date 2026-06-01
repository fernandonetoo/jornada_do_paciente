import api from "../api/axios";

export type CollectionKey =
  | "pacientes"
  | "consulta"
  | "exames"
  | "regulacao"
  | "diagnosticos";

export const COLLECTION_KEYS: CollectionKey[] = [
  "pacientes",
  "consulta",
  "exames",
  "regulacao",
  "diagnosticos",
];

function unwrap<T>(response: { data: any }): T {
  return response.data?.data ?? response.data;
}

export function persistBootstrap(data: any) {
  if (!data) return;

  if (data.access) {
    localStorage.setItem("access", data.access);
    localStorage.setItem("token", data.access);
  }

  if (data.refresh) {
    localStorage.setItem("refresh", data.refresh);
  }

  if (data.usuario) {
    localStorage.setItem("usuarioLogado", JSON.stringify(data.usuario));
    localStorage.setItem("fotoPerfilAtual", data.usuario.foto || data.usuario.fotoPerfil || "");
  }

  if (data.usuarios) {
    localStorage.setItem("usuarios", JSON.stringify(data.usuarios));
  }

  if (data.collections) {
    COLLECTION_KEYS.forEach((key) => {
      localStorage.setItem(key, JSON.stringify(data.collections[key] || []));
    });
  }
}

export async function loginBackend(email: string, senha: string) {
  const data = unwrap<any>(await api.post("auth/login/", { email, senha }));
  persistBootstrap(data);
  return data.usuario;
}

export async function registerPaciente(payload: {
  nome: string;
  cpf: string;
  data: string;
  email: string;
  senha: string;
}) {
  return unwrap<any>(await api.post("auth/register/", payload));
}

export async function refreshBootstrap() {
  if (!localStorage.getItem("access") && !localStorage.getItem("token")) {
    return null;
  }

  const data = unwrap<any>(await api.get("auth/bootstrap/"));
  persistBootstrap(data);
  return data;
}

export async function saveCollection(key: CollectionKey, items: any[]) {
  const data = unwrap<any[]>(await api.put(`collections/${key}/`, { items }));
  localStorage.setItem(key, JSON.stringify(data || []));
  return data || [];
}

export async function loadCollection(key: CollectionKey) {
  const data = unwrap<any[]>(await api.get(`collections/${key}/`));
  localStorage.setItem(key, JSON.stringify(data || []));
  return data || [];
}

export async function updateProfile(payload: any) {
  const data = unwrap<any>(await api.put("auth/profile/", payload));
  persistBootstrap(data);
  return data.usuario;
}

export async function changePassword(senhaAtual: string, novaSenha: string) {
  const data = unwrap<any>(
    await api.post("auth/change-password/", {
      senhaAtual,
      novaSenha,
    })
  );
  persistBootstrap(data);
  return data;
}

export function clearSession() {
  localStorage.removeItem("usuarioLogado");
  localStorage.removeItem("usuarios");
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  localStorage.removeItem("token");
  localStorage.removeItem("fotoPerfilAtual");
  localStorage.removeItem("pacienteAtual");

  COLLECTION_KEYS.forEach((key) => {
    localStorage.removeItem(key);
  });
}
