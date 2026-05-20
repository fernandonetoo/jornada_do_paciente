import { useNavigate } from "react-router-dom";

export default function BotaoVoltar() {
  const navigate = useNavigate();

  return (
    <button
      style={styles.botao}
      onClick={() => navigate(-1)}
    >
      ← Voltar
    </button>
  );
}

const styles: any = {
  botao: {
    position: "fixed",

    // 🔥 AGORA NA PARTE SUPERIOR ESQUERDA
    top: "100px",
    left: "20px",

    padding: "10px 16px",
    borderRadius: "10px",
    border: "none",

    background: "#005697",
    color: "#fff",

    fontSize: "14px",
    fontWeight: "600",

    cursor: "pointer",

    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",

    display: "flex",
    alignItems: "center",
    gap: "6px",

    zIndex: 9999,

    transition: "0.2s",
  },
};