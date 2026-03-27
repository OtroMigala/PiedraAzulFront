import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { NewAppointmentModal } from '../../app/pages/DailyAgenda';

// Mock del módulo de API para no hacer llamadas HTTP reales
vi.mock('../../app/services/api', () => ({
  apiFetch: vi.fn(),
}));

import { apiFetch } from '../../app/services/api';

const mockDoctors = [
  { id: 'doc-1', name: 'Dr. Andrea Urbano' },
  { id: 'doc-2', name: 'Dr. Carlos Pérez' },
];

describe('NewAppointmentModal — RF2: Crear nueva cita', () => {
  const onClose = vi.fn();
  const onSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza el modal con el título "Registrar nueva cita"', () => {
    render(
      <NewAppointmentModal onClose={onClose} doctors={mockDoctors} onSuccess={onSuccess} />,
    );

    expect(screen.getByText('Registrar nueva cita')).toBeInTheDocument();
  });

  it('muestra el campo de búsqueda de paciente por documento', () => {
    render(
      <NewAppointmentModal onClose={onClose} doctors={mockDoctors} onSuccess={onSuccess} />,
    );

    expect(
      screen.getByLabelText(/buscar paciente por documento/i),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^buscar$/i })).toBeInTheDocument();
  });

  it('muestra los médicos disponibles en el selector de detalles de la cita', () => {
    render(
      <NewAppointmentModal onClose={onClose} doctors={mockDoctors} onSuccess={onSuccess} />,
    );

    expect(screen.getByText('Dr. Andrea Urbano')).toBeInTheDocument();
    expect(screen.getByText('Dr. Carlos Pérez')).toBeInTheDocument();
  });

  it('muestra el formulario de nuevo paciente cuando no se encuentra el documento', async () => {
    // La API responde 404 → paciente no existe
    vi.mocked(apiFetch).mockRejectedValueOnce(new Error('Not found'));

    render(
      <NewAppointmentModal onClose={onClose} doctors={mockDoctors} onSuccess={onSuccess} />,
    );

    const searchInput = screen.getByLabelText(/buscar paciente por documento/i);
    await userEvent.type(searchInput, '1020456789');
    await userEvent.click(screen.getByRole('button', { name: /^buscar$/i }));

    await waitFor(() => {
      expect(screen.getByText(/registrar nuevo paciente/i)).toBeInTheDocument();
    });
  });

  it('bloquea el guardado y muestra error cuando los campos requeridos están vacíos', async () => {
    // Búsqueda falla → activa formulario de nuevo paciente
    vi.mocked(apiFetch).mockRejectedValueOnce(new Error('Not found'));

    render(
      <NewAppointmentModal onClose={onClose} doctors={mockDoctors} onSuccess={onSuccess} />,
    );

    // Activar formulario de nuevo paciente
    const searchInput = screen.getByLabelText(/buscar paciente por documento/i);
    await userEvent.type(searchInput, '9999999999');
    await userEvent.click(screen.getByRole('button', { name: /^buscar$/i }));
    await waitFor(() => screen.getByText(/registrar nuevo paciente/i));

    // Intentar guardar sin llenar campos requeridos
    await userEvent.click(screen.getByRole('button', { name: /agendar cita/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/documento.*nombres.*celular.*género.*obligatorios/i),
      ).toBeInTheDocument();
    });
  });

  it('muestra campos de documento, nombres, celular y género como requeridos', async () => {
    vi.mocked(apiFetch).mockRejectedValueOnce(new Error('Not found'));

    render(
      <NewAppointmentModal onClose={onClose} doctors={mockDoctors} onSuccess={onSuccess} />,
    );

    await userEvent.type(
      screen.getByLabelText(/buscar paciente por documento/i),
      '123',
    );
    await userEvent.click(screen.getByRole('button', { name: /^buscar$/i }));

    await waitFor(() => {
      expect(screen.getByText(/número de documento/i)).toBeInTheDocument();
      expect(screen.getByText(/nombres y apellidos/i)).toBeInTheDocument();
      expect(screen.getByText(/celular/i)).toBeInTheDocument();
      expect(screen.getByText(/género/i)).toBeInTheDocument();
    });
  });

  it('llama a onClose al hacer click en Cancelar', async () => {
    render(
      <NewAppointmentModal onClose={onClose} doctors={mockDoctors} onSuccess={onSuccess} />,
    );

    await userEvent.click(screen.getByRole('button', { name: /cancelar/i }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
