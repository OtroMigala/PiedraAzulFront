import React from 'react';
import {
  Plus, Search, Filter, ChevronDown, Shield, Lock,
  X, Check, AlertTriangle, Calendar, User, Tag,
  FileText, Clock, Brain, Bone, Activity
} from 'lucide-react';
import { COLORS, MEDICAL_HISTORY, PATIENTS, DOCTORS } from '../data/mockData';

const SPECIALTY_ICONS: Record<string, React.ReactNode> = {
  'Terapia Neural': <Brain size={14} />,
  'Quiropraxia': <Bone size={14} />,
  'Fisioterapia': <Activity size={14} />,
};

const SPECIALTY_COLORS: Record<string, { bg: string; text: string }> = {
  'Terapia Neural': { bg: COLORS.blueLight, text: COLORS.blue },
  'Quiropraxia': { bg: COLORS.greenLight, text: COLORS.green },
  'Fisioterapia': { bg: '#FFF3E0', text: '#E65100' },
};

interface AddControlModalProps {
  patient: typeof PATIENTS[0];
  onClose: () => void;
}

function AddControlModal({ patient, onClose }: AddControlModalProps) {
  const [description, setDescription] = React.useState('');
  const [saved, setSaved] = React.useState(false);
  const MIN_CHARS = 20;
  const charCount = description.length;
  const isValid = charCount >= MIN_CHARS;

  const handleSave = () => {
    if (!isValid) return;
    setSaved(true);
    setTimeout(onClose, 1800);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
      <div className="rounded-2xl overflow-hidden w-full max-w-lg shadow-2xl" style={{ background: COLORS.white }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ background: COLORS.text }}>
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-white" />
            <h3 className="text-white text-base" style={{ fontWeight: 700 }}>Registrar control médico</h3>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {saved ? (
          <div className="p-10 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: COLORS.greenLight }}>
              <Check size={32} style={{ color: COLORS.green }} />
            </div>
            <p className="text-lg" style={{ color: COLORS.green, fontWeight: 700 }}>¡Control registrado!</p>
            <p style={{ color: COLORS.textLight, fontSize: 14, marginTop: 4 }}>El registro ha sido guardado de forma permanente</p>
          </div>
        ) : (
          <div className="p-5 flex flex-col gap-4">
            {/* Read-only info */}
            <div className="rounded-xl p-4" style={{ background: COLORS.bg, border: `1px solid ${COLORS.border}` }}>
              <p className="text-xs mb-3" style={{ color: COLORS.gray, textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>
                Información de la cita (solo lectura)
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Paciente', value: patient.name },
                  { label: 'Fecha y hora', value: '20 Feb 2025, 9:20 AM' },
                  { label: 'Médico', value: 'Dra. Carolina Mendoza' },
                  { label: 'Especialidad', value: 'Terapia Neural' },
                ].map((item) => (
                  <div key={item.label}>
                    <p style={{ fontSize: 11, color: COLORS.gray, fontWeight: 600, textTransform: 'uppercase' }}>{item.label}</p>
                    <p style={{ fontSize: 14, color: COLORS.text, fontWeight: 600 }}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block mb-1.5" style={{ color: COLORS.text, fontSize: 14, fontWeight: 600 }}>
                Descripción del procedimiento <span style={{ color: COLORS.error }}>*</span>
              </label>
              <textarea
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe detalladamente el procedimiento realizado, la respuesta del paciente, observaciones clínicas relevantes..."
                className="w-full px-4 py-3 rounded-xl outline-none resize-none transition-all"
                style={{
                  border: `1.5px solid ${isValid ? COLORS.green : charCount > 0 ? COLORS.border : COLORS.border}`,
                  fontSize: 14,
                  color: COLORS.text,
                  background: COLORS.bg,
                  lineHeight: 1.6,
                }}
              />

              {/* Char counter */}
              <div className="flex items-center justify-between mt-1.5">
                <div>
                  {charCount > 0 && charCount < MIN_CHARS && (
                    <p style={{ fontSize: 13, color: COLORS.warning }}>
                      Mínimo {MIN_CHARS} caracteres ({MIN_CHARS - charCount} restantes)
                    </p>
                  )}
                  {isValid && (
                    <p className="flex items-center gap-1" style={{ fontSize: 13, color: COLORS.green }}>
                      <Check size={12} /> Descripción válida
                    </p>
                  )}
                </div>
                <span style={{ fontSize: 12, color: isValid ? COLORS.green : COLORS.gray, fontWeight: 600 }}>
                  {charCount} caracteres
                </span>
              </div>
            </div>

            {/* Immutability warning */}
            <div className="flex items-start gap-3 p-4 rounded-xl" style={{ background: '#FFF3E0', border: `1px solid #FFCC80` }}>
              <AlertTriangle size={18} style={{ color: COLORS.warning, flexShrink: 0, marginTop: 1 }} />
              <div>
                <p style={{ color: '#E65100', fontWeight: 700, fontSize: 14 }}>Una vez guardado, no se puede cambiar</p>
                <p style={{ color: '#5D4037', fontSize: 13, lineHeight: 1.5 }}>
                  Este registro <strong>no podrá modificarse</strong> una vez guardado. Asegúrate de que la información sea correcta y completa antes de continuar.
                </p>
              </div>
            </div>

            {/* Security badge */}
            <div className="flex items-center gap-2 justify-center py-2" style={{ borderTop: `1px solid ${COLORS.border}` }}>
              <Lock size={13} style={{ color: COLORS.gray }} />
              <span style={{ fontSize: 12, color: COLORS.gray }}>Historia clínica protegida · Acceso solo para profesionales autorizados</span>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border hover:bg-gray-50 transition-colors"
                style={{ borderColor: COLORS.border, color: COLORS.textLight, fontSize: 14, fontWeight: 600 }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={!isValid}
                className="flex-1 py-2.5 rounded-xl text-white hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ background: COLORS.green, fontSize: 14, fontWeight: 700 }}
              >
                <Shield size={15} />
                Guardar control
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MedicalHistory() {
  const [showModal, setShowModal] = React.useState(false);
  const [selectedPatient, setSelectedPatient] = React.useState(PATIENTS[0]);
  const [filterSpecialty, setFilterSpecialty] = React.useState('Todas');
  const [search, setSearch] = React.useState('');

  const filteredHistory = MEDICAL_HISTORY.filter(
    (h) => filterSpecialty === 'Todas' || h.specialty === filterSpecialty
  );

  const age = new Date().getFullYear() - new Date(selectedPatient.birthDate).getFullYear();
  const lastControl = MEDICAL_HISTORY[0]?.date ? new Date(MEDICAL_HISTORY[0].date).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';

  return (
    <div className="p-4 sm:p-6 lg:p-8" style={{ background: COLORS.bg, minHeight: '100vh' }}>
      {/* Security banner */}
      <div className="flex items-center gap-3 p-3 rounded-xl mb-6" style={{ background: '#E3F2FD', border: `1px solid ${COLORS.blue}30` }}>
        <Lock size={16} style={{ color: COLORS.blue }} />
        <p style={{ fontSize: 13, color: COLORS.blue, fontWeight: 600 }}>
          Historia Clínica – Acceso restringido solo a Médicos y Terapistas autorizados. Los registros no se pueden modificar una vez guardados.
        </p>
      </div>

      {/* Patient search */}
      <div className="rounded-2xl p-5 mb-6" style={{ background: COLORS.white, boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
        <h2 className="text-base mb-3" style={{ color: COLORS.text, fontWeight: 700 }}>Buscar paciente</h2>
        <div className="flex gap-2">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: COLORS.gray }} />
            <input
              type="text"
              placeholder="Nombre o número de documento..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-lg outline-none"
              aria-label="Buscar paciente por nombre o documento"
              style={{ border: `1.5px solid ${COLORS.border}`, fontSize: 14, color: COLORS.text, background: COLORS.bg }}
            />
          </div>
          <button
            className="px-4 py-2.5 rounded-lg text-white hover:opacity-90"
            style={{ background: COLORS.blue, fontWeight: 600, fontSize: 14 }}
          >
            Buscar
          </button>
        </div>

        {/* Quick patient list */}
        <div className="flex gap-2 mt-3 flex-wrap">
          {PATIENTS.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPatient(p)}
              className="flex items-center gap-2 px-3 py-2 rounded-full border transition-all"
              style={{
                borderColor: selectedPatient.id === p.id ? COLORS.blue : COLORS.border,
                background: selectedPatient.id === p.id ? COLORS.blueLight : COLORS.white,
                color: selectedPatient.id === p.id ? COLORS.blue : COLORS.textLight,
                fontSize: 13,
                fontWeight: selectedPatient.id === p.id ? 700 : 400,
              }}
            >
              <User size={13} />
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Patient header */}
        <div className="xl:col-span-1">
          <div className="rounded-2xl overflow-hidden" style={{ background: COLORS.white, boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
            {/* Top bar */}
            <div className="py-4 px-5" style={{ background: `linear-gradient(135deg, ${COLORS.text} 0%, #1a2a3a 100%)` }}>
              <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3 mx-auto"
                style={{ background: COLORS.blue, border: '3px solid rgba(255,255,255,0.3)' }}>
                <span className="text-white text-lg" style={{ fontWeight: 800 }}>
                  {selectedPatient.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                </span>
              </div>
              <h3 className="text-white text-center text-sm" style={{ fontWeight: 700 }}>{selectedPatient.name}</h3>
            </div>

            <div className="p-5 flex flex-col gap-3">
              {[
                { label: 'Documento', value: selectedPatient.document },
                { label: 'Teléfono', value: selectedPatient.phone },
                { label: 'Género', value: selectedPatient.gender },
                { label: 'Edad', value: `${age} años` },
                { label: 'Último control', value: lastControl },
                { label: 'Total controles', value: `${MEDICAL_HISTORY.length} registros` },
              ].map((item) => (
                <div key={item.label} className="flex flex-col">
                  <span style={{ fontSize: 11, color: COLORS.gray, textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>
                    {item.label}
                  </span>
                  <span style={{ fontSize: 14, color: COLORS.text, fontWeight: 600 }}>{item.value}</span>
                </div>
              ))}
            </div>

            {/* Add control button */}
            <div className="px-5 pb-5">
              <button
                onClick={() => setShowModal(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white hover:opacity-90 transition-all"
                style={{ background: COLORS.green, fontSize: 14, fontWeight: 700 }}
              >
                <Plus size={16} />
                Agregar control médico
              </button>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="xl:col-span-3">
          <div className="rounded-2xl overflow-hidden" style={{ background: COLORS.white, boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${COLORS.border}` }}>
              <h2 className="text-base" style={{ color: COLORS.text, fontWeight: 700 }}>
                Historial de controles médicos
              </h2>
              <div className="flex items-center gap-2">
                <Filter size={15} style={{ color: COLORS.gray }} />
                <div className="relative">
                  <select
                    value={filterSpecialty}
                    onChange={(e) => setFilterSpecialty(e.target.value)}
                    className="pl-3 pr-7 py-2 rounded-lg outline-none appearance-none"
                    aria-label="Filtrar por especialidad"
                    style={{ border: `1px solid ${COLORS.border}`, fontSize: 14, color: COLORS.text, background: COLORS.bg }}
                  >
                    <option>Todas</option>
                    <option>Terapia Neural</option>
                    <option>Quiropraxia</option>
                    <option>Fisioterapia</option>
                  </select>
                  <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: COLORS.gray }} />
                </div>
              </div>
            </div>

            {/* History entries */}
            <div className="p-5 flex flex-col gap-4">
              {filteredHistory.map((entry, idx) => {
                const spColors = SPECIALTY_COLORS[entry.specialty] || { bg: COLORS.grayLight, text: COLORS.gray };
                const date = new Date(entry.date);
                return (
                  <div key={entry.id} className="flex gap-4">
                    {/* Timeline line */}
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center"
                        style={{ background: spColors.bg, color: spColors.text, border: `2px solid ${spColors.text}30` }}
                      >
                        {SPECIALTY_ICONS[entry.specialty]}
                      </div>
                      {idx < filteredHistory.length - 1 && (
                        <div className="w-px flex-1 mt-2" style={{ background: COLORS.border, minHeight: 32 }} />
                      )}
                    </div>

                    {/* Card */}
                    <div
                      className="flex-1 rounded-2xl p-4 mb-2 transition-all hover:shadow-md"
                      style={{ border: `1px solid ${COLORS.border}`, background: COLORS.white }}
                    >
                      <div className="flex items-start justify-between flex-wrap gap-2 mb-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span style={{ fontSize: 14, fontWeight: 700, color: COLORS.text }}>
                              {date.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                            <span style={{ fontSize: 12, color: COLORS.gray }}>·</span>
                            <span style={{ fontSize: 13, color: COLORS.textLight }}>
                              {date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-1">
                            <User size={12} style={{ color: COLORS.gray }} />
                            <span style={{ fontSize: 13, color: COLORS.textLight }}>{entry.doctor}</span>
                          </div>
                        </div>
                        <div className="flex gap-1.5 flex-wrap">
                          {entry.tags.map((tag) => (
                            <span
                              key={tag}
                              className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                              style={{ background: spColors.bg, color: spColors.text, fontWeight: 600, fontSize: 13 }}
                            >
                              <Tag size={9} />
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <p style={{ fontSize: 14, color: COLORS.text, lineHeight: 1.6 }}>{entry.procedure}</p>

                      {/* Immutable badge */}
                      <div className="flex items-center gap-1.5 mt-3 pt-3" style={{ borderTop: `1px solid ${COLORS.border}` }}>
                        <Lock size={12} style={{ color: COLORS.gray }} />
                        <span style={{ fontSize: 12, color: COLORS.gray }}>Una vez guardado, no se puede modificar</span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredHistory.length === 0 && (
                <div className="text-center py-12">
                  <FileText size={40} className="mx-auto mb-3" style={{ color: COLORS.gray, opacity: 0.4 }} />
                  <p style={{ color: COLORS.gray }}>No hay controles registrados para este filtro</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <AddControlModal
          patient={selectedPatient}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
