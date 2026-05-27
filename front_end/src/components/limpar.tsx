import { useState } from "react";

export default function LimparSistema() {
  const [limpo, setLimpo] = useState(false);

  function limparSistema() {
    localStorage.clear();
    setLimpo(true);
    window.dispatchEvent(new Event("jornada:storage-cleared"));
  }

  return (
    <button onClick={limparSistema}>
      {limpo ? "Dados apagados" : "Limpar Sistema"}
    </button>
  );
}
