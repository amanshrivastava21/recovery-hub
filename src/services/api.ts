import type {
  Patient, Medicine, Visit, DashboardStats, User, StaffMember, Worker
} from '@/types';
import { registerUser } from '@/contexts/AuthContext';

// ─── Configuration ───────────────────────────────────────
const API_URL = import.meta.env.VITE_API_URL || '';

const getToken = (): string | null => localStorage.getItem('rcms_token');

const headers = (): HeadersInit => {
  const h: HeadersInit = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
};

const apiFetch = async (path: string, options?: RequestInit) => {
  const res = await fetch(`${API_URL}${path}`, { ...options, headers: { ...headers(), ...options?.headers } });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `Request failed with status ${res.status}`);
  return data;
};

// ─── Check if backend is available ───────────────────────
const isBackendMode = (): boolean => !!API_URL;

// ─── Mock Data ───────────────────────────────────────────
let mockPatients: Patient[] = [
  {
    id: 'p1', fullName: 'Ahmed Khan', age: 32, gender: 'male',
    contact: { phone: '555-1001', email: 'ahmed@mail.com', address: '123 Main St' },
    emergencyContact: { name: 'Ali Khan', phone: '555-2001', relationship: 'Brother' },
    addictionType: 'Substance Abuse', medicalHistory: 'No prior conditions',
    admissionDate: '2025-11-15', recoveryStatus: 'in-treatment',
    assignedWorker: '2', assignedStaff: '3', treatmentPlan: 'CBT + Group Therapy',
    progressNotes: [
      { note: 'Patient responding well to therapy', addedBy: 'Dr. Sarah Staff', date: '2025-12-01' },
      { note: 'Improved behavior observed', addedBy: 'John Worker', date: '2025-12-15' },
    ],
  },
  {
    id: 'p2', fullName: 'Fatima Ali', age: 28, gender: 'female',
    contact: { phone: '555-1002', address: '456 Oak Ave' },
    emergencyContact: { name: 'Hasan Ali', phone: '555-2002', relationship: 'Father' },
    addictionType: 'Alcohol Dependency', admissionDate: '2025-10-01',
    dischargeDate: '2026-01-15', recoveryStatus: 'discharged', recoveryDuration: 106,
    assignedWorker: '2', treatmentPlan: '12-Step Program',
    progressNotes: [{ note: 'Successfully completed program', addedBy: 'Dr. Sarah Staff', date: '2026-01-14' }],
    finalReport: 'Patient completed full recovery program. Recommended follow-up in 3 months.',
  },
  {
    id: 'p3', fullName: 'Omar Farooq', age: 45, gender: 'male',
    contact: { phone: '555-1003' },
    emergencyContact: { name: 'Zainab Farooq', phone: '555-2003', relationship: 'Wife' },
    addictionType: 'Opioid Addiction', admissionDate: '2026-02-10', recoveryStatus: 'admitted',
    assignedWorker: '2', progressNotes: [],
  },
  {
    id: 'p4', fullName: 'Aisha Begum', age: 35, gender: 'female',
    contact: { phone: '555-1004', address: '789 Pine Rd' },
    emergencyContact: { name: 'Tariq Begum', phone: '555-2004', relationship: 'Husband' },
    addictionType: 'Prescription Drug Abuse', admissionDate: '2026-01-20', recoveryStatus: 'recovering',
    assignedWorker: '2', assignedStaff: '3', treatmentPlan: 'Medication-Assisted Treatment',
    progressNotes: [{ note: 'Showing signs of recovery', addedBy: 'Dr. Sarah Staff', date: '2026-03-01' }],
  },
  {
    id: 'p5', fullName: 'Bilal Hassan', age: 29, gender: 'male',
    contact: { phone: '555-1005', email: 'bilal@mail.com' },
    emergencyContact: { name: 'Saeed Hassan', phone: '555-2005', relationship: 'Father' },
    addictionType: 'Methamphetamine Addiction', admissionDate: '2026-03-01', recoveryStatus: 'in-treatment',
    assignedWorker: '5', assignedStaff: '3', treatmentPlan: 'Intensive Outpatient Program',
    progressNotes: [{ note: 'Enrolled in group therapy', addedBy: 'David Counselor', date: '2026-03-05' }],
  },
];

