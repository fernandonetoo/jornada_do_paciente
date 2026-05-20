import { useState, useEffect } from "react";

export default function useAuth() {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("usuarioLogado") || "null");
    setUsuario(user);
  }, []);

  return { usuario };
}