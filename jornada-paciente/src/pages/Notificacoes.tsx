import { useState } from "react";
import Header from "../components/Header";
import Navbar from "../components/Navbar";
import BotaoVoltar from "../components/BotaoVoltar";

type Notificacao = {
  id: number;
  titulo: string;
  descricao: string;
  data: string;
  icone: string;
};

export default function Notificacoes() {

  const [selecionado, setSelecionado] = useState<Notificacao | null>(null);

  const dados: Notificacao[] = [
    {
      id: 1,
      titulo: "Consulta agendada",
      descricao: "Você tem uma consulta marcada para o dia 25 de abril, às 14:00.",
      data: "Hoje, 09:00",
      icone: "📅"
    },
    {
      id: 2,
      titulo: "Exame disponível",
      descricao: "Resultados dos seus exames estão disponíveis para visualização.",
      data: "Ontem, 16:45",
      icone: "🧪"
    },
    {
      id: 3,
      titulo: "Atualização de regulação",
      descricao: "Sua solicitação foi aprovada e está em processo de agendamento.",
      data: "22 de abril, 11:30",
      icone: "⚙️"
    },
    {
      id: 4,
      titulo: "Nova mensagem",
      descricao: "Você tem uma nova mensagem da unidade de saúde.",
      data: "22 de abril, 09:20",
      icone: "💬"
    }
  ];

  return (
    <div style={styles.pagina}>
      
      <Header />

      <div style={styles.container}>
        
        {/* TOPO */}
        <div style={styles.topo}>
          <h2 style={styles.titulo}>Notificações</h2>

          
        </div>

        {/* LISTA */}
        {dados.map((item) => (
          <div
            key={item.id}
            style={styles.card}
            onClick={() => setSelecionado(item)}
          >
            <div style={styles.cardConteudo}>
              
              <span style={styles.icone}>{item.icone}</span>

              <div>
                <p style={styles.cardTitulo}>
                  {item.titulo}
                </p>

                <p style={styles.descricao}>
                  {item.descricao}
                </p>

                <p style={styles.data}>
                  {item.data}
                </p>
              </div>
            </div>

            <span style={styles.link}>
              Detalhes &gt;
            </span>
          </div>
        ))}

        {/* MODAL */}
        {selecionado && (
          <div
            style={styles.overlay}
            onClick={() => setSelecionado(null)}
          >
            <div
              style={styles.modal}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={styles.modalTitulo}>
                {selecionado.titulo}
              </h3>

              <p style={styles.modalDescricao}>
                {selecionado.descricao}
              </p>

              <p style={styles.modalData}>
                <strong>Data:</strong> {selecionado.data}
              </p>

              <button
                onClick={() => setSelecionado(null)}
                style={styles.botaoFechar}
              >
                Fechar
              </button>
            </div>
          </div>
        )}

      </div>
       <BotaoVoltar />
      <Navbar />
    </div>
  );
}

const styles: any = {
  pagina: {
    background: "#f5f5f5",
    minHeight: "100vh",
    paddingBottom: "80px"
  },

  container: {
    padding: "20px",
    maxWidth: "700px",
    margin: "0 auto"
  },

  topo: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },

  titulo: {
    margin: 0,
    fontSize: "28px",
    color: "#1F2937"
  },

  linkTopo: {
    fontSize: "13px",
    color: "#2563eb",
    cursor: "pointer"
  },

  card: {
    width: "100%",
    background: "#fff",
    padding: "15px",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "10px",
    cursor: "pointer"
  },

  cardConteudo: {
    display: "flex",
    gap: "12px",
    alignItems: "center"
  },

  icone: {
    fontSize: "22px"
  },

  cardTitulo: {
    margin: 0,
    fontWeight: "600",
    fontSize: "15px",
    color: "#1F2937"
  },

  descricao: {
    margin: "2px 0",
    fontSize: "13px",
    color: "#6B7280"
  },

  data: {
    margin: "2px 0",
    fontSize: "12px",
    color: "#9CA3AF"
  },

  link: {
    color: "#0ea5a4",
    fontSize: "13px"
  },

  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },

  modal: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    width: "300px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.15)"
  },

  modalTitulo: {
    marginTop: 0
  },

  modalDescricao: {
    fontSize: "14px",
    color: "#374151"
  },

  modalData: {
    fontSize: "13px",
    marginTop: "10px"
  },

  botaoFechar: {
    marginTop: "15px",
    padding: "10px",
    width: "100%",
    border: "none",
    background: "#0ea5a4",
    color: "#fff",
    borderRadius: "8px",
    cursor: "pointer"
  }
};

