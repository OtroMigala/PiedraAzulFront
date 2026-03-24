/** Cita normalizada para uso en la UI (DailyAgenda) */
export interface Appointment {
  id: number;
  date: string;
  time: string;
  patient: string;
  document: string;
  phone: string;
  specialty: string;
  doctor: string;
  doctorId?: string;
  observation: string;
  status: string;
  color: string;
}

/** Cita tal como la devuelve el backend */
export interface AppointmentApiItem {
  id: number;
  date: string;
  time: string;
  patientName: string;
  documentId: string;
  phone: string;
  specialty: string;
  doctorName: string;
  doctorId: string;
  observation: string;
  status: string;
}

/** Respuesta de GET /api/appointments/by-doctor */
export interface AppointmentsResponse {
  message: string;
  total: number;
  appointments: AppointmentApiItem[];
}

/** Payload de POST /api/appointments (agendador) */
export interface CreateAppointmentPayload {
  documentId: string;
  fullName: string;
  phone: string;
  gender: number;
  birthDate: string | null;
  email: string | null;
  doctorId: string | undefined;
  date: string;
  time: string;
}

/** Payload de POST /api/patient/appointments (auto-agendamiento paciente) */
export interface PatientAppointmentPayload {
  doctorId: string;
  date: string | null;
  time: string | null;
  captchaToken: string;
}
