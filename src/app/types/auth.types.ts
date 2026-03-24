export type UserRole = 'Admin' | 'Scheduler' | 'Patient' | 'Doctor';

export interface AuthData {
  token: string;
  role: string;
  fullName: string;
  id: string;
}
