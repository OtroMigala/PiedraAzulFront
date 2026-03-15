import { createBrowserRouter, Navigate } from 'react-router';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DailyAgenda from './pages/DailyAgenda';
import AppointmentsByDoctor from './pages/AppointmentsByDoctor';
import Doctors from './pages/Doctors';
import MedicalHistory from './pages/MedicalHistory';
import SchedulingFlow from './pages/SchedulingFlow';
import { validateAuth, getRole } from './store/authStore';

// Placeholder pages
function AuditPage() {
  return (
    <div className="p-8 text-center">
      <p style={{ color: '#90A4AE' }}>Módulo de Auditoría – Próximamente</p>
    </div>
  );
}

function ReportsPage() {
  return (
    <div className="p-8 text-center">
      <p style={{ color: '#90A4AE' }}>Módulo de Reportes – Próximamente</p>
    </div>
  );
}

/** Redirige al panel propio del usuario o al login si no está autenticado */
function RootRedirect() {
  if (!validateAuth()) return <Navigate to="/login" replace />;
  const role = getRole();
  switch (role) {
    case 'Admin':     return <Navigate to="/app/dashboard" replace />;
    case 'Doctor':    return <Navigate to="/app/agenda" replace />;
    case 'Scheduler': return <Navigate to="/app/citas-por-medico" replace />;
    case 'Patient':   return <Navigate to="/app/schedule" replace />;
    default:          return <Navigate to="/login" replace />;
  }
}

export const router = createBrowserRouter([
  // Siempre redirige '/' a '/login'
  { path: '/', element: <Navigate to="/login" replace /> },

  // Rutas públicas
  { path: '/login', Component: Login },


  // Rutas protegidas bajo /app
  {
    path: '/app',
    Component: Layout,
    children: [
      // Redirige /app a dashboard según rol
      { index: true, element: <RootRedirect /> },

      // Admin + Agendadora
      {
        element: <ProtectedRoute allowedRoles={['Admin', 'Scheduler']} />, 
        children: [
          { path: 'dashboard', Component: Dashboard },
          { path: 'citas-por-medico', Component: AppointmentsByDoctor },
        ],
      },


      // Admin + Agendadora + Médico + Paciente + Paciente agendando cita
      {
        element: <ProtectedRoute allowedRoles={['Admin', 'Doctor', 'Scheduler', 'Patient']} />, 
        children: [
          { path: 'agenda', Component: DailyAgenda },
          { path: 'schedule', Component: SchedulingFlow },
        ],
      },

      // Admin + Médico
      {
        element: <ProtectedRoute allowedRoles={['Admin', 'Doctor']} />, 
        children: [
          { path: 'history', Component: MedicalHistory },
          { path: 'reports', Component: ReportsPage },
        ],
      },

      // Solo Admin
      {
        element: <ProtectedRoute allowedRoles={['Admin']} />, 
        children: [
          { path: 'doctors', Component: Doctors },
          { path: 'audit', Component: AuditPage },
        ],
      },

      // Cualquier ruta desconocida → redirect según rol
      { path: '*', element: <RootRedirect /> },
    ],
  },

  // Cualquier ruta desconocida fuera de /app → login
  { path: '*', element: <Navigate to="/login" replace /> },
]);
