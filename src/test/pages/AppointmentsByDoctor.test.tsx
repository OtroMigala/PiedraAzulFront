import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import AppointmentsByDoctor from '../../app/pages/AppointmentsByDoctor';

// Mock del módulo de API para no hacer llamadas HTTP reales
vi.mock('../../app/services/api', () => ({
  apiFetch: vi.fn(),
}));

import { apiFetch } from '../../app/services/api';

const mockDoctors = [
  { id: 'doc-1', fullName: 'Dr. Andrea Urbano' },
  { id: 'doc-2', fullName: 'Dr. Carlos Pérez' },
];

const mockAppointmentsResponse = {
  message: '',
  total: 2,
  appointments: [
    {
      id: 'appt-1',
      patientName: 'Juan García',
      documentId: '1020456789',
      time: '08:00',
      specialty: 'NeuralTherapy',
      status: 'Scheduled',
    },
    {
      id: 'appt-2',
      patientName: 'María López',
      documentId: '987654321',
      time: '09:00',
      specialty: 'Chiropractic',
      status: 'Completed',
    },
  ],
};

describe('AppointmentsByDoctor — RF1: Listar citas médicas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza el selector de profesional y el campo de fecha', async () => {
    vi.mocked(apiFetch).mockResolvedValueOnce(mockDoctors);

    render(<AppointmentsByDoctor />);

    expect(
      screen.getByRole('combobox', { name: /seleccionar profesional/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/seleccionar fecha/i)).toBeInTheDocument();
  });

  it('muestra "Cargando..." en el selector mientras carga los profesionales', () => {
    // La promesa nunca resuelve → estado de carga persistente
    vi.mocked(apiFetch).mockReturnValueOnce(new Promise(() => {}));

    render(<AppointmentsByDoctor />);

    expect(screen.getByText('Cargando...')).toBeInTheDocument();
  });

  it('carga y muestra los profesionales en el selector tras la llamada API', async () => {
    vi.mocked(apiFetch).mockResolvedValueOnce(mockDoctors);

    render(<AppointmentsByDoctor />);

    await waitFor(() => {
      expect(screen.getByText('Dr. Andrea Urbano')).toBeInTheDocument();
      expect(screen.getByText('Dr. Carlos Pérez')).toBeInTheDocument();
    });
  });

  it('muestra mensaje de error cuando falla la carga de profesionales', async () => {
    vi.mocked(apiFetch).mockRejectedValueOnce(new Error('Network error'));

    render(<AppointmentsByDoctor />);

    await waitFor(() => {
      expect(
        screen.getByText(/no se pudieron cargar los profesionales/i),
      ).toBeInTheDocument();
    });
  });

  it('muestra la tabla con las citas y el contador al seleccionar un profesional', async () => {
    vi.mocked(apiFetch)
      .mockResolvedValueOnce(mockDoctors)              // GET /api/doctors
      .mockResolvedValueOnce(mockAppointmentsResponse); // GET /api/appointments/by-doctor

    render(<AppointmentsByDoctor />);

    // Esperar a que carguen los profesionales y seleccionar uno
    await waitFor(() => screen.getByText('Dr. Andrea Urbano'));
    const select = screen.getByRole('combobox', { name: /seleccionar profesional/i });
    await userEvent.selectOptions(select, 'doc-1');

    // Verificar contador en footer y datos de la tabla
    await waitFor(() => {
      expect(screen.getByText(/2 cita\(s\) encontradas/i)).toBeInTheDocument();
      expect(screen.getByText('Juan García')).toBeInTheDocument();
      expect(screen.getByText('María López')).toBeInTheDocument();
    });
  });

  it('muestra estado vacío cuando no hay citas para el profesional y fecha', async () => {
    vi.mocked(apiFetch)
      .mockResolvedValueOnce(mockDoctors)
      .mockResolvedValueOnce({ message: '', total: 0, appointments: [] });

    render(<AppointmentsByDoctor />);

    await waitFor(() => screen.getByText('Dr. Andrea Urbano'));
    const select = screen.getByRole('combobox', { name: /seleccionar profesional/i });
    await userEvent.selectOptions(select, 'doc-1');

    await waitFor(() => {
      expect(
        screen.getByText(/no hay citas registradas para esta búsqueda/i),
      ).toBeInTheDocument();
    });
  });

  it('muestra badge de estado "Agendada" y "Completada" según el status de cada cita', async () => {
    vi.mocked(apiFetch)
      .mockResolvedValueOnce(mockDoctors)
      .mockResolvedValueOnce(mockAppointmentsResponse);

    render(<AppointmentsByDoctor />);

    await waitFor(() => screen.getByText('Dr. Andrea Urbano'));
    await userEvent.selectOptions(
      screen.getByRole('combobox', { name: /seleccionar profesional/i }),
      'doc-1',
    );

    await waitFor(() => {
      expect(screen.getByText('Agendada')).toBeInTheDocument();
      expect(screen.getByText('Completada')).toBeInTheDocument();
    });
  });
});
