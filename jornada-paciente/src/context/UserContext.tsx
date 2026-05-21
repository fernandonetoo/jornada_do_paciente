import { createContext, useEffect, useState } from "react";

type UserContextType = {
  foto: string | null;
  setFoto: React.Dispatch<React.SetStateAction<string | null>>;
};

export const UserContext = createContext<UserContextType>({
  foto: null,
  setFoto: () => {},
});

export function UserProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [foto, setFoto] = useState<string | null>(null);

  useEffect(() => {
    const usuario = JSON.parse(
      localStorage.getItem("usuarioLogado") || "null"
    );

    if (usuario?.foto || usuario?.fotoPerfil) {
      setFoto(usuario.foto || usuario.fotoPerfil);
    } else {
      setFoto(null);
    }
  }, []);

  return (
    <UserContext.Provider value={{ foto, setFoto }}>
      {children}
    </UserContext.Provider>
  );
}
