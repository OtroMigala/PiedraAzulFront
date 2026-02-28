import React from 'react';
import { NavLink } from 'react-router';
import {
  Calendar, Users, UserCheck, LayoutDashboard, ClipboardList,
  BarChart2, LogOut, ChevronDown, Shield, FileText, X, Menu
} from 'lucide-react';
import { COLORS } from '../data/mockData';

type Role = 'admin' | 'doctor' | 'scheduler' | 'patient';

interface SidebarProps {
  role: Role;
  onRoleChange: (role: Role) => void;
  isOpen: boolean;
  onClose: () => void;
}

const ROLE_MENUS: Record<Role, { label: string; icon: React.ReactNode; path: string }[]> = {
  admin: [
    { label: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/dashboard' },
    { label: 'Agendar Cita', icon: <Calendar size={18} />, path: '/schedule' },
    { label: 'Agenda Diaria', icon: <ClipboardList size={18} />, path: '/agenda' },
    { label: 'Médicos/Terapistas', icon: <UserCheck size={18} />, path: '/doctors' },
    { label: 'Historial Clínico', icon: <FileText size={18} />, path: '/history' },
    { label: 'Auditoría', icon: <Shield size={18} />, path: '/audit' },
    { label: 'Reportes', icon: <BarChart2 size={18} />, path: '/reports' },
  ],
  doctor: [
    { label: 'Mis Citas', icon: <Calendar size={18} />, path: '/agenda' },
    { label: 'Historia Clínica', icon: <FileText size={18} />, path: '/history' },
    { label: 'Reportes', icon: <BarChart2 size={18} />, path: '/reports' },
  ],
  scheduler: [
    { label: 'Agendar Cita', icon: <Calendar size={18} />, path: '/schedule' },
    { label: 'Agenda del Día', icon: <ClipboardList size={18} />, path: '/agenda' },
    { label: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/dashboard' },
  ],
  patient: [
    { label: 'Agendar Cita', icon: <Calendar size={18} />, path: '/schedule' },
    { label: 'Mis Citas', icon: <ClipboardList size={18} />, path: '/agenda' },
  ],
};

const ROLE_LABELS: Record<Role, string> = {
  admin: 'Administrador',
  doctor: 'Dr. Andrés Pulido',
  scheduler: 'Laura Jiménez',
  patient: 'María González',
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

export function Sidebar({ role, onRoleChange, isOpen, onClose }: SidebarProps) {
  const [showRoleMenu, setShowRoleMenu] = React.useState(false);
  const menu = ROLE_MENUS[role];

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
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: COLORS.blue }}>
              <span className="text-white text-sm" style={{ fontWeight: 700 }}>P</span>
            </div>
            <div>
              <div className="text-white text-sm" style={{ fontWeight: 700, letterSpacing: '0.5px' }}>Piedrazul</div>
              <div style={{ color: COLORS.gray, fontSize: 11 }}>Centro Médico</div>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-white/60 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* User & Role */}
        <div className="px-4 py-3" style={{ borderBottom: `1px solid rgba(255,255,255,0.1)` }}>
          <button
            className="w-full flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-white/10 transition-colors"
            onClick={() => setShowRoleMenu(!showRoleMenu)}
          >
            <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: ROLE_BADGE_COLORS[role] }}>
              <span className="text-white text-xs" style={{ fontWeight: 700 }}>
                {ROLE_LABELS[role].substring(0, 2).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 text-left">
              <div className="text-white text-sm truncate" style={{ fontWeight: 500 }}>{ROLE_LABELS[role]}</div>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: ROLE_BADGE_COLORS[role] + '33', color: ROLE_BADGE_COLORS[role] }}>
                {ROLE_BADGE_LABELS[role]}
              </span>
            </div>
            <ChevronDown size={14} className={`text-white/60 transition-transform ${showRoleMenu ? 'rotate-180' : ''}`} />
          </button>

          {showRoleMenu && (
            <div className="mt-2 rounded-lg overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
              {(['admin', 'doctor', 'scheduler', 'patient'] as Role[]).map((r) => (
                <button
                  key={r}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-white/10 transition-colors"
                  onClick={() => { onRoleChange(r); setShowRoleMenu(false); }}
                >
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: ROLE_BADGE_COLORS[r] }} />
                  <span className="text-sm" style={{ color: r === role ? 'white' : 'rgba(255,255,255,0.6)' }}>
                    {ROLE_BADGE_LABELS[r]} – {ROLE_LABELS[r]}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto">
          <div style={{ color: COLORS.gray, fontSize: 10, fontWeight: 700, letterSpacing: '1px', paddingLeft: 8, marginBottom: 8, textTransform: 'uppercase' }}>
            Menú Principal
          </div>
          <ul className="flex flex-col gap-1">
            {menu.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm ${
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
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="px-3 py-4" style={{ borderTop: `1px solid rgba(255,255,255,0.1)` }}>
          <NavLink
            to="/login"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/10 transition-all"
          >
            <LogOut size={18} />
            Cerrar sesión
          </NavLink>
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
      <button onClick={onMenuClick} className="text-white">
        <Menu size={22} />
      </button>
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: COLORS.blue }}>
          <span className="text-white" style={{ fontSize: 11, fontWeight: 700 }}>P</span>
        </div>
        <span className="text-white text-sm" style={{ fontWeight: 600 }}>{pageTitle}</span>
      </div>
    </header>
  );
}
