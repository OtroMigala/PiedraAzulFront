import type { AuthData, UserRole } from '../types/auth.types';

export type { AuthData, UserRole };

// Fallback en memoria para cuando localStorage está bloqueado (ej: Edge InPrivate)
let _memAuth: AuthData | null = null;

function lsGet(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}

function lsSet(key: string, value: string): void {
  try { localStorage.setItem(key, value); } catch { /* storage not available */ }
}

function lsRemove(key: string): void {
  try { localStorage.removeItem(key); } catch { /* storage not available */ }
}

export function saveAuth(data: AuthData): void {
  _memAuth = data;
  lsSet('token', data.token);
  lsSet('role', data.role);
  lsSet('fullName', data.fullName);
  lsSet('userId', data.id);
}

export function getAuth(): AuthData | null {
  const token = lsGet('token');
  if (token) {
    return {
      token,
      role: lsGet('role') ?? '',
      fullName: lsGet('fullName') ?? '',
      id: lsGet('userId') ?? '',
    };
  }
  // localStorage bloqueado: usar el valor en memoria
  return _memAuth;
}

export function clearAuth(): void {
  _memAuth = null;
  lsRemove('token');
  lsRemove('role');
  lsRemove('fullName');
  lsRemove('userId');
}

export function isAuthenticated(): boolean {
  return !!lsGet('token') || !!_memAuth;
}

export function getRole(): UserRole | null {
  const role = lsGet('role') ?? _memAuth?.role ?? null;
  if (role === 'Admin' || role === 'Scheduler' || role === 'Patient' || role === 'Doctor') return role;
  return null;
}

export function getFullName(): string {
  return lsGet('fullName') ?? _memAuth?.fullName ?? '';
}

export function getUserId(): string {
  return lsGet('userId') ?? _memAuth?.id ?? '';
}

// Decodifica el payload del JWT sin verificar firma (solo para leer datos)
function decodeJWT(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

// Extrae el rol del token JWT
export function extractRoleFromToken(token: string): string | null {
  const payload = decodeJWT(token);
  if (!payload) return null;

  return (
    (payload.role as string) ||
    (payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] as string) ||
    null
  );
}

// Extrae el nombre completo del token JWT
export function extractFullNameFromToken(token: string): string | null {
  const payload = decodeJWT(token);
  if (!payload) return null;

  return (
    (payload.name as string) ||
    (payload.fullName as string) ||
    (payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] as string) ||
    null
  );
}

// Extrae el ID del usuario del token JWT (claim 'sub' o 'id' o 'nameid')
export function extractIdFromToken(token: string): string {
  const payload = decodeJWT(token);
  if (!payload) return '';

  return (
    (payload.sub as string) ||
    (payload.id as string) ||
    (payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] as string) ||
    ''
  );
}

// Verifica si el token está expirado
export function isTokenExpired(): boolean {
  const auth = getAuth();
  if (!auth?.token) return true;

  const payload = decodeJWT(auth.token);
  if (!payload || !payload.exp) return true;

  const expTimestamp = payload.exp as number;
  const nowTimestamp = Math.floor(Date.now() / 1000);

  return expTimestamp < nowTimestamp;
}

// Valida y renueva la autenticación si es necesario
export function validateAuth(): boolean {
  if (!isAuthenticated()) return false;

  if (isTokenExpired()) {
    clearAuth();
    return false;
  }

  return true;
}
