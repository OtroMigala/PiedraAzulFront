import React from 'react';
import {
  Search, ChevronDown, Calendar,
  RefreshCw, Filter, X, AlertCircle,
} from 'lucide-react';
import { COLORS } from '../data/mockData';
import { apiFetch } from '../services/api';

// Valores de status según la guía de API del backend
const STATUS_LABELS: Record<string, string> = {
  Scheduled:   'Agendada',
  Completed:   'Completada',
  Cancelled:   'Cancelada',
  Rescheduled: 'Reprogramada',
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  Scheduled:   { bg: '#E3F2FD',          text: COLORS.blue  },
  Completed:   { bg: COLORS.greenLight,  text: COLORS.green },
  Cancelled:   { bg: COLORS.errorLight,  text: COLORS.error },
  Rescheduled: { bg: '#FFF9C4',          text: '#F57F17'    },
};

// Especialidades según la guía de API del backend
const SPECIALTY_LABELS: Record<string, string> = {
  NeuralTherapy:  'Terapia Neural',
  Chiropractic:   'Quiropraxia',
  Physiotherapy:  'Fisioterapia',
};

interface Appointment {
  id: string;
  patientName: string;
  documentId: string;
  time: string;
  specialty: string;
  status: string;
}

// id es UUID (string) según la guía de API del backend
interface Doctor {
  id: string;
  fullName: string;
}

interface AppointmentsResponse {
  message: string;
  total: number;
  appointments: Appointment[];
}

