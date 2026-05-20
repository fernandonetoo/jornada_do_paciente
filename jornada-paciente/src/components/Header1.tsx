import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../context/UserContext";

export default function Header1() {
  const navigate = useNavigate();
  const { foto } = useContext(UserContext);
  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "15px 20px",
      background: "#fff",
      borderBottom: "1px solid #eee"
    }}>

      {/* LOGO COM IMAGEM */}
      <div
        onClick={() => navigate("/pacientes")}
        style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "15px" }}
      >
        <img 
          src="/src/assets/logomarca.jpeg"
          alt="logo" 
          style={{ 
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            objectFit: "cover",
            cursor: "pointer",
            border: "0px solid #0ea5a4" 
            }} />
        <h2 style={{ margin: 0,
                     color: "#024975", 
                     fontSize: "32px" 
                     
                     }}>

          Jornada do Paciente
        </h2>
      </div>

      {/* ÍCONES */}
      

        <img
          src={foto ? foto : "/default-user.png"} 
          alt="perfil"
          onClick={() => navigate("/perfil1")}
          style={{ 
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            objectFit: "cover",
            cursor: "pointer",
            border: "0px solid #0ea5a4"

          }}
        />

      </div>
    
  );
}