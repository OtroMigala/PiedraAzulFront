const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5071';
import { getAuth, clearAuth } from '../store/authStore';

// ─────────────────────────────────────────────────────────────
//  Estilos de consola para entornos que los soportan (Chrome/Edge)
// ─────────────────────────────────────────────────────────────
const S = {
  title:   'color:#4285F4;font-weight:bold;font-size:12px',
  ok:      'color:#0F9D58;font-weight:bold',
  error:   'color:#DB4437;font-weight:bold',
  warn:    'color:#F4B400;font-weight:bold',
  label:   'color:#888;font-size:11px',
};

export async function apiFetch<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAuth()?.token ?? null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) ?? {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const method  = (options.method ?? 'GET').toUpperCase();
  const fullUrl = `${BASE_URL}${path}`;

  // ── LOG DE PETICIÓN ────────────────────────────────────────
  console.group(`%c[API REQUEST] ${method} ${path}`, S.title);
  console.log('%cURL completa:', S.label, fullUrl);
  console.log('%cHeaders enviados:', S.label, {
    'Content-Type': headers['Content-Type'],
    Authorization: token
      ? `Bearer …${token.slice(-8)}  (token activo)`
      : '(sin token – petición pública)',
  });
  if (options.body) {
    try {
      console.log('%cBody (JSON):', S.label, JSON.parse(options.body as string));
    } catch {
      console.log('%cBody (raw):', S.label, options.body);
    }
  } else {
    console.log('%cBody:', S.label, '(vacío – sin cuerpo)');
  }
  const t0 = performance.now();

  // ── PETICIÓN ──────────────────────────────────────────────
  let response: Response;
  try {
    response = await fetch(fullUrl, { ...options, headers });
  } catch (networkErr) {
    const msg = networkErr instanceof Error ? networkErr.message : String(networkErr);
    console.error('%c🔴 ERROR DE RED (sin conexión o CORS bloqueado)', S.error);
    console.error('%cDetalle:', S.label, msg);
    console.error('%cVerifica que el back esté corriendo en', S.label, BASE_URL);
    console.groupEnd();
    throw networkErr;
  }

  const ms = (performance.now() - t0).toFixed(0);

  // ── RESPUESTA ERROR HTTP ───────────────────────────────────
  if (!response.ok) {
  const errorBody = await response.text();
  console.error('Cuerpo de error devuelto por el back:', errorBody);
  throw new Error(`Error ${response.status}: ${errorBody}`);
}

  // ── RESPUESTA 204 No Content ───────────────────────────────
  if (response.status === 204) {
    console.log(`%c✅ 204 No Content  (${ms} ms)`, S.ok);
    console.groupEnd();
    return null;
  }

  // ── RESPUESTA OK CON CUERPO ────────────────────────────────
  const data = await response.json() as T;
  console.log(`%c✅ ${response.status} ${response.statusText}  (${ms} ms)`, S.ok);
  console.log('%cRespuesta del back:', S.label, data);
  console.groupEnd();
  return data;
}
