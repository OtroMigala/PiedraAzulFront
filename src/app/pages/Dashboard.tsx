import React from 'react';
import { useNavigate } from 'react-router';
import {
  Plus, Calendar, Users, Clock, CheckCircle, AlertCircle,
  TrendingUp, Filter, RefreshCw, ChevronDown, Search
} from 'lucide-react';
import { COLORS, APPOINTMENTS_TODAY, DOCTORS } from '../data/mockData';

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  Confirmada: { bg: '#E3F2FD', text: COLORS.blue, dot: COLORS.blue },
  Completada: { bg: COLORS.greenLight, text: COLORS.green, dot: COLORS.green },
  Pendiente: { bg: '#FFF3E0', text: '#E65100', dot: '#E65100' },
  Cancelada: { bg: COLORS.errorLight, text: COLORS.error, dot: COLORS.error },
};

const STAT_CARDS = [
  { label: 'Citas hoy', value: 7, change: '+2 vs ayer', icon: <Calendar size={22} />, color: COLORS.blue, bg: COLORS.blueLight },
  { label: 'Completadas', value: 1, change: '14%', icon: <CheckCircle size={22} />, color: COLORS.green, bg: COLORS.greenLight },
  { label: 'Pendientes', value: 6, change: '86%', icon: <Clock size={22} />, color: '#E65100', bg: '#FFF3E0' },
  { label: 'Profesionales activos', value: 3, change: 'de 4 totales', icon: <Users size={22} />, color: '#9C27B0', bg: '#F3E5F5' },
];

const UPCOMING = APPOINTMENTS_TODAY.slice(0, 4);

