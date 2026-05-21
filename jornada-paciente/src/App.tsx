import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import ProtectedRoute from "./components/ProtectedRoute";
import { clearSession, refreshBootstrap } from "./services/backend";

// Páginas públicas
import Criar from "./pages/Criar";
import Login from "./pages/Login";
import AlterarSenha from "./pages/AlterarSenha";
import Perfil1 from "./pages/Perfil1";

// Paciente
import Dashboard from "./pages/Dashboard";
import Consultas from "./pages/Consultas";
import Exames from "./pages/Exames";
import Regulacao from "./pages/Regulacao";
import Historico from "./pages/Historico";
import Notificacoes from "./pages/Notificacoes";
import Perfil from "./pages/Perfil";


// Médico UBS
import HomeMedico from "./pages/HomeMedico";
import CriarAtendimento from "./pages/CriarAtendimento"
import Gerenciar from "./pages/Gerenciar";
import CriarConsulta from "./pages/CriarConsulta";
import CriarExames from "./pages/CriarExames";
import CriarRegulacao from "./pages/CriarRegulacao";
import VerDiagnosticos from "./pages/VerDiagnosticos.tsx";


// Médico Oncologista
import Pacientes from "./pages/Pacientes";
import VerGerenciarciamento from "./pages/VerGerenciamento";
import VerConsulta from "./pages/VerConsulta";
import VerExame from "./pages/VerExames";
import VerRegulacao from "./pages/VerRegulacao";
import CriarDiagnostico from "./pages/CriarDiagnostico";

  

export default function App() {

  useEffect(() => {
    refreshBootstrap().catch(() => {
      clearSession();
    });
  }, []);

  return (
    <Routes>

      {/* 🌐 PÚBLICAS */}
      <Route path="/" element={<Login />} />
      <Route path="/criar" element={<Criar />} />
      <Route path="/alterarsenha" element={<AlterarSenha />} />
      <Route path="/perfil1" element={<Perfil1 />} />

      {/* 👤 PACIENTE */}
      <Route path="/dashboard" element={
        <ProtectedRoute permitido={["paciente"]}>
          <Dashboard />
        </ProtectedRoute>
      } />

      <Route path="/consultas" element={
        <ProtectedRoute permitido={["paciente"]}>
          <Consultas />
        </ProtectedRoute>
      } />

      <Route path="/exames" element={
        <ProtectedRoute permitido={["paciente"]}>
          <Exames />
        </ProtectedRoute>
      } />

      <Route path="/regulacao" element={
        <ProtectedRoute permitido={["paciente"]}>
          <Regulacao />
        </ProtectedRoute>
      } />

      <Route path="/historico" element={
        <ProtectedRoute permitido={["paciente"]}>
          <Historico />
        </ProtectedRoute>
      } />

      <Route path="/notificacoes" element={
        <ProtectedRoute permitido={["paciente"]}>
          <Notificacoes />
        </ProtectedRoute>
      } />

      <Route path="/perfil" element={
        <ProtectedRoute permitido={["paciente"]}>
          <Perfil />
        </ProtectedRoute>
      } />

      <Route path="/perfil1" element={
        <ProtectedRoute permitido={["medico_ubs"]}>
          <Perfil1 />
        </ProtectedRoute>
      } />

      {/* 👨‍⚕️ MÉDICO UBS */}
      <Route path="/homemedico" element={
        <ProtectedRoute permitido={["medico_ubs"]}>
          <HomeMedico />
        </ProtectedRoute>
      } />

      <Route path="/criaratendimento" element={
        <ProtectedRoute permitido={["medico_ubs"]}>
          <CriarAtendimento />
        </ProtectedRoute>
      } />

      <Route path="/gerenciar" element={
        <ProtectedRoute permitido={["medico_ubs"]}>
          <Gerenciar />
        </ProtectedRoute>
      } />

      <Route path="/criarconsulta" element={
        <ProtectedRoute permitido={["medico_ubs"]}>
          <CriarConsulta />
        </ProtectedRoute>
      } />

      <Route path="/criarexame" element={
        <ProtectedRoute permitido={["medico_ubs"]}>
          <CriarExames />
        </ProtectedRoute>
      } />

      <Route path="/criarregulacao" element={
        <ProtectedRoute permitido={["medico_ubs"]}>
          <CriarRegulacao />
        </ProtectedRoute>
      } />

      <Route path="/verDiagnostico" element={
        <ProtectedRoute permitido={["medico_ubs"]}>
          <VerDiagnosticos />
        </ProtectedRoute>
      } />

    


      {/* MEDICO ONCOLOGISTA */}
      <Route path="/pacientes" element={
        <ProtectedRoute permitido={["medico_oncologista", "medico_ubs"]}>
          <Pacientes />
        </ProtectedRoute>
}       />
      <Route path="/vergerenciamento" element={
        <ProtectedRoute permitido={["medico_oncologista"]}>
          <VerGerenciarciamento />
        </ProtectedRoute>
      } /> 

      <Route path="/verconsulta" element={
        <ProtectedRoute permitido={["medico_oncologista"]}>
          <VerConsulta />
        </ProtectedRoute>
       } />

       <Route path="/verexame" element={
        <ProtectedRoute permitido={["medico_oncologista"]}>
          <VerExame />
        </ProtectedRoute>
       } />

       <Route path="/verregulacao" element={
        <ProtectedRoute permitido={["medico_oncologista"]}>
          <VerRegulacao />
        </ProtectedRoute>
       } />

       <Route path="/CriarDiagnostico" element={
        <ProtectedRoute permitido={["medico_oncologista"]}>
          <CriarDiagnostico />
        </ProtectedRoute>
       } />
       

       

      {/* 🛠 ADMIN */}
      <Route path="/admin" element={
        <ProtectedRoute permitido={["admin"]}>
          <div>Painel Admin</div>
        </ProtectedRoute>
      } />
      
      

      <Route path="*" element={<Navigate to="/" />} />

    </Routes>
  );
}
