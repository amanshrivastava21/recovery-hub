import type {
  Patient, Medicine, Visit, DashboardStats, User, StaffMember, Worker
} from '@/types';

// ─── Mock Data ───────────────────────────────────────────
const mockPatients: Patient[] = [
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
];

const mockMedicines: Medicine[] = [
  { id: 'm1', name: 'Methadone', description: 'Opioid agonist for addiction treatment', category: 'Opioid Treatment', stockQuantity: 500, unit: 'mg', manufacturer: 'PharmaCo', expiryDate: '2027-06-30', isActive: true },
  { id: 'm2', name: 'Naltrexone', description: 'Opioid antagonist', category: 'Opioid Treatment', stockQuantity: 200, unit: 'tablets', manufacturer: 'MedLife', expiryDate: '2027-03-15', isActive: true },
  { id: 'm3', name: 'Disulfiram', description: 'Alcohol deterrent', category: 'Alcohol Treatment', stockQuantity: 150, unit: 'tablets', manufacturer: 'HealthGen', expiryDate: '2026-12-31', isActive: true },
  { id: 'm4', name: 'Buprenorphine', description: 'Partial opioid agonist', category: 'Opioid Treatment', stockQuantity: 80, unit: 'mg', manufacturer: 'PharmaCo', expiryDate: '2027-09-15', isActive: true },
  { id: 'm5', name: 'Diazepam', description: 'Benzodiazepine for withdrawal', category: 'Withdrawal Management', stockQuantity: 300, unit: 'tablets', manufacturer: 'GenMed', expiryDate: '2026-08-20', isActive: true },
];

const mockVisits: Visit[] = [
  { id: 'v1', patient: 'p1', patientName: 'Ahmed Khan', worker: '2', workerName: 'John Worker', visitDate: '2026-03-20', notes: 'Patient appears more engaged in group sessions', patientCondition: 'improving', behaviorReport: 'Cooperative and participative', recommendations: 'Continue current treatment plan' },
  { id: 'v2', patient: 'p3', patientName: 'Omar Farooq', worker: '2', workerName: 'John Worker', visitDate: '2026-03-18', notes: 'Initial assessment completed. Patient shows willingness to recover.', patientCondition: 'stable', behaviorReport: 'Anxious but cooperative' },
  { id: 'v3', patient: 'p4', patientName: 'Aisha Begum', worker: '2', workerName: 'John Worker', visitDate: '2026-03-15', notes: 'Good progress on medication reduction schedule', patientCondition: 'improving', recommendations: 'Reduce dosage by 10% next week' },
  { id: 'v4', patient: 'p1', patientName: 'Ahmed Khan', worker: '2', workerName: 'John Worker', visitDate: '2026-03-10', notes: 'Mild withdrawal symptoms reported', patientCondition: 'stable', behaviorReport: 'Slightly agitated', recommendations: 'Monitor closely for next 48 hours' },
];

const mockUsers: User[] = [
  { id: '1', name: 'System Admin', email: 'admin@rcms.com', role: 'admin', isActive: true },
  { id: '2', name: 'John Worker', email: 'worker@rcms.com', role: 'worker', phone: '555-0102', isActive: true },
  { id: '3', name: 'Dr. Sarah Staff', email: 'staff@rcms.com', role: 'staff', phone: '555-0103', isActive: true },
  { id: '4', name: 'Nurse Mary', email: 'mary@rcms.com', role: 'staff', phone: '555-0104', isActive: true },
  { id: '5', name: 'David Counselor', email: 'david@rcms.com', role: 'worker', phone: '555-0105', isActive: true },
];

const mockStaff: StaffMember[] = [
  { id: 's1', user: mockUsers[2], staffRole: 'doctor', department: 'Rehabilitation', schedule: 'Mon-Fri 8AM-4PM', attendance: [{ date: '2026-03-27', status: 'present' }, { date: '2026-03-26', status: 'present' }] },
  { id: 's2', user: mockUsers[3], staffRole: 'nurse', department: 'Care Unit', schedule: 'Mon-Sat 7AM-3PM', attendance: [{ date: '2026-03-27', status: 'present' }, { date: '2026-03-26', status: 'leave' }] },
];

