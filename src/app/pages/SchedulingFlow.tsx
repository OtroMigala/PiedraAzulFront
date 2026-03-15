import React from 'react';
import { useNavigate } from 'react-router';
import {
  Brain, Bone, Activity, ChevronRight, ChevronLeft, ChevronDown,
  Star, Clock, Calendar, User, Phone, Mail, CheckCircle,
  Shield, Download, RefreshCw, Home, Check, AlertCircle, X
} from 'lucide-react';
import { ProgressSteps } from '../components/ProgressSteps';
import { COLORS, SPECIALTIES } from '../data/mockData';
import { apiFetch } from '../services/api';
import { getAuth } from '../store/authStore';

const STEPS = ['Especialidad', 'Profesional', 'Fecha y Hora', 'Confirmación'];

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  type: string;
  interval: number;
  status: string;
  photo: string;
  nextAvailable: string;
  initials: string;
}

type FormState = {
  specialty: string | null;
  doctor: Doctor | null;
  date: string | null;
  time: string | null;
  email: string;
  phone: string;
  observations: string;
  termsAccepted: boolean;
};

const SPECIALTY_ICONS: Record<string, React.ReactNode> = {
  neural: <Brain size={36} />,
  quiro: <Bone size={36} />,
  fisio: <Activity size={36} />,
};

const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTH_NAMES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

