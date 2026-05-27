import React from "react";

type Props = {
  titulo: string;
  valor: string;
  descricao: string;
  imagem?: string;
  icone?: React.ReactNode;
  onClick?: () => void;
};

export default function Card({
  titulo,
  valor,
  descricao,
  imagem,
  icone,
  onClick
}: Props) {

  // 🔥 renderização inteligente do ícone
  function renderIcon() {
    if (icone) return icone;

    return (
      <img
        src={imagem || "/default-icon.png"}
        alt="icone"
        style={styles.image}
      />
    );
  }

  return (
    <div
      onClick={onClick}
      style={styles.card}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.04)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >

      {/* TOPO */}
      <div style={styles.header}>
        <div style={styles.iconContainer}>
          {renderIcon()}
        </div>

        <h4 style={styles.title}>{titulo}</h4>
      </div>

      {/* VALOR */}
      <h1 style={styles.value}>{valor}</h1>

      {/* DESCRIÇÃO */}
      <p style={styles.description}>{descricao}</p>

      {/* LINK */}
      <div style={styles.link}>
        Ver todos →
      </div>

    </div>
  );
}

const styles: any = {
  card: {
    background: "#fff",
    padding: "18px",
    borderRadius: "14px",
    boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
    width: "100%",
    maxWidth: "380px",
    height: "160px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    cursor: "pointer",
    transition: "0.2s ease",
    border: "1px solid #f0f0f0",
  },

  header: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  iconContainer: {
    width: "36px",
    height: "36px",
    borderRadius: "8px",
    background: "#f1f5f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  image: {
    width: "24px",
    height: "24px",
    objectFit: "contain",
  },

  title: {
    fontSize: "16px",
    margin: 0,
    color: "#1f2937",
    fontWeight: 600,
  },

  value: {
    margin: "4px 0",
    fontSize: "30px",
    color: "#111827",
    fontWeight: 700,
  },

  description: {
    fontSize: "13px",
    color: "#6b7280",
    margin: 0,
  },

  link: {
    textAlign: "right",
    fontSize: "13px",
    color: "#2563eb",
    fontWeight: 500,
  },
};