const mockWorkers: Worker[] = [
  { id: 'w1', user: mockUsers[1], specialization: 'Addiction Counseling', assignedPatients: ['p1', 'p3', 'p4'], performanceScore: 85 },
  { id: 'w2', user: mockUsers[4], specialization: 'Behavioral Therapy', assignedPatients: [], performanceScore: 72 },
];

// ─── Service Functions ───────────────────────────────────
// These use mock data. When backend is running, swap to fetch calls.

let patients = [...mockPatients];
let medicines = [...mockMedicines];
let visits = [...mockVisits];
let users = [...mockUsers];

export const api = {
  // Dashboard
  getDashboardStats: async (): Promise<DashboardStats> => {
    const total = patients.length;
    const active = patients.filter(p => p.recoveryStatus !== 'discharged').length;
    const discharged = patients.filter(p => p.recoveryStatus === 'discharged').length;
    const avgDays = patients.filter(p => p.recoveryDuration).reduce((s, p) => s + (p.recoveryDuration || 0), 0) / (discharged || 1);
    return {
      totalPatients: total, activePatients: active, dischargedPatients: discharged,
      totalWorkers: mockWorkers.length, totalStaff: mockStaff.length, totalMedicines: medicines.length,
      averageRecoveryDays: Math.round(avgDays), recoveryRate: total > 0 ? Math.round((discharged / total) * 100) : 0,
    };
  },

  // Patients
  getPatients: async (): Promise<Patient[]> => [...patients],
  getPatient: async (id: string): Promise<Patient | undefined> => patients.find(p => p.id === id),
  createPatient: async (data: Omit<Patient, 'id' | 'progressNotes'>): Promise<Patient> => {
    const p = { ...data, id: 'p' + Date.now(), progressNotes: [] } as Patient;
    patients.push(p);
    return p;
  },
  updatePatient: async (id: string, data: Partial<Patient>): Promise<Patient> => {
    const idx = patients.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Patient not found');
    patients[idx] = { ...patients[idx], ...data };
    return patients[idx];
  },
  deletePatient: async (id: string): Promise<void> => {
    patients = patients.filter(p => p.id !== id);
  },
  dischargePatient: async (id: string, dischargeDate: string, finalReport: string): Promise<Patient> => {
    const idx = patients.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Patient not found');
    const admission = new Date(patients[idx].admissionDate);
    const discharge = new Date(dischargeDate);
    const days = Math.ceil((discharge.getTime() - admission.getTime()) / (1000 * 60 * 60 * 24));
    patients[idx] = { ...patients[idx], dischargeDate, recoveryStatus: 'discharged', recoveryDuration: days, finalReport };
    return patients[idx];
  },

  // Medicines
  getMedicines: async (): Promise<Medicine[]> => [...medicines],
  createMedicine: async (data: Omit<Medicine, 'id'>): Promise<Medicine> => {
    const m = { ...data, id: 'm' + Date.now() };
    medicines.push(m);
    return m;
  },
  updateMedicine: async (id: string, data: Partial<Medicine>): Promise<Medicine> => {
    const idx = medicines.findIndex(m => m.id === id);
    if (idx === -1) throw new Error('Medicine not found');
    medicines[idx] = { ...medicines[idx], ...data };
    return medicines[idx];
  },
  deleteMedicine: async (id: string): Promise<void> => {
    medicines = medicines.filter(m => m.id !== id);
  },

  // Visits
  getVisits: async (): Promise<Visit[]> => [...visits],
  createVisit: async (data: Omit<Visit, 'id'>): Promise<Visit> => {
    const v = { ...data, id: 'v' + Date.now() };
    visits.push(v);
    return v;
  },

  // Users
  getUsers: async (): Promise<User[]> => [...users],
  createUser: async (data: Omit<User, 'id'>): Promise<User> => {
    const u = { ...data, id: String(Date.now()) };
    users.push(u);
    return u;
  },
  deleteUser: async (id: string): Promise<void> => {
    users = users.filter(u => u.id !== id);
  },

  // Workers
  getWorkers: async (): Promise<Worker[]> => [...mockWorkers],

  // Staff
  getStaff: async (): Promise<StaffMember[]> => [...mockStaff],
};
