import { createBrowserRouter, Navigate } from 'react-router';
import { Layout } from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DailyAgenda from './pages/DailyAgenda';
import AppointmentsByDoctor from './pages/AppointmentsByDoctor';
import Doctors from './pages/Doctors';
import MedicalHistory from './pages/MedicalHistory';
import SchedulingFlow from './pages/SchedulingFlow';

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

export const router = createBrowserRouter([
  {
    path: '/login',
    Component: Login,
  },
  // Ruta pública para agendar citas (pacientes no autenticados)
  {
    path: '/schedule',
    Component: SchedulingFlow,
  },
  {
    path: '/',
    Component: Layout,
    // Layout ya maneja la verificación de autenticación
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', Component: Dashboard },
      { path: 'agenda', Component: DailyAgenda },
      { path: 'citas-por-medico', Component: AppointmentsByDoctor },
      { path: 'doctors', Component: Doctors },
      { path: 'history', Component: MedicalHistory },
      { path: 'audit', Component: AuditPage },
      { path: 'reports', Component: ReportsPage },
      { path: '*', element: <Navigate to="/dashboard" replace /> },
    ],
  },
]);