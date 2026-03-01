import React from 'react';
import {
  Plus, Search, Filter, Edit2, Eye, ToggleLeft, ToggleRight,
  ChevronDown, X, Check, AlertCircle, Clock
} from 'lucide-react';
import { COLORS, DOCTORS } from '../data/mockData';

const SPECIALTY_COLORS: Record<string, { bg: string; text: string }> = {
  'Terapia Neural': { bg: COLORS.blueLight, text: COLORS.blue },
  'Quiropraxia': { bg: COLORS.greenLight, text: COLORS.green },
  'Fisioterapia': { bg: '#FFF3E0', text: '#E65100' },
};

const DAYS_OF_WEEK = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

interface DoctorFormModalProps {
  doctor?: typeof DOCTORS[0] | null;
  onClose: () => void;
}

function DoctorFormModal({ doctor, onClose }: DoctorFormModalProps) {
  const isEdit = !!doctor;
  const [saved, setSaved] = React.useState(false);
  const [scheduleOpen, setScheduleOpen] = React.useState(false);

  const [form, setForm] = React.useState({
    name: doctor?.name || '',
    type: doctor?.type || 'Médico',
    specialty: doctor?.specialty || '',
    interval: doctor?.interval || 20,
    status: doctor?.status === 'Activo',
    schedule: doctor?.schedule || {} as Record<string, { start: string; end: string }>,
  });

  const [enabledDays, setEnabledDays] = React.useState<Record<string, boolean>>(
    DAYS_OF_WEEK.reduce((acc, day) => ({
      ...acc,
      [day]: !!doctor?.schedule?.[day],
    }), {} as Record<string, boolean>)
  );

  const handleSave = () => {
    setSaved(true);
    setTimeout(onClose, 1500);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="rounded-2xl overflow-hidden w-full max-w-xl shadow-2xl" style={{ background: COLORS.white }}>
        {/* Header */}
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
            <p className="text-lg" style={{ color: COLORS.green, fontWeight: 700 }}>¡Guardado exitosamente!</p>
          </div>
        ) : (
          <div className="p-5 flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
            {/* Name */}
            <div>
              <label className="block mb-1.5" style={{ color: COLORS.text, fontSize: 14, fontWeight: 600 }}>
                Nombres completos <span style={{ color: COLORS.error }}>*</span>
              </label>
              <input
                type="text"
                placeholder="Ej: Dra. Carolina Mendoza"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-lg outline-none"
                style={{ border: `1.5px solid ${COLORS.border}`, fontSize: 14, color: COLORS.text, background: COLORS.bg }}
              />
            </div>

            {/* Type */}
            <div>
              <label className="block mb-1.5" style={{ color: COLORS.text, fontSize: 14, fontWeight: 600 }}>Tipo</label>
              <div className="flex gap-4">
                {['Médico', 'Terapista'].map((type) => (
                  <label key={type} className="flex items-center gap-2 cursor-pointer">
                    <div
                      className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
                      style={{ borderColor: form.type === type ? COLORS.blue : COLORS.border }}
                      onClick={() => setForm((f) => ({ ...f, type }))}
                    >
                      {form.type === type && (
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS.blue }} />
                      )}
                    </div>
                    <span style={{ fontSize: 14, color: COLORS.text }}>{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Specialty */}
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
                  <option>Terapia Neural</option>
                  <option>Quiropraxia</option>
                  <option>Fisioterapia</option>
                </select>
                <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: COLORS.gray }} />
              </div>
            </div>

            {/* Interval */}
            <div>
              <label className="block mb-1.5" style={{ color: COLORS.text, fontSize: 14, fontWeight: 600 }}>
                Intervalo de atención
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={10}
                  max={60}
                  step={5}
                  value={form.interval}
                  onChange={(e) => setForm((f) => ({ ...f, interval: Number(e.target.value) }))}
                  className="w-24 px-4 py-2.5 rounded-lg outline-none text-center"
                  style={{ border: `1.5px solid ${COLORS.border}`, fontSize: 14, color: COLORS.text, background: COLORS.bg, fontWeight: 700 }}
                />
                <span style={{ color: COLORS.textLight, fontSize: 14 }}>minutos por cita</span>
              </div>
              <div className="flex gap-2 mt-2">
                {[15, 20, 30, 45, 60].map((m) => (
                  <button
                    key={m}
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

            {/* Status */}
            <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: COLORS.bg, border: `1px solid ${COLORS.border}` }}>
              <div>
                <p style={{ color: COLORS.text, fontSize: 14, fontWeight: 600 }}>Estado del profesional</p>
                <p style={{ color: COLORS.textLight, fontSize: 12 }}>
                  {form.status ? 'Activo – disponible para citas' : 'Inactivo – no aparece en agendamiento'}
                </p>
              </div>
              <button
                onClick={() => setForm((f) => ({ ...f, status: !f.status }))}
                className="transition-all"
                style={{ color: form.status ? COLORS.green : COLORS.gray }}
              >
                {form.status ? <ToggleRight size={36} /> : <ToggleLeft size={36} />}
              </button>
            </div>

            {/* Schedule collapsible */}
            <div>
              <button
                className="w-full flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={() => setScheduleOpen(!scheduleOpen)}
                style={{ border: `1px solid ${COLORS.border}`, color: COLORS.text, fontSize: 14, fontWeight: 600 }}
              >
                <div className="flex items-center gap-2">
                  <Clock size={15} style={{ color: COLORS.blue }} />
                  Horarios de atención (opcional)
                </div>
                <ChevronDown size={14} className={`transition-transform ${scheduleOpen ? 'rotate-180' : ''}`} style={{ color: COLORS.gray }} />
              </button>

              {scheduleOpen && (
                <div className="mt-2 p-4 rounded-lg flex flex-col gap-2" style={{ background: COLORS.bg, border: `1px solid ${COLORS.border}` }}>
                  {DAYS_OF_WEEK.map((day) => (
                    <div key={day} className="flex items-center gap-3">
                      <label className="flex items-center gap-2 w-28 flex-shrink-0 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={enabledDays[day] || false}
                          onChange={(e) => setEnabledDays((d) => ({ ...d, [day]: e.target.checked }))}
                          style={{ accentColor: COLORS.blue }}
                        />
                        <span style={{ fontSize: 13, color: COLORS.text, fontWeight: 500 }}>{day}</span>
                      </label>
                      {enabledDays[day] && (
                        <div className="flex items-center gap-2">
                          <input
                            type="time"
                            defaultValue={doctor?.schedule?.[day]?.start || '07:00'}
                            className="px-2 py-1.5 rounded outline-none"
                            style={{ border: `1px solid ${COLORS.border}`, fontSize: 13, background: COLORS.white }}
                          />
                          <span style={{ color: COLORS.gray, fontSize: 13 }}>–</span>
                          <input
                            type="time"
                            defaultValue={doctor?.schedule?.[day]?.end || '13:00'}
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
                onClick={handleSave}
                disabled={!form.name || !form.specialty}
                className="flex-1 py-2.5 rounded-xl text-white hover:opacity-90 transition-all disabled:opacity-40"
                style={{ background: COLORS.blue, fontSize: 14, fontWeight: 700 }}
              >
                Guardar
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
  const [editDoctor, setEditDoctor] = React.useState<typeof DOCTORS[0] | null>(null);
  const [search, setSearch] = React.useState('');
  const [filterSpecialty, setFilterSpecialty] = React.useState('Todas');
  const [filterStatus, setFilterStatus] = React.useState('Todos');

  const filtered = DOCTORS.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) &&
      (filterSpecialty === 'Todas' || d.specialty === filterSpecialty) &&
      (filterStatus === 'Todos' || d.status === filterStatus)
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8" style={{ background: COLORS.bg, minHeight: '100vh' }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl" style={{ color: COLORS.text, fontWeight: 800 }}>Médicos y Terapistas</h1>
          <p style={{ color: COLORS.textLight, fontSize: 14 }}>{DOCTORS.length} profesionales registrados</p>
        </div>
        <button
          onClick={() => { setEditDoctor(null); setModal(true); }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white shadow-md hover:opacity-90 transition-all"
          style={{ background: `linear-gradient(135deg, ${COLORS.blue} 0%, ${COLORS.blueDark} 100%)`, fontSize: 14, fontWeight: 700 }}
        >
          <Plus size={18} />
          Agregar médico/terapista
        </button>
      </div>

      {/* Filters */}
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
        <div className="flex items-center gap-2">
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

      {/* Table */}
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
                return (
                  <tr
                    key={doctor.id}
                    className="hover:bg-blue-50/20 transition-colors"
                    style={{ borderTop: `1px solid ${COLORS.border}` }}
                  >
                    {/* Professional */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full overflow-hidden flex-shrink-0" style={{ border: `2px solid ${COLORS.border}` }}>
                          <img src={doctor.photo} alt={doctor.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 700, color: COLORS.text }}>{doctor.name}</p>
                          <p style={{ fontSize: 12, color: COLORS.textLight }}>
                            Disponible: {doctor.nextAvailable}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Type */}
                    <td className="px-5 py-4">
                      <span style={{ fontSize: 13, color: COLORS.text, fontWeight: 500 }}>{doctor.type}</span>
                    </td>

                    {/* Specialty */}
                    <td className="px-5 py-4">
                      <span
                        className="px-2.5 py-1 rounded-full text-xs"
                        style={{ background: spColors.bg, color: spColors.text, fontWeight: 700 }}
                      >
                        {doctor.specialty}
                      </span>
                    </td>

                    {/* Interval */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <Clock size={13} style={{ color: COLORS.gray }} />
                        <span style={{ fontSize: 13, color: COLORS.text }}>{doctor.interval} min</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <span
                        className="px-2.5 py-1.5 rounded-full text-xs flex items-center gap-1.5 w-fit"
                        style={{
                          background: doctor.status === 'Activo' ? COLORS.greenLight : COLORS.grayLight,
                          color: doctor.status === 'Activo' ? COLORS.green : COLORS.gray,
                          fontWeight: 700,
                        }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: doctor.status === 'Activo' ? COLORS.green : COLORS.gray }}
                        />
                        {doctor.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          title="Ver perfil"
                          aria-label="Ver perfil del profesional"
                          className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-blue-50 transition-colors"
                          style={{ color: COLORS.blue }}
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          title="Editar"
                          aria-label="Editar profesional"
                          onClick={() => { setEditDoctor(doctor); setModal(true); }}
                          className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-orange-50 transition-colors"
                          style={{ color: COLORS.warning }}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          title={doctor.status === 'Activo' ? 'Desactivar' : 'Activar'}
                          aria-label={doctor.status === 'Activo' ? 'Desactivar profesional' : 'Activar profesional'}
                          className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors"
                          style={{
                            color: doctor.status === 'Activo' ? COLORS.error : COLORS.green,
                            background: doctor.status === 'Activo' ? COLORS.errorLight : COLORS.greenLight,
                          }}
                        >
                          {doctor.status === 'Activo' ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle size={40} className="mx-auto mb-3" style={{ color: COLORS.gray, opacity: 0.4 }} />
            <p style={{ color: COLORS.gray }}>No hay profesionales que coincidan con los filtros</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <DoctorFormModal
          doctor={editDoctor}
          onClose={() => { setModal(false); setEditDoctor(null); }}
        />
      )}
    </div>
  );
}
