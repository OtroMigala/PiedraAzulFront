import { Navigate, Outlet } from 'react-router';
import { isAuthenticated, getRole, validateAuth } from '../store/authStore';

type AllowedRole = 'Admin' | 'Doctor' | 'Scheduler' | 'Patient';

interface ProtectedRouteProps {
  allowedRoles?: AllowedRole[];
  redirectTo?: string;
}

export function ProtectedRoute({ allowedRoles, redirectTo = '/login' }: ProtectedRouteProps) {
  // Validar autenticación y expiración del token
  if (!validateAuth()) {
    console.warn('[ProtectedRoute] Token expirado o no autenticado. Redirigiendo a login.');
    return <Navigate to="/login" replace />;
  }

  // Si no hay roles especificados, solo verificar autenticación
  if (!allowedRoles || allowedRoles.length === 0) {
    return <Outlet />;
  }

  // Verificar si el usuario tiene uno de los roles permitidos
  const userRole = getRole();

  if (!userRole) {
    console.warn('[ProtectedRoute] No se pudo obtener el rol del usuario.');
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(userRole)) {
    console.warn(`[ProtectedRoute] Acceso denegado. Rol requerido: ${allowedRoles.join(', ')}. Rol del usuario: ${userRole}`);
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
}
