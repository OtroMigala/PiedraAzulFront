import React from 'react';
import { useNavigate } from 'react-router';
import { Eye, EyeOff, Lock, User, AlertCircle, Shield } from 'lucide-react';
import { COLORS } from '../data/mockData';

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = React.useState(false);
  const [remember, setRemember] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor ingresa tu usuario y contraseña.');
      return;
    }
    setError('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate('/dashboard');
    }, 1200);
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
            <p style={{ color: COLORS.textLight, fontSize: 13 }}>Centro Médico de Medicina Alternativa</p>
          </div>

          {/* Title */}
          <h2 className="text-lg mb-6 text-center" style={{ color: COLORS.text, fontWeight: 600 }}>
            Iniciar sesión
          </h2>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 rounded-lg px-4 py-3 mb-4" style={{ background: COLORS.errorLight, color: COLORS.error }}>
              <AlertCircle size={16} />
              <span style={{ fontSize: 13 }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email */}
            <div>
              <label className="block mb-1.5" style={{ color: COLORS.text, fontSize: 13, fontWeight: 600 }}>
                Usuario o correo electrónico
              </label>
              <div className="relative">
                <User
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: COLORS.gray }}
                />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@piedrazul.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg outline-none transition-all"
                  style={{
                    border: `1.5px solid ${COLORS.border}`,
                    fontSize: 14,
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
              <label className="block mb-1.5" style={{ color: COLORS.text, fontSize: 13, fontWeight: 600 }}>
                Contraseña
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: COLORS.gray }}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg outline-none transition-all"
                  style={{
                    border: `1.5px solid ${COLORS.border}`,
                    fontSize: 14,
                    color: COLORS.text,
                    background: COLORS.bg,
                  }}
                  onFocus={(e) => e.target.style.borderColor = COLORS.blue}
                  onBlur={(e) => e.target.style.borderColor = COLORS.border}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: COLORS.gray }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="rounded"
                  style={{ accentColor: COLORS.blue }}
                />
                <span style={{ color: COLORS.textLight, fontSize: 13 }}>Recordarme</span>
              </label>
              <button type="button" className="text-sm hover:underline" style={{ color: COLORS.blue, fontSize: 13 }}>
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-70 mt-1"
              style={{
                background: loading ? COLORS.gray : `linear-gradient(135deg, ${COLORS.blue} 0%, ${COLORS.blueDark} 100%)`,
                fontWeight: 600,
                fontSize: 15,
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
            className="w-full py-2.5 rounded-lg transition-all hover:bg-blue-50 border"
            style={{ borderColor: COLORS.blue, color: COLORS.blue, fontSize: 14, fontWeight: 500 }}
          >
            Agendar cita como paciente →
          </button>

          {/* Security badge */}
          <div className="flex items-center justify-center gap-1.5 mt-5">
            <Shield size={12} style={{ color: COLORS.gray }} />
            <span style={{ color: COLORS.gray, fontSize: 11 }}>Conexión segura SSL – Datos protegidos</span>
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
