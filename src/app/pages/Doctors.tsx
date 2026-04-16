import React from 'react';
import { apiFetch } from '../services/api';
import {
  Plus, Search, Filter, Edit2, Eye, ToggleLeft, ToggleRight,
  ChevronDown, X, Check, AlertCircle, Clock
} from 'lucide-react';
import { COLORS } from '../data/mockData';

type DoctorSchedule = {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
};

type DoctorItem = {
  id: string;
  fullName: string;
  type: string;
  specialty: string;
  intervalMinutes: number;
  isActive: boolean;
  schedules: DoctorSchedule[];
};

type SchedulingConfigResponse = {
  weeksAhead: number;
  minDate?: string;
  maxDate?: string;
};

const DAYS_OF_WEEK = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'] as const;
type DayLabel = typeof DAYS_OF_WEEK[number];

const DAY_TO_BACKEND: Record<DayLabel, string> = {
  Lunes: 'Monday',
  Martes: 'Tuesday',
  Miércoles: 'Wednesday',
  Jueves: 'Thursday',
  Viernes: 'Friday',
  Sábado: 'Saturday',
};

const BACKEND_TO_DAY: Record<string, DayLabel> = {
  Monday: 'Lunes',
  Tuesday: 'Martes',
  Wednesday: 'Miércoles',
  Thursday: 'Jueves',
  Friday: 'Viernes',
  Saturday: 'Sábado',
};

const SPECIALTY_OPTIONS = [
  { value: 'NeuralTherapy', label: 'Terapia Neural' },
  { value: 'Chiropractic', label: 'Quiropraxia' },
  { value: 'Physiotherapy', label: 'Fisioterapia' },
];

const TYPE_OPTIONS = [
  { value: 'Doctor', label: 'Médico' },
  { value: 'Therapist', label: 'Terapista' },
];

const SPECIALTY_LABELS: Record<string, string> = {
  NeuralTherapy: 'Terapia Neural',
  Chiropractic: 'Quiropraxia',
  Physiotherapy: 'Fisioterapia',
};

const TYPE_LABELS: Record<string, string> = {
  Doctor: 'Médico',
  Therapist: 'Terapista',
};

const SPECIALTY_COLORS: Record<string, { bg: string; text: string }> = {
  NeuralTherapy: { bg: COLORS.blueLight, text: COLORS.blue },
  Chiropractic: { bg: COLORS.greenLight, text: COLORS.green },
  Physiotherapy: { bg: '#FFF3E0', text: '#E65100' },
};

const NAME_MAX_LENGTH = 100;

// Letras (incluye acentos), espacios y ñ/Ñ
const NAME_REGEX = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]+$/;

export function sanitizeNameInput(value: string) {
  return value
    .replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]/g, '')
    .replace(/\s{2,}/g, ' ')
    .slice(0, NAME_MAX_LENGTH);
}

type ScheduleFormState = Partial<Record<DayLabel, { id?: string; start: string; end: string }>>;

interface DoctorFormModalProps {
  doctor?: DoctorItem | null;
  onClose: () => void;
  onSaved: () => Promise<void> | void;
}

