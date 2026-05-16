import type {
  Patient, Medicine, Visit, DashboardStats, User, StaffMember, Worker, Resource, Discharge, TreatmentPlan, Campaign, ProgressReport
} from '@/types';
import { registerUser } from '@/contexts/AuthContext';

// ─── Configuration ───────────────────────────────────────
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';

const getToken = (): string | null => localStorage.getItem('rcms_token');

const headers = (): HeadersInit => {
  const h: HeadersInit = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
};

const apiFetch = async (path: string, options?: RequestInit) => {
  const res = await fetch(`${API_URL}${path}`, { ...options, headers: { ...headers(), ...options?.headers } });
  const contentType = res.headers.get('content-type') || '';
  const raw = await res.text();
  const data = contentType.includes('application/json') && raw ? JSON.parse(raw) : null;
  if (!res.ok) throw new Error(data?.message || `Request failed with status ${res.status}`);
  if (!data) throw new Error(`Backend did not return JSON for ${path}. Please check VITE_API_URL and backend server.`);
  return data;
};

const normalizeMedicine = (data: any): Medicine => ({
  id: data._id || data.id,
  name: data.name,
  description: data.description,
  category: data.category,
  stockQuantity: data.inventory?.quantity ?? data.stockQuantity ?? 0,
  unit: data.inventory?.unit ?? data.unit ?? 'units',
  manufacturer: data.manufacturer ?? '',
  expiryDate: data.inventory?.expiryDate ?? data.expiryDate,
  isActive: data.isActive,
});

const normalizePatient = (data: any): Patient => {
  const normalized = { ...data, id: data.id || data._id };
  delete (normalized as any)._id;
  return normalized as Patient;
};

const normalizeVisit = (data: any): Visit => ({
  id: data.id || data._id,
  patient: typeof data.patient === 'string' ? data.patient : data.patient?._id || data.patient?.id || '',
  patientName: data.patient?.fullName || data.patientName || data.patient?.name || '',
  worker: typeof data.worker === 'string' ? data.worker : data.worker?._id || data.worker?.id || '',
  workerName: data.worker?.name || data.workerName || data.worker?.user?.name || '',
  visitDate: data.visitDate ? new Date(data.visitDate).toISOString() : '',
  visitType: data.visitType,
  notes: data.notes || '',
  patientCondition: data.patientCondition,
  behaviorReport: data.behaviorReport,
  recommendations: data.recommendations,
});

const normalizeCampaign = (data: any): Campaign => ({
  id: data.id || data._id,
  placeName: data.placeName,
  assignedWorker: typeof data.assignedWorker === 'string' ? data.assignedWorker : data.assignedWorker?._id || data.assignedWorker?.id || '',
  assignedWorkerName: data.assignedWorker?.name || data.assignedWorkerName || '',
  sentBy: typeof data.sentBy === 'string' ? data.sentBy : data.sentBy?._id || data.sentBy?.id,
  sentByName: data.sentBy?.name || data.sentByName || 'Admin',
  campaignDate: data.campaignDate ? new Date(data.campaignDate).toISOString() : '',
  description: data.description || '',
  status: data.status || 'pending',
  teamMembers: Array.isArray(data.teamMembers) ? data.teamMembers : [],
  completedAt: data.completedAt ? new Date(data.completedAt).toISOString() : undefined,
});

const normalizeProgressReport = (data: any): ProgressReport => ({
  id: data.id || data._id,
  patient: typeof data.patient === 'string' ? data.patient : data.patient?._id || data.patient?.id || '',
  patientName: data.patient?.fullName || data.patientName || '',
  worker: typeof data.worker === 'string' ? data.worker : data.worker?._id || data.worker?.id,
  workerName: data.worker?.name || data.workerName || '',
  reportDate: data.reportDate ? new Date(data.reportDate).toISOString() : '',
  report: data.report || '',
  medicineTaken: Boolean(data.medicineTaken),
  medicineNotes: data.medicineNotes || '',
});

const normalizeDischarge = (data: any): Discharge => ({
  id: data.id || data._id,
  patient: typeof data.patient === 'string' ? data.patient : data.patient?._id || data.patient?.id || '',
  patientName: data.patientName || data.patient?.fullName || data.patient?.name || '',
  dischargeDate: data.dischargeDate ? new Date(data.dischargeDate).toISOString() : '',
  admissionDate: data.admissionDate ? new Date(data.admissionDate).toISOString() : '',
  recoveryDays: data.recoveryDays,
  recoveryStatus: data.recoveryStatus,
  finalNotes: data.finalNotes,
  recommendedFollowUp: data.recommendedFollowUp,
  dischargeSummary: data.dischargeSummary,
  dischargedBy: data.dischargedBy?._id || data.dischargedBy?.id || data.dischargedBy,
  successRate: data.successRate,
  afterCareInstructions: data.afterCareInstructions,
});