export default function AppointmentsByDoctor() {
  const [selectedDoctorId, setSelectedDoctorId] = React.useState<string>('');
  const [selectedDate, setSelectedDate] = React.useState(() => new Date().toISOString().split('T')[0]);

  const [appointments, setAppointments] = React.useState<Appointment[]>([]);
  const [total, setTotal] = React.useState(0);
  const [message, setMessage] = React.useState('');

  const [doctors, setDoctors] = React.useState<Doctor[]>([]);
  const [loadingDoctors, setLoadingDoctors] = React.useState(true);
  const [doctorsError, setDoctorsError] = React.useState('');

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  // Término de búsqueda — se envía al backend como parámetro ?search=
  const [searchTerm, setSearchTerm] = React.useState('');

  // Indica si ya se realizó al menos una búsqueda (controla visibilidad del buscador)
  const [hasFetched, setHasFetched] = React.useState(false);

  // Cargar lista de médicos activos al montar (el backend solo retorna IsActive = true)
  React.useEffect(() => {
    console.log('[AppointmentsByDoctor] Cargando lista de doctores...');
    setLoadingDoctors(true);
    apiFetch('/api/doctors')
      .then((data: Doctor[]) => {
        console.log(`[AppointmentsByDoctor] ✅ ${data?.length || 0} doctores cargados`);
        setDoctors(data || []);
        setDoctorsError('');
      })
      .catch((err) => {
        console.error('[AppointmentsByDoctor] ❌ Error cargando doctores:', err);
        setDoctorsError('No se pudieron cargar los profesionales.');
        setDoctors([]);
      })
      .finally(() => setLoadingDoctors(false));
  }, []);

  // Función principal de búsqueda — recibe los parámetros explícitamente para evitar stale closures
  const fetchAppointments = React.useCallback((doctorId: string, date: string, search: string) => {
    if (!doctorId || !date) return;

    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    if (new Date(date + 'T00:00:00') < oneYearAgo) {
      console.warn('[AppointmentsByDoctor] ⚠️ Fecha anterior a 1 año:', date);
      setError('La fecha no puede ser anterior a 1 año desde hoy.');
      setAppointments([]);
      setTotal(0);
      setMessage('');
      return;
    }

    // Construir URL con parámetro search opcional (búsqueda server-side según guía de API)
    const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
    const url = `/api/appointments/by-doctor?doctorId=${doctorId}&date=${date}${searchParam}`;

    console.log(`[AppointmentsByDoctor] 🔍 Buscando - Doctor: ${doctorId}, Fecha: ${date}${search ? `, Búsqueda: "${search}"` : ''}`);
    setLoading(true);
    setError('');
    setMessage('');

    apiFetch(url)
      .then((data: AppointmentsResponse) => {
        console.log(`[AppointmentsByDoctor] ✅ ${data.total || 0} citas encontradas`);
        setAppointments(data.appointments || []);
        setTotal(data.total || 0);
        setMessage(data.message || '');
        setHasFetched(true);
      })
      .catch((err) => {
        console.error('[AppointmentsByDoctor] ❌ Error cargando citas:', err);
        setError('Error al cargar las citas. Verifique la conexión e intente de nuevo.');
        setAppointments([]);
        setTotal(0);
        setMessage('');
      })
      .finally(() => setLoading(false));
  }, []);

  // Al cambiar médico o fecha: resetea el buscador y lanza una búsqueda nueva
  React.useEffect(() => {
    if (selectedDoctorId && selectedDate) {
      setSearchTerm('');
      fetchAppointments(selectedDoctorId, selectedDate, '');
    }
  }, [selectedDoctorId, selectedDate]);

  // Al escribir en el buscador: espera 400ms y llama al backend con ?search=
  React.useEffect(() => {
    if (!selectedDoctorId || !selectedDate || searchTerm === '') return;
    const timer = setTimeout(() => {
      fetchAppointments(selectedDoctorId, selectedDate, searchTerm);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedDoctorId, selectedDate]);

  const formattedDate = React.useMemo(() => {
    if (!selectedDate) return '';
    return new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-CO', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });
  }, [selectedDate]);

  return (
    <div className="p-4 sm:p-6 lg:p-8" style={{ background: COLORS.bg, minHeight: '100vh' }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl" style={{ color: COLORS.text, fontWeight: 800 }}>Citas por Profesional</h1>
          <p style={{ color: COLORS.textLight, fontSize: 14 }}>Consulta las citas agendadas para un médico en una fecha específica.</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="rounded-2xl p-4 mb-4 flex flex-col sm:flex-row gap-3" style={{ background: COLORS.white, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
        <div className="flex items-center gap-2 flex-1">
          <Filter size={15} style={{ color: COLORS.gray }} />
          <div className="relative">
            <select
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              className="pl-3 pr-8 py-2.5 rounded-lg outline-none appearance-none"
              aria-label="Seleccionar profesional"
              style={{ border: `1.5px solid ${doctorsError ? COLORS.error : COLORS.border}`, fontSize: 14, color: COLORS.text, background: COLORS.bg, minWidth: 220 }}
              disabled={loadingDoctors}
            >
              <option value="">{loadingDoctors ? 'Cargando...' : 'Seleccione un profesional'}</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>{d.fullName}</option>
              ))}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: COLORS.gray }} />
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2.5 rounded-lg outline-none"
            aria-label="Seleccionar fecha"
            style={{ border: `1.5px solid ${COLORS.border}`, fontSize: 14, color: COLORS.text, background: COLORS.bg }}
          />
        </div>
        <button
          onClick={() => fetchAppointments(selectedDoctorId, selectedDate, searchTerm)}
          disabled={loading || !selectedDoctorId || !selectedDate}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-white hover:opacity-90 transition-all shadow-md disabled:opacity-50"
          style={{ background: `linear-gradient(135deg, ${COLORS.blue} 0%, ${COLORS.blueDark} 100%)`, fontSize: 14, fontWeight: 700 }}
        >
          {loading ? <RefreshCw size={16} className="animate-spin" /> : <Search size={16} />}
          Buscar Citas
        </button>
      </div>

      {/* Mensajes de error */}
      {doctorsError && (
        <div className="flex items-center gap-2 rounded-xl px-4 py-3 mb-4" style={{ background: COLORS.errorLight, color: COLORS.error }}>
          <AlertCircle size={16} />
          <span style={{ fontSize: 14 }}>{doctorsError}</span>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 rounded-xl px-4 py-3 mb-4" style={{ background: COLORS.errorLight, color: COLORS.error }}>
          <AlertCircle size={16} />
          <span style={{ fontSize: 14 }}>{error}</span>
        </div>
      )}

      {/* Buscador en tabla — visible tras la primera búsqueda exitosa
          Al escribir, envía ?search= al backend (búsqueda server-side) */}
      {hasFetched && !error && (
        <div className="rounded-2xl p-4 mb-4" style={{ background: COLORS.white, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center gap-2">
            <Search size={18} style={{ color: COLORS.gray }} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre o documento del paciente..."
              className="flex-1 px-3 py-2 rounded-lg outline-none"
              style={{ border: `1.5px solid ${COLORS.border}`, fontSize: 14, color: COLORS.text, background: COLORS.bg }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Limpiar búsqueda"
              >
                <X size={16} style={{ color: COLORS.gray }} />
              </button>
            )}
          </div>
          {searchTerm && (
            <p style={{ fontSize: 13, color: COLORS.textLight, marginTop: 8 }}>
              {loading ? 'Buscando...' : `${total} resultado(s) para "${searchTerm}"`}
            </p>
          )}
        </div>
      )}

      {/* Tabla — el backend ya devuelve las citas ordenadas por hora */}
      <div className="rounded-2xl overflow-hidden" style={{ background: COLORS.white, boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
        <div className="overflow-x-auto">
          {appointments.length > 0 && (
            <table className="w-full">
              <thead>
                <tr style={{ background: COLORS.bg }}>
                  {['Hora', 'Paciente', 'Documento', 'Tipo de atención', 'Estado'].map((col) => (
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
                {appointments.map((appt) => (
                  <tr
                    key={appt.id}
                    className="hover:bg-blue-50/30 transition-colors"
                    style={{ borderTop: `1px solid ${COLORS.border}` }}
                  >
                    <td className="px-4 py-3">
                      <span style={{ fontSize: 14, fontWeight: 700, color: COLORS.text }}>{appt.time}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span style={{ fontSize: 14, color: COLORS.text, fontWeight: 500, whiteSpace: 'nowrap' }}>{appt.patientName}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span style={{ fontSize: 13, color: COLORS.textLight, fontFamily: 'monospace' }}>{appt.documentId}</span>
                    </td>
                    <td className="px-4 py-3">
                      <p style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>
                        {SPECIALTY_LABELS[appt.specialty] ?? appt.specialty}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="px-2.5 py-1 rounded-full text-xs"
                        style={{
                          background: STATUS_COLORS[appt.status]?.bg ?? COLORS.grayLight,
                          color: STATUS_COLORS[appt.status]?.text ?? COLORS.gray,
                          fontWeight: 700,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {STATUS_LABELS[appt.status] ?? appt.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {loading && (
          <div className="text-center py-12">
            <RefreshCw size={24} className="animate-spin mx-auto mb-2" style={{ color: COLORS.gray }} />
            <p style={{ color: COLORS.gray, fontSize: 14 }}>Buscando citas...</p>
          </div>
        )}

        {!loading && total === 0 && selectedDoctorId && selectedDate && !error && hasFetched && (
          <div className="text-center py-16">
            <Calendar size={48} className="mx-auto mb-3" style={{ color: COLORS.gray, opacity: 0.3 }} />
            <p style={{ color: COLORS.text, fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
              No hay citas registradas para esta búsqueda
            </p>
            <p style={{ color: COLORS.textLight, fontSize: 14 }}>
              {message || 'Intente con otro profesional o fecha'}
            </p>
          </div>
        )}

        <div className="px-4 py-3 flex items-center justify-between" style={{ borderTop: `1px solid ${COLORS.border}` }}>
          <span style={{ fontSize: 13, color: COLORS.textLight }}>
            {total} cita(s) encontradas
          </span>
          <button
            onClick={() => fetchAppointments(selectedDoctorId, selectedDate, searchTerm)}
            disabled={loading || !selectedDoctorId || !selectedDate}
            className="flex items-center gap-1.5 text-sm hover:text-blue-700 transition-colors disabled:opacity-50"
            style={{ color: COLORS.blue, fontWeight: 600 }}
          >
            <RefreshCw size={13} />
            Actualizar
          </button>
        </div>
      </div>
    </div>
  );
}