function DoctorFormModal({ doctor, onClose, onSaved }: DoctorFormModalProps) {
  const isEdit = !!doctor;
  const [saved, setSaved] = React.useState(false);
  const [scheduleOpen, setScheduleOpen] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [formError, setFormError] = React.useState('');

  const initialScheduleData = React.useMemo<ScheduleFormState>(() => {
    const data: ScheduleFormState = {};
    (doctor?.schedules || []).forEach((s) => {
      const day = BACKEND_TO_DAY[s.dayOfWeek];
      if (day) {
        data[day] = {
          id: s.id,
          start: s.startTime.slice(0, 5),
          end: s.endTime.slice(0, 5),
        };
      }
    });
    return data;
  }, [doctor]);

  const [form, setForm] = React.useState({
    name: doctor?.fullName || '',
    type: doctor?.type || 'Doctor',
    specialty: doctor?.specialty || '',
    interval: doctor?.intervalMinutes || 20,
    status: doctor?.isActive ?? true,
  });

  const [scheduleData, setScheduleData] = React.useState<ScheduleFormState>(initialScheduleData);

  const [enabledDays, setEnabledDays] = React.useState<Record<DayLabel, boolean>>(
    DAYS_OF_WEEK.reduce((acc, day) => {
      acc[day] = !!initialScheduleData[day];
      return acc;
    }, {} as Record<DayLabel, boolean>)
  );

  const validateForm = () => {
    const trimmedName = form.name.trim();

    if (!trimmedName) return 'El nombre es obligatorio.';
    if (trimmedName.length > NAME_MAX_LENGTH) return 'El nombre no puede superar los 100 caracteres.';
    if (!NAME_REGEX.test(trimmedName)) {
      return 'El nombre solo puede contener letras, tildes y espacios.';
    }

    if (!form.specialty) return 'La especialidad es obligatoria.';
    if (!form.interval || form.interval <= 0) return 'El intervalo debe ser mayor a 0.';

    const activeDays = DAYS_OF_WEEK.filter((day) => enabledDays[day]);
    if (activeDays.length === 0) return 'Debes seleccionar al menos un día de atención.';

    for (const day of activeDays) {
      const schedule = scheduleData[day];
      if (!schedule?.start || !schedule?.end) {
        return `Debes definir hora de inicio y fin para ${day}.`;
      }
      if (schedule.end <= schedule.start) {
        return `La hora final debe ser mayor que la hora inicial en ${day}.`;
      }
    }

    return '';
  };

  const createSchedule = async (doctorId: string, day: DayLabel, start: string, end: string) => {
    await apiFetch(`/api/doctors/${doctorId}/schedules`, {
      method: 'POST',
      body: JSON.stringify({
        dayOfWeek: DAY_TO_BACKEND[day],
        startTime: `${start}:00`,
        endTime: `${end}:00`,
      }),
    });
  };

  const deleteSchedule = async (doctorId: string, scheduleId: string) => {
    await apiFetch(`/api/doctors/${doctorId}/schedules/${scheduleId}`, {
      method: 'DELETE',
    });
  };

  const syncSchedules = async (doctorId: string) => {
    const existingSchedules = doctor?.schedules || [];
    const existingByDay = new Map<DayLabel, DoctorSchedule>();

    existingSchedules.forEach((s) => {
      const day = BACKEND_TO_DAY[s.dayOfWeek];
      if (day) existingByDay.set(day, s);
    });

    for (const day of DAYS_OF_WEEK) {
      const isEnabled = enabledDays[day];
      const existing = existingByDay.get(day);
      const data = scheduleData[day];

      if (!isEnabled && existing) {
        await deleteSchedule(doctorId, existing.id);
        continue;
      }

      if (isEnabled && data) {
        if (!existing) {
          await createSchedule(doctorId, day, data.start, data.end);
          continue;
        }

        const oldStart = existing.startTime.slice(0, 5);
        const oldEnd = existing.endTime.slice(0, 5);

        if (oldStart !== data.start || oldEnd !== data.end) {
          await deleteSchedule(doctorId, existing.id);
          await createSchedule(doctorId, day, data.start, data.end);
        }
      }
    }
  };

  const handleSave = async () => {
    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    try {
      setSaving(true);
      setFormError('');

      const createPayload = {
        fullName: form.name.trim(),
        type: form.type,
        specialty: form.specialty,
        appointmentIntervalMinutes: form.interval,
      };

      console.log('Payload doctor:', createPayload);

      let doctorId = doctor?.id;

      if (!doctorId) {
        const created = await apiFetch('/api/doctors', {
          method: 'POST',
          body: JSON.stringify(createPayload),
        }) as { doctorId: string };

        doctorId = created.doctorId;
      } else {
        await apiFetch(`/api/doctors/${doctorId}`, {
          method: 'PUT',
          body: JSON.stringify({
            fullName: form.name.trim(),
            specialty: form.specialty,
            appointmentIntervalMinutes: form.interval,
          }),
        });
      }

      if (!doctorId) throw new Error('No se pudo obtener el id del profesional.');

      await syncSchedules(doctorId);

      const originalStatus = doctor?.isActive ?? true;
      if (form.status !== originalStatus) {
        if (form.status) {
          await apiFetch(`/api/doctors/${doctorId}/activate`, { method: 'POST' });
        } else {
          await apiFetch(`/api/doctors/${doctorId}`, { method: 'DELETE' });
        }
      }

      await onSaved();
      setSaved(true);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Error guardando profesional.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="rounded-2xl overflow-hidden w-full max-w-xl shadow-2xl" style={{ background: COLORS.white }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ background: COLORS.text }}>
          <h3 className="text-white text-base" style={{ fontWeight: 700 }}>
            {isEdit ? 'Editar médico/terapista' : 'Agregar médico/terapista'}
          </h3>
          <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {saved ? (
          <div className="p-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: COLORS.greenLight }}>
              <Check size={32} style={{ color: COLORS.green }} />
            </div>
            <p className="text-lg" style={{ color: COLORS.green, fontWeight: 700 }}>
              ¡Guardado exitosamente!
            </p>
          </div>
        ) : (
          <div className="p-5 flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
            <div>
              <label className="block mb-1.5" style={{ color: COLORS.text, fontSize: 14, fontWeight: 600 }}>
                Nombres completos <span style={{ color: COLORS.error }}>*</span>
              </label>
              <input
                type="text"
                placeholder="Ej: Carolina Mendoza"
                value={form.name}
                maxLength={NAME_MAX_LENGTH}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    name: sanitizeNameInput(e.target.value),
                  }))
                }
                className="w-full px-4 py-2.5 rounded-lg outline-none"
                style={{ border: `1.5px solid ${COLORS.border}`, fontSize: 14, color: COLORS.text, background: COLORS.bg }}
              />
              <p style={{ color: COLORS.textLight, fontSize: 12, marginTop: 6 }}>
                Máximo 100 caracteres. Solo letras y espacios.
              </p>
            </div>

            <div>
              <label className="block mb-1.5" style={{ color: COLORS.text, fontSize: 14, fontWeight: 600 }}>
                Tipo
              </label>
              <div className="flex gap-4">
                {TYPE_OPTIONS.map((type) => (
                  <label key={type.value} className="flex items-center gap-2 cursor-pointer">
                    <div
                      className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
                      style={{ borderColor: form.type === type.value ? COLORS.blue : COLORS.border }}
                      onClick={() => setForm((f) => ({ ...f, type: type.value }))}
                    >
                      {form.type === type.value && (
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS.blue }} />
                      )}
                    </div>
                    <span style={{ fontSize: 14, color: COLORS.text }}>{type.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block mb-1.5" style={{ color: COLORS.text, fontSize: 14, fontWeight: 600 }}>
                Especialidad <span style={{ color: COLORS.error }}>*</span>
              </label>
              <div className="relative">
                <select
                  value={form.specialty}
                  onChange={(e) => setForm((f) => ({ ...f, specialty: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-lg outline-none appearance-none"
                  style={{ border: `1.5px solid ${COLORS.border}`, fontSize: 14, color: COLORS.text, background: COLORS.bg }}
                >
                  <option value="">Seleccionar especialidad...</option>
                  {SPECIALTY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: COLORS.gray }} />
              </div>
            </div>

            <div>
              <label className="block mb-1.5" style={{ color: COLORS.text, fontSize: 14, fontWeight: 600 }}>
                Intervalo de atención
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={5}
                  max={120}
                  step={5}
                  value={form.interval}
                  onChange={(e) => setForm((f) => ({ ...f, interval: Number(e.target.value) }))}
                  className="w-24 px-4 py-2.5 rounded-lg outline-none text-center"
                  style={{ border: `1.5px solid ${COLORS.border}`, fontSize: 14, color: COLORS.text, background: COLORS.bg, fontWeight: 700 }}
                />
                <span style={{ color: COLORS.textLight, fontSize: 14 }}>minutos por cita</span>
              </div>
              <div className="flex gap-2 mt-2 flex-wrap">
                {[15, 20, 30, 45, 60].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, interval: m }))}
                    className="px-2.5 py-1 rounded-lg transition-all"
                    style={{
                      background: form.interval === m ? COLORS.blue : COLORS.grayLight,
                      color: form.interval === m ? 'white' : COLORS.textLight,
                      fontWeight: 600,
                      fontSize: 13,
                    }}
                  >
                    {m} min
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: COLORS.bg, border: `1px solid ${COLORS.border}` }}>
              <div>
                <p style={{ color: COLORS.text, fontSize: 14, fontWeight: 600 }}>Estado del profesional</p>
                <p style={{ color: COLORS.textLight, fontSize: 12 }}>
                  {form.status ? 'Activo – disponible para citas' : 'Inactivo – no aparece en agendamiento'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, status: !f.status }))}
                className="transition-all"
                style={{ color: form.status ? COLORS.green : COLORS.gray }}
              >
                {form.status ? <ToggleRight size={36} /> : <ToggleLeft size={36} />}
              </button>
            </div>

            <div>
              <button
                type="button"
                className="w-full flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={() => setScheduleOpen(!scheduleOpen)}
                style={{ border: `1px solid ${COLORS.border}`, color: COLORS.text, fontSize: 14, fontWeight: 600 }}
              >
                <div className="flex items-center gap-2">
                  <Clock size={15} style={{ color: COLORS.blue }} />
                  Horarios de atención
                </div>
                <ChevronDown size={14} className={`transition-transform ${scheduleOpen ? 'rotate-180' : ''}`} style={{ color: COLORS.gray }} />
              </button>

              {scheduleOpen && (
                <div className="mt-2 p-4 rounded-lg flex flex-col gap-2" style={{ background: COLORS.bg, border: `1px solid ${COLORS.border}` }}>
                  {DAYS_OF_WEEK.map((day) => (
                    <div key={day} className="flex items-center gap-3 flex-wrap">
                      <label className="flex items-center gap-2 w-28 flex-shrink-0 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={enabledDays[day] || false}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setEnabledDays((prev) => ({ ...prev, [day]: checked }));

                            if (checked && !scheduleData[day]) {
                              setScheduleData((prev) => ({
                                ...prev,
                                [day]: { start: '07:00', end: '13:00' },
                              }));
                            }
                          }}
                          style={{ accentColor: COLORS.blue }}
                        />
                        <span style={{ fontSize: 13, color: COLORS.text, fontWeight: 500 }}>{day}</span>
                      </label>

                      {enabledDays[day] && (
                        <div className="flex items-center gap-2">
                          <input
                            type="time"
                            value={scheduleData[day]?.start || '07:00'}
                            onChange={(e) =>
                              setScheduleData((prev) => ({
                                ...prev,
                                [day]: {
                                  ...prev[day],
                                  id: prev[day]?.id,
                                  start: e.target.value,
                                  end: prev[day]?.end || '13:00',
                                },
                              }))
                            }
                            className="px-2 py-1.5 rounded outline-none"
                            style={{ border: `1px solid ${COLORS.border}`, fontSize: 13, background: COLORS.white }}
                          />
                          <span style={{ color: COLORS.gray, fontSize: 13 }}>–</span>
                          <input
                            type="time"
                            value={scheduleData[day]?.end || '13:00'}
                            onChange={(e) =>
                              setScheduleData((prev) => ({
                                ...prev,
                                [day]: {
                                  ...prev[day],
                                  id: prev[day]?.id,
                                  start: prev[day]?.start || '07:00',
                                  end: e.target.value,
                                },
                              }))
                            }
                            className="px-2 py-1.5 rounded outline-none"
                            style={{ border: `1px solid ${COLORS.border}`, fontSize: 13, background: COLORS.white }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {formError && (
              <div
                className="px-3 py-2 rounded-lg"
                style={{ background: COLORS.errorLight, color: COLORS.error, fontSize: 13, fontWeight: 600 }}
              >
                {formError}
              </div>
            )}

            <div className="flex gap-3 pt-2" style={{ borderTop: `1px solid ${COLORS.border}` }}>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border hover:bg-gray-50 transition-colors"
                style={{ borderColor: COLORS.border, color: COLORS.textLight, fontSize: 14, fontWeight: 600 }}
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl text-white hover:opacity-90 transition-all disabled:opacity-40"
                style={{ background: COLORS.blue, fontSize: 14, fontWeight: 700 }}
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Doctors() {
  const [modal, setModal] = React.useState(false);
  const [editDoctor, setEditDoctor] = React.useState<DoctorItem | null>(null);
  const [search, setSearch] = React.useState('');
  const [filterSpecialty, setFilterSpecialty] = React.useState('Todas');
  const [filterStatus, setFilterStatus] = React.useState('Todos');

  const [doctors, setDoctors] = React.useState<DoctorItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  const [weeksAhead, setWeeksAhead] = React.useState(4);
  const [savingWeeks, setSavingWeeks] = React.useState(false);

  const loadDoctors = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await apiFetch('/api/doctors?includeInactive=true') as DoctorItem[];
      setDoctors(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando profesionales.');
    } finally {
      setLoading(false);
    }
  };

  const loadSchedulingConfig = async () => {
    try {
      const data = await apiFetch('/api/scheduling/config') as SchedulingConfigResponse;
      setWeeksAhead(data.weeksAhead ?? 4);
    } catch (err) {
      console.error(err);
    }
  };

  React.useEffect(() => {
    void loadDoctors();
    void loadSchedulingConfig();
  }, []);

  const handleSaveWeeksAhead = async () => {
    try {
      if (!weeksAhead || weeksAhead < 1 || weeksAhead > 30) {
        alert('La ventana de agendamiento debe estar entre 1 y 30 semanas.');
        return;
      }

      setSavingWeeks(true);
      await apiFetch('/api/scheduling/config', {
        method: 'PUT',
        body: JSON.stringify({ weeksAhead }),
      });
      await loadSchedulingConfig();
      alert('Configuración guardada correctamente.');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error guardando configuración.');
    } finally {
      setSavingWeeks(false);
    }
  };

  const filtered = doctors.filter((d) => {
    const matchesSearch = d.fullName.toLowerCase().includes(search.toLowerCase());
    const matchesSpecialty = filterSpecialty === 'Todas' || SPECIALTY_LABELS[d.specialty] === filterSpecialty;
    const matchesStatus =
      filterStatus === 'Todos' ||
      (filterStatus === 'Activo' ? d.isActive : !d.isActive);

    return matchesSearch && matchesSpecialty && matchesStatus;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8" style={{ background: COLORS.bg, minHeight: '100vh' }}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl" style={{ color: COLORS.text, fontWeight: 800 }}>
            Configuración de agenda médica
          </h1>
          <p style={{ color: COLORS.textLight, fontSize: 14 }}>
            {doctors.length} profesionales registrados
          </p>
        </div>

        <button
          onClick={() => {
            setEditDoctor(null);
            setModal(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white shadow-md hover:opacity-90 transition-all"
          style={{ background: `linear-gradient(135deg, ${COLORS.blue} 0%, ${COLORS.blueDark} 100%)`, fontSize: 14, fontWeight: 700 }}
        >
          <Plus size={18} />
          Agregar médico/terapista
        </button>
      </div>

      <div
        className="rounded-2xl p-4 mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        style={{ background: COLORS.white, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}
      >
        <div>
          <h2 style={{ color: COLORS.text, fontWeight: 700 }}>Ventana de agendamiento</h2>
          <p style={{ color: COLORS.textLight, fontSize: 14 }}>
            Define cuántas semanas hacia adelante pueden agendar los pacientes
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <input
            type="number"
            min={1}
            max={30}
            value={weeksAhead}
            onChange={(e) => {
              const value = Number(e.target.value);
              if (Number.isNaN(value)) {
                setWeeksAhead(1);
                return;
              }
              setWeeksAhead(Math.min(30, Math.max(1, value)));
            }}
            className="w-32 px-4 py-2.5 rounded-lg outline-none"
            style={{
              border: `1.5px solid ${COLORS.border}`,
              fontSize: 14,
              color: COLORS.text,
              background: COLORS.bg,
            }}
          />
          <button
            onClick={handleSaveWeeksAhead}
            disabled={savingWeeks}
            className="px-4 py-2 rounded-xl text-white disabled:opacity-50"
            style={{ background: COLORS.blue, fontWeight: 700 }}
          >
            {savingWeeks ? 'Guardando...' : 'Guardar'}
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">

      <span style={{ color: COLORS.textLight, fontSize: 12 }}>
        Valor permitido: de 1 a 30 semanas
      </span>
    </div>
        </div>
      </div>

      <div className="rounded-2xl p-4 mb-4 flex flex-col sm:flex-row gap-3" style={{ background: COLORS.white, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: COLORS.gray }} />
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded-lg outline-none"
            aria-label="Buscar profesional por nombre"
            style={{ border: `1.5px solid ${COLORS.border}`, fontSize: 14, color: COLORS.text, background: COLORS.bg }}
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={15} style={{ color: COLORS.gray }} />

          <div className="relative">
            <select
              value={filterSpecialty}
              onChange={(e) => setFilterSpecialty(e.target.value)}
              className="pl-3 pr-7 py-2.5 rounded-lg outline-none appearance-none"
              aria-label="Filtrar por especialidad"
              style={{ border: `1.5px solid ${COLORS.border}`, fontSize: 14, color: COLORS.text, background: COLORS.bg, minWidth: 150 }}
            >
              <option>Todas</option>
              <option>Terapia Neural</option>
              <option>Quiropraxia</option>
              <option>Fisioterapia</option>
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: COLORS.gray }} />
          </div>

          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-3 pr-7 py-2.5 rounded-lg outline-none appearance-none"
              aria-label="Filtrar por estado"
              style={{ border: `1.5px solid ${COLORS.border}`, fontSize: 14, color: COLORS.text, background: COLORS.bg, minWidth: 110 }}
            >
              <option>Todos</option>
              <option>Activo</option>
              <option>Inactivo</option>
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: COLORS.gray }} />
          </div>
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: COLORS.white, boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: COLORS.bg }}>
                {['Profesional', 'Tipo', 'Especialidad', 'Intervalo', 'Estado', 'Acciones'].map((col) => (
                  <th
                    key={col}
                    className="px-5 py-3 text-left"
                    style={{ fontSize: 13, color: COLORS.gray, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filtered.map((doctor) => {
                const spColors = SPECIALTY_COLORS[doctor.specialty] || { bg: COLORS.grayLight, text: COLORS.gray };
                const enabledScheduleCount = doctor.schedules.length;

                return (
                  <tr
                    key={doctor.id}
                    className="hover:bg-blue-50/20 transition-colors"
                    style={{ borderTop: `1px solid ${COLORS.border}` }}
                  >
                    <td className="px-5 py-4">
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 700, color: COLORS.text }}>{doctor.fullName}</p>
                        <p style={{ fontSize: 12, color: COLORS.textLight }}>
                          {enabledScheduleCount} día(s) configurado(s)
                        </p>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span style={{ fontSize: 13, color: COLORS.text, fontWeight: 500 }}>
                        {TYPE_LABELS[doctor.type] || doctor.type}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className="px-2.5 py-1 rounded-full text-xs"
                        style={{ background: spColors.bg, color: spColors.text, fontWeight: 700 }}
                      >
                        {SPECIALTY_LABELS[doctor.specialty] || doctor.specialty}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <Clock size={13} style={{ color: COLORS.gray }} />
                        <span style={{ fontSize: 13, color: COLORS.text }}>{doctor.intervalMinutes} min</span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className="px-2.5 py-1.5 rounded-full text-xs flex items-center gap-1.5 w-fit"
                        style={{
                          background: doctor.isActive ? COLORS.greenLight : COLORS.grayLight,
                          color: doctor.isActive ? COLORS.green : COLORS.gray,
                          fontWeight: 700,
                        }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: doctor.isActive ? COLORS.green : COLORS.gray }}
                        />
                        {doctor.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          title="Ver configuración"
                          aria-label="Ver configuración del profesional"
                          className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-blue-50 transition-colors"
                          style={{ color: COLORS.blue }}
                          onClick={() => {
                            setEditDoctor(doctor);
                            setModal(true);
                          }}
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          title="Editar"
                          aria-label="Editar profesional"
                          onClick={() => {
                            setEditDoctor(doctor);
                            setModal(true);
                          }}
                          className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-orange-50 transition-colors"
                          style={{ color: COLORS.warning }}
                        >
                          <Edit2 size={16} />
                        </button>

                        <button
                          title={doctor.isActive ? 'Desactivar' : 'Activar'}
                          aria-label={doctor.isActive ? 'Desactivar profesional' : 'Activar profesional'}
                          onClick={async () => {
                            try {
                              if (doctor.isActive) {
                                await apiFetch(`/api/doctors/${doctor.id}`, { method: 'DELETE' });
                              } else {
                                await apiFetch(`/api/doctors/${doctor.id}/activate`, { method: 'POST' });
                              }
                              await loadDoctors();
                            } catch (err) {
                              alert(err instanceof Error ? err.message : 'Error actualizando estado.');
                            }
                          }}
                          className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors"
                          style={{
                            color: doctor.isActive ? COLORS.error : COLORS.green,
                            background: doctor.isActive ? COLORS.errorLight : COLORS.greenLight,
                          }}
                        >
                          {doctor.isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {!loading && filtered.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle size={40} className="mx-auto mb-3" style={{ color: COLORS.gray, opacity: 0.4 }} />
            <p style={{ color: COLORS.gray }}>
              {error || 'No hay profesionales que coincidan con los filtros'}
            </p>
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <p style={{ color: COLORS.gray }}>Cargando profesionales...</p>
          </div>
        )}
      </div>

      {modal && (
        <DoctorFormModal
          doctor={editDoctor}
          onClose={() => {
            setModal(false);
            setEditDoctor(null);
          }}
          onSaved={async () => {
            await loadDoctors();
            await loadSchedulingConfig();
          }}
        />
      )}
    </div>
  );
}