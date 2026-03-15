import { Navigate, Outlet } from 'react-router';
import { getRole, validateAuth } from '../store/authStore';

type AllowedRole = 'Admin' | 'Doctor' | 'Scheduler' | 'Patient';

interface ProtectedRouteProps {
  allowedRoles?: AllowedRole[];
}

/** Ruta de inicio según el rol autenticado */
function getHomePathByRole(role: string | null): string {
  switch (role) {
    case 'Admin':     return '/dashboard';
    case 'Doctor':    return '/agenda';
    case 'Scheduler': return '/citas-por-medico';
    case 'Patient':   return '/schedule';
    default:          return '/login';
  }
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  // Validar autenticación y expiración del token
  if (!validateAuth()) {
    console.warn('[ProtectedRoute] Token expirado o no autenticado. Redirigiendo a login.');
    return <Navigate to="/login" replace />;
  }

  // Si no hay roles especificados, solo verificar autenticación
  if (!allowedRoles || allowedRoles.length === 0) {
    return <Outlet />;
  }

  const userRole = getRole();

  if (!userRole) {
    console.warn('[ProtectedRoute] No se pudo obtener el rol del usuario.');
    return <Navigate to="/login" replace />;
  }

  // Si el usuario no tiene permiso, redirigir a su propio panel — nunca al de otro rol
  if (!allowedRoles.includes(userRole)) {
    console.warn(`[ProtectedRoute] Acceso denegado. Rol requerido: ${allowedRoles.join(', ')}. Rol del usuario: ${userRole}`);
    return <Navigate to={getHomePathByRole(userRole)} replace />;
  }

  return <Outlet />;
}
