export const COLORS = {
  blue: '#1E88E5',
  blueDark: '#1565C0',
  blueLight: '#E3F2FD',
  green: '#2E7D32',
  greenLight: '#E8F5E9',
  bg: '#F4F6F8',
  text: '#2C3E50',
  textLight: '#455A64',
  error: '#D32F2F',
  errorLight: '#FFEBEE',
  warning: '#E65100',
  warningLight: '#FFF3E0',
  white: '#FFFFFF',
  gray: '#607D8B',
  grayLight: '#ECEFF1',
  border: '#CFD8DC',
};

export const DOCTORS = [
  {
    id: 1,
    name: 'Dra. Carolina Mendoza',
    specialty: 'Terapia Neural',
    type: 'Médico',
    interval: 20,
    status: 'Activo',
    photo: 'https://images.unsplash.com/photo-1659353888906-adb3e0041693?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    nextAvailable: 'Lun 24 Feb',
    initials: 'CM',
    schedule: {
      Lunes: { start: '07:00', end: '13:00' },
      Martes: { start: '07:00', end: '13:00' },
      Miércoles: { start: '07:00', end: '13:00' },
      Jueves: { start: '07:00', end: '13:00' },
      Viernes: { start: '07:00', end: '12:00' },
    },
  },
  {
    id: 2,
    name: 'Dr. Andrés Pulido',
    specialty: 'Quiropraxia',
    type: 'Médico',
    interval: 30,
    status: 'Activo',
    photo: 'https://images.unsplash.com/photo-1678940807055-d46f1dac7cf7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    nextAvailable: 'Mar 25 Feb',
    initials: 'AP',
    schedule: {
      Lunes: { start: '08:00', end: '14:00' },
      Miércoles: { start: '08:00', end: '14:00' },
      Viernes: { start: '08:00', end: '12:00' },
    },
  },
  {
    id: 3,
    name: 'Dra. Lucía Vargas',
    specialty: 'Fisioterapia',
    type: 'Terapista',
    interval: 30,
    status: 'Activo',
    photo: 'https://images.unsplash.com/photo-1717500252010-d708ec89a0a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    nextAvailable: 'Lun 24 Feb',
    initials: 'LV',
    schedule: {
      Martes: { start: '07:00', end: '15:00' },
      Jueves: { start: '07:00', end: '15:00' },
      Viernes: { start: '07:00', end: '12:00' },
    },
  },
  {
    id: 4,
    name: 'Dr. Sebastián Torres',
    specialty: 'Terapia Neural',
    type: 'Terapista',
    interval: 20,
    status: 'Inactivo',
    photo: 'https://images.unsplash.com/photo-1748288166888-f1bd5d6ef9ed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    nextAvailable: 'N/A',
    initials: 'ST',
    schedule: {
      Lunes: { start: '14:00', end: '18:00' },
      Miércoles: { start: '14:00', end: '18:00' },
    },
  },
];

export const TIME_SLOTS = [
  '7:00 AM', '7:20 AM', '7:40 AM', '8:00 AM', '8:20 AM',
  '8:40 AM', '9:00 AM', '9:20 AM', '9:40 AM', '10:00 AM',
  '10:20 AM', '10:40 AM', '11:00 AM', '11:20 AM', '11:40 AM',
  '12:00 PM',
];

export const OCCUPIED_SLOTS = ['7:00 AM', '7:40 AM', '8:20 AM', '9:00 AM', '10:00 AM', '11:00 AM'];

export const APPOINTMENTS = [
  // 20 Feb 2025
  { id: 1, date: '2025-02-20', time: '7:00 AM', patient: 'María González López', document: '1.020.456.789', phone: '315 234 5678', specialty: 'Terapia Neural', doctor: 'Dra. Carolina Mendoza', observation: 'Primera consulta', status: 'Confirmada', color: '#1E88E5' },
  { id: 2, date: '2025-02-20', time: '7:20 AM', patient: 'Carlos Rueda Mora', document: '79.456.123', phone: '310 345 6789', specialty: 'Terapia Neural', doctor: 'Dra. Carolina Mendoza', observation: 'Seguimiento dolor lumbar', status: 'Confirmada', color: '#1E88E5' },
  { id: 3, date: '2025-02-20', time: '8:00 AM', patient: 'Ana Sofía Pérez', document: '52.123.456', phone: '321 456 7890', specialty: 'Quiropraxia', doctor: 'Dr. Andrés Pulido', observation: '', status: 'Confirmada', color: '#2E7D32' },
  { id: 4, date: '2025-02-20', time: '8:30 AM', patient: 'Roberto Silva Cano', document: '80.234.567', phone: '300 567 8901', specialty: 'Fisioterapia', doctor: 'Dra. Lucía Vargas', observation: 'Post-operatorio rodilla', status: 'Completada', color: '#F57C00' },
  { id: 5, date: '2025-02-20', time: '9:00 AM', patient: 'Isabella Martínez', document: '1.033.789.456', phone: '317 678 9012', specialty: 'Fisioterapia', doctor: 'Dra. Lucía Vargas', observation: '', status: 'Confirmada', color: '#F57C00' },
  { id: 6, date: '2025-02-20', time: '9:20 AM', patient: 'Felipe Herrera Ríos', document: '1.019.234.567', phone: '318 789 0123', specialty: 'Terapia Neural', doctor: 'Dra. Carolina Mendoza', observation: 'Migrañas crónicas', status: 'Confirmada', color: '#1E88E5' },
  { id: 7, date: '2025-02-20', time: '10:00 AM', patient: 'Valentina Ospina', document: '43.567.890', phone: '312 890 1234', specialty: 'Quiropraxia', doctor: 'Dr. Andrés Pulido', observation: 'Dolor cervical', status: 'Pendiente', color: '#2E7D32' },
  // 21 Feb 2025
  { id: 8, date: '2025-02-21', time: '7:00 AM', patient: 'Laura Jiménez Díaz', document: '1.015.678.234', phone: '314 123 4567', specialty: 'Terapia Neural', doctor: 'Dra. Carolina Mendoza', observation: 'Control mensual', status: 'Confirmada', color: '#1E88E5' },
  { id: 9, date: '2025-02-21', time: '8:00 AM', patient: 'Diego Morales Castro', document: '80.345.678', phone: '320 567 8901', specialty: 'Quiropraxia', doctor: 'Dr. Andrés Pulido', observation: 'Dolor de espalda', status: 'Pendiente', color: '#2E7D32' },
  // 19 Feb 2025
  { id: 10, date: '2025-02-19', time: '7:00 AM', patient: 'Camila Rojas Pinto', document: '52.789.012', phone: '316 234 5678', specialty: 'Fisioterapia', doctor: 'Dra. Lucía Vargas', observation: 'Rehabilitación hombro', status: 'Completada', color: '#F57C00' },
  { id: 11, date: '2025-02-19', time: '8:00 AM', patient: 'Andrés López Mejía', document: '1.022.345.678', phone: '311 345 6789', specialty: 'Terapia Neural', doctor: 'Dra. Carolina Mendoza', observation: '', status: 'Completada', color: '#1E88E5' },
];

