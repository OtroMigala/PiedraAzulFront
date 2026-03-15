import React from 'react';
import { useNavigate } from 'react-router';
import { Eye, EyeOff, Lock, User, AlertCircle, Shield } from 'lucide-react';
import { COLORS } from '../data/mockData';
import { apiFetch } from '../services/api';
import { saveAuth, extractRoleFromToken, extractFullNameFromToken, validateAuth, getRole } from '../store/authStore';

export default function Login() {
  const navigate = useNavigate();

  // Si el usuario ya está autenticado, redirigir a su panel — no mostrar el login
  React.useEffect(() => {
    if (validateAuth()) {
      const role = getRole();
      switch (role) {
        case 'Admin':     navigate('/dashboard', { replace: true }); break;
        case 'Doctor':    navigate('/agenda', { replace: true }); break;
        case 'Scheduler': navigate('/citas-por-medico', { replace: true }); break;
        case 'Patient':   navigate('/schedule', { replace: true }); break;
        default:          break;
      }
    }
  }, [navigate]);

  const [showPassword, setShowPassword] = React.useState(false);
  const [remember, setRemember] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor ingresa tu usuario y contraseña.');
      return;
    }
    setError('');
    setLoading(true);
    console.log(`%c[Login] Intentando iniciar sesión con usuario: "${email}"`, 'color:#4285F4');
    try {
      const data = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username: email, password }),
      }) as { token: string; role?: string; fullName?: string; expiresAt?: string };

      // Extraer rol y nombre del token si no vienen en la respuesta
      const role = data.role || extractRoleFromToken(data.token) || '';
      const fullName = data.fullName || extractFullNameFromToken(data.token) || '';

      console.log(`%c[Login] ✅ Autenticación exitosa — rol: ${role}, usuario: ${fullName}, expira: ${data.expiresAt || 'N/A'}`, 'color:#0F9D58');
      saveAuth({ token: data.token, role, fullName });

      // Redirigir según el rol
      const redirectPath = getRedirectPathByRole(role);
      console.log(`%c[Login] Redirigiendo a ${redirectPath}`, 'color:#4285F4');
      navigate(redirectPath);
    } catch (err) {
      console.error('[Login] ❌ Fallo en autenticación:', err);
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  // Función para determinar la ruta de redirección según el rol
  const getRedirectPathByRole = (role: string): string => {
    switch (role) {
      case 'Admin':
        return '/dashboard';
      case 'Doctor':
        return '/agenda';
      case 'Scheduler':
        return '/citas-por-medico';
      case 'Patient':
        return '/schedule';
      default:
        return '/dashboard';
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: `linear-gradient(135deg, ${COLORS.text} 0%, #1a2a3a 60%, #0d1a26 100%)` }}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg width="100%" height="100%">
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative w-full max-w-[420px]">
        {/* Card */}
        <div className="rounded-2xl p-8 shadow-2xl" style={{ background: COLORS.white }}>
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3 shadow-lg"
              style={{ background: `linear-gradient(135deg, ${COLORS.blue} 0%, ${COLORS.blueDark} 100%)` }}
            >
              <span className="text-white text-2xl" style={{ fontWeight: 800 }}>P</span>
            </div>
            <h1 className="text-2xl" style={{ color: COLORS.text, fontWeight: 700 }}>Piedrazul</h1>
            <p style={{ color: COLORS.textLight, fontSize: 15 }}>Centro Médico de Medicina Alternativa</p>
          </div>

          {/* Title */}
          <h2 className="text-lg mb-6 text-center" style={{ color: COLORS.text, fontWeight: 600 }}>
            Iniciar sesión
          </h2>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 rounded-lg px-4 py-3 mb-4" style={{ background: COLORS.errorLight, color: COLORS.error }}>
              <AlertCircle size={18} />
              <span style={{ fontSize: 15 }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email */}
            <div>
              <label className="block mb-2" style={{ color: COLORS.text, fontSize: 15, fontWeight: 600 }}>
                Usuario, correo o documento
              </label>
              <div className="relative">
                <User
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2"
                  style={{ color: COLORS.gray }}
                  aria-hidden="true"
                />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@piedrazul.com o N° documento"
                  aria-label="Usuario, correo electrónico o número de documento"
                  className="w-full pl-11 pr-4 py-3 rounded-lg outline-none transition-all"
                  style={{
                    border: `1.5px solid ${COLORS.border}`,
                    fontSize: 16,
                    color: COLORS.text,
                    background: COLORS.bg,
                  }}
                  onFocus={(e) => e.target.style.borderColor = COLORS.blue}
                  onBlur={(e) => e.target.style.borderColor = COLORS.border}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block mb-2" style={{ color: COLORS.text, fontSize: 15, fontWeight: 600 }}>
                Contraseña
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2"
                  style={{ color: COLORS.gray }}
                  aria-hidden="true"
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  aria-label="Contraseña"
                  className="w-full pl-11 pr-12 py-3 rounded-lg outline-none transition-all"
                  style={{
                    border: `1.5px solid ${COLORS.border}`,
                    fontSize: 16,
                    color: COLORS.text,
                    background: COLORS.bg,
                  }}
                  onFocus={(e) => e.target.style.borderColor = COLORS.blue}
                  onBlur={(e) => e.target.style.borderColor = COLORS.border}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                  style={{ color: COLORS.gray }}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2.5 cursor-pointer py-1">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="rounded w-5 h-5"
                  style={{ accentColor: COLORS.blue }}
                />
                <span style={{ color: COLORS.textLight, fontSize: 15 }}>Recordarme</span>
              </label>
              <button type="button" className="text-sm hover:underline py-1" style={{ color: COLORS.blue, fontSize: 15 }}>
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-70 mt-2"
              style={{
                background: loading ? COLORS.gray : `linear-gradient(135deg, ${COLORS.blue} 0%, ${COLORS.blueDark} 100%)`,
                fontWeight: 700,
                fontSize: 16,
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeDasharray="60" strokeDashoffset="20" strokeLinecap="round" />
                  </svg>
                  Iniciando sesión...
                </span>
              ) : 'Iniciar sesión'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ background: COLORS.border }} />
            <span style={{ color: COLORS.gray, fontSize: 12 }}>ó</span>
            <div className="flex-1 h-px" style={{ background: COLORS.border }} />
          </div>

          {/* Patient scheduling */}
          <button
            onClick={() => navigate('/schedule')}
            className="w-full py-3 rounded-xl transition-all hover:bg-blue-50 border"
            style={{ borderColor: COLORS.blue, color: COLORS.blue, fontSize: 15, fontWeight: 600 }}
          >
            Agendar cita como paciente →
          </button>

          {/* Security badge */}
          <div className="flex items-center justify-center gap-1.5 mt-5">
            <Shield size={14} style={{ color: COLORS.gray }} aria-hidden="true" />
            <span style={{ color: COLORS.gray, fontSize: 13 }}>Conexión segura SSL – Datos protegidos</span>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center mt-4" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
          © 2025 Piedrazul Centro Médico · v1.0.0
        </p>
      </div>
    </div>
  );
}
