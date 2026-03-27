import { describe, it, expect } from 'vitest';
import { formatTimeForApi, parseTimeFromApi } from '../../app/pages/DailyAgenda';
import { sanitizeNameInput } from '../../app/pages/Doctors';

// ─── formatTimeForApi ───────────────────────────────────────────────────────
// Convierte "H:MM AM/PM" → "HH:MM:SS" (formato API backend)

describe('formatTimeForApi', () => {
  it('convierte "7:00 AM" a "07:00:00"', () => {
    expect(formatTimeForApi('7:00 AM')).toBe('07:00:00');
  });

  it('convierte "12:00 PM" a "12:00:00" (mediodía)', () => {
    expect(formatTimeForApi('12:00 PM')).toBe('12:00:00');
  });

  it('convierte "12:00 AM" a "00:00:00" (medianoche)', () => {
    expect(formatTimeForApi('12:00 AM')).toBe('00:00:00');
  });

  it('convierte "2:30 PM" a "14:30:00"', () => {
    expect(formatTimeForApi('2:30 PM')).toBe('14:30:00');
  });

  it('convierte "11:45 AM" a "11:45:00"', () => {
    expect(formatTimeForApi('11:45 AM')).toBe('11:45:00');
  });
});

// ─── parseTimeFromApi ───────────────────────────────────────────────────────
// Convierte "HH:MM:SS" (API backend) → "H:MM AM/PM" (visualización)

describe('parseTimeFromApi', () => {
  it('convierte "07:00:00" a "7:00 AM"', () => {
    expect(parseTimeFromApi('07:00:00')).toBe('7:00 AM');
  });

  it('convierte "14:30:00" a "2:30 PM"', () => {
    expect(parseTimeFromApi('14:30:00')).toBe('2:30 PM');
  });

  it('convierte "00:00:00" a "12:00 AM" (medianoche)', () => {
    expect(parseTimeFromApi('00:00:00')).toBe('12:00 AM');
  });

  it('convierte "12:00:00" a "12:00 PM" (mediodía)', () => {
    expect(parseTimeFromApi('12:00:00')).toBe('12:00 PM');
  });

  it('convierte "09:20:00" a "9:20 AM"', () => {
    expect(parseTimeFromApi('09:20:00')).toBe('9:20 AM');
  });
});

// ─── formatTimeForApi + parseTimeFromApi (ida y vuelta) ─────────────────────

describe('formatTimeForApi + parseTimeFromApi (round-trip)', () => {
  it('ida y vuelta: "9:20 AM" → API → display mantiene el valor', () => {
    const original = '9:20 AM';
    expect(parseTimeFromApi(formatTimeForApi(original))).toBe(original);
  });

  it('ida y vuelta: "3:00 PM" → API → display mantiene el valor', () => {
    const original = '3:00 PM';
    expect(parseTimeFromApi(formatTimeForApi(original))).toBe(original);
  });
});

// ─── sanitizeNameInput ──────────────────────────────────────────────────────
// Limpia entradas de nombre: solo letras (con acentos/ñ), espacios, máx 100 chars

describe('sanitizeNameInput', () => {
  it('elimina números del input', () => {
    expect(sanitizeNameInput('Juan123')).toBe('Juan');
  });

  it('elimina caracteres especiales pero conserva letras con acento', () => {
    expect(sanitizeNameInput('María!@#')).toBe('María');
  });

  it('conserva ñ/Ñ y ü/Ü', () => {
    expect(sanitizeNameInput('Ñoño Güero')).toBe('Ñoño Güero');
  });

  it('colapsa múltiples espacios consecutivos en uno', () => {
    expect(sanitizeNameInput('Juan   Carlos')).toBe('Juan Carlos');
  });

  it('trunca a 100 caracteres máximo', () => {
    const longName = 'A'.repeat(150);
    expect(sanitizeNameInput(longName).length).toBe(100);
  });

  it('devuelve cadena vacía si el input solo contiene caracteres inválidos', () => {
    expect(sanitizeNameInput('123!@#$')).toBe('');
  });
});
