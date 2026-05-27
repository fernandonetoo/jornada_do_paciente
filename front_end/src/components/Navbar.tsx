import { useNavigate, useLocation } from "react-router-dom";
import {
  CalendarDays,
  FlaskConical,
  ClipboardList,
  User,
} from "lucide-react";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  function isActive(path: string) {
    return location.pathname === path;
  }

  function getBtnStyle(path: string): React.CSSProperties {
    const ativo = isActive(path);

    return {
      background: "transparent",
      border: "none",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      cursor: "pointer",
      fontSize: "12px",
      color: ativo ? "#0b4f6c" : "#333",
      transform: ativo ? "scale(1.1)" : "scale(1)",
      transition: "0.2s",
    };
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: "15px",
        left: 0,
        width: "100%",
        display: "flex",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "#fff",
          display: "flex",
          gap: "25px",
          padding: "10px 25px",
          borderRadius: "30px",
          boxShadow: "0 6px 15px rgba(0,0,0,0.15)",
        }}
      >
        {/* CONSULTAS */}
        <button
          onClick={() => navigate("/consultas")}
          style={getBtnStyle("/consultas")}
        >
          <CalendarDays size={22} />
          <span>Consultas</span>
        </button>

        {/* EXAMES */}
        <button
          onClick={() => navigate("/exames")}
          style={getBtnStyle("/exames")}
        >
          <FlaskConical size={22} />
          <span>Exames</span>
        </button>

        {/* REGULAÇÃO */}
        <button
          onClick={() => navigate("/regulacao")}
          style={getBtnStyle("/regulacao")}
        >
          <ClipboardList size={22} />
          <span>Regulação</span>
        </button>

        {/* PERFIL */}
        <button
          onClick={() => navigate("/perfil")}
          style={getBtnStyle("/perfil")}
        >
          <User size={22} />
          <span>Perfil</span>
        </button>
      </div>
    </div>
  );
}