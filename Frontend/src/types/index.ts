export type UserRole = 'admin' | 'worker' | 'staff' | 'doctor' | 'nurse' | 'counselor' | 'therapist' | 'receptionist' | 'compounder' | 'patient';

export interface User {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role: UserRole;
  staffRole?: 'doctor' | 'nurse' | 'counselor' | 'therapist' | 'receptionist' | 'compounder';
  phone?: string;
  avatar?: string;
  department?: string;
  specialization?: string[];
  isActive?: boolean;
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
  assignedStaff?: string | StaffMember;
  treatmentPlan?: string | TreatmentPlan;
  medicines?: (string | any)[];
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
  _id?: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  address?: string;
  shift?: 'morning' | 'afternoon' | 'night' | 'flexible';
  isActive?: boolean;
  specialization?: string;
  assignedPatients?: string[];
  performanceScore?: number;
  totalVisits?: number;
  averageRating?: number;
  patientSatisfactionScore?: number;
  schedule?: { day: string; available: boolean }[];
  joinDate?: string;
  notes?: string;
  user?: User;
}

export interface StaffMember {
  id: string;
  _id?: string;
  user?: User;
  staffRole: 'doctor' | 'nurse' | 'counselor' | 'therapist' | 'receptionist' | 'compounder';
  department?: string;
  loginPassword?: string;
  shift?: 'morning' | 'afternoon' | 'night' | 'flexible';
  schedule?: string;
  attendance?: { date: string; status: 'present' | 'absent' | 'leave' }[];
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
  visitType?: 'counseling' | 'health-check' | 'activity' | 'assessment' | 'follow-up';
  notes: string;
  patientCondition: 'stable' | 'improving' | 'declining' | 'critical' | 'recovered';
  behaviorReport?: string;
  recommendations?: string;
}

export interface Campaign {
  id: string;
  placeName: string;
  assignedWorker: string;
  assignedWorkerName?: string;
  sentBy?: string;
  sentByName: string;
  campaignDate: string;
  description: string;
  status: 'pending' | 'completed';
  teamMembers: string[];
  completedAt?: string;
}

export interface ProgressReport {
  id: string;
  patient: string;
  patientName?: string;
  worker?: string;
  workerName: string;
  reportDate: string;
  report: string;
  medicineTaken: boolean;
  medicineNotes?: string;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  category: 'mental-health' | 'physical-health' | 'support-group' | 'emergency' | 'education' | 'other';
  link?: string;
  phone?: string;
  address?: string;
  isActive: boolean;
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

// ─── New Types for Enhanced Features ───

export interface Discharge {
  id: string;
  patient: string;
  patientName?: string;
  dischargeDate: string;
  admissionDate: string;
  recoveryDays?: number;
  recoveryStatus: 'fully-recovered' | 'partially-recovered' | 'relapsed' | 'transferred';
  finalNotes?: string;
  recommendedFollowUp?: string;
  dischargeSummary?: string;
  dischargedBy?: string;
  successRate?: number;
  afterCareInstructions?: string;
}

export interface Attendance {
  id: string;
  member?: string;
  memberType?: 'staff' | 'worker' | '';
  staff?: string;
  staffName?: string;
  worker?: string;
  workerName?: string;
  date: string;
  timeIn?: string;
  timeOut?: string;
  status: 'present' | 'absent' | 'leave' | 'half-day';
  reason?: string;
  notes?: string;
  shift: 'morning' | 'evening' | 'night';
}

export interface TreatmentPlan {
  id: string;
  patient: string;
  patientName?: string;
  createdBy?: string;
  createdByName?: string;
  therapist?: string;
  therapistName?: string;
  planType: 'detox' | 'rehabilitation' | 'counseling' | 'medication' | 'combined';
  startDate: string;
  endDate?: string;
  goals: string[];
  activities: Array<{ activity: string; frequency: string; duration?: number; notes?: string }>;
  medicines: Array<{ medicineId: string; dosage: string; frequency: string; startDate: string; endDate?: string }>;
  therapy: string[];
  status: 'active' | 'completed' | 'paused' | 'discontinued';
  notes?: string;
  progressReviews?: Array<{ date: string; reviewer: string; notes: string; status: string }>;
  version?: number;
  history?: TreatmentPlanVersion[];
}

export interface TreatmentPlanVersion {
  version: number;
  archivedAt: string;
  updatedBy?: string;
  changeNote?: string;
  planType?: 'detox' | 'rehabilitation' | 'counseling' | 'medication' | 'combined';
  startDate?: string;
  endDate?: string;
  goals?: string[];
  activities?: Array<{ activity: string; frequency: string; duration?: number; notes?: string }>;
  medicines?: Array<{ medicineId: string; dosage: string; frequency: string; startDate: string; endDate?: string }>;
  therapy?: string[];
  status?: 'active' | 'completed' | 'paused' | 'discontinued';
  notes?: string;
}