const getStaffDisplayName = (staff: any): string => (
  staff?.user?.name || staff?.name || staff?.staffRole || ''
);

const normalizeAttendance = (data: any): Attendance => {
  const staffName = data.staffName || data.staff?.user?.name || data.member?.user?.name;
  const workerName = data.workerName || data.worker?.name || data.member?.name;

  return {
    id: data.id || data._id,
    member: data.member?._id || data.member?.id || data.member || data.staff?._id || data.worker?._id || '',
    memberType: data.memberType || (data.staff ? 'staff' : data.worker ? 'worker' : ''),
    staff: data.staff?._id || data.staff?.id || data.staff,
    staffName,
    worker: data.worker?._id || data.worker?.id || data.worker,
    workerName,
    date: data.date ? new Date(data.date).toISOString() : '',
    timeIn: data.timeIn,
    timeOut: data.timeOut,
    status: data.status,
    reason: data.reason,
    notes: data.notes,
    shift: data.shift,
  } as Attendance & { worker?: string; workerName?: string };
};

const normalizeTreatmentPlan = (data: any): TreatmentPlan => ({
  id: data.id || data._id,
  patient: typeof data.patient === 'string' ? data.patient : data.patient?._id || data.patient?.id,
  patientName: data.patient?.fullName || data.patientName || data.patient?.name || (typeof data.patient === 'string' ? data.patient : ''),
  createdBy: data.createdBy?._id || data.createdBy?.id || data.createdBy,
  createdByName: getStaffDisplayName(data.createdBy),
  therapist: data.therapist?._id || data.therapist?.id || data.therapist,
  therapistName: getStaffDisplayName(data.therapist) || getStaffDisplayName(data.patient?.assignedStaff),
  planType: data.planType,
  startDate: data.startDate ? new Date(data.startDate).toISOString() : '',
  endDate: data.endDate ? new Date(data.endDate).toISOString() : undefined,
  goals: Array.isArray(data.goals) ? data.goals : [],
  activities: Array.isArray(data.activities) ? data.activities : [],
  medicines: Array.isArray(data.medicines) ? data.medicines.map((med: any) => ({
    medicineId: med.medicineId?._id || med.medicineId?.id || med.medicineId,
    dosage: med.dosage,
    frequency: med.frequency,
    startDate: med.startDate ? new Date(med.startDate).toISOString() : '',
    endDate: med.endDate ? new Date(med.endDate).toISOString() : undefined,
  })) : [],
  therapy: Array.isArray(data.therapy) ? data.therapy : [],
  status: data.status,
  notes: data.notes,
  progressReviews: Array.isArray(data.progressReviews)
    ? data.progressReviews.map((review: any) => ({
        date: review.date ? new Date(review.date).toISOString() : new Date().toISOString(),
        reviewer: review.reviewer?._id || review.reviewer?.id || review.reviewer,
        notes: review.notes,
        status: review.status,
      }))
    : [],
  version: data.version ?? 1,
  history: Array.isArray(data.history)
    ? data.history.map((item: any) => ({
        version: item.version ?? 1,
        archivedAt: item.archivedAt ? new Date(item.archivedAt).toISOString() : '',
        updatedBy: item.updatedBy?._id || item.updatedBy?.id || item.updatedBy,
        changeNote: item.changeNote,
        planType: item.planType,
        startDate: item.startDate ? new Date(item.startDate).toISOString() : undefined,
        endDate: item.endDate ? new Date(item.endDate).toISOString() : undefined,
        goals: Array.isArray(item.goals) ? item.goals : [],
        activities: Array.isArray(item.activities) ? item.activities : [],
        medicines: Array.isArray(item.medicines) ? item.medicines.map((med: any) => ({
          medicineId: med.medicineId?._id || med.medicineId?.id || med.medicineId,
          dosage: med.dosage,
          frequency: med.frequency,
          startDate: med.startDate ? new Date(med.startDate).toISOString() : '',
          endDate: med.endDate ? new Date(med.endDate).toISOString() : undefined,
        })) : [],
        therapy: Array.isArray(item.therapy) ? item.therapy : [],
        status: item.status,
        notes: item.notes,
      }))
    : [],
});

