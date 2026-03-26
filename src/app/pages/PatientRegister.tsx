import React from 'react';
import { useNavigate } from 'react-router';
import { User, Phone, Mail, AlertCircle, Shield, ChevronLeft } from 'lucide-react';
import { COLORS } from '../data/mockData';
import { apiFetch } from '../services/api';
import { saveAuth, extractRoleFromToken, extractFullNameFromToken, extractIdFromToken } from '../store/authStore';
import type { Gender } from '../types/common.types';

interface RegisterPayload {
  documentId: string;
  fullName: string;
  phone: string;
  gender: Gender;
  birthDate: string | null;
  email: string | null;
  password: string;
}

interface RegisterResponse {
  token: string;
  role?: string;
  fullName?: string;
}

export default function PatientRegister() {
  const navigate = useNavigate();

  const [documentId, setDocumentId] = React.useState('');
  const [fullName, setFullName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [gender, setGender] = React.useState<Gender | ''>('');
  const [birthDate, setBirthDate] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const validate = (): string => {
    if (!documentId.trim()) return 'El número de documento es obligatorio.';
    if (!fullName.trim()) return 'Los nombres y apellidos son obligatorios.';
    if (!phone.trim()) return 'El celular es obligatorio.';
    if (!gender) return 'El género es obligatorio.';
    if (!password) return 'La contraseña es obligatoria.';
    if (password.length < 6) return 'La contraseña debe tener al menos 6 caracteres.';
    if (password !== confirmPassword) return 'Las contraseñas no coinciden.';
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'El correo no tiene un formato válido.';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setError('');
    setLoading(true);

    const payload: RegisterPayload = {
      documentId: documentId.replace(/\./g, ''),
      fullName: fullName.trim(),
      phone: phone.trim(),
      gender: gender as Gender,
      birthDate: birthDate ? `${birthDate}T00:00:00` : null,
      email: email.trim() || null,
      password,
    };

    console.log('%c[PatientRegister] Registrando nuevo paciente…', 'color:#4285F4', { ...payload, password: '***' });

    try {
      const data = await apiFetch<RegisterResponse>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const role = data.role || extractRoleFromToken(data.token) || 'Patient';
      const name = data.fullName || extractFullNameFromToken(data.token) || fullName.trim();
      const id = extractIdFromToken(data.token);

      console.log('%c[PatientRegister] ✅ Registro exitoso', 'color:#0F9D58');
      saveAuth({ token: data.token, role, fullName: name, id });
      navigate('/app/schedule');
    } catch (err) {
      console.error('[PatientRegister] ❌ Error en registro:', err);
      setError(err instanceof Error ? err.message : 'Error al registrar el paciente');
    } finally {
      setLoading(false);
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

      <div className="relative w-full max-w-[460px]">
        <div className="rounded-2xl p-8 shadow-2xl" style={{ background: COLORS.white }}>
          {/* Header */}
          <div className="flex flex-col items-center mb-6">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 shadow-lg"
              style={{ background: `linear-gradient(135deg, ${COLORS.blue} 0%, ${COLORS.blueDark} 100%)` }}
            >
              <span className="text-white text-xl" style={{ fontWeight: 800 }}>P</span>
            </div>
            <h1 className="text-xl" style={{ color: COLORS.text, fontWeight: 700 }}>Registro de Paciente</h1>
            <p style={{ color: COLORS.textLight, fontSize: 14 }}>Piedrazul Centro Médico</p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 rounded-lg px-4 py-3 mb-4" style={{ background: COLORS.errorLight, color: COLORS.error }}>
              <AlertCircle size={16} />
              <span style={{ fontSize: 14 }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
            {/* Documento */}
            <div>
              <label className="block mb-1.5" style={{ color: COLORS.text, fontSize: 14, fontWeight: 600 }}>
                Número de documento <span style={{ color: COLORS.error }}>*</span>
              </label>
              <input
                type="text"
                value={documentId}
                onChange={(e) => setDocumentId(e.target.value)}
                placeholder="Ej: 1234567890"
                className="w-full px-4 py-2.5 rounded-lg outline-none"
                style={{ border: `1.5px solid ${COLORS.border}`, fontSize: 15, color: COLORS.text, background: COLORS.bg }}
                onFocus={(e) => e.target.style.borderColor = COLORS.blue}
                onBlur={(e) => e.target.style.borderColor = COLORS.border}
              />
            </div>

            {/* Nombres */}
            <div>
              <label className="block mb-1.5" style={{ color: COLORS.text, fontSize: 14, fontWeight: 600 }}>
                Nombres y apellidos <span style={{ color: COLORS.error }}>*</span>
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: COLORS.gray }} />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ej: Juan Pablo Gómez"
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg outline-none"
                  style={{ border: `1.5px solid ${COLORS.border}`, fontSize: 15, color: COLORS.text, background: COLORS.bg }}
                  onFocus={(e) => e.target.style.borderColor = COLORS.blue}
                  onBlur={(e) => e.target.style.borderColor = COLORS.border}
                />
              </div>
            </div>

            {/* Celular + Género en fila */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-1.5" style={{ color: COLORS.text, fontSize: 14, fontWeight: 600 }}>
                  Celular <span style={{ color: COLORS.error }}>*</span>
                </label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: COLORS.gray }} />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="300 000 0000"
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg outline-none"
                    style={{ border: `1.5px solid ${COLORS.border}`, fontSize: 15, color: COLORS.text, background: COLORS.bg }}
                    onFocus={(e) => e.target.style.borderColor = COLORS.blue}
                    onBlur={(e) => e.target.style.borderColor = COLORS.border}
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1.5" style={{ color: COLORS.text, fontSize: 14, fontWeight: 600 }}>
                  Género <span style={{ color: COLORS.error }}>*</span>
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Gender | '')}
                  className="w-full px-3 py-2.5 rounded-lg outline-none appearance-none"
                  style={{ border: `1.5px solid ${COLORS.border}`, fontSize: 15, color: gender ? COLORS.text : COLORS.gray, background: COLORS.bg }}
                >
                  <option value="" disabled>Seleccionar</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
            </div>

            {/* Fecha de nacimiento (opcional) */}
            <div>
              <label className="block mb-1.5" style={{ color: COLORS.text, fontSize: 14, fontWeight: 600 }}>
                Fecha de nacimiento <span style={{ color: COLORS.gray, fontWeight: 400 }}>(opcional)</span>
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2.5 rounded-lg outline-none"
                style={{ border: `1.5px solid ${COLORS.border}`, fontSize: 15, color: COLORS.text, background: COLORS.bg }}
                onFocus={(e) => e.target.style.borderColor = COLORS.blue}
                onBlur={(e) => e.target.style.borderColor = COLORS.border}
              />
            </div>

            {/* Correo (opcional) */}
            <div>
              <label className="block mb-1.5" style={{ color: COLORS.text, fontSize: 14, fontWeight: 600 }}>
                Correo electrónico <span style={{ color: COLORS.gray, fontWeight: 400 }}>(opcional)</span>
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: COLORS.gray }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="paciente@correo.com"
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg outline-none"
                  style={{ border: `1.5px solid ${COLORS.border}`, fontSize: 15, color: COLORS.text, background: COLORS.bg }}
                  onFocus={(e) => e.target.style.borderColor = COLORS.blue}
                  onBlur={(e) => e.target.style.borderColor = COLORS.border}
                />
              </div>
            </div>

            {/* Contraseña */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-1.5" style={{ color: COLORS.text, fontSize: 14, fontWeight: 600 }}>
                  Contraseña <span style={{ color: COLORS.error }}>*</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mín. 6 caracteres"
                  className="w-full px-4 py-2.5 rounded-lg outline-none"
                  style={{ border: `1.5px solid ${COLORS.border}`, fontSize: 15, color: COLORS.text, background: COLORS.bg }}
                  onFocus={(e) => e.target.style.borderColor = COLORS.blue}
                  onBlur={(e) => e.target.style.borderColor = COLORS.border}
                />
              </div>
              <div>
                <label className="block mb-1.5" style={{ color: COLORS.text, fontSize: 14, fontWeight: 600 }}>
                  Confirmar <span style={{ color: COLORS.error }}>*</span>
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repetir contraseña"
                  className="w-full px-4 py-2.5 rounded-lg outline-none"
                  style={{ border: `1.5px solid ${COLORS.border}`, fontSize: 15, color: COLORS.text, background: COLORS.bg }}
                  onFocus={(e) => e.target.style.borderColor = COLORS.blue}
                  onBlur={(e) => e.target.style.borderColor = COLORS.border}
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-70 mt-1"
              style={{
                background: loading ? COLORS.gray : `linear-gradient(135deg, ${COLORS.blue} 0%, ${COLORS.blueDark} 100%)`,
                fontWeight: 700,
                fontSize: 15,
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeDasharray="60" strokeDashoffset="20" strokeLinecap="round" />
                  </svg>
                  Registrando...
                </span>
              ) : 'Crear cuenta y agendar cita'}
            </button>
          </form>

          {/* Back to login */}
          <button
            onClick={() => navigate('/login')}
            className="w-full flex items-center justify-center gap-1.5 mt-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            style={{ color: COLORS.textLight, fontSize: 14 }}
          >
            <ChevronLeft size={16} />
            Volver al inicio de sesión
          </button>

          {/* Security badge */}
          <div className="flex items-center justify-center gap-1.5 mt-3">
            <Shield size={13} style={{ color: COLORS.gray }} aria-hidden="true" />
            <span style={{ color: COLORS.gray, fontSize: 12 }}>Conexión segura SSL – Datos protegidos</span>
          </div>
        </div>

        <p className="text-center mt-4" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
          © 2025 Piedrazul Centro Médico · v1.0.0
        </p>
      </div>
    </div>
  );
}
