export type UserRole = 'admin' | 'worker' | 'staff';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  isActive: boolean;
}

export interface Patient {
  id: string;
  fullName: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  contact: {
    phone: string;
    email?: string;
    address?: string;
  };
  emergencyContact: {
    name: string;
    phone: string;
    relationship?: string;
  };
  addictionType: string;
  medicalHistory?: string;
  admissionDate: string;
  dischargeDate?: string;
  recoveryStatus: 'admitted' | 'in-treatment' | 'recovering' | 'discharged' | 'relapsed';
  recoveryDuration?: number;
  assignedWorker?: string;
  assignedStaff?: string;
  treatmentPlan?: string;
  progressNotes: ProgressNote[];
  finalReport?: string;
}

export interface ProgressNote {
  note: string;
  addedBy: string;
  date: string;
}

export interface Worker {
  id: string;
  user: User;
  specialization?: string;
  assignedPatients: string[];
  performanceScore: number;
}

export interface StaffMember {
  id: string;
  user: User;
  staffRole: 'doctor' | 'nurse' | 'counselor';
  department?: string;
  schedule?: string;
  attendance: { date: string; status: 'present' | 'absent' | 'leave' }[];
}

export interface Medicine {
  id: string;
  name: string;
  description?: string;
  category?: string;
  stockQuantity: number;
  unit: 'tablets' | 'capsules' | 'ml' | 'mg' | 'units';
  manufacturer?: string;
  expiryDate?: string;
  isActive: boolean;
}

export interface Visit {
  id: string;
  patient: string;
  patientName?: string;
  worker: string;
  workerName?: string;
  visitDate: string;
  notes: string;
  patientCondition: 'stable' | 'improving' | 'declining' | 'critical' | 'recovered';
  behaviorReport?: string;
  recommendations?: string;
}

export interface DashboardStats {
  totalPatients: number;
  activePatients: number;
  dischargedPatients: number;
  totalWorkers: number;
  totalStaff: number;
  totalMedicines: number;
  averageRecoveryDays: number;
  recoveryRate: number;
}
