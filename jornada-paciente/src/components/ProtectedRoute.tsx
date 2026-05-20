import { Navigate } from "react-router-dom";

type Props = {
  children: React.ReactNode;
  permitido: string[];
};

export default function ProtectedRoute({ children, permitido }: Props) {
  const usuario = JSON.parse(localStorage.getItem("usuarioLogado") || "null");

  if (!usuario) return <Navigate to="/" replace />;

  if (!Array.isArray(usuario.grupos)) {
    return <Navigate to="/" replace />;
  }

  const autorizado = permitido.some((g) =>
    usuario.grupos.includes(g)
  );

  if (!autorizado) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}