// ─── API Service ─────────────────────────────────────────
export const api = {
  // ── Dashboard ──
  getDashboardStats: async (): Promise<DashboardStats> => {
    const res = await apiFetch('/api/dashboard/stats');
    return res.data;
  },

  // ── Patients ──
  getPatients: async (): Promise<Patient[]> => {
    const res = await apiFetch('/api/patients');
    const payload = res.data ?? res;
    return Array.isArray(payload) ? payload.map(normalizePatient) : [];
  },
  getPatient: async (id: string): Promise<Patient | undefined> => {
    const res = await apiFetch(`/api/patients/${id}`);
    const payload = res.data ?? res;
    return payload ? normalizePatient(payload) : undefined;
  },
  getMyPatient: async (): Promise<Patient> => {
    const res = await apiFetch('/api/patients/me');
    const payload = res.data ?? res;
    return normalizePatient(payload);
  },
  updateMyPatient: async (data: any): Promise<Patient> => {
    const res = await apiFetch('/api/patients/me', { method: 'PUT', body: JSON.stringify(data) });
    const payload = res.data ?? res;
    return normalizePatient(payload);
  },
  createPatient: async (data: Omit<Patient, 'id' | 'progressNotes'> & { password?: string }): Promise<Patient> => {
    console.log('[api] createPatient called', { API_URL, data });
    const res = await apiFetch('/api/patients', { method: 'POST', body: JSON.stringify(data) });
    console.log('[api] Patient created successfully', res);
    return res.data;
  },
  updatePatient: async (id: string, data: Partial<Patient>): Promise<Patient> => {
    const res = await apiFetch(`/api/patients/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    return res.data;
  },
  deletePatient: async (id: string): Promise<void> => {
    await apiFetch(`/api/patients/${id}`, { method: 'DELETE' });
  },
  dischargePatient: async (id: string, dischargeDate: string, finalReport: string): Promise<Patient> => {
    const res = await apiFetch(`/api/patients/${id}/discharge`, {
      method: 'POST', body: JSON.stringify({ dischargeDate, finalReport }),
    });
    return res.data;
  },

  // ── Medicines ──
  getMedicines: async (): Promise<Medicine[]> => {
    const res = await apiFetch('/api/medicines');
    return res.data.map((item: any) => normalizeMedicine(item));
  },
  getMedicine: async (id: string): Promise<Medicine> => {
    const res = await apiFetch(`/api/medicines/${id}`);
    return normalizeMedicine(res.data ?? res);
  },
  createMedicine: async (data: Omit<Medicine, 'id'>): Promise<Medicine> => {
    const res = await apiFetch('/api/medicines', { method: 'POST', body: JSON.stringify(data) });
    return res.data;
  },
  updateMedicine: async (id: string, data: Partial<Medicine>): Promise<Medicine> => {
    const res = await apiFetch(`/api/medicines/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    return res.data;
  },
  deleteMedicine: async (id: string): Promise<void> => {
    await apiFetch(`/api/medicines/${id}`, { method: 'DELETE' });
  },

  // ── Visits ──
  getVisits: async (): Promise<Visit[]> => {
    const res = await apiFetch('/api/visits');
    const payload = res.data ?? res;
    return Array.isArray(payload) ? payload.map(normalizeVisit) : [];
  },
  createVisit: async (data: Omit<Visit, 'id'>): Promise<Visit> => {
    const res = await apiFetch('/api/visits', { method: 'POST', body: JSON.stringify(data) });
    const payload = res.data ?? res;
    return normalizeVisit(payload);
  },
  deleteVisit: async (id: string): Promise<void> => {
    await apiFetch(`/api/visits/${id}`, { method: 'DELETE' });
  },
  getCampaigns: async (): Promise<Campaign[]> => {
    const res = await apiFetch('/api/campaigns');
    const payload = res.data ?? res;
    return Array.isArray(payload) ? payload.map(normalizeCampaign) : [];
  },
  createCampaign: async (data: Omit<Campaign, 'id'>): Promise<Campaign> => {
    const res = await apiFetch('/api/campaigns', { method: 'POST', body: JSON.stringify(data) });
    return normalizeCampaign(res.data ?? res);
  },
  updateCampaign: async (id: string, data: Partial<Campaign>): Promise<Campaign> => {
    const res = await apiFetch(`/api/campaigns/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    return normalizeCampaign(res.data ?? res);
  },
  deleteCampaign: async (id: string): Promise<void> => {
    await apiFetch(`/api/campaigns/${id}`, { method: 'DELETE' });
  },
  getProgressReports: async (): Promise<ProgressReport[]> => {
    const res = await apiFetch('/api/progress-reports');
    const payload = res.data ?? res;
    return Array.isArray(payload) ? payload.map(normalizeProgressReport) : [];
  },
  createProgressReport: async (data: Omit<ProgressReport, 'id'>): Promise<ProgressReport> => {
    const res = await apiFetch('/api/progress-reports', { method: 'POST', body: JSON.stringify(data) });
    return normalizeProgressReport(res.data ?? res);
  },
  deleteProgressReport: async (id: string): Promise<void> => {
    await apiFetch(`/api/progress-reports/${id}`, { method: 'DELETE' });
  },

  // ── Resources ──
  getResources: async (): Promise<Resource[]> => {
    console.log('[api] GET /api/resources');
    const res = await apiFetch('/api/resources');
    console.log('[api] resources response', res);
    return res.data;
  },
  createResource: async (data: Omit<Resource, 'id' | 'isActive'>): Promise<Resource> => {
    console.log('[api] POST /api/resources', data);
    const res = await apiFetch('/api/resources', { method: 'POST', body: JSON.stringify(data) });
    console.log('[api] create resource response', res);
    return res.data;
  },

  // ── Users ──
  getUsers: async (): Promise<User[]> => {
    const res = await apiFetch('/api/users');
    return res.data;
  },
  createUser: async (data: Omit<User, 'id'> & { password?: string; staffRole?: string; department?: string; specialization?: string }): Promise<User> => {
    const res = await apiFetch('/api/users', { method: 'POST', body: JSON.stringify(data) });
    return res.data;
  },
  deleteUser: async (id: string): Promise<void> => {
    await apiFetch(`/api/users/${id}`, { method: 'DELETE' });
  },

  // ── Staff ──
  getStaff: async (): Promise<StaffMember[]> => {
    const res = await apiFetch('/api/staff');
    return res.data;
  },
  getStaffMember: async (id: string): Promise<StaffMember> => {
    const res = await apiFetch(`/api/staff/${id}`);
    return res.data;
  },
  createStaff: async (data: any): Promise<StaffMember> => {
    const res = await apiFetch('/api/staff', { method: 'POST', body: JSON.stringify(data) });
    return res.data;
  },
  deleteStaff: async (id: string): Promise<void> => {
    await apiFetch(`/api/staff/${id}`, { method: 'DELETE' });
  },

  // ── Workers ──
  getWorkers: async (): Promise<Worker[]> => {
    try {
      const res = await apiFetch('/api/workers');
      const workers = Array.isArray(res.data) ? res.data : [];
      localStorage.setItem('rcms_workers_cache', JSON.stringify(workers));
      return workers;
    } catch (error) {
      const cached = JSON.parse(localStorage.getItem('rcms_workers_cache') || '[]');
      if (Array.isArray(cached) && cached.length > 0) return cached;
      throw error;
    }
  },
  getWorker: async (id: string): Promise<Worker> => {
    const res = await apiFetch(`/api/workers/${id}`);
    return res.data;
  },
  createWorker: async (data: any): Promise<Worker> => {
    const res = await apiFetch('/api/workers', { method: 'POST', body: JSON.stringify(data) });
    const worker = res.data;
    const cached = JSON.parse(localStorage.getItem('rcms_workers_cache') || '[]');
    if (Array.isArray(cached)) {
      localStorage.setItem('rcms_workers_cache', JSON.stringify([...cached.filter((item: Worker) => item.email !== worker.email), worker]));
    }
    return worker;
  },
  deleteWorker: async (id: string): Promise<void> => {
    await apiFetch(`/api/workers/${id}`, { method: 'DELETE' });
  },

  // ── Treatment Plans ──
  getTreatmentPlans: async (): Promise<TreatmentPlan[]> => {
    const res = await apiFetch('/api/treatment-plans');
    const payload = res.data ?? res;
    return Array.isArray(payload) ? payload.map(normalizeTreatmentPlan) : [];
  },
  getTreatmentPlan: async (id: string): Promise<TreatmentPlan> => {
    const res = await apiFetch(`/api/treatment-plans/${id}`);
    const payload = res.data ?? res;
    return normalizeTreatmentPlan(payload);
  },
  createTreatmentPlan: async (data: any): Promise<TreatmentPlan> => {
    const res = await apiFetch('/api/treatment-plans', { method: 'POST', body: JSON.stringify(data) });
    const payload = res.data ?? res;
    return normalizeTreatmentPlan(payload.treatmentPlan ?? payload);
  },
  updateTreatmentPlan: async (id: string, data: any): Promise<TreatmentPlan> => {
    const res = await apiFetch(`/api/treatment-plans/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    const payload = res.data ?? res;
    return normalizeTreatmentPlan(payload.plan ?? payload);
  },
  deleteTreatmentPlan: async (id: string): Promise<void> => {
    await apiFetch(`/api/treatment-plans/${id}`, { method: 'DELETE' });
  },
  addProgressReview: async (id: string, data: any): Promise<TreatmentPlan> => {
    const res = await apiFetch(`/api/treatment-plans/${id}/review`, { method: 'POST', body: JSON.stringify(data) });
    const payload = res.data ?? res;
    return normalizeTreatmentPlan(payload.plan ?? payload);
  },
  completeTreatmentPlan: async (id: string): Promise<TreatmentPlan> => {
    const res = await apiFetch(`/api/treatment-plans/${id}/complete`, { method: 'PUT' });
    const payload = res.data ?? res;
    return normalizeTreatmentPlan(payload.plan ?? payload);
  },

  // ── Discharges ──
  getDischarges: async (): Promise<Discharge[]> => {
    const res = await apiFetch('/api/discharge');
    const payload = res.data ?? res;
    return Array.isArray(payload) ? payload.map(normalizeDischarge) : [];
  },
  createDischarge: async (data: any): Promise<Discharge> => {
    const res = await apiFetch('/api/discharge', { method: 'POST', body: JSON.stringify(data) });
    return normalizeDischarge(res.discharge ?? res.data ?? res);
  },
  deleteDischarge: async (id: string): Promise<void> => {
    await apiFetch(`/api/discharge/${id}`, { method: 'DELETE' });
  },

// ─── Attendance ──
getAttendance: async (type?: string): Promise<any[]> => {
  try {
    const params = new URLSearchParams();

    if (type && ['staff', 'worker'].includes(type)) {
      params.append('type', type);
    }

    const queryString = params.toString();
    const res = await apiFetch(`/api/attendance${queryString ? '?' + queryString : ''}`);
    const payload = res.data ?? res;

    return Array.isArray(payload) ? payload.map(normalizeAttendance) : [];
  } catch (error) {
    console.error('[Attendance] getAttendance error:', error);
    return [];
  }
},

markAttendance: async (data: any): Promise<any> => {
  try {
    const payload: any = {
      date: data.date,
      status: data.status,
      shift: data.shift,
      timeIn: data.timeIn,
      timeOut: data.timeOut,
      reason: data.reason,
      notes: data.notes
    };

    if (data.memberType === 'staff') {
      payload.staff = data.member;
    } else if (data.memberType === 'worker') {
      payload.worker = data.member;
    }

    payload.memberType = data.memberType;
    payload.member = data.member;

    console.log('[Attendance] Payload:', payload);

    const res = await apiFetch('/api/attendance', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    return normalizeAttendance(res.attendance ?? res.data?.attendance ?? res.data ?? res);

  } catch (error: any) {
    console.error('[Attendance] markAttendance error:', error.message);
    throw error;
  }
},

getAttendanceStats: async (memberType?: string, month?: string): Promise<any> => {
  try {
    const params = new URLSearchParams();

    if (memberType && ['staff', 'worker'].includes(memberType)) {
      params.append('type', memberType);
    }

    if (month) {
      params.append('month', month);
    }

    const res = await apiFetch(`/api/attendance/stats/monthly?${params.toString()}`);

    return res.data ?? res;

  } catch (error) {
    console.error('[Attendance] stats error:', error);

    return {
      total: 0,
      present: 0,
      absent: 0,
      leave: 0,
      attendancePercentage: '0%',
    };
  }
},

  // ── Profile ──
  getMyProfile: async (): Promise<User> => {
    const res = await apiFetch('/api/auth/me');
    return res.user || res.data;
  },
  updateMyProfile: async (data: any): Promise<User> => {
    const res = await apiFetch('/api/auth/me', { method: 'PUT', body: JSON.stringify(data) });
    return res.user || res.data;
  },
};
