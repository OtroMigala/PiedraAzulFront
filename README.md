
# Piedrazul - Sistema de Gestión de Citas Médicas

Frontend del sistema de gestión de citas y agenda médica del **Centro Médico Piedrazul**, construido con React + TypeScript + Vite.

---

## Tabla de Contenidos

- [Descripción General](#descripción-general)
- [Arquitectura del Proyecto](#arquitectura-del-proyecto)
- [Stack Tecnológico](#stack-tecnológico)
- [Estructura de Directorios](#estructura-de-directorios)
- [Instalación y Configuración](#instalación-y-configuración)
- [Variables de Entorno](#variables-de-entorno)
- [Autenticación y Autorización](#autenticación-y-autorización)
- [Enrutamiento](#enrutamiento)
- [Integración con la API](#integración-con-la-api)
- [Gestión de Estado](#gestión-de-estado)
- [Sistema de Tipos](#sistema-de-tipos)
- [Componentes Principales](#componentes-principales)
- [Estilos y Diseño Visual](#estilos-y-diseño-visual)
- [Testing](#testing)
- [Scripts Disponibles](#scripts-disponibles)

---

## Descripción General

Piedrazul es una aplicación web SPA (Single Page Application) para la gestión integral de citas médicas. El sistema soporta múltiples roles de usuario con flujos de trabajo diferenciados:

| Rol | Descripción |
|---|---|
| **Admin** | Acceso completo: gestión de doctores, dashboard, reportes y auditoría |
| **Scheduler** | Agendamiento y gestión de citas por médico |
| **Doctor** | Vista de agenda propia e historial de pacientes |
| **Patient** | Registro propio y solicitud autónoma de citas |

---

## Arquitectura del Proyecto

```
┌──────────────────────────────────────────────────────────┐
│                        Cliente (SPA)                      │
│                                                          │
│  ┌─────────────┐   ┌──────────────┐   ┌──────────────┐  │
│  │   Routing   │   │    Pages     │   │  Components  │  │
│  │ (React Router│   │  (Views por  │   │  (Layout,    │  │
│  │    v7)      │   │    rol)      │   │  Sidebar, UI)│  │
│  └──────┬──────┘   └──────┬───────┘   └──────┬───────┘  │
│         │                 │                  │           │
│  ┌──────▼─────────────────▼──────────────────▼───────┐  │
│  │              State Layer                          │  │
│  │   authStore (localStorage + in-memory fallback)   │  │
│  │   React local state + React Hook Form             │  │
│  └──────────────────────────┬────────────────────────┘  │
│                             │                            │
│  ┌──────────────────────────▼────────────────────────┐  │
│  │              API Service (api.ts)                 │  │
│  │   Bearer token injection | Error handling | Logs  │  │
│  └──────────────────────────┬────────────────────────┘  │
└─────────────────────────────┼────────────────────────────┘
                              │ HTTP/REST
                              ▼
               ┌──────────────────────────┐
               │   Backend API (.NET)     │
               │   http://localhost:5071  │
               └──────────────────────────┘
```

### Decisiones de Arquitectura

- **Sin Redux/Zustand**: El estado global se limita a autenticación (`authStore`), usando estado local de React para el resto. Simplifica el código y es suficiente para el dominio actual.
- **Vite como build tool**: HMR ultra-rápido, soporte nativo de TypeScript y ES Modules, y el ecosistema de plugins más moderno.
- **Radix UI + Tailwind CSS**: Componentes headless accesibles envueltos con utilidades de Tailwind, sin sacrificar control sobre el diseño.
- **JWT sin librería**: El cliente decodifica el payload del JWT manualmente (sin verificación de firma) para extraer rol, nombre e ID del usuario. La verificación real ocurre en el backend.

---

## Stack Tecnológico

### Core

| Tecnología | Versión | Uso |
|---|---|---|
| React | 18.3.1 | Librería UI principal |
| TypeScript | — | Tipado estático |
| Vite | 6.3.5 | Build tool y dev server |
| React Router | 7.13.0 | Enrutamiento SPA |

### UI y Estilos

| Tecnología | Versión | Uso |
|---|---|---|
| Tailwind CSS | 4.1.12 | Utilidades CSS |
| Material UI (MUI) | 7.3.5 | Componentes de UI adicionales |
| Radix UI | — | Componentes headless accesibles |
| Lucide React | 0.487.0 | Iconografía |
| Motion | 12.23.24 | Animaciones declarativas |
| Recharts | 2.15.2 | Gráficos y visualizaciones |
| Sonner | 2.0.3 | Notificaciones toast |

### Formularios y Datos

| Tecnología | Versión | Uso |
|---|---|---|
| React Hook Form | 7.55.0 | Gestión de formularios |
| React DnD | 16.0.1 | Drag-and-drop |
| date-fns | 3.6.0 | Manipulación de fechas |
| React Slick | 0.31.0 | Carrusel de contenido |

### Testing

| Tecnología | Versión | Uso |
|---|---|---|
| Vitest | 4.1.2 | Test runner (nativo Vite) |
| @testing-library/react | 16.3.2 | Testing de componentes |
| @testing-library/user-event | 14.6.1 | Simulación de interacciones |
| jsdom | 29.0.1 | DOM virtual para tests |
| @vitest/coverage-v8 | 4.1.2 | Reporte de cobertura |

---

## Estructura de Directorios

```
Frontend/Front/
├── index.html                          # Entry HTML (monta #root)
├── vite.config.ts                      # Config de Vite (plugins, alias, test)
├── postcss.config.mjs                  # Config de PostCSS
├── package.json
├── .env                                # Variables de entorno (VITE_API_URL)
│
└── src/
    ├── main.tsx                        # Punto de entrada React (ReactDOM.render)
    │
    ├── app/
    │   ├── App.tsx                     # Proveedor de RouterProvider
    │   ├── routes.tsx                  # Definición de rutas con protección por rol
    │   │
    │   ├── components/
    │   │   ├── Layout.tsx              # Layout raíz (Sidebar + Topbar + Outlet)
    │   │   ├── Sidebar.tsx             # Menú lateral con menús dinámicos por rol
    │   │   ├── ProtectedRoute.tsx      # HOC: guarda de rutas por autenticación y rol
    │   │   ├── ProgressSteps.tsx       # Indicador de progreso para formularios multi-paso
    │   │   ├── figma/                  # Componentes de integración con Figma
    │   │   └── ui/                     # +50 wrappers de Radix UI (Button, Dialog, Form…)
    │   │
    │   ├── pages/
    │   │   ├── Login.tsx               # Página de autenticación
    │   │   ├── PatientRegister.tsx     # Registro de pacientes
    │   │   ├── Dashboard.tsx           # Dashboard de administración
    │   │   ├── DailyAgenda.tsx         # Agenda diaria con modales de detalle/reagendamiento
    │   │   ├── AppointmentsByDoctor.tsx # Vista de citas por médico (Scheduler)
    │   │   ├── Doctors.tsx             # CRUD de médicos (Admin)
    │   │   ├── MedicalHistory.tsx      # Historial médico de pacientes
    │   │   └── SchedulingFlow.tsx      # Flujo de agendamiento multi-paso (Patient)
    │   │
    │   ├── services/
    │   │   └── api.ts                  # Cliente HTTP centralizado con logging y auth
    │   │
    │   ├── store/
    │   │   └── authStore.ts            # Estado de autenticación (localStorage + fallback)
    │   │
    │   ├── types/
    │   │   ├── auth.types.ts           # UserRole, AuthData
    │   │   ├── appointment.types.ts    # Appointment, payloads de API
    │   │   ├── doctor.types.ts         # DoctorApiItem, Doctor
    │   │   └── common.types.ts         # Gender enum
    │   │
    │   └── data/
    │       └── mockData.ts             # Datos mock y paleta de colores
    │
    ├── styles/
    │   ├── index.css                   # Hoja de estilos maestra (importa las demás)
    │   ├── tailwind.css                # Directivas @tailwind
    │   ├── fonts.css                   # Fuentes personalizadas
    │   └── theme.css                   # Variables CSS globales y clases utilitarias
    │
    ├── test/
    │   ├── setup.ts                    # Setup global de tests (@testing-library/jest-dom)
    │   ├── pages/                      # Tests de componentes/páginas
    │   └── utils/                      # Tests de funciones utilitarias
    │
    └── assets/media/                   # Logotipos de Piedrazul (SVG/PNG)
```

---

## Instalación y Configuración

### Prerrequisitos

- Node.js >= 18
- npm >= 9
- Backend corriendo en `http://localhost:5071`

### Pasos

```bash
# 1. Clonar el repositorio
git clone <repo-url>
cd Frontend/Front

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con la URL del backend

# 4. Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:5173` (puerto Vite por defecto).

---

## Variables de Entorno

| Variable | Descripción | Ejemplo |
|---|---|---|
| `VITE_API_URL` | URL base del backend API | `http://localhost:5071` |

> Todas las variables para el cliente deben tener el prefijo `VITE_` para ser expuestas por Vite.

---

## Autenticación y Autorización

### Flujo de Autenticación

```
Login (email + password)
        │
        ▼
POST /api/auth/login
        │
        ▼
   Response: { token: "JWT..." }
        │
        ▼
authStore.saveAuth()  →  localStorage
        │
        ▼
Decode JWT payload (sin verificación de firma)
        │
        ├─ role     → UserRole ('Admin' | 'Scheduler' | 'Doctor' | 'Patient')
        ├─ fullName → nombre del usuario
        └─ id       → ID del usuario
```

### authStore.ts

El módulo `authStore` gestiona toda la capa de autenticación en el cliente:

```typescript
saveAuth(data: AuthData): void          // Persiste token y claims en localStorage
getAuth(): AuthData | null              // Recupera sesión almacenada
clearAuth(): void                       // Logout: borra localStorage
validateAuth(): boolean                 // Verifica token + expiración
extractRoleFromToken(): UserRole        // Decodifica claim de rol del JWT
extractFullNameFromToken(): string      // Decodifica nombre del JWT
extractIdFromToken(): string            // Decodifica ID de usuario del JWT
isTokenExpired(): boolean               // Verifica claim 'exp' del JWT
```

**Fallback a in-memory**: Si `localStorage` no está disponible (navegación privada o entorno sin storage), el store usa un objeto en memoria como respaldo transparente.

### Control de Acceso por Rol (RBAC)

`ProtectedRoute.tsx` actúa como HOC de guarda de rutas:

1. Verifica que exista un token válido → redirect a `/login`
2. Verifica que el rol del usuario esté en la lista `allowedRoles` de la ruta → redirect al home del rol
3. Si pasa ambas validaciones → renderiza la página solicitada

El `Layout.tsx` revalida el token cada **60 segundos** y hace logout automático si expira.

---

## Enrutamiento

Definido en `src/app/routes.tsx` usando React Router v7:

```
/                     → Redirect automático
/login                → Login                    [público]
/register             → PatientRegister          [público]

/app                  → Layout (requiere autenticación)
├── /                 → RootRedirect (redirige según rol)
├── /dashboard        → Dashboard                [Admin, Scheduler]
├── /citas-por-medico → AppointmentsByDoctor     [Admin, Scheduler]
├── /agenda           → DailyAgenda              [Admin, Scheduler, Doctor, Patient]
├── /schedule         → SchedulingFlow           [Patient]
├── /doctors          → Doctors                  [Admin]
├── /history          → MedicalHistory           [Admin, Doctor]
├── /audit            → Audit                    [Admin]
└── /reports          → Reports                  [Admin, Doctor]
```

**Home por rol:**

| Rol | Ruta inicial |
|---|---|
| Admin | `/dashboard` |
| Scheduler | `/dashboard` |
| Doctor | `/agenda` |
| Patient | `/schedule` |

---

## Integración con la API

### Cliente HTTP (`src/app/services/api.ts`)

```typescript
apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T | null>
```

Características:
- **Bearer token automático**: Inyecta `Authorization: Bearer <token>` desde `authStore`
- **Logging estilizado**: Imprime método, URL, status y body en consola (útil en desarrollo)
- **Soporte 204 No Content**: Devuelve `null` para respuestas sin cuerpo
- **Detección de CORS**: Identifica errores de red como posibles problemas de CORS
- **Base URL configurable**: Lee `VITE_API_URL` del entorno

### Endpoints Principales

| Método | Endpoint | Descripción | Roles |
|---|---|---|---|
| POST | `/api/auth/login` | Autenticación | Público |
| GET | `/api/doctors` | Listar médicos | Admin, Scheduler |
| GET | `/api/appointments/by-doctor` | Citas por médico | Admin, Scheduler |
| POST | `/api/appointments` | Crear cita (Scheduler) | Scheduler |
| POST | `/api/patient/appointments` | Crear cita (Paciente) | Patient |
| GET | `/api/patients/{documentId}` | Datos de paciente | Admin, Doctor |

---

## Gestión de Estado

El proyecto usa una estrategia **ligera y sin librerías de estado global** (no hay Redux, Zustand ni Context API):

| Tipo de estado | Solución |
|---|---|
| Autenticación | `authStore.ts` → `localStorage` + in-memory fallback |
| Estado de formularios | `React Hook Form` |
| Estado de componente | `useState` / `useReducer` locales |
| Estado derivado | `useMemo` / `useCallback` |
| Datos del servidor | Llamadas directas con `apiFetch` en `useEffect` |

---

## Sistema de Tipos

Definidos en `src/app/types/`:

```typescript
// auth.types.ts
type UserRole = 'Admin' | 'Scheduler' | 'Patient' | 'Doctor'
interface AuthData { token: string; role: UserRole; fullName: string; id: string }

// appointment.types.ts
interface Appointment {
  id: string; date: string; time: string;
  patient: string; doctor: string;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  color: string;
}
interface CreateAppointmentPayload {
  documentId: string; fullName: string; phone: string;
  gender: Gender; birthDate: string; email: string;
  doctorId: string; date: string; time: string;
}

// doctor.types.ts
interface DoctorApiItem {
  id: string; fullName: string; specialty: string;
  type: string; intervalMinutes: number; isActive: boolean;
}

// common.types.ts
type Gender = 'Masculino' | 'Femenino' | 'Otro'
```

---

## Componentes Principales

### Layout (`src/app/components/Layout.tsx`)

Wrapper raíz de todas las páginas protegidas. Orquesta:
- `Sidebar` con menú de navegación por rol
- Topbar con información del usuario activo
- `Outlet` de React Router para las páginas hijas
- Carga la lista de médicos para el modal de nueva cita
- Revalidación periódica del token (cada 60 s)

### Sidebar (`src/app/components/Sidebar.tsx`)

- Menú dinámico basado en `UserRole`
- Avatar con iniciales del usuario
- Soporte de menú hamburguesa para móvil
- Botón de logout con limpieza de `authStore`

### SchedulingFlow (`src/app/pages/SchedulingFlow.tsx`)

Flujo de agendamiento para pacientes en 4 pasos:
1. Selección de médico
2. Selección de fecha y hora
3. Datos personales del paciente
4. Confirmación y envío

Usa `ProgressSteps.tsx` como indicador visual del avance.

### DailyAgenda (`src/app/pages/DailyAgenda.tsx`)

- Lista de citas del día con filtrado por fecha
- Modal de detalle de cita
- Modal de reagendamiento
- Modal de nueva cita (disponible para Scheduler/Admin)

### Doctors (`src/app/pages/Doctors.tsx`)

- Tabla de médicos con estado activo/inactivo
- Activación/desactivación de médicos
- Solo accesible para Admin

### UI Library (`src/app/components/ui/`)

Más de 50 componentes wrapper sobre Radix UI: `Button`, `Dialog`, `Form`, `Select`, `Popover`, `Tooltip`, `Badge`, `Card`, `Input`, `Checkbox`, `DatePicker`, entre otros. Todos accesibles por defecto (WAI-ARIA).

---

## Estilos y Diseño Visual

### Estrategia de Estilos

El proyecto combina tres capas:

1. **Tailwind CSS** (`tailwind.css`): Utilidades atómicas para layout, spacing y typography
2. **CSS Variables** (`theme.css`): Tokens de diseño reutilizables y clases de componentes personalizadas
3. **Emotion/MUI** (`@emotion/react`): CSS-in-JS para componentes Material UI

### Paleta de Colores

```javascript
// src/app/data/mockData.ts
export const COLORS = {
  blue:       '#1E88E5',  // Acento principal
  blueDark:   '#1565C0',  // Hover / estados activos
  blueLight:  '#E3F2FD',  // Fondos de highlight
  green:      '#2E7D32',  // Estados de éxito / confirmado
  greenLight: '#E8F5E9',
  bg:         '#F4F6F8',  // Fondo de aplicación
  text:       '#2C3E50',  // Texto principal
  error:      '#D32F2F',  // Estados de error / cancelado
  errorLight: '#FFEBEE',
}
```

### Configuración de Vite (`vite.config.ts`)

```typescript
export default defineConfig({
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: { '@': './src' }       // Alias para imports absolutos
  },
  assetsInclude: ['**/*.svg', '**/*.csv'],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
  }
})
```

---

## Testing

### Estructura de Tests

```
src/test/
├── setup.ts                             # Importa @testing-library/jest-dom
├── pages/
│   ├── DailyAgenda.test.tsx             # Tests de NewAppointmentModal
│   └── AppointmentsByDoctor.test.tsx    # Tests de renderizado
└── utils/
    └── timeHelpers.test.ts              # Tests de funciones utilitarias
```

### Ejecutar Tests

```bash
npm run test            # Modo watch (interactivo)
npm run test:run        # Ejecución única (CI)
npm run test:coverage   # Con reporte de cobertura en /coverage
```

---

## Scripts Disponibles

```bash
npm run dev             # Inicia servidor de desarrollo con HMR
npm run build           # Build de producción en /dist
npm run preview         # Previsualiza el build de producción localmente
npm run test            # Tests en modo watch
npm run test:run        # Tests en modo CI (una sola ejecución)
npm run test:coverage   # Tests + reporte de cobertura
```

---

## Consideraciones de Desarrollo

- El alias `@` apunta a `./src`. Úsalo para imports absolutos: `import { apiFetch } from '@/app/services/api'`
- Los datos en `src/app/data/mockData.ts` están destinados a ser reemplazados progresivamente por llamadas reales a la API
- El backend debe estar corriendo en `http://localhost:5071` o configurar `VITE_API_URL` en `.env`
- La verificación criptográfica del JWT ocurre **únicamente en el backend**; el cliente solo decodifica el payload para propósitos de UX (nombre, rol, ID)
