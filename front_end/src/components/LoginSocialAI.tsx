import {
  FaFacebookF,
  FaGoogle,
  FaApple,
} from "react-icons/fa";

export default function LoginSocialAI() {
  return (
    <div style={styles.container}>
      
      <h3 style={styles.title}>
        Continuar com
      </h3>

      <div style={styles.buttons}>
        
        {/* FACEBOOK */}
        <button style={styles.socialBtn}>
          <FaFacebookF
            size={38}
            color="#1877F2"
          />
        </button>

        {/* GOOGLE */}
        <button style={styles.socialBtn}>
          <FaGoogle
            size={38}
            color="#EA4335"
          />
        </button>

        {/* APPLE */}
        <button style={styles.socialBtn}>
          <FaApple
            size={38}
            color="#000"
          />
        </button>
      </div>
    </div>
  );
}

const styles: any = {
  container: {
    width: "100%",
    marginTop: "30px",
    textAlign: "center",
  },

  title: {
    fontSize: "15px",
    fontWeight: "500",
    color: "#444",
    marginBottom: "25px",
  },

  buttons: {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    flexWrap: "wrap",
  },

  socialBtn: {
    width: "100px",
    height: "50px",

    border: "2px solid #d1d5db",
    borderRadius: "8px",

    background: "#fff",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    cursor: "pointer",

    transition: "0.2s ease",

    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
  },
};