import React from 'react';
import { NavLink, useNavigate } from 'react-router';
import {
  Calendar, UserCheck, LayoutDashboard, ClipboardList,
  BarChart2, LogOut, Shield, FileText, X, Menu
} from 'lucide-react';
import { COLORS } from '../data/mockData';
import { clearAuth } from '../store/authStore';

type Role = 'admin' | 'doctor' | 'scheduler' | 'patient';

interface SidebarProps {
  role: Role;
  isOpen: boolean;
  onClose: () => void;
  onNewAppointmentClick: () => void;
  userFullName?: string;
}

const ROLE_MENUS: Record<Role, { label: string; icon: React.ReactNode; path?: string; action?: () => void }[]> = {
  admin: [
    { label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/app/dashboard' },
    { label: 'Citas por Médico', icon: <ClipboardList size={20} />, path: '/app/citas-por-medico' },
    { label: 'Agendar Cita', icon: <Calendar size={20} />, action: undefined },
    { label: 'Agenda Diaria', icon: <ClipboardList size={20} />, path: '/app/agenda' },
    { label: 'Médicos/Terapistas', icon: <UserCheck size={20} />, path: '/app/doctors' },
    { label: 'Historial Clínico', icon: <FileText size={20} />, path: '/app/history' },
    { label: 'Auditoría', icon: <Shield size={20} />, path: '/app/audit' },
    { label: 'Reportes', icon: <BarChart2 size={20} />, path: '/app/reports' },
  ],
  doctor: [
    { label: 'Mis Citas', icon: <Calendar size={20} />, path: '/app/agenda' },
    { label: 'Historia Clínica', icon: <FileText size={20} />, path: '/app/history' },
    { label: 'Reportes', icon: <BarChart2 size={20} />, path: '/app/reports' },
  ],
  scheduler: [
    { label: 'Citas por Médico', icon: <ClipboardList size={20} />, path: '/app/citas-por-medico' },
    { label: 'Agendar Cita', icon: <Calendar size={20} />, action: undefined },
    { label: 'Agenda del Día', icon: <ClipboardList size={20} />, path: '/app/agenda' },
    { label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/app/dashboard' },
  ],
  patient: [
    { label: 'Agendar Cita', icon: <Calendar size={20} />, path: '/app/schedule' },
    { label: 'Mis Citas', icon: <ClipboardList size={20} />, path: '/app/agenda' },
  ],
};

// Etiquetas por defecto si no se proporciona el nombre del usuario
const DEFAULT_ROLE_LABELS: Record<Role, string> = {
  admin: 'Administrador',
  doctor: 'Doctor',
  scheduler: 'Agendador',
  patient: 'Paciente',
};

const ROLE_BADGE_LABELS: Record<Role, string> = {
  admin: 'Admin',
  doctor: 'Médico',
  scheduler: 'Agendadora',
  patient: 'Paciente',
};

const ROLE_BADGE_COLORS: Record<Role, string> = {
  admin: '#D32F2F',
  doctor: '#1E88E5',
  scheduler: '#2E7D32',
  patient: '#F57C00',
};

export function Sidebar({ role, isOpen, onClose, onNewAppointmentClick, userFullName }: SidebarProps) {
  const navigate = useNavigate();
  const menu = ROLE_MENUS[role].map((item) =>
    item.action === undefined && !item.path
      ? { ...item, action: onNewAppointmentClick }
      : item
  );

  // Usar el nombre del usuario si está disponible, si no usar el label por defecto
  const displayName = userFullName || DEFAULT_ROLE_LABELS[role];

  const handleLogout = () => {
    console.log('[Sidebar] Cerrando sesión...');
    clearAuth();
    navigate('/login', { replace: true });
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full z-50 flex flex-col transition-transform duration-300 lg:relative lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ width: 260, background: COLORS.text, minHeight: '100vh' }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid rgba(255,255,255,0.1)` }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: COLORS.blue }}>
              <span className="text-white text-base" style={{ fontWeight: 700 }}>P</span>
            </div>
            <div>
              <div className="text-white text-sm" style={{ fontWeight: 700, letterSpacing: '0.5px' }}>Piedrazul</div>
              <div style={{ color: COLORS.gray, fontSize: 12 }}>Centro Médico</div>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-white/60 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* User & Role (solo lectura — el rol viene del token autenticado) */}
        <div className="px-4 py-3" style={{ borderBottom: `1px solid rgba(255,255,255,0.1)` }}>
          <div className="flex items-center gap-3 rounded-lg px-2 py-2">
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: ROLE_BADGE_COLORS[role] }}>
              <span className="text-white text-sm" style={{ fontWeight: 700 }}>
                {displayName.substring(0, 2).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 text-left">
              <div className="text-white text-sm truncate" style={{ fontWeight: 500 }}>{displayName}</div>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: ROLE_BADGE_COLORS[role] + '33', color: ROLE_BADGE_COLORS[role] }}>
                {ROLE_BADGE_LABELS[role]}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto">
          <div style={{ color: COLORS.gray, fontSize: 11, fontWeight: 700, letterSpacing: '1px', paddingLeft: 8, marginBottom: 8, textTransform: 'uppercase' }}>
            Menú Principal
          </div>
          <ul className="flex flex-col gap-1">
            {menu.map((item) => (
              <li key={item.label}>
                {item.path ? (
                  <NavLink
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-3 rounded-lg transition-all text-sm ${
                        isActive
                          ? 'text-white'
                          : 'text-white/60 hover:text-white hover:bg-white/10'
                      }`
                    }
                    style={({ isActive }) => isActive ? { background: COLORS.blue } : {}}
                  >
                    {item.icon}
                    {item.label}
                  </NavLink>
                ) : (
                  <button
                    onClick={() => { item.action?.(); onClose(); }}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all text-sm text-white/60 hover:text-white hover:bg-white/10"
                  >
                    {item.icon}
                    {item.label}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="px-3 py-4" style={{ borderTop: `1px solid rgba(255,255,255,0.1)` }}>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/10 transition-all"
          >
            <LogOut size={20} />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
}

interface TopbarProps {
  onMenuClick: () => void;
  pageTitle: string;
}

export function Topbar({ onMenuClick, pageTitle }: TopbarProps) {
  return (
    <header className="flex items-center gap-4 px-4 py-3 lg:hidden sticky top-0 z-30"
      style={{ background: COLORS.text, borderBottom: `1px solid rgba(255,255,255,0.1)` }}>
      <button onClick={onMenuClick} className="text-white w-11 h-11 flex items-center justify-center rounded-lg" aria-label="Abrir menú">
        <Menu size={24} />
      </button>
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded flex items-center justify-center" style={{ background: COLORS.blue }}>
          <span className="text-white" style={{ fontSize: 13, fontWeight: 700 }}>P</span>
        </div>
        <span className="text-white text-sm" style={{ fontWeight: 600 }}>{pageTitle}</span>
      </div>
    </header>
  );
}