export default function Dashboard() {
  const navigate = useNavigate();
  const [selectedDoctor, setSelectedDoctor] = React.useState('Todos');
  const [selectedDate, setSelectedDate] = React.useState('2025-02-20');

  const filteredAppts = APPOINTMENTS_TODAY.filter(
    (a) => selectedDoctor === 'Todos' || a.doctor === selectedDoctor
  );

  // Timeline slots
  const HOURS = ['7:00', '7:20', '7:40', '8:00', '8:20', '8:40', '9:00', '9:20', '9:40', '10:00', '10:20', '10:40'];

  return (
    <div className="p-4 sm:p-6 lg:p-8" style={{ background: COLORS.bg, minHeight: '100vh' }}>
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl" style={{ color: COLORS.text, fontWeight: 800 }}>Dashboard</h1>
          <p style={{ color: COLORS.textLight, fontSize: 14 }}>Jueves, 20 de febrero de 2025</p>
        </div>
        <button
          onClick={() => navigate('/app/agenda')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white shadow-md hover:shadow-lg transition-all hover:opacity-90"
          style={{ background: `linear-gradient(135deg, ${COLORS.blue} 0%, ${COLORS.blueDark} 100%)`, fontSize: 14, fontWeight: 700 }}
        >
          <Plus size={18} />
          Nueva cita
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STAT_CARDS.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl p-5 flex flex-col gap-3"
            style={{ background: COLORS.white, boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: card.bg, color: card.color }}>
                {card.icon}
              </div>
              <TrendingUp size={14} style={{ color: COLORS.gray }} />
            </div>
            <div>
              <p className="text-3xl" style={{ color: COLORS.text, fontWeight: 800, lineHeight: 1 }}>{card.value}</p>
              <p className="text-sm mt-1" style={{ color: COLORS.textLight }}>{card.label}</p>
              <p className="text-xs mt-0.5" style={{ color: card.color, fontWeight: 600 }}>{card.change}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Timeline */}
        <div className="xl:col-span-2">
          <div className="rounded-2xl overflow-hidden" style={{ background: COLORS.white, boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${COLORS.border}` }}>
              <h2 className="text-base" style={{ color: COLORS.text, fontWeight: 700 }}>Agenda del Día</h2>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="pl-3 pr-8 py-2 rounded-lg border text-sm outline-none"
                    style={{ borderColor: COLORS.border, color: COLORS.text, fontSize: 14 }}
                    aria-label="Fecha de la agenda"
                  />
                </div>
                <div className="relative">
                  <select
                    value={selectedDoctor}
                    onChange={(e) => setSelectedDoctor(e.target.value)}
                    className="pl-3 pr-7 py-2 rounded-lg border text-sm outline-none appearance-none"
                    style={{ borderColor: COLORS.border, color: COLORS.text, fontSize: 14, background: COLORS.white }}
                    aria-label="Filtrar por médico"
                  >
                    <option>Todos</option>
                    {DOCTORS.filter((d) => d.status === 'Activo').map((d) => (
                      <option key={d.id}>{d.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: COLORS.gray }} />
                </div>
                <button className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors" style={{ color: COLORS.gray }} aria-label="Refrescar">
                  <RefreshCw size={16} />
                </button>
              </div>
            </div>

            {/* Timeline */}
            <div className="p-4">
              <div className="flex flex-col gap-1">
                {HOURS.map((hour) => {
                  const appt = filteredAppts.find((a) => a.time === hour + ' AM' || a.time === hour + ' PM');
                  return (
                    <div key={hour} className="flex items-stretch gap-3 min-h-[52px]">
                      <div className="w-14 flex-shrink-0 flex items-start pt-1">
                      <span style={{ fontSize: 13, color: COLORS.gray, fontWeight: 600 }}>{hour}</span>
                      </div>
                      <div className="w-px flex-shrink-0" style={{ background: COLORS.border }} />
                      <div className="flex-1">
                        {appt ? (
                          <div
                            className="rounded-lg px-3 py-2 flex items-center gap-3 cursor-pointer hover:opacity-90 transition-all"
                            style={{ background: appt.color + '18', border: `1px solid ${appt.color}40` }}
                            onClick={() => navigate('/app/agenda')}
                          >
                            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: appt.color }} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm truncate" style={{ color: COLORS.text, fontWeight: 600 }}>{appt.patient}</p>
                              <p style={{ fontSize: 12, color: COLORS.textLight }}>{appt.specialty} · {appt.doctor.split(' ').slice(-1)[0]}</p>
                            </div>
                            <span
                              className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                              style={{
                                background: STATUS_COLORS[appt.status]?.bg,
                                color: STATUS_COLORS[appt.status]?.text,
                                fontWeight: 600,
                              }}
                            >
                              {appt.status}
                            </span>
                          </div>
                        ) : (
                          <div
                            className="rounded-lg border border-dashed h-10 flex items-center px-3 cursor-pointer hover:bg-blue-50 transition-colors group"
                            style={{ borderColor: COLORS.border }}
                            onClick={() => navigate('/app/agenda')}
                          >
                            <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: COLORS.blue }}>
                              + Agregar cita
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="flex flex-col gap-4">
          {/* Professionals */}
          <div className="rounded-2xl p-5" style={{ background: COLORS.white, boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
            <h3 className="text-sm mb-4" style={{ color: COLORS.text, fontWeight: 700 }}>Profesionales activos hoy</h3>
            <div className="flex flex-col gap-3">
              {DOCTORS.filter((d) => d.status === 'Activo').map((doctor) => {
                const doctorAppts = APPOINTMENTS_TODAY.filter((a) => a.doctor === doctor.name);
                const completed = doctorAppts.filter((a) => a.status === 'Completada').length;
                const progress = (completed / (doctorAppts.length || 1)) * 100;

                return (
                  <div key={doctor.id} className="flex items-center gap-3">
                    <img
                      src={doctor.photo}
                      alt={doctor.name}
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                      style={{ border: `2px solid ${COLORS.border}` }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate" style={{ color: COLORS.text, fontWeight: 600 }}>{doctor.name}</p>
                      <p style={{ fontSize: 12, color: COLORS.textLight }}>{doctorAppts.length} citas · {completed} completadas</p>
                      <div className="mt-1 h-1.5 rounded-full overflow-hidden" style={{ background: COLORS.grayLight }}>
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${progress}%`, background: COLORS.green }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick actions */}
          <div className="rounded-2xl p-5" style={{ background: COLORS.white, boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
            <h3 className="text-sm mb-4" style={{ color: COLORS.text, fontWeight: 700 }}>Acciones rápidas</h3>
            <div className="flex flex-col gap-2">
              {[
                { label: 'Nueva cita manual', icon: <Plus size={18} />, path: '/agenda', color: COLORS.blue, bg: COLORS.blueLight },
                { label: 'Ver agenda completa', icon: <Calendar size={18} />, path: '/agenda', color: COLORS.green, bg: COLORS.greenLight },
                { label: 'Gestionar médicos', icon: <Users size={18} />, path: '/doctors', color: '#9C27B0', bg: '#F3E5F5' },
              ].map((action) => (
                <button
                  key={action.label}
                  onClick={() => navigate(action.path)}
                  className="flex items-center gap-3 p-3 rounded-xl hover:opacity-90 transition-all"
                  style={{ background: action.bg }}
                >
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: action.color, color: 'white' }}>
                    {action.icon}
                  </div>
                  <span style={{ fontSize: 14, color: action.color, fontWeight: 600 }}>{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Recent alerts */}
          <div className="rounded-2xl p-5" style={{ background: COLORS.white, boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
            <h3 className="text-sm mb-3" style={{ color: COLORS.text, fontWeight: 700 }}>Alertas recientes</h3>
            <div className="flex flex-col gap-2">
              <div className="flex items-start gap-2 p-2.5 rounded-lg" style={{ background: COLORS.warningLight }}>
                <AlertCircle size={16} style={{ color: COLORS.warning, flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontSize: 13, color: '#5D4037' }}>Valentina Ospina tiene cita en 30 min – sin confirmar</p>
              </div>
              <div className="flex items-start gap-2 p-2.5 rounded-lg" style={{ background: COLORS.blueLight }}>
                <AlertCircle size={16} style={{ color: COLORS.blue, flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontSize: 13, color: COLORS.text }}>2 nuevas citas autónomas agendadas hoy</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
