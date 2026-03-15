import React from 'react';
import {
  Plus, Search, Download, ChevronDown, Eye, Calendar,
  RefreshCw, Filter, X, User, Phone, FileText, AlertCircle, Check,
  Clock, Edit2, Mail
} from 'lucide-react';
import { COLORS, APPOINTMENTS_TODAY, DOCTORS, PATIENTS } from '../data/mockData';
import { apiFetch } from '../services/api';

// Helper: get Spanish day name from date string
function getDayName(dateStr: string): string {
  const dayMap: Record<number, string> = { 0: 'Domingo', 1: 'Lunes', 2: 'Martes', 3: 'Miércoles', 4: 'Jueves', 5: 'Viernes', 6: 'Sábado' };
  return dayMap[new Date(dateStr + 'T12:00:00').getDay()];
}

// Helper: generate time slots from a doctor's schedule for a given date
function generateTimeSlotsForDoctor(doctorName: string, dateStr: string): string[] {
  const doctor = DOCTORS.find(d => d.name === doctorName);
  if (!doctor || !dateStr) return [];
  const dayName = getDayName(dateStr);
  const daySchedule = doctor.schedule[dayName as keyof typeof doctor.schedule];
  if (!daySchedule) return [];

  const slots: string[] = [];
  const [startH, startM] = daySchedule.start.split(':').map(Number);
  const [endH, endM] = daySchedule.end.split(':').map(Number);
  let current = startH * 60 + startM;
  const end = endH * 60 + endM;

  while (current < end) {
    const h = Math.floor(current / 60);
    const m = current % 60;
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
    slots.push(`${h12}:${String(m).padStart(2, '0')} ${ampm}`);
    current += doctor.interval;
  }
  return slots;
}

// Helper: occupied slots (kept for NewAppointmentModal compatibility; backend handles exclusion)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getOccupiedSlots(_doctorName: string, _dateStr: string): string[] {
  return [];
}

// Helper: convert AM/PM slot string (e.g. "7:00 AM") to "HH:MM:SS" for the API
function formatTimeForApi(time: string): string {
  const [timePart, period] = time.split(' ');
  const [h, m] = timePart.split(':').map(Number);
  let hours = h;
  if (period === 'AM' && h === 12) hours = 0;
  if (period === 'PM' && h !== 12) hours = h + 12;
  return `${String(hours).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`;
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  Confirmada: { bg: '#E3F2FD', text: COLORS.blue },
  Completada: { bg: COLORS.greenLight, text: COLORS.green },
  Pendiente: { bg: '#FFF3E0', text: '#E65100' },
  Cancelada: { bg: COLORS.errorLight, text: COLORS.error },
  Scheduled: { bg: '#E3F2FD', text: COLORS.blue },
  Completed: { bg: COLORS.greenLight, text: COLORS.green },
  Pending: { bg: '#FFF3E0', text: '#E65100' },
  Cancelled: { bg: COLORS.errorLight, text: COLORS.error },
};

type ModalType = 'new' | 'reschedule' | 'detail' | null;

interface Appointment {
  id: number;
  date: string;
  time: string;
  patient: string;
  document: string;
  phone: string;
  specialty: string;
  doctor: string;
  doctorId?: number;
  observation: string;
  status: string;
  color: string;
}

interface RescheduleModalProps {
  appointment: Appointment;
  onClose: () => void;
}

