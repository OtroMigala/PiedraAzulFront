/** Médico tal como lo devuelve GET /api/doctors */
export interface DoctorApiItem {
  id: string;
  fullName: string;
  specialty: string;
  type: string;
  intervalMinutes: number;
  isActive?: boolean;
}

/** Forma reducida usada en dropdowns (Layout, NewAppointmentModal) */
export interface DoctorListItem {
  id: string;
  name: string;
}

/** Médico normalizado para uso interno en componentes */
export interface Doctor {
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
