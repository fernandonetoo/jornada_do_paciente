type Usuario = {
  email: string;
  nome: string;
  grupos: string[];
};

type LoginResponse = {
  token?: string;
  usuario: Usuario;
};

export function login(data: LoginResponse) {
  localStorage.setItem("usuarioLogado", JSON.stringify(data.usuario));

  if (data.token) {
    localStorage.setItem("token", data.token);
  }
}

export function getUsuario(): Usuario | null {
  return JSON.parse(localStorage.getItem("usuarioLogado") || "null");
}

export function logout() {
  localStorage.removeItem("usuarioLogado");
  localStorage.removeItem("token");
}