let mockMedicines: Medicine[] = [
  { id: 'm1', name: 'Methadone', description: 'Opioid agonist for addiction treatment', category: 'Opioid Treatment', stockQuantity: 500, unit: 'mg', manufacturer: 'PharmaCo', expiryDate: '2027-06-30', isActive: true },
  { id: 'm2', name: 'Naltrexone', description: 'Opioid antagonist', category: 'Opioid Treatment', stockQuantity: 200, unit: 'tablets', manufacturer: 'MedLife', expiryDate: '2027-03-15', isActive: true },
  { id: 'm3', name: 'Disulfiram', description: 'Alcohol deterrent', category: 'Alcohol Treatment', stockQuantity: 150, unit: 'tablets', manufacturer: 'HealthGen', expiryDate: '2026-12-31', isActive: true },
  { id: 'm4', name: 'Buprenorphine', description: 'Partial opioid agonist', category: 'Opioid Treatment', stockQuantity: 80, unit: 'mg', manufacturer: 'PharmaCo', expiryDate: '2027-09-15', isActive: true },
  { id: 'm5', name: 'Diazepam', description: 'Benzodiazepine for withdrawal', category: 'Withdrawal Management', stockQuantity: 300, unit: 'tablets', manufacturer: 'GenMed', expiryDate: '2026-08-20', isActive: true },
  { id: 'm6', name: 'Acamprosate', description: 'Reduces alcohol cravings', category: 'Alcohol Treatment', stockQuantity: 45, unit: 'tablets', manufacturer: 'RehabMed', expiryDate: '2027-01-10', isActive: true },
];

let mockVisits: Visit[] = [
  { id: 'v1', patient: 'p1', patientName: 'Ahmed Khan', worker: '2', workerName: 'John Worker', visitDate: '2026-03-25', notes: 'Patient appears more engaged in group sessions. Showing positive attitude.', patientCondition: 'improving', behaviorReport: 'Cooperative and participative', recommendations: 'Continue current treatment plan' },
  { id: 'v2', patient: 'p3', patientName: 'Omar Farooq', worker: '2', workerName: 'John Worker', visitDate: '2026-03-23', notes: 'Initial assessment completed. Patient shows willingness to recover.', patientCondition: 'stable', behaviorReport: 'Anxious but cooperative' },
  { id: 'v3', patient: 'p4', patientName: 'Aisha Begum', worker: '2', workerName: 'John Worker', visitDate: '2026-03-20', notes: 'Good progress on medication reduction schedule', patientCondition: 'improving', recommendations: 'Reduce dosage by 10% next week' },
  { id: 'v4', patient: 'p1', patientName: 'Ahmed Khan', worker: '2', workerName: 'John Worker', visitDate: '2026-03-15', notes: 'Mild withdrawal symptoms reported but manageable', patientCondition: 'stable', behaviorReport: 'Slightly agitated', recommendations: 'Monitor closely for next 48 hours' },
  { id: 'v5', patient: 'p5', patientName: 'Bilal Hassan', worker: '5', workerName: 'David Counselor', visitDate: '2026-03-22', notes: 'First counseling session. Patient is motivated.', patientCondition: 'stable', behaviorReport: 'Engaged and responsive' },
];

const mockUsers: User[] = [
  { id: '1', name: 'System Admin', email: 'admin@rcms.com', role: 'admin', isActive: true },
  { id: '2', name: 'John Worker', email: 'worker@rcms.com', role: 'worker', phone: '555-0102', isActive: true },
  { id: '3', name: 'Dr. Sarah Staff', email: 'staff@rcms.com', role: 'staff', phone: '555-0103', isActive: true },
  { id: '4', name: 'Nurse Mary', email: 'mary@rcms.com', role: 'staff', phone: '555-0104', isActive: true },
  { id: '5', name: 'David Counselor', email: 'david@rcms.com', role: 'worker', phone: '555-0105', isActive: true },
];

