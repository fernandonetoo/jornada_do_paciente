import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api/v1/",
});

function clearClientSession() {
  [
    "usuarioLogado",
    "usuarios",
    "access",
    "refresh",
    "token",
    "fotoPerfilAtual",
    "pacienteAtual",
    "pacientes",
    "consulta",
    "exames",
    "regulacao",
    "diagnosticos",
  ].forEach((key) => localStorage.removeItem(key));
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access") || localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearClientSession();

      if (window.location.pathname !== "/") {
        window.location.replace("/");
      }
    }

    return Promise.reject(error);
  }
);

export default api;