/** @deprecated Use APPOINTMENTS instead */
export const APPOINTMENTS_TODAY = APPOINTMENTS.filter(a => a.date === '2025-02-20');

export const PATIENTS = [
  { id: 1, name: 'María González López', document: '1.020.456.789', phone: '315 234 5678', gender: 'Femenino', birthDate: '1990-05-14', age: 34 },
  { id: 2, name: 'Carlos Rueda Mora', document: '79.456.123', phone: '310 345 6789', gender: 'Masculino', birthDate: '1975-11-22', age: 49 },
  { id: 3, name: 'Ana Sofía Pérez', document: '52.123.456', phone: '321 456 7890', gender: 'Femenino', birthDate: '1982-03-08', age: 42 },
];

export const MEDICAL_HISTORY = [
  {
    id: 1,
    date: '2025-02-10 09:00',
    doctor: 'Dra. Carolina Mendoza',
    specialty: 'Terapia Neural',
    procedure: 'Se realiza terapia neural de primera sesión. Paciente presenta dolor crónico en zona lumbar irradiado a pierna derecha. Se aplican infiltraciones en puntos gatillo L3-L5. Respuesta favorable inicial.',
    tags: ['Terapia Neural', 'Dolor Lumbar'],
  },
  {
    id: 2,
    date: '2025-01-27 10:20',
    doctor: 'Dra. Carolina Mendoza',
    specialty: 'Terapia Neural',
    procedure: 'Segunda sesión de terapia neural. El paciente reporta mejoría del 40% en dolor inicial. Se continúa con protocolo de tratamiento establecido. Se aplican 8 puntos de infiltración subcutánea.',
    tags: ['Terapia Neural', 'Seguimiento'],
  },
  {
    id: 3,
    date: '2025-01-15 07:40',
    doctor: 'Dr. Andrés Pulido',
    specialty: 'Quiropraxia',
    procedure: 'Evaluación inicial quiropraxia. Se identifica hiperlordosis lumbar y subluxación en L4. Se realiza ajuste espinal manual con técnica diversificada. Paciente tolera bien el procedimiento.',
    tags: ['Quiropraxia', 'Primera Consulta'],
  },
];

export const RESCHEDULING_HISTORY = [
  {
    id: 1,
    original: 'Lun 17 Feb 2025, 9:00 AM',
    newDate: 'Mié 19 Feb 2025, 10:00 AM',
    changedBy: 'Laura Jiménez (Agendadora)',
    changedAt: 'Vie 14 Feb 2025, 3:45 PM',
    reason: 'Paciente solicitó cambio por viaje',
  },
  {
    id: 2,
    original: 'Vie 10 Ene 2025, 8:00 AM',
    newDate: 'Lun 17 Feb 2025, 9:00 AM',
    changedBy: 'Sistema automático',
    changedAt: 'Jue 9 Ene 2025, 11:00 AM',
    reason: 'Médico no disponible por incapacidad',
  },
];

export const SPECIALTIES = [
  {
    id: 'neural',
    name: 'Terapia Neural',
    description: 'Tratamiento para aliviar dolores crónicos de cabeza, espalda y nervios, mediante pequeñas aplicaciones localizadas.',
    icon: 'Brain',
    color: '#1E88E5',
    bgColor: '#E3F2FD',
  },
  {
    id: 'quiro',
    name: 'Quiropraxia',
    description: 'Cuidado de la columna vertebral y articulaciones para mejorar tu movilidad y reducir el dolor.',
    icon: 'Bone',
    color: '#2E7D32',
    bgColor: '#E8F5E9',
  },
  {
    id: 'fisio',
    name: 'Fisioterapia',
    description: 'Ejercicios guiados y masajes para recuperar fuerza, movilidad y bienestar después de una lesión o cirugía.',
    icon: 'Activity',
    color: '#E65100',
    bgColor: '#FFF3E0',
  },
];