let users = [...mockUsers];

const mockStaff: StaffMember[] = [
  { id: 's1', user: mockUsers[2], staffRole: 'doctor', department: 'Rehabilitation', schedule: 'Mon-Fri 8AM-4PM', attendance: [{ date: '2026-03-27', status: 'present' }, { date: '2026-03-26', status: 'present' }, { date: '2026-03-25', status: 'present' }] },
  { id: 's2', user: mockUsers[3], staffRole: 'nurse', department: 'Care Unit', schedule: 'Mon-Sat 7AM-3PM', attendance: [{ date: '2026-03-27', status: 'present' }, { date: '2026-03-26', status: 'leave' }, { date: '2026-03-25', status: 'present' }] },
];

const mockWorkers: Worker[] = [
  { id: 'w1', user: mockUsers[1], specialization: 'Addiction Counseling', assignedPatients: ['p1', 'p3', 'p4'], performanceScore: 85 },
  { id: 'w2', user: mockUsers[4], specialization: 'Behavioral Therapy', assignedPatients: ['p5'], performanceScore: 72 },
];

// ─── API Service ─────────────────────────────────────────
export const api = {
  // ── Dashboard ──
  getDashboardStats: async (): Promise<DashboardStats> => {
    if (isBackendMode()) {
      const res = await apiFetch('/api/reports/dashboard');
      return res.data;
    }
    const total = mockPatients.length;
    const active = mockPatients.filter(p => p.recoveryStatus !== 'discharged').length;
    const discharged = mockPatients.filter(p => p.recoveryStatus === 'discharged').length;
    const withDuration = mockPatients.filter(p => p.recoveryDuration);
    const avgDays = withDuration.length > 0 ? withDuration.reduce((s, p) => s + (p.recoveryDuration || 0), 0) / withDuration.length : 0;
    return {
      totalPatients: total, activePatients: active, dischargedPatients: discharged,
      totalWorkers: mockWorkers.length, totalStaff: mockStaff.length, totalMedicines: mockMedicines.length,
      averageRecoveryDays: Math.round(avgDays), recoveryRate: total > 0 ? Math.round((discharged / total) * 100) : 0,
    };
  },

  // ── Patients ──
  getPatients: async (): Promise<Patient[]> => {
    if (isBackendMode()) {
      const res = await apiFetch('/api/patients');
      return res.data;
    }
    return [...mockPatients];
  },
  getPatient: async (id: string): Promise<Patient | undefined> => {
    if (isBackendMode()) {
      const res = await apiFetch(`/api/patients/${id}`);
      return res.data;
    }
    return mockPatients.find(p => p.id === id);
  },
  createPatient: async (data: Omit<Patient, 'id' | 'progressNotes'>): Promise<Patient> => {
    if (isBackendMode()) {
      const res = await apiFetch('/api/patients', { method: 'POST', body: JSON.stringify(data) });
      return res.data;
    }
    const p = { ...data, id: 'p' + Date.now(), progressNotes: [] } as Patient;
    mockPatients = [...mockPatients, p];
    return p;
  },
  updatePatient: async (id: string, data: Partial<Patient>): Promise<Patient> => {
    if (isBackendMode()) {
      const res = await apiFetch(`/api/patients/${id}`, { method: 'PUT', body: JSON.stringify(data) });
      return res.data;
    }
    const idx = mockPatients.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Patient not found');
    mockPatients[idx] = { ...mockPatients[idx], ...data };
    return mockPatients[idx];
  },
  deletePatient: async (id: string): Promise<void> => {
    if (isBackendMode()) {
      await apiFetch(`/api/patients/${id}`, { method: 'DELETE' });
      return;
    }
    mockPatients = mockPatients.filter(p => p.id !== id);
  },
  dischargePatient: async (id: string, dischargeDate: string, finalReport: string): Promise<Patient> => {
    if (isBackendMode()) {
      const res = await apiFetch(`/api/patients/${id}/discharge`, {
        method: 'POST', body: JSON.stringify({ dischargeDate, finalReport }),
      });
      return res.data;
    }
    const idx = mockPatients.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Patient not found');
    const admission = new Date(mockPatients[idx].admissionDate);
    const discharge = new Date(dischargeDate);
    const days = Math.ceil((discharge.getTime() - admission.getTime()) / (1000 * 60 * 60 * 24));
    mockPatients[idx] = { ...mockPatients[idx], dischargeDate, recoveryStatus: 'discharged', recoveryDuration: days, finalReport };
    return mockPatients[idx];
  },

  // ── Medicines ──
  getMedicines: async (): Promise<Medicine[]> => {
    if (isBackendMode()) {
      const res = await apiFetch('/api/medicines');
      return res.data;
    }
    return [...mockMedicines];
  },
  createMedicine: async (data: Omit<Medicine, 'id'>): Promise<Medicine> => {
    if (isBackendMode()) {
      const res = await apiFetch('/api/medicines', { method: 'POST', body: JSON.stringify(data) });
      return res.data;
    }
    const m = { ...data, id: 'm' + Date.now() };
    mockMedicines = [...mockMedicines, m];
    return m;
  },
  updateMedicine: async (id: string, data: Partial<Medicine>): Promise<Medicine> => {
    if (isBackendMode()) {
      const res = await apiFetch(`/api/medicines/${id}`, { method: 'PUT', body: JSON.stringify(data) });
      return res.data;
    }
    const idx = mockMedicines.findIndex(m => m.id === id);
    if (idx === -1) throw new Error('Medicine not found');
    mockMedicines[idx] = { ...mockMedicines[idx], ...data };
    return mockMedicines[idx];
  },
  deleteMedicine: async (id: string): Promise<void> => {
    if (isBackendMode()) {
      await apiFetch(`/api/medicines/${id}`, { method: 'DELETE' });
      return;
    }
    mockMedicines = mockMedicines.filter(m => m.id !== id);
  },

  // ── Visits ──
  getVisits: async (): Promise<Visit[]> => {
    if (isBackendMode()) {
      const res = await apiFetch('/api/visits');
      return res.data;
    }
    return [...mockVisits];
  },
  createVisit: async (data: Omit<Visit, 'id'>): Promise<Visit> => {
    if (isBackendMode()) {
      const res = await apiFetch('/api/visits', { method: 'POST', body: JSON.stringify(data) });
      return res.data;
    }
    const v = { ...data, id: 'v' + Date.now() };
    mockVisits = [v, ...mockVisits];
    return v;
  },

  // ── Users ──
  getUsers: async (): Promise<User[]> => {
    if (isBackendMode()) {
      const res = await apiFetch('/api/users');
      return res.data;
    }
    return [...users];
  },
  createUser: async (data: Omit<User, 'id'> & { password?: string; staffRole?: string }): Promise<User> => {
    if (isBackendMode()) {
      const res = await apiFetch('/api/users', { method: 'POST', body: JSON.stringify(data) });
      return res.data;
    }
    const u = { id: String(Date.now()), name: data.name, email: data.email, role: data.role, phone: data.phone, isActive: data.isActive ?? true };
    users = [...users, u];
    // Register in auth system so the new user can login
    const password = data.password || 'Password@123';
    registerUser(data.email, password, u);
    return u;
  },
  deleteUser: async (id: string): Promise<void> => {
    if (isBackendMode()) {
      await apiFetch(`/api/users/${id}`, { method: 'DELETE' });
      return;
    }
    users = users.filter(u => u.id !== id);
  },

  // ── Workers ──
  getWorkers: async (): Promise<Worker[]> => {
    if (isBackendMode()) {
      const res = await apiFetch('/api/workers');
      return res.data;
    }
    return [...mockWorkers];
  },

  // ── Staff ──
  getStaff: async (): Promise<StaffMember[]> => {
    if (isBackendMode()) {
      const res = await apiFetch('/api/staff');
      return res.data;
    }
    return [...mockStaff];
  },
};
