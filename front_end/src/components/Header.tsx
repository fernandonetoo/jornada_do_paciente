import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../context/UserContext";
import { Bell, User } from "lucide-react";

export default function Header() {

  const navigate = useNavigate();

  const { foto } = useContext(UserContext);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "15px 20px",
        background: "#fff",
        borderBottom: "1px solid #eee",
      }}
    >

      {/* LOGO */}
      <div
        onClick={() => navigate("/dashboard")}
        style={{
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "15px",
        }}
      >

        <img
          src="/src/assets/logomarca.jpeg"
          alt="logo"
          style={{
            width: "30px",
            height: "30px",
            borderRadius: "50%",
            objectFit: "cover",
          }}
        />

        <h2
          style={{
            margin: 0,
            color: "#024975",
            fontSize: "32px",
          }}
        >
          Jornada do Paciente
        </h2>

      </div>

      {/* ÍCONES */}
      <div
        style={{
          display: "flex",
          gap: "20px",
          alignItems: "center",
        }}
      >

        {/* NOTIFICAÇÕES */}
        <Bell
          size={28}
          color="#0b4f6c"
          style={{ cursor: "pointer" }}
          onClick={() => navigate("/notificacoes")}
        />

        {/* PERFIL */}
        {foto ? (

          <img
            src={foto}
            alt="perfil"
            onClick={() => navigate("/perfil")}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              objectFit: "cover",
              cursor: "pointer",
            }}
          />

        ) : (

          <button
            type="button"
            aria-label="Abrir perfil"
            onClick={() => navigate("/perfil")}
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#f3f4f6",
              border: "2px solid #e5e7eb",
              cursor: "pointer",
              padding: 0,
            }}
          >
            <User size={20} color="#9ca3af" />
          </button>

        )}

      </div>

    </div>
  );
}
