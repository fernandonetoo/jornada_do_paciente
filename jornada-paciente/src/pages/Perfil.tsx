import { useState, useRef, useContext, useEffect } from "react";
import Header from "../components/Header";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import BotaoVoltar from "../components/BotaoVoltar";
import { User } from "lucide-react";
import "./Perfil1.css";

export default function Perfil() {
  const navigate = useNavigate();
  const { foto, setFoto } = useContext(UserContext);

  const [menuAberto, setMenuAberto] = useState(false);
  const [editando, setEditando] = useState(false);
  const [toast, setToast] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const usuario = JSON.parse(
    localStorage.getItem("usuarioLogado") || "null"
  );

  const [nome, setNome] = useState(usuario?.nome || "");
  const [cpf, setCpf] = useState(usuario?.cpf || "");
  const [dataNascimento, setDataNascimento] = useState(
    usuario?.dataNascimento || ""
  );
  const [email, setEmail] = useState(usuario?.email || "");
  const [telefone, setTelefone] = useState(usuario?.telefone || "");
  const [cartaoSus, setCartaoSus] = useState(usuario?.cartaoSus || "");

  useEffect(() => {
    if (usuario?.foto) {
      setFoto(usuario.foto);
    } else {
      setFoto(null);
    }
  }, []);

  // Fecha o menu da foto ao clicar fora
  useEffect(() => {
    function fecharMenu(e: MouseEvent) {
      const alvo = e.target as HTMLElement;

      if (
        !alvo.closest(".perfil-foto-wrap") &&
        !alvo.closest(".perfil-btn-trocar-foto")
      ) {
        setMenuAberto(false);
      }
    }

    document.addEventListener("mousedown", fecharMenu);
    return () => document.removeEventListener("mousedown", fecharMenu);
  }, []);

  function atualizarUsuarios(atualizado: any) {
    let usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");

    usuarios = usuarios.map((u: any) =>
      u.email === usuario.email ? atualizado : u
    );

    localStorage.setItem("usuarios", JSON.stringify(usuarios));
  }

  // FOTO
  function handleFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      const base64 = reader.result as string;

      const atualizado = {
        ...usuario,
        foto: base64,
      };

      localStorage.setItem("usuarioLogado", JSON.stringify(atualizado));
      atualizarUsuarios(atualizado);
      setFoto(base64);
    };

    reader.readAsDataURL(file);
  }

  function removerFoto() {
    const atualizado = {
      ...usuario,
      foto: null,
    };

    localStorage.setItem("usuarioLogado", JSON.stringify(atualizado));
    atualizarUsuarios(atualizado);

    setFoto(null);
    setMenuAberto(false);
  }

  // SALVAR
  function salvar() {
    const atualizado = {
      ...usuario,
      nome,
      cpf,
      email,
      telefone,
      cartaoSus,
      dataNascimento,
      foto,
    };

    localStorage.setItem("usuarioLogado", JSON.stringify(atualizado));
    atualizarUsuarios(atualizado);

    setEditando(false);
    
    // Exibe o Toast de sucesso ao invés do Alert
    setToast(true);
    setTimeout(() => setToast(false), 2800);
  }

  // LOGOUT
  function logout() {
    const confirmar = window.confirm(
      "Tem certeza que deseja sair da conta?"
    );

    if (!confirmar) return;

    localStorage.removeItem("usuarioLogado");
    setFoto(null);

    navigate("/");
  }

  return (
    <div className="perfil-pagina">
      <Header />

      <div className="perfil-container">
        
        {/* CABEÇALHO DO PERFIL COM FOTO */}
        <div className="perfil-header-card">
          <div className="perfil-foto-wrap">
            <div onClick={() => setMenuAberto(!menuAberto)} style={{ cursor: "pointer" }}>
              {foto ? (
                <img
                  src={foto}
                  className="perfil-foto"
                  alt="Foto de perfil"
                />
              ) : (
                <div 
                  className="perfil-foto" 
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "#fff" }}
                >
                  <User size={40} color="#0b4f6c" />
                </div>
              )}
            </div>

            <span 
              className="perfil-camera-badge" 
              onClick={() => setMenuAberto(!menuAberto)}
            >
              📷
            </span>

            {menuAberto && (
              <div className="perfil-menu-foto">
                <div
                  className="perfil-menu-item"
                  onClick={() => {
                    inputRef.current?.click();
                    setMenuAberto(false);
                  }}
                >
                  📷 Trocar foto
                </div>

                {foto && (
                  <div
                    className="perfil-menu-item danger"
                    onClick={removerFoto}
                  >
                    🗑 Remover foto
                  </div>
                )}
              </div>
            )}

            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={handleFoto}
              style={{ display: "none" }}
            />
          </div>

          <div className="perfil-header-info">
            <h3 className="perfil-nome">{nome || "Sem nome"}</h3>

            {cpf && <p className="perfil-cpf">CPF: {cpf}</p>}

            <button
              className="perfil-btn-trocar-foto"
              onClick={() => setMenuAberto(!menuAberto)}
            >
              📷 Editar foto
            </button>
          </div>
        </div>

        <h2 className="perfil-titulo">
          Meu Perfil
          {editando && (
            <span className="perfil-badge-editando">✏ Editando</span>
          )}
        </h2>

        <p className="perfil-subtitulo">
          Visualize e edite suas informações pessoais
        </p>

        {/* INFORMAÇÕES PESSOAIS */}
        <div className="perfil-card">
          <div className="perfil-card-titulo">Informações Pessoais</div>

          <div className="perfil-grid">
            <Input
              label="Nome Completo"
              value={nome}
              onChange={setNome}
              disabled={!editando}
              full
            />

            <Input
              label="CPF"
              value={cpf}
              onChange={setCpf}
              disabled={!editando}
            />

            <Input
              label="Data de Nascimento"
              value={dataNascimento}
              onChange={setDataNascimento}
              disabled={!editando}
            />

            <Input
              label="Cartão SUS"
              value={cartaoSus}
              onChange={setCartaoSus}
              disabled={!editando}
              full
            />
          </div>
        </div>

        {/* CONTATO */}
        <div className="perfil-card">
          <div className="perfil-card-titulo">Contato</div>

          <div className="perfil-grid">
            <Input
              label="E-mail"
              value={email}
              onChange={setEmail}
              disabled={!editando}
              full
            />

            <Input
              label="Telefone"
              value={telefone}
              onChange={setTelefone}
              disabled={!editando}
            />
          </div>
        </div>

        {/* BOTÕES DE AÇÃO */}
        <div className="perfil-botoes">
          {!editando ? (
            <button
              className="perfil-btn-editar"
              onClick={() => setEditando(true)}
            >
              ✏ Editar dados
            </button>
          ) : (
            <>
              <button
                className="perfil-btn-editar"
                onClick={() => setEditando(false)}
              >
                Cancelar
              </button>

              <button
                className="perfil-btn-salvar"
                onClick={salvar}
              >
                Salvar alterações
              </button>
            </>
          )}
        </div>

        {/* CONTA (AÇÕES DE SISTEMA) */}
        <div className="perfil-conta">
          <div className="perfil-card-titulo" style={{ marginTop: 6 }}>
            Conta
          </div>

          <div
            className="perfil-opcao"
            onClick={() => navigate("/alterarsenha")}
          >
            🔒 Alterar senha
            <span className="perfil-opcao-arrow">›</span>
          </div>

          <div className="perfil-opcao logout" onClick={logout}>
            🚪 Sair da conta
            <span className="perfil-opcao-arrow">›</span>
          </div>
        </div>
      </div>

      {/* AVISO DE SUCESSO FLUTUANTE (TOAST) */}
      {toast && (
        <div className="perfil-toast">
          ✅ Dados atualizados com sucesso!
        </div>
      )}

      <BotaoVoltar />
      <Navbar />
    </div>
  );
}

// Subcomponente de Input atualizado com as novas classes do Perfil1.css
function Input({
  label,
  value,
  onChange,
  disabled,
  full,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
  full?: boolean;
}) {
  return (
    <div className={`perfil-input-group${full ? " full" : ""}`}>
      <label className="perfil-label">{label}</label>

      <input
        className="perfil-input"
        value={value || ""}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