function RescheduleModal({ appointment, onClose }: RescheduleModalProps) {
  const [newDate, setNewDate] = React.useState('');
  const [newTime, setNewTime] = React.useState('');
  const [reason, setReason] = React.useState('');
  const [historyOpen, setHistoryOpen] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  const TIME_SLOTS = ['7:00 AM', '7:20 AM', '7:40 AM', '8:00 AM', '8:20 AM', '9:00 AM', '9:20 AM', '10:00 AM', '10:40 AM'];

  const handleConfirm = () => {
    setSaved(true);
    setTimeout(onClose, 1500);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="rounded-2xl overflow-hidden w-full max-w-lg shadow-2xl" style={{ background: COLORS.white }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ background: COLORS.text }}>
          <div className="flex items-center gap-2">
            <RefreshCw size={18} className="text-white" aria-hidden="true" />
            <h3 className="text-white text-base" style={{ fontWeight: 700 }}>Re-agendar cita</h3>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {saved ? (
          <div className="p-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: COLORS.greenLight }}>
              <Check size={32} style={{ color: COLORS.green }} />
            </div>
            <p className="text-lg" style={{ color: COLORS.green, fontWeight: 700 }}>¡Cita re-agendada!</p>
          </div>
        ) : (
          <div className="p-5 flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
            {/* Current appointment info */}
            <div className="rounded-xl p-4" style={{ background: COLORS.bg, border: `1px solid ${COLORS.border}` }}>
              <p className="text-xs mb-3" style={{ color: COLORS.gray, textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>
                Información actual (solo lectura)
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Paciente', value: appointment.patient },
                  { label: 'Fecha y hora', value: `20 Feb 2025, ${appointment.time}` },
                  { label: 'Médico', value: appointment.doctor.split(' ').slice(0, 3).join(' ') },
                  { label: 'Especialidad', value: appointment.specialty },
                ].map((item) => (
                  <div key={item.label}>
                    <p style={{ fontSize: 11, color: COLORS.gray, fontWeight: 600, textTransform: 'uppercase' }}>{item.label}</p>
                    <p style={{ fontSize: 14, color: COLORS.text, fontWeight: 600 }}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* New date/time */}
            <div>
              <p className="text-sm mb-3" style={{ color: COLORS.text, fontWeight: 700 }}>Nueva programación</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1.5" style={{ color: COLORS.text, fontSize: 14, fontWeight: 600 }}>
                    Nueva fecha <span style={{ color: COLORS.error }}>*</span>
                  </label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    min="2025-02-21"
                    className="w-full px-3 py-2.5 rounded-lg outline-none"
                    style={{ border: `1.5px solid ${COLORS.border}`, fontSize: 14, color: COLORS.text, background: COLORS.bg }}
                  />
                </div>
                <div>
                  <label className="block mb-1.5" style={{ color: COLORS.text, fontSize: 14, fontWeight: 600 }}>
                    Nueva hora <span style={{ color: COLORS.error }}>*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg outline-none appearance-none"
                      style={{ border: `1.5px solid ${COLORS.border}`, fontSize: 14, color: COLORS.text, background: COLORS.bg }}
                    >
                      <option value="">Seleccionar...</option>
                      {TIME_SLOTS.map((s) => <option key={s}>{s}</option>)}
                    </select>
                    <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: COLORS.gray }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Change doctor */}
            <div>
              <label className="block mb-1.5" style={{ color: COLORS.text, fontSize: 14, fontWeight: 600 }}>
                Cambiar médico (opcional)
              </label>
              <div className="relative">
                <select
                  className="w-full px-3 py-2.5 rounded-lg outline-none appearance-none"
                  style={{ border: `1.5px solid ${COLORS.border}`, fontSize: 14, color: COLORS.text, background: COLORS.bg }}
                >
                  <option value="">Mantener médico actual</option>
                  {DOCTORS.filter((d) => d.status === 'Activo').map((d) => (
                    <option key={d.id}>{d.name}</option>
                  ))}
                </select>
                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: COLORS.gray }} />
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="block mb-1.5" style={{ color: COLORS.text, fontSize: 14, fontWeight: 600 }}>
                Motivo del cambio
              </label>
              <textarea
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ej: Paciente solicitó cambio por viaje de trabajo..."
                className="w-full px-3 py-2.5 rounded-lg outline-none resize-none"
                style={{ border: `1.5px solid ${COLORS.border}`, fontSize: 14, color: COLORS.text, background: COLORS.bg }}
              />
            </div>

            {/* History */}
            <div>
              <button
                className="flex items-center gap-2 w-full text-left py-2"
                onClick={() => setHistoryOpen(!historyOpen)}
                style={{ color: COLORS.textLight, fontSize: 14, fontWeight: 600 }}
              >
                <Clock size={15} />
                Historial de cambios
                <ChevronDown size={14} className={`ml-auto transition-transform ${historyOpen ? 'rotate-180' : ''}`} />
              </button>

              {historyOpen && (
                <div className="flex flex-col gap-2 mt-2">
                  {[
                    { original: 'Lun 17 Feb, 9:00 AM', new: 'Mié 19 Feb, 10:00 AM', user: 'Laura Jiménez', date: '14 Feb', reason: 'Paciente solicitó cambio' },
                    { original: 'Vie 10 Ene, 8:00 AM', new: 'Lun 17 Feb, 9:00 AM', user: 'Sistema', date: '9 Ene', reason: 'Médico no disponible' },
                  ].map((h, i) => (
                    <div key={i} className="rounded-lg p-3 flex gap-3" style={{ background: COLORS.bg, border: `1px solid ${COLORS.border}` }}>
                      <div className="w-1 rounded-full flex-shrink-0" style={{ background: COLORS.blue }} />
                      <div>
                        <p style={{ fontSize: 11, color: COLORS.text, fontWeight: 600 }}>
                          {h.original} → {h.new}
                        </p>
                        <p style={{ fontSize: 10, color: COLORS.textLight }}>
                          Por {h.user} · {h.date} · "{h.reason}"
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2" style={{ borderTop: `1px solid ${COLORS.border}` }}>
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border hover:bg-gray-50 transition-colors"
                style={{ borderColor: COLORS.border, color: COLORS.textLight, fontSize: 14, fontWeight: 600 }}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                disabled={!newDate || !newTime}
                className="flex-1 py-2.5 rounded-xl text-white hover:opacity-90 transition-all disabled:opacity-40"
                style={{ background: COLORS.blue, fontSize: 14, fontWeight: 700 }}
              >
                Confirmar cambio
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface NewAppointmentModalProps {
  onClose: () => void;
  doctors: { id: number; name: string }[];
  onSuccess?: () => void;
}

export function NewAppointmentModal({ onClose, doctors, onSuccess }: NewAppointmentModalProps) {
  const [search, setSearch] = React.useState('');
  const [foundPatient, setFoundPatient] = React.useState<typeof PATIENTS[0] | null>(null);
  const [newPatient, setNewPatient] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState('');

  const [form, setForm] = React.useState({
    document: '', names: '', phone: '', gender: '', birthDate: '', email: '',
    doctor: '', doctorId: '', date: '', time: '', observations: '', saveToHistory: false,
  });
  const [conflictError, setConflictError] = React.useState('');

  const age = form.birthDate
    ? Math.floor((Date.now() - new Date(form.birthDate).getTime()) / (365.25 * 24 * 3600 * 1000))
    : '';

  const handleSearch = () => {
    const found = PATIENTS.find((p) => p.document.replace(/\./g, '') === search.replace(/\./g, ''));
    if (found) setFoundPatient(found);
    else setNewPatient(true);
  };

  // Dynamic slot generation — fixed Mon–Fri slots
  const dynamicSlots = React.useMemo(() => {
    if (!form.doctorId || !form.date) return [];
    const day = new Date(form.date + 'T12:00:00').getDay();
    if (day === 0 || day === 6) return []; // weekend
    return [
      '7:00 AM','7:20 AM','7:40 AM','8:00 AM','8:20 AM','8:40 AM',
      '9:00 AM','9:20 AM','9:40 AM','10:00 AM','10:20 AM','10:40 AM',
      '11:00 AM','11:20 AM','11:40 AM','12:00 PM',
    ];
  }, [form.doctorId, form.date]);

  // Occupied slots for the selected doctor on the selected date
  const occupiedSlots = React.useMemo(
    () => form.doctorId && form.date ? getOccupiedSlots(form.doctorId, form.date) : [],
    [form.doctorId, form.date]
  );

  const GENDER_MAP: Record<string, number> = { Masculino: 0, Femenino: 1, Otro: 2 };

  const handleSave = async () => {
    if (!form.doctorId || !form.date || !form.time) {
      setConflictError('Selecciona médico, fecha y hora.');
      return;
    }
    setConflictError('');
    setSubmitError('');
    setSubmitting(true);

    const doctorObj = doctors.find((d) => String(d.id) === form.doctorId);
    const patientDoc = foundPatient ? foundPatient.document.replace(/\./g, '') : form.document;
    const patientName = foundPatient ? foundPatient.name : form.names;
    const patientPhone = foundPatient ? foundPatient.phone : form.phone;
    const rawGender = foundPatient ? foundPatient.gender : form.gender;
    const genderValue = GENDER_MAP[rawGender] ?? 0;
    const rawBirth = foundPatient ? foundPatient.birthDate : form.birthDate;
    const birthDateValue = rawBirth ? `${rawBirth}T00:00:00` : null;
    const emailValue = form.email || null;

    const payload = {
      documentId: patientDoc,
      fullName: patientName,
      phone: patientPhone,
      gender: genderValue,
      birthDate: birthDateValue,
      email: emailValue,
      doctorId: doctorObj?.id,
      date: `${form.date}T00:00:00`,
      time: formatTimeForApi(form.time),
    };
    console.log('%c[DailyAgenda] Registrando nueva cita…', 'color:#4285F4', payload);

    try {
      await apiFetch('/api/appointments', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      console.log('%c[DailyAgenda] ✅ Cita registrada exitosamente', 'color:#0F9D58');
      setSaved(true);
      setTimeout(() => { onClose(); onSuccess?.(); }, 1500);
    } catch (err) {
      console.error('[DailyAgenda] ❌ Error al registrar la cita:', err);
      setSubmitError(err instanceof Error ? err.message : 'Error al registrar la cita');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="rounded-2xl overflow-hidden w-full max-w-2xl shadow-2xl" style={{ background: COLORS.white }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ background: COLORS.text }}>
          <div className="flex items-center gap-2">
            <Plus size={18} className="text-white" />
            <h3 className="text-white text-base" style={{ fontWeight: 700 }}>Registrar nueva cita</h3>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {saved ? (
          <div className="p-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: COLORS.greenLight }}>
              <Check size={32} style={{ color: COLORS.green }} />
            </div>
            <p className="text-lg" style={{ color: COLORS.green, fontWeight: 700 }}>¡Cita registrada exitosamente!</p>
          </div>
        ) : (
          <div className="p-5 max-h-[80vh] overflow-y-auto flex flex-col gap-5">
            {/* Patient search */}
            <div>
              <label className="block mb-2" style={{ color: COLORS.text, fontSize: 14, fontWeight: 700 }}>
                Buscar paciente existente
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: COLORS.gray }} />
                  <input
                    type="text"
                    placeholder="Número de documento o nombre completo..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg outline-none"
                    aria-label="Buscar paciente por documento o nombre"
                    style={{ border: `1.5px solid ${COLORS.border}`, fontSize: 14, color: COLORS.text, background: COLORS.bg }}
                  />
                </div>
                <button
                  onClick={handleSearch}
                  className="px-4 py-2.5 rounded-lg text-white hover:opacity-90"
                  style={{ background: COLORS.blue, fontWeight: 600, fontSize: 14 }}
                >
                  Buscar
                </button>
              </div>
            </div>

            {foundPatient && !newPatient && (
              <div className="rounded-xl p-4 flex items-center gap-3" style={{ background: COLORS.greenLight, border: `1px solid ${COLORS.green}40` }}>
                <Check size={18} style={{ color: COLORS.green }} />
                <div>
                  <p style={{ fontWeight: 700, color: COLORS.text, fontSize: 14 }}>{foundPatient.name}</p>
                  <p style={{ fontSize: 12, color: COLORS.textLight }}>Doc: {foundPatient.document} · Tel: {foundPatient.phone} · {foundPatient.age} años</p>
                </div>
              </div>
            )}

            {(newPatient || !foundPatient) && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-px flex-1" style={{ background: COLORS.border }} />
                  <span style={{ fontSize: 12, color: COLORS.gray }}>Registrar nuevo paciente</span>
                  <div className="h-px flex-1" style={{ background: COLORS.border }} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { key: 'document', label: 'Número de documento', placeholder: 'Ej: 1.020.456.789', req: true },
                    { key: 'names', label: 'Nombres y apellidos', placeholder: 'Nombre completo', req: true },
                    { key: 'phone', label: 'Celular', placeholder: 'Ej: 310 234 5678', req: true },
                    { key: 'email', label: 'Correo electrónico', placeholder: 'Ej: correo@ejemplo.com', req: false },
                  ].map((field) => (
                    <div key={field.key}>
                      <label className="block mb-1" style={{ color: COLORS.text, fontSize: 14, fontWeight: 600 }}>
                        {field.label} {field.req && <span style={{ color: COLORS.error }}>*</span>}
                      </label>
                      <input
                        type="text"
                        placeholder={field.placeholder}
                        value={form[field.key as keyof typeof form] as string}
                        onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))}
                        className="w-full px-3 py-2.5 rounded-lg outline-none"
                        style={{ border: `1.5px solid ${COLORS.border}`, fontSize: 14, color: COLORS.text, background: COLORS.bg }}
                      />
                    </div>
                  ))}
                  <div>
                    <label className="block mb-1" style={{ color: COLORS.text, fontSize: 14, fontWeight: 600 }}>Género</label>
                    <div className="relative">
                      <select
                        value={form.gender}
                        onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}
                        className="w-full px-3 py-2.5 rounded-lg outline-none appearance-none"
                        style={{ border: `1.5px solid ${COLORS.border}`, fontSize: 14, color: COLORS.text, background: COLORS.bg }}
                      >
                        <option value="">Seleccionar...</option>
                        <option>Masculino</option>
                        <option>Femenino</option>
                        <option>Otro</option>
                      </select>
                      <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: COLORS.gray }} />
                    </div>
                  </div>
                  <div>
                    <label className="block mb-1" style={{ color: COLORS.text, fontSize: 14, fontWeight: 600 }}>Fecha de nacimiento</label>
                    <input
                      type="date"
                      value={form.birthDate}
                      onChange={(e) => setForm((f) => ({ ...f, birthDate: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-lg outline-none"
                      style={{ border: `1.5px solid ${COLORS.border}`, fontSize: 14, color: COLORS.text, background: COLORS.bg }}
                    />
                  </div>
                  <div>
                    <label className="block mb-1" style={{ color: COLORS.text, fontSize: 14, fontWeight: 600 }}>Edad (automática)</label>
                    <input
                      type="text"
                      value={age ? `${age} años` : ''}
                      readOnly
                      placeholder="Se calcula automáticamente"
                      className="w-full px-3 py-2.5 rounded-lg"
                      style={{ border: `1.5px solid ${COLORS.border}`, fontSize: 14, color: COLORS.textLight, background: COLORS.grayLight, cursor: 'not-allowed' }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Appointment details */}
            <div>
              <p className="text-sm mb-3" style={{ color: COLORS.text, fontWeight: 700 }}>Detalles de la cita</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block mb-1" style={{ color: COLORS.text, fontSize: 14, fontWeight: 600 }}>
                    Médico/Terapista <span style={{ color: COLORS.error }}>*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={form.doctorId}
                      onChange={(e) => {
                        const sel = doctors.find((d) => String(d.id) === e.target.value);
                        setForm((f) => ({ ...f, doctorId: e.target.value, doctor: sel?.name ?? '', time: '' }));
                      }}
                      className="w-full px-3 py-2.5 rounded-lg outline-none appearance-none"
                      style={{ border: `1.5px solid ${COLORS.border}`, fontSize: 14, color: COLORS.text, background: COLORS.bg }}
                    >
                      <option value="">Seleccionar...</option>
                      {doctors.map((d) => (
                        <option key={d.id} value={String(d.id)}>{d.name}</option>
                      ))}
                    </select>
                    <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: COLORS.gray }} />
                  </div>
                </div>
                <div>
                  <label className="block mb-1" style={{ color: COLORS.text, fontSize: 14, fontWeight: 600 }}>
                    Fecha <span style={{ color: COLORS.error }}>*</span>
                  </label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => { setForm((f) => ({ ...f, date: e.target.value, time: '' })); setConflictError(''); }}
                    className="w-full px-3 py-2.5 rounded-lg outline-none"
                    style={{ border: `1.5px solid ${COLORS.border}`, fontSize: 14, color: COLORS.text, background: COLORS.bg }}
                  />
                </div>
                <div>
                  <label className="block mb-1" style={{ color: COLORS.text, fontSize: 14, fontWeight: 600 }}>
                    Hora <span style={{ color: COLORS.error }}>*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={form.time}
                      onChange={(e) => { setForm((f) => ({ ...f, time: e.target.value })); setConflictError(''); }}
                      disabled={dynamicSlots.length === 0}
                      className="w-full px-3 py-2.5 rounded-lg outline-none appearance-none"
                      style={{ border: `1.5px solid ${conflictError ? COLORS.error : COLORS.border}`, fontSize: 14, color: COLORS.text, background: dynamicSlots.length === 0 ? COLORS.grayLight : COLORS.bg }}
                    >
                      <option value="">{dynamicSlots.length === 0 ? 'Seleccione médico y fecha primero' : 'Seleccionar horario...'}</option>
                      {dynamicSlots.map((s) => {
                        const isOccupied = occupiedSlots.includes(s);
                        return (
                          <option key={s} value={s} disabled={isOccupied}>
                            {s}{isOccupied ? ' (Ocupado)' : ''}
                          </option>
                        );
                      })}
                    </select>
                    <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: COLORS.gray }} />
                  </div>
                  {dynamicSlots.length > 0 && (
                    <p className="mt-1" style={{ fontSize: 12, color: COLORS.gray }}>
                      {dynamicSlots.length} franjas · {occupiedSlots.length} ocupadas · {dynamicSlots.length - occupiedSlots.length} disponibles
                    </p>
                  )}
                </div>
              </div>
              {conflictError && (
                <div className="flex items-center gap-2 rounded-lg px-4 py-2.5 mt-3" style={{ background: COLORS.errorLight, color: COLORS.error }}>
                  <AlertCircle size={16} />
                  <span style={{ fontSize: 13 }}>{conflictError}</span>
                </div>
              )}
            </div>

            {/* Observations */}
            <div>
              <label className="block mb-1.5" style={{ color: COLORS.text, fontSize: 14, fontWeight: 600 }}>Observaciones</label>
              <textarea
                rows={2}
                value={form.observations}
                onChange={(e) => setForm((f) => ({ ...f, observations: e.target.value }))}
                placeholder="Motivo de consulta, síntomas, información adicional..."
                className="w-full px-3 py-2.5 rounded-lg outline-none resize-none"
                style={{ border: `1.5px solid ${COLORS.border}`, fontSize: 14, color: COLORS.text, background: COLORS.bg }}
              />
              <label className="flex items-center gap-2.5 mt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.saveToHistory}
                  onChange={(e) => setForm((f) => ({ ...f, saveToHistory: e.target.checked }))}
                  className="w-5 h-5"
                  style={{ accentColor: COLORS.blue }}
                />
                <span style={{ fontSize: 14, color: COLORS.textLight }}>Guardar observación en Historia Clínica</span>
              </label>
            </div>

            {/* Actions */}
            {submitError && (
              <div className="flex items-center gap-2 rounded-lg px-4 py-2.5" style={{ background: COLORS.errorLight, color: COLORS.error }}>
                <AlertCircle size={16} />
                <span style={{ fontSize: 13 }}>{submitError}</span>
              </div>
            )}
            <div className="flex gap-3 pt-2" style={{ borderTop: `1px solid ${COLORS.border}` }}>
              <button
                onClick={onClose}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl border hover:bg-gray-50 transition-colors"
                style={{ borderColor: COLORS.border, color: COLORS.textLight, fontSize: 14, fontWeight: 600 }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl text-white hover:opacity-90 transition-all disabled:opacity-60"
                style={{ background: COLORS.blue, fontSize: 14, fontWeight: 700 }}
              >
                {submitting ? 'Guardando...' : 'Agendar cita'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DailyAgenda() {
  const [modal, setModal] = React.useState<ModalType>(null);
  const [selectedAppt, setSelectedAppt] = React.useState<Appointment | null>(null);
  const [search, setSearch] = React.useState('');
  const [filterDoctor, setFilterDoctor] = React.useState('Todos');
  const [filterType, setFilterType] = React.useState('Todos');
  const [selectedDate, setSelectedDate] = React.useState(() => new Date().toISOString().split('T')[0]);
  const [total, setTotal] = React.useState(0);
  const [appointments, setAppointments] = React.useState<Appointment[]>([]);
  const [loadingAppts, setLoadingAppts] = React.useState(false);
  const [doctorsFromApi, setDoctorsFromApi] = React.useState<{ id: number; name: string; type: string; status: string }[]>([]);
  const [doctorsError, setDoctorsError] = React.useState('');

  React.useEffect(() => {
    setDoctorsError('');
    console.log('%c[DailyAgenda] Cargando médicos desde /api/doctors…', 'color:#4285F4');
    apiFetch('/api/doctors')
      .then((res: unknown) => {
        const list = res as Array<{ id: number; fullName: string; type: string; isActive: boolean }>;
        if (!Array.isArray(list)) {
          console.error('[DailyAgenda] ❌ La respuesta de /api/doctors no es un array:', list);
          setDoctorsError('Respuesta inesperada del servidor al cargar médicos');
          return;
        }
        const seen = new Set<number>();
        setDoctorsFromApi(
          list
            .filter(d => { if (seen.has(d.id)) return false; seen.add(d.id); return true; })
            .map(d => ({
              id: d.id,
              name: d.fullName ?? '',
              type: d.type === 'Doctor' ? 'Médico' : 'Terapista',
              status: d.isActive ? 'Activo' : 'Inactivo',
            }))
        );
        console.log(`%c[DailyAgenda] Médicos cargados: ${list.length} registros`, 'color:#0F9D58');
      })
      .catch((err: unknown) => {
        console.error('[DailyAgenda] ❌ Error al cargar médicos:', err);
        setDoctorsError(err instanceof Error ? err.message : 'Error al cargar médicos');
        setDoctorsFromApi([]);
      });
  }, []);

  React.useEffect(() => {
    setLoadingAppts(true);
    console.log(`%c[DailyAgenda] Cargando citas para la fecha: ${selectedDate}`, 'color:#4285F4');
    apiFetch(`/api/appointments?date=${selectedDate}`)
      .then((res: unknown) => {
        const list = res.appointments as Array<{
          id: number; date: string; time: string; patientName: string;
          documentId: string; phone: string; specialty: string;
          doctorName: string; doctorId: number; observation: string; status: string;
        }>;
        setAppointments(list.sort((a, b) => a.time.localeCompare(b.time)).map(a => ({
          id: a.id,
          date: a.date,
          time: a.time,
          patient: a.patientName,
          document: a.documentId,
          phone: a.phone,
          specialty: a.specialty,
          doctor: a.doctorName,
          doctorId: a.doctorId,
          observation: a.observation,
          status: a.status,
          color: COLORS.blue,
        })));
        console.log(`%c[DailyAgenda] Citas del ${selectedDate}: ${list.length} registros`, 'color:#0F9D58', list);
      })
      .catch((err: unknown) => {
        console.error(`[DailyAgenda] ❌ Error al cargar citas para ${selectedDate}:`, err);
        setAppointments([]);
      })
      .finally(() => setLoadingAppts(false));
  }, [selectedDate]);

  // Build a lookup of doctor name -> type from API doctors
  const doctorTypeMap = React.useMemo(() => {
    const map: Record<string, string> = {};
    doctorsFromApi.forEach((d) => { map[d.name] = d.type; });
    return map;
  }, [doctorsFromApi]);

  // Format selected date for display
  const formattedDate = React.useMemo(() => {
    if (!selectedDate) return '';
    return new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-CO', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });
  }, [selectedDate]);

  const filtered = appointments.filter(
    (a) =>
      (filterDoctor === 'Todos' || a.doctor === filterDoctor) &&
      (filterType === 'Todos' || doctorTypeMap[a.doctor] === filterType) &&
      (a.patient.toLowerCase().includes(search.toLowerCase()) ||
        a.document.includes(search))
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8" style={{ background: COLORS.bg, minHeight: '100vh' }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl" style={{ color: COLORS.text, fontWeight: 800 }}>Agenda Diaria</h1>
          <p style={{ color: COLORS.textLight, fontSize: 14, textTransform: 'capitalize' }}>{formattedDate || 'Selecciona una fecha'}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border hover:bg-gray-50 transition-colors"
            style={{ borderColor: COLORS.border, color: COLORS.textLight, fontSize: 14, fontWeight: 600 }}
          >
            <Download size={16} />
            Exportar CSV
          </button>
          <button
            onClick={() => setModal('new')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white hover:opacity-90 transition-all shadow-md"
            style={{ background: `linear-gradient(135deg, ${COLORS.blue} 0%, ${COLORS.blueDark} 100%)`, fontSize: 14, fontWeight: 700 }}
          >
            <Plus size={18} />
            Nueva cita
          </button>
        </div>
      </div>

      {/* Doctors fetch error */}
      {doctorsError && (
        <div className="flex items-center gap-2 rounded-xl px-4 py-3 mb-4" style={{ background: COLORS.errorLight, color: COLORS.error }}>
          <AlertCircle size={16} />
          <span style={{ fontSize: 14 }}>Médicos: {doctorsError}</span>
        </div>
      )}

      {/* Filters */}
      <div className="rounded-2xl p-4 mb-4 flex flex-col sm:flex-row gap-3" style={{ background: COLORS.white, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: COLORS.gray }} />
          <input
            type="text"
            placeholder="Buscar por paciente o documento..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded-lg outline-none"
            aria-label="Buscar citas por paciente o documento"
            style={{ border: `1.5px solid ${COLORS.border}`, fontSize: 14, color: COLORS.text, background: COLORS.bg }}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={15} style={{ color: COLORS.gray }} />
          <div className="relative">
            <select
              value={filterType}
              onChange={(e) => { setFilterType(e.target.value); setFilterDoctor('Todos'); }}
              className="pl-3 pr-8 py-2.5 rounded-lg outline-none appearance-none"
              aria-label="Filtrar por tipo de profesional"
              style={{ border: `1.5px solid ${COLORS.border}`, fontSize: 14, color: COLORS.text, background: COLORS.bg, minWidth: 160 }}
            >
              <option value="Todos">Médico / Terapista</option>
              <option value="Médico">Médico</option>
              <option value="Terapista">Terapista</option>
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: COLORS.gray }} />
          </div>
          <div className="relative">
            <select
              value={filterDoctor}
              onChange={(e) => setFilterDoctor(e.target.value)}
              className="pl-3 pr-8 py-2.5 rounded-lg outline-none appearance-none"
              aria-label="Filtrar por profesional"
              style={{ border: `1.5px solid ${COLORS.border}`, fontSize: 14, color: COLORS.text, background: COLORS.bg, minWidth: 180 }}
            >
              <option>Todos</option>
              {doctorsFromApi.filter(d => d.status === 'Activo' && (filterType === 'Todos' || d.type === filterType)).map((d) => (
                <option key={d.id}>{d.name}</option>
              ))}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: COLORS.gray }} />
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2.5 rounded-lg outline-none"
            aria-label="Filtrar por fecha"
            style={{ border: `1.5px solid ${COLORS.border}`, fontSize: 14, color: COLORS.text, background: COLORS.bg }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: COLORS.white, boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: COLORS.bg }}>
                {['Hora', 'Paciente', 'Documento', 'Celular', 'Especialidad / Médico', 'Observación', 'Estado', 'Acciones'].map((col) => (
                  <th
                    key={col}
                    className="px-4 py-3 text-left"
                    style={{ fontSize: 13, color: COLORS.gray, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.sort((a, b) => a.time.localeCompare(b.time)).map((appt, idx) => (
                <tr
                  key={appt.id}
                  className="hover:bg-blue-50/30 transition-colors"
                  style={{ borderTop: `1px solid ${COLORS.border}` }}
                >
                  <td className="px-4 py-3">
                    <span style={{ fontSize: 14, fontWeight: 700, color: COLORS.text }}>
                      {new Date(`1970-01-01T${appt.time}`).toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit', hour12: true })}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0"
                        style={{ background: appt.color, fontSize: 11, fontWeight: 700 }}
                      >
                        {appt.patient.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                      </div>
                      <span style={{ fontSize: 14, color: COLORS.text, fontWeight: 500, whiteSpace: 'nowrap' }}>{appt.patient}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span style={{ fontSize: 13, color: COLORS.textLight, fontFamily: 'monospace' }}>{appt.document}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span style={{ fontSize: 13, color: COLORS.textLight }}>{appt.phone}</span>
                  </td>
                  <td className="px-4 py-3">
                    <p style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>{appt.specialty}</p>
                    <p style={{ fontSize: 12, color: COLORS.textLight }}>{appt.doctor.split(' ').slice(0, 3).join(' ')}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span style={{ fontSize: 13, color: COLORS.textLight, maxWidth: 120, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {appt.observation || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="px-2.5 py-1 rounded-full text-xs"
                      style={{
                        background: STATUS_COLORS[appt.status]?.bg,
                        color: STATUS_COLORS[appt.status]?.text,
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {appt.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        title="Ver detalles"
                        aria-label="Ver detalles de la cita"
                        className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-blue-50 transition-colors"
                        style={{ color: COLORS.blue }}
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        title="Re-agendar"
                        aria-label="Re-agendar esta cita"
                        onClick={() => { setSelectedAppt(appt); setModal('reschedule'); }}
                        className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-orange-50 transition-colors"
                        style={{ color: COLORS.warning }}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        title="Exportar"
                        aria-label="Exportar datos de la cita"
                        className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-green-50 transition-colors"
                        style={{ color: COLORS.green }}
                      >
                        <Download size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {loadingAppts ? (
          <div className="text-center py-12">
            <p style={{ color: COLORS.gray }}>Cargando...</p>
          </div>
        ) : total === 0 && (
          <div className="text-center py-12">
            <Calendar size={40} className="mx-auto mb-3" style={{ color: COLORS.gray, opacity: 0.4 }} />
            <p style={{ color: COLORS.gray }}>No hay citas registradas para esta búsqueda</p>
          </div>
        )}

        <div className="px-4 py-3 flex items-center justify-between" style={{ borderTop: `1px solid ${COLORS.border}` }}>
          <span style={{ fontSize: 13, color: COLORS.textLight }}>{total} cita(s) encontrada(s)</span>
          <button className="flex items-center gap-1.5 text-sm hover:text-blue-700 transition-colors" style={{ color: COLORS.blue, fontWeight: 600 }}>
            <RefreshCw size={13} />
            Actualizar
          </button>
        </div>
      </div>

      {/* Modals */}
      {modal === 'new' && (
        <NewAppointmentModal
          onClose={() => setModal(null)}
          doctors={doctorsFromApi}
          onSuccess={() => {
            apiFetch(`/api/appointments?date=${selectedDate}`)
              .then((res: unknown) => {
                const list = res.appointments as Array<{
                  id: number; date: string; time: string; patientName: string;
                  documentId: string; phone: string; specialty: string;
                  doctorName: string; doctorId: number; observation: string; status: string;
                }>;
                setAppointments(list.sort((a, b) => a.time.localeCompare(b.time)).map(a => ({
                  id: a.id,
                  date: a.date,
                  time: a.time,
                  patient: a.patientName,
                  document: a.documentId,
                  phone: a.phone,
                  specialty: a.specialty,
                  doctor: a.doctorName,
                  doctorId: a.doctorId,
                  observation: a.observation,
                  status: a.status,
                  color: COLORS.blue,
                })));
                setTotal(res.total || 0);
              })
              .catch(() => {});
          }}
        />
      )}
      {modal === 'reschedule' && selectedAppt && (
        <RescheduleModal appointment={selectedAppt} onClose={() => { setModal(null); setSelectedAppt(null); }} />
      )}
    </div>
  );
}