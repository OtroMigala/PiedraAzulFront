import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { Sidebar, Topbar } from './Sidebar';
import { NewAppointmentModal } from '../pages/DailyAgenda';
import { apiFetch } from '../services/api';
import { COLORS } from '../data/mockData';
import { validateAuth, getRole, getFullName } from '../store/authStore';

type Role = 'admin' | 'doctor' | 'scheduler' | 'patient';

// Mapea roles del backend a roles internos del componente
function mapBackendRoleToComponentRole(backendRole: string | null): Role {
  switch (backendRole) {
    case 'Admin':
      return 'admin';
    case 'Doctor':
      return 'doctor';
    case 'Scheduler':
      return 'scheduler';
    case 'Patient':
      return 'patient';
    default:
      return 'admin'; // Fallback
  }
}

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/schedule': 'Agendar Cita',
  '/agenda': 'Agenda Diaria',
  '/citas-por-medico': 'Citas por Médico',
  '/doctors': 'Médicos',
  '/history': 'Historia Clínica',
  '/audit': 'Auditoría',
  '/reports': 'Reportes',
};

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  // Validar autenticación al montar el componente y periódicamente
  React.useEffect(() => {
    // Validación inicial
    if (!validateAuth()) {
      console.warn('[Layout] Usuario no autenticado o token expirado. Redirigiendo a login.');
      navigate('/login', { replace: true });
      return;
    }

    // Validación periódica cada 60 segundos
    const intervalId = setInterval(() => {
      if (!validateAuth()) {
        console.warn('[Layout] Token expirado durante la sesión. Redirigiendo a login.');
        navigate('/login', { replace: true });
      }
    }, 60000); // 60 segundos

    return () => clearInterval(intervalId);
  }, [navigate]);

  // Rol derivado directamente del authStore (solo lectura, no modificable desde la UI)
  const role = mapBackendRoleToComponentRole(getRole());
  const fullName = getFullName();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [isNewAppointmentModalOpen, setNewAppointmentModalOpen] = React.useState(false);
  const [doctors, setDoctors] = React.useState<{ id: number; name: string }[]>([]);
  const title = PAGE_TITLES[location.pathname] || 'Piedrazul';

  React.useEffect(() => {
    apiFetch('/api/doctors').then((res: any) => {
      if (Array.isArray(res)) {
        setDoctors(res.map((d: any) => ({ id: d.id, name: d.fullName })));
      }
    }).catch(() => {});
  }, []);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: COLORS.bg }}>
      <Sidebar
        role={role}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNewAppointmentClick={() => setNewAppointmentModalOpen(true)}
        userFullName={fullName}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar onMenuClick={() => setSidebarOpen(true)} pageTitle={title} />
        <main className="flex-1 overflow-y-auto">
          <Outlet context={{ role }} />
        </main>
      </div>

      {isNewAppointmentModalOpen && (
        <NewAppointmentModal
          onClose={() => setNewAppointmentModalOpen(false)}
          doctors={doctors}
          onSuccess={() => setNewAppointmentModalOpen(false)}
        />
      )}
    </div>
  );
}