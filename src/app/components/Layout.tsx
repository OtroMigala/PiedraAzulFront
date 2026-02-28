import React from 'react';
import { Outlet, useLocation } from 'react-router';
import { Sidebar, Topbar } from './Sidebar';
import { COLORS } from '../data/mockData';

type Role = 'admin' | 'doctor' | 'scheduler' | 'patient';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/schedule': 'Agendar Cita',
  '/agenda': 'Agenda Diaria',
  '/doctors': 'Médicos',
  '/history': 'Historia Clínica',
  '/audit': 'Auditoría',
  '/reports': 'Reportes',
};

export function Layout() {
  const [role, setRole] = React.useState<Role>('admin');
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] || 'Piedrazul';

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: COLORS.bg }}>
      <Sidebar
        role={role}
        onRoleChange={setRole}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar onMenuClick={() => setSidebarOpen(true)} pageTitle={title} />
        <main className="flex-1 overflow-y-auto">
          <Outlet context={{ role, setRole }} />
        </main>
      </div>
    </div>
  );
}