function MiniCalendar({ selected, onSelect }: { selected: string | null; onSelect: (d: string) => void }) {
  const today = new Date();
  const [viewYear, setViewYear] = React.useState(today.getFullYear());
  const [viewMonth, setViewMonth] = React.useState(today.getMonth()); // 0-indexed

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0=Dom
  const allDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const isPast = (day: number) => {
    const d = new Date(viewYear, viewMonth, day);
    d.setHours(0, 0, 0, 0);
    const t = new Date(); t.setHours(0, 0, 0, 0);
    return d < t;
  };
  const isWeekend = (day: number) => {
    const dow = new Date(viewYear, viewMonth, day).getDay();
    return dow === 0 || dow === 6;
  };
  const toDateStr = (day: number) =>
    `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const todayDay = today.getFullYear() === viewYear && today.getMonth() === viewMonth ? today.getDate() : -1;

  // Prevent navigating before current month
  const isCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth();

  return (
    <div className="rounded-xl p-4" style={{ background: COLORS.white, border: `1px solid ${COLORS.border}` }}>
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={prevMonth}
          disabled={isCurrentMonth}
          className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ color: COLORS.textLight }}
        >
          <ChevronLeft size={16} />
        </button>
        <span style={{ color: COLORS.text, fontWeight: 600, fontSize: 14 }}>
          {MONTH_NAMES[viewMonth]} {viewYear}
        </span>
        <button
          onClick={nextMonth}
          className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
          style={{ color: COLORS.textLight }}
        >
          <ChevronRight size={16} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS.map(d => (
          <div key={d} className="text-center" style={{ fontSize: 12, fontWeight: 600, color: COLORS.gray }}>
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`off-${i}`} />)}
        {allDays.map(day => {
          const disabled = isPast(day) || isWeekend(day);
          const dateStr = toDateStr(day);
          const isSelected = selected === dateStr;
          const isTodayDay = day === todayDay;

          return (
            <button
              key={day}
              disabled={disabled}
              onClick={() => !disabled && onSelect(dateStr)}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all text-sm mx-auto"
              style={{
                background: isSelected ? COLORS.blue : isTodayDay && !isSelected ? COLORS.blueLight : 'transparent',
                color: isSelected ? 'white' : disabled ? COLORS.gray : isTodayDay ? COLORS.blue : COLORS.text,
                opacity: disabled ? 0.4 : 1,
                cursor: disabled ? 'not-allowed' : 'pointer',
                fontWeight: isSelected || isTodayDay ? 700 : 400,
              }}
            >
              {day}
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-4 mt-3 pt-3" style={{ borderTop: `1px solid ${COLORS.border}` }}>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-full" style={{ background: COLORS.grayLight }} />
          <span style={{ fontSize: 12, color: COLORS.gray }}>No disponible</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-full" style={{ background: COLORS.blue }} />
          <span style={{ fontSize: 12, color: COLORS.gray }}>Seleccionado</span>
        </div>
      </div>
    </div>
  );
}

// Step 1
function Step1({ form, setForm }: { form: FormState; setForm: React.Dispatch<React.SetStateAction<FormState>> }) {
  return (
    <div>
      <h2 className="text-xl mb-1" style={{ color: COLORS.text, fontWeight: 700 }}>Selecciona una especialidad</h2>
      <p className="mb-6" style={{ color: COLORS.textLight, fontSize: 15 }}>
        Elige el tipo de terapia que necesitas para tu tratamiento
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {SPECIALTIES.map((sp) => {
          const isSelected = form.specialty === sp.id;
          return (
            <button
              key={sp.id}
              onClick={() => setForm((f) => ({ ...f, specialty: sp.id }))}
              className="rounded-2xl p-6 text-left transition-all duration-200 relative"
              style={{
                border: `2px solid ${isSelected ? sp.color : COLORS.border}`,
                background: isSelected ? sp.bgColor : COLORS.white,
                transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                boxShadow: isSelected ? `0 4px 20px ${sp.color}30` : '0 1px 4px rgba(0,0,0,0.06)',
              }}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: sp.color }}>
                  <Check size={12} className="text-white" />
                </div>
              )}
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: sp.bgColor, color: sp.color }}
              >
                {SPECIALTY_ICONS[sp.id]}
              </div>
              <h3 className="text-base mb-2" style={{ color: COLORS.text, fontWeight: 700 }}>{sp.name}</h3>
              <p style={{ color: COLORS.textLight, fontSize: 13, lineHeight: 1.5 }}>{sp.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Step 2
function Step2({ form, setForm, doctors }: { form: FormState; setForm: React.Dispatch<React.SetStateAction<FormState>>; doctors: Doctor[] }) {
  const [search, setSearch] = React.useState('');
  const [filterType, setFilterType] = React.useState('Todos');
  const filtered = doctors.filter(
    (d) =>
      (!form.specialty || d.specialty === form.specialty) &&
      (filterType === 'Todos' || d.type === filterType) &&
      d.name.toLowerCase().includes(search.toLowerCase()) &&
      d.status === 'Activo'
  );

  return (
    <div>
      <h2 className="text-xl mb-1" style={{ color: COLORS.text, fontWeight: 700 }}>Elige tu profesional</h2>
      <p className="mb-5" style={{ color: COLORS.textLight, fontSize: 15 }}>
        Selecciona el médico o terapista de tu preferencia
      </p>

      {/* Search + Type filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: COLORS.gray }} />
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg outline-none"
            style={{ border: `1.5px solid ${COLORS.border}`, fontSize: 13, color: COLORS.text, background: COLORS.white }}
          />
        </div>
        <div className="relative" style={{ minWidth: 180 }}>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full pl-3 pr-8 py-2.5 rounded-lg outline-none appearance-none"
            aria-label="Filtrar por tipo de profesional"
            style={{ border: `1.5px solid ${COLORS.border}`, fontSize: 13, color: COLORS.text, background: COLORS.white }}
          >
            <option value="Todos">Médico / Terapista</option>
            <option value="Médico">Médico</option>
            <option value="Terapista">Terapista</option>
          </select>
          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: COLORS.gray }} />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {filtered.map((doctor) => {
          const isSelected = form.doctor?.id === doctor.id;
          const sp = SPECIALTIES.find((s) => s.id === doctor.specialty);
          return (
            <div
              key={doctor.id}
              className="rounded-xl p-4 flex items-center gap-4 cursor-pointer transition-all duration-200"
              onClick={() => setForm((f) => ({ ...f, doctor }))}
              style={{
                border: `2px solid ${isSelected ? COLORS.blue : COLORS.border}`,
                background: isSelected ? COLORS.blueLight : COLORS.white,
                boxShadow: isSelected ? `0 2px 12px ${COLORS.blue}25` : 'none',
              }}
            >
              {/* Photo */}
              <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0" style={{ border: `3px solid ${isSelected ? COLORS.blue : COLORS.border}` }}>
                <img src={doctor.photo} alt={doctor.name} className="w-full h-full object-cover" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base" style={{ color: COLORS.text, fontWeight: 700 }}>{doctor.name}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: sp?.bgColor, color: sp?.color, fontWeight: 600 }}>
                    {doctor.type}
                  </span>
                </div>
                <p className="text-sm" style={{ color: COLORS.textLight }}>{sp?.name ?? doctor.specialty}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Clock size={13} style={{ color: COLORS.green }} />
                  <span style={{ fontSize: 13, color: COLORS.green, fontWeight: 600 }}>
                    Disponible desde: {doctor.nextAvailable}
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <Star size={12} fill="#E65100" style={{ color: '#E65100' }} />
                  <Star size={12} fill="#E65100" style={{ color: '#E65100' }} />
                  <Star size={12} fill="#E65100" style={{ color: '#E65100' }} />
                  <Star size={12} fill="#E65100" style={{ color: '#E65100' }} />
                  <Star size={12} fill="#E65100" style={{ color: '#E65100' }} />
                  <span style={{ fontSize: 12, color: COLORS.gray }}>Intervalo: {doctor.interval} min</span>
                </div>
              </div>

              {/* Select button */}
              <div className="flex-shrink-0">
                {isSelected ? (
                  <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg" style={{ background: COLORS.blue, color: 'white', fontSize: 13, fontWeight: 600 }}>
                    <Check size={14} />
                    Seleccionado
                  </div>
                ) : (
                  <button
                    className="px-3 py-1.5 rounded-lg border transition-all hover:bg-blue-50"
                    style={{ borderColor: COLORS.blue, color: COLORS.blue, fontSize: 13, fontWeight: 600 }}
                  >
                    Seleccionar
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-8" style={{ color: COLORS.gray }}>
            <User size={40} className="mx-auto mb-2 opacity-40" />
            <p>No hay profesionales disponibles para esta especialidad</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Step 3
function Step3({ form, setForm, timeSlots, occupiedSlots }: { form: FormState; setForm: React.Dispatch<React.SetStateAction<FormState>>; timeSlots: string[]; occupiedSlots: string[] }) {
  return (
    <div>
      <h2 className="text-xl mb-1" style={{ color: COLORS.text, fontWeight: 700 }}>Selecciona fecha y hora</h2>
      <p className="mb-5" style={{ color: COLORS.textLight, fontSize: 15 }}>
        Elige el día y el horario disponible que más te convenga
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar */}
        <div>
          <label className="block mb-2" style={{ color: COLORS.text, fontSize: 13, fontWeight: 600 }}>
            <Calendar size={14} className="inline mr-1.5" />
            Fecha de la cita
          </label>
          <MiniCalendar
            selected={form.date}
            onSelect={(d) => setForm((f) => ({ ...f, date: d, time: null }))}
          />
        </div>

        {/* Time slots */}
        <div>
          <label className="block mb-2" style={{ color: COLORS.text, fontSize: 13, fontWeight: 600 }}>
            <Clock size={14} className="inline mr-1.5" />
            Horarios disponibles
            {form.date && (
              <span className="ml-2 text-xs px-2 py-0.5 rounded-full" style={{ background: COLORS.blueLight, color: COLORS.blue }}>
                {new Date(form.date + 'T12:00:00').toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'short' })}
              </span>
            )}
          </label>

          {!form.date ? (
            <div className="rounded-xl p-8 flex flex-col items-center justify-center" style={{ border: `2px dashed ${COLORS.border}`, background: COLORS.white }}>
              <Calendar size={32} style={{ color: COLORS.gray }} className="mb-2 opacity-40" />
              <p style={{ color: COLORS.gray, fontSize: 13 }}>Selecciona una fecha para ver los horarios</p>
            </div>
          ) : (
            <div className="rounded-xl p-4" style={{ background: COLORS.white, border: `1px solid ${COLORS.border}` }}>
              <div className="grid grid-cols-3 gap-2">
                {timeSlots.map((slot) => {
                  const isOccupied = occupiedSlots.includes(slot);
                  const isSelected = form.time === slot;
                  return (
                    <button
                      key={slot}
                      disabled={isOccupied}
                      onClick={() => !isOccupied && setForm((f) => ({ ...f, time: slot }))}
                      className="py-3 rounded-lg text-center transition-all duration-150"
                      style={{
                        background: isSelected
                          ? COLORS.blue
                          : isOccupied
                          ? COLORS.grayLight
                          : COLORS.bg,
                        color: isSelected ? 'white' : isOccupied ? COLORS.gray : COLORS.text,
                        border: `1.5px solid ${isSelected ? COLORS.blue : isOccupied ? COLORS.border : COLORS.border}`,
                        cursor: isOccupied ? 'not-allowed' : 'pointer',
                        fontWeight: isSelected ? 700 : 500,
                        opacity: isOccupied ? 0.5 : 1,
                        fontSize: 14,
                      }}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-4 mt-3 pt-3" style={{ borderTop: `1px solid ${COLORS.border}` }}>
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 rounded" style={{ background: COLORS.blue }} />
                  <span style={{ fontSize: 13, color: COLORS.gray }}>Seleccionado</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 rounded" style={{ background: COLORS.grayLight, border: `1px solid ${COLORS.border}` }} />
                  <span style={{ fontSize: 13, color: COLORS.gray }}>Ocupado</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 rounded" style={{ background: COLORS.bg, border: `1px solid ${COLORS.border}` }} />
                  <span style={{ fontSize: 13, color: COLORS.gray }}>Disponible</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Step 4
function Step4({ form, setForm }: { form: FormState; setForm: React.Dispatch<React.SetStateAction<FormState>> }) {
  const [emailError, setEmailError] = React.useState('');
  const [phoneError, setPhoneError] = React.useState('');
  const sp = SPECIALTIES.find((s) => s.id === form.specialty);

  const validateEmail = (v: string) => {
    if (!v) return setEmailError('El correo es requerido');
    if (!/\S+@\S+\.\S+/.test(v)) return setEmailError('Correo inválido');
    setEmailError('');
  };
  const validatePhone = (v: string) => {
    if (!v) return setPhoneError('El teléfono es requerido');
    if (!/^3\d{9}$/.test(v.replace(/\s/g, ''))) return setPhoneError('Formato inválido (ej: 310 234 5678)');
    setPhoneError('');
  };

  return (
    <div>
      <h2 className="text-xl mb-1" style={{ color: COLORS.text, fontWeight: 700 }}>Confirma tu cita</h2>
      <p className="mb-5" style={{ color: COLORS.textLight, fontSize: 15 }}>
        Revisa los datos y completa tu información de contacto
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Summary card */}
        <div>
          <label className="block mb-2" style={{ color: COLORS.text, fontSize: 14, fontWeight: 600 }}>Resumen de tu cita</label>
          <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${COLORS.blue}`, boxShadow: `0 2px 12px ${COLORS.blue}20` }}>
            <div className="px-5 py-3" style={{ background: `linear-gradient(135deg, ${COLORS.blue} 0%, ${COLORS.blueDark} 100%)` }}>
              <p className="text-white text-sm" style={{ fontWeight: 600 }}>Cita Médica – Piedrazul</p>
            </div>
            <div className="p-5 flex flex-col gap-3" style={{ background: COLORS.white }}>
              {[
                { label: 'Especialidad', value: sp?.name, icon: <Activity size={14} /> },
                { label: 'Profesional', value: form.doctor?.name, icon: <User size={14} /> },
                { label: 'Fecha', value: form.date ? new Date(form.date + 'T12:00:00').toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '', icon: <Calendar size={14} /> },
                { label: 'Hora', value: form.time, icon: <Clock size={14} /> },
                { label: 'Duración estimada', value: `${form.doctor?.interval} minutos`, icon: <Clock size={14} /> },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: COLORS.blueLight, color: COLORS.blue }}>
                    {item.icon}
                  </div>
                  <div>
                    <p style={{ fontSize: 12, color: COLORS.gray, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>{item.label}</p>
                    <p style={{ fontSize: 15, color: COLORS.text, fontWeight: 600 }}>{item.value || '–'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact form */}
        <div className="flex flex-col gap-4">
          <label className="block" style={{ color: COLORS.text, fontSize: 14, fontWeight: 600 }}>Información de contacto</label>

          {/* Email */}
          <div>
            <label className="flex items-center gap-1 mb-1.5" style={{ color: COLORS.text, fontSize: 14, fontWeight: 600 }}>
              <Mail size={14} /> Correo electrónico <span style={{ color: COLORS.error }}>*</span>
            </label>
            <input
              type="email"
              placeholder="tucorreo@ejemplo.com"
              value={form.email}
              onChange={(e) => { setForm((f) => ({ ...f, email: e.target.value })); setEmailError(''); }}
              onBlur={(e) => validateEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg outline-none"
              style={{
                border: `1.5px solid ${emailError ? COLORS.error : COLORS.border}`,
                fontSize: 15,
                color: COLORS.text,
                background: COLORS.bg,
              }}
            />
            {emailError && (
              <p className="flex items-center gap-1 mt-1" style={{ color: COLORS.error, fontSize: 13 }}>
                <AlertCircle size={13} /> {emailError}
              </p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="flex items-center gap-1 mb-1.5" style={{ color: COLORS.text, fontSize: 14, fontWeight: 600 }}>
              <Phone size={14} /> Teléfono / Celular <span style={{ color: COLORS.error }}>*</span>
            </label>
            <input
              type="tel"
              placeholder="310 234 5678"
              value={form.phone}
              onChange={(e) => { setForm((f) => ({ ...f, phone: e.target.value })); setPhoneError(''); }}
              onBlur={(e) => validatePhone(e.target.value)}
              className="w-full px-4 py-3 rounded-lg outline-none"
              style={{
                border: `1.5px solid ${phoneError ? COLORS.error : COLORS.border}`,
                fontSize: 15,
                color: COLORS.text,
                background: COLORS.bg,
              }}
            />
            {phoneError && (
              <p className="flex items-center gap-1 mt-1" style={{ color: COLORS.error, fontSize: 13 }}>
                <AlertCircle size={13} /> {phoneError}
              </p>
            )}
          </div>

          {/* Observations */}
          <div>
            <label className="block mb-1.5" style={{ color: COLORS.text, fontSize: 14, fontWeight: 600 }}>
              Observaciones (opcional)
            </label>
            <textarea
              rows={3}
              placeholder="Síntomas, motivo de consulta, información adicional..."
              value={form.observations}
              onChange={(e) => setForm((f) => ({ ...f, observations: e.target.value }))}
              className="w-full px-4 py-3 rounded-lg outline-none resize-none"
              style={{ border: `1.5px solid ${COLORS.border}`, fontSize: 15, color: COLORS.text, background: COLORS.bg }}
            />
          </div>

          {/* CAPTCHA mock */}
          <div className="rounded-lg p-3 flex items-center gap-3" style={{ border: `1.5px solid ${COLORS.border}`, background: COLORS.white }}>
            <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0" style={{ background: COLORS.grayLight }}>
              <Shield size={14} style={{ color: COLORS.gray }} />
            </div>
            <span style={{ fontSize: 14, color: COLORS.textLight, flex: 1 }}>No soy un robot</span>
            <div className="w-10 h-10 flex items-center justify-center">
              <svg viewBox="0 0 24 24" width="28" height="28">
                <path d="M12 2L2 7v10l10 5 10-5V7L12 2z" fill="#4285F4" />
                <path d="M12 2L2 7l10 5 10-5L12 2z" fill="#1565C0" />
              </svg>
            </div>
          </div>

          {/* Terms */}
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={form.termsAccepted}
              onChange={(e) => setForm((f) => ({ ...f, termsAccepted: e.target.checked }))}
              className="mt-1 w-5 h-5"
              style={{ accentColor: COLORS.blue }}
            />
            <span style={{ fontSize: 14, color: COLORS.textLight }}>
              Acepto los{' '}
              <span className="cursor-pointer hover:underline" style={{ color: COLORS.blue }}>términos y condiciones</span>
              {' '}y la{' '}
              <span className="cursor-pointer hover:underline" style={{ color: COLORS.blue }}>política de privacidad</span>
              {' '}de Piedrazul. <span style={{ color: COLORS.error }}>*</span>
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}

// Step 5 - Success
function Step5({ form }: { form: FormState }) {
  const navigate = useNavigate();
  const sp = SPECIALTIES.find((s) => s.id === form.specialty);

  return (
    <div className="flex flex-col items-center text-center max-w-lg mx-auto py-4">
      {/* Success icon */}
      <div
        className="w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-lg"
        style={{ background: `linear-gradient(135deg, ${COLORS.green} 0%, #1b5e20 100%)` }}
      >
        <CheckCircle size={48} className="text-white" />
      </div>

      <h2 className="text-2xl mb-2" style={{ color: COLORS.green, fontWeight: 800 }}>
        ¡Cita agendada exitosamente!
      </h2>
      <p className="mb-6" style={{ color: COLORS.textLight, fontSize: 15 }}>
        Hemos enviado la confirmación a tu correo electrónico
      </p>

      {/* Summary */}
      <div className="w-full rounded-2xl overflow-hidden mb-6" style={{ border: `1px solid ${COLORS.border}`, boxShadow: '0 2px 16px rgba(0,0,0,0.07)' }}>
        <div className="py-3 px-5" style={{ background: COLORS.green }}>
          <p className="text-white text-sm" style={{ fontWeight: 700 }}>Comprobante de Cita N° PZ-2025-0891</p>
        </div>
        <div className="p-5 grid grid-cols-2 gap-4 text-left" style={{ background: COLORS.white }}>
          {[
            { label: 'Especialidad', value: sp?.name },
            { label: 'Profesional', value: form.doctor?.name },
            { label: 'Fecha', value: form.date ? new Date(form.date + 'T12:00:00').toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' }) : '' },
            { label: 'Hora', value: form.time },
            { label: 'Duración', value: `${form.doctor?.interval} minutos` },
            { label: 'Correo', value: form.email || 'paciente@email.com' },
          ].map((item) => (
            <div key={item.label}>
            <p style={{ fontSize: 11, color: COLORS.gray, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>{item.label}</p>
            <p style={{ fontSize: 14, color: COLORS.text, fontWeight: 600 }}>{item.value || '–'}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="w-full rounded-xl p-4 mb-6 flex items-start gap-3 text-left" style={{ background: COLORS.warningLight, border: `1px solid #FFCC80` }}>
        <AlertCircle size={18} style={{ color: COLORS.warning, flexShrink: 0, marginTop: 1 }} />
        <div>
          <p style={{ color: COLORS.warning, fontWeight: 700, fontSize: 14 }}>Recordatorio importante</p>
          <p style={{ color: '#5D4037', fontSize: 14, lineHeight: 1.5 }}>
            Por favor llega <strong>15 minutos antes</strong> de tu cita. Trae tu documento de identidad y cualquier examen médico previo relevante.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <button
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border flex-1 hover:bg-gray-50 transition-colors"
          style={{ borderColor: COLORS.border, color: COLORS.textLight, fontSize: 14, fontWeight: 600 }}
        >
          <Download size={18} />
          Descargar comprobante
        </button>
        <button
          onClick={() => navigate('/schedule')}
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border flex-1 hover:bg-blue-50 transition-colors"
          style={{ borderColor: COLORS.blue, color: COLORS.blue, fontSize: 14, fontWeight: 600 }}
        >
          <RefreshCw size={18} />
          Agendar otra cita
        </button>
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl flex-1 text-white hover:opacity-90 transition-all"
          style={{ background: COLORS.blue, fontSize: 14, fontWeight: 600 }}
        >
          <Home size={18} />
          Ir al inicio
        </button>
      </div>
    </div>
  );
}

export default function SchedulingFlow() {
  const [step, setStep] = React.useState(1);
  const [form, setForm] = React.useState<FormState>({
    specialty: null,
    doctor: null,
    date: null,
    time: null,
    email: '',
    phone: '',
    observations: '',
    termsAccepted: false,
  });
  const [doctors, setDoctors] = React.useState<Doctor[]>([]);
  const [apiSlots, setApiSlots] = React.useState<string[]>([]);

  React.useEffect(() => {
    console.log('%c[SchedulingFlow] Cargando lista de médicos desde /api/doctors…', 'color:#4285F4');
    apiFetch('/api/doctors')
      .then((res: unknown) => {
        const list = res as Array<{
          id: string; fullName: string; specialty: string;
          type: string; intervalMinutes: number; isActive?: boolean;
        }>;
        setDoctors(list.map(d => ({
          id: d.id,
          name: d.fullName,
          specialty: ({ NeuralTherapy: 'neural', Chiropractic: 'quiro', Physiotherapy: 'fisio' } as Record<string, string>)[d.specialty] ?? d.specialty,
          type: d.type === 'Doctor' ? 'Médico' : 'Terapista',
          interval: d.intervalMinutes,
          status: d.isActive === false ? 'Inactivo' : 'Activo',
          photo: '',
          nextAvailable: '',
          initials: d.fullName.split(' ').map((n: string) => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase(),
        })));
        console.log(`%c[SchedulingFlow] Médicos cargados: ${list.length} registros`, 'color:#0F9D58');
      })
      .catch((err: unknown) => {
        console.error('[SchedulingFlow] ❌ No se pudo cargar la lista de médicos:', err);
        setDoctors([]);
      });
  }, []);

  React.useEffect(() => {
    if (!form.doctor || !form.date) {
      setApiSlots([]);
      return;
    }
    let cancelled = false;
    console.log(`%c[SchedulingFlow] Pidiendo slots → doctorId=${form.doctor.id}, fecha=${form.date}`, 'color:#4285F4');
    apiFetch(`/api/scheduling/slots?doctorId=${form.doctor.id}&date=${form.date}`)
      .then((res: unknown) => {
        if (!cancelled) {
          const slots = (res as { slots: string[] }).slots ?? [];
          console.log(`%c[SchedulingFlow] Slots disponibles (${slots.length}):`, 'color:#0F9D58', slots);
          setApiSlots(slots);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          console.error('[SchedulingFlow] ❌ Error al cargar slots:', err);
          setApiSlots([]);
        }
      });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.doctor?.id, form.date]);

  const canProceed = () => {
    if (step === 1) return !!form.specialty;
    if (step === 2) return !!form.doctor;
    if (step === 3) return !!form.date && !!form.time;
    if (step === 4) return !!form.email && !!form.phone && form.termsAccepted;
    return false;
  };

  const [submitError, setSubmitError] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const handleNext = async () => {
    if (step === 4 && canProceed()) {
      const auth = getAuth();
      if (!auth || auth.role !== 'Patient') {
        setSubmitError('Debes iniciar sesión como paciente para confirmar');
        return;
      }
      setSubmitting(true);
      setSubmitError('');
      const payload = {
        doctorId: form.doctor!.id,
        date: form.date,
        time: form.time,
      };
      console.log('%c[SchedulingFlow] Confirmando cita (paciente)…', 'color:#4285F4', payload);
      try {
        await apiFetch('/api/patient/appointments', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        console.log('%c[SchedulingFlow] ✅ Cita confirmada exitosamente', 'color:#0F9D58');
        setStep(5);
      } catch (err) {
        console.error('[SchedulingFlow] ❌ Error al confirmar la cita:', err);
        setSubmitError(err instanceof Error ? err.message : 'Error al confirmar la cita');
      } finally {
        setSubmitting(false);
      }
      return;
    }
    if (canProceed()) setStep((s) => Math.min(s + 1, 5));
  };
  const handleBack = () => setStep((s) => Math.max(s - 1, 1));

  return (
    <div className="min-h-screen" style={{ background: COLORS.bg }}>
      {/* Header */}
      <div className="py-5 px-4" style={{ background: COLORS.white, borderBottom: `1px solid ${COLORS.border}` }}>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: COLORS.blue }}>
              <span className="text-white text-sm" style={{ fontWeight: 700 }}>P</span>
            </div>
            <div>
              <span className="text-sm" style={{ color: COLORS.text, fontWeight: 700 }}>Piedrazul</span>
              <span className="mx-2" style={{ color: COLORS.gray }}>·</span>
              <span className="text-sm" style={{ color: COLORS.textLight }}>Centro Médico</span>
            </div>
          </div>

          {step < 5 && (
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h1 className="text-lg" style={{ color: COLORS.text, fontWeight: 700 }}>Agenda tu cita</h1>
                <p style={{ color: COLORS.textLight, fontSize: 14 }}>Paso {step} de {STEPS.length}</p>
              </div>
              <div style={{ maxWidth: 500, width: '100%' }}>
                <ProgressSteps steps={STEPS} current={step} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="rounded-2xl p-6 sm:p-8 shadow-sm" style={{ background: COLORS.white }}>
          {step === 1 && <Step1 form={form} setForm={setForm} />}
          {step === 2 && <Step2 form={form} setForm={setForm} doctors={doctors} />}
          {step === 3 && <Step3 form={form} setForm={setForm} timeSlots={apiSlots} occupiedSlots={[]} />}
          {step === 4 && <Step4 form={form} setForm={setForm} />}
          {step === 5 && <Step5 form={form} />}

          {submitError && step === 4 && (
            <div className="flex items-center gap-2 rounded-lg px-4 py-3 mt-6" style={{ background: COLORS.errorLight, color: COLORS.error }}>
              <AlertCircle size={16} />
              <span style={{ fontSize: 14 }}>{submitError}</span>
            </div>
          )}
          {/* Navigation buttons */}
          {step < 5 && (
            <div className="flex items-center justify-between mt-6 pt-6" style={{ borderTop: `1px solid ${COLORS.border}` }}>
              <button
                onClick={handleBack}
                disabled={step === 1}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border transition-all hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ borderColor: COLORS.border, color: COLORS.textLight, fontSize: 14, fontWeight: 600 }}
              >
                <ChevronLeft size={16} />
                Atrás
              </button>

              <div className="flex items-center gap-2">
                {[1, 2, 3, 4].map((s) => (
                  <div
                    key={s}
                    className="rounded-full transition-all"
                    style={{
                      width: s === step ? 20 : 6,
                      height: 6,
                      background: s === step ? COLORS.blue : s < step ? COLORS.green : COLORS.grayLight,
                    }}
                  />
                ))}
              </div>

              <button
                onClick={handleNext}
                disabled={!canProceed() || submitting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: COLORS.blue, fontSize: 14, fontWeight: 600 }}
              >
                {step === 4 ? (submitting ? 'Enviando...' : 'Confirmar cita') : 'Continuar'}
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
