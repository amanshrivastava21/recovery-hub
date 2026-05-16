// Frontend Role-Based Access Control Utilities
// Mirror of backend permissions configuration

export const STAFF_ROLES = ['admin', 'doctor', 'nurse', 'counselor', 'therapist', 'receptionist', 'compounder'] as const;
export type StaffRole = typeof STAFF_ROLES[number];

interface FeaturePermission {
  view: boolean;
  edit: boolean;
}

interface RolePermissions {
  name: string;
  features: {
    [key: string]: FeaturePermission;
  };
}

export const rolePermissions: Record<StaffRole, RolePermissions> = {
  admin: {
    name: 'Admin',
    features: {
      dashboard: { view: true, edit: true },
      myProfile: { view: true, edit: true },
      viewPatients: { view: true, edit: true },
      addEditPatient: { view: true, edit: true },
      dischargePatient: { view: true, edit: true },
      treatmentPlans: { view: true, edit: true },
      progressNotes: { view: true, edit: true },
      viewMedicines: { view: true, edit: true },
      prescribeMedicine: { view: true, edit: true },
      dispenseMedicine: { view: true, edit: true },
      visits: { view: true, edit: true },
      dischargeRecords: { view: true, edit: true },
      reports: { view: true, edit: true },
      users: { view: true, edit: true },
      staff: { view: true, edit: true },
      workers: { view: true, edit: true },
      resources: { view: true, edit: true },
    },
  },
  doctor: {
    name: 'Doctor',
    features: {
      dashboard: { view: true, edit: false },
      myProfile: { view: true, edit: true },
      viewPatients: { view: true, edit: false },
      addEditPatient: { view: true, edit: true },
      dischargePatient: { view: true, edit: true },
      treatmentPlans: { view: true, edit: true },
      progressNotes: { view: true, edit: true },
      viewMedicines: { view: true, edit: false },
      prescribeMedicine: { view: true, edit: true },
      dispenseMedicine: { view: false, edit: false },
      visits: { view: true, edit: true },
      dischargeRecords: { view: true, edit: false },
      reports: { view: true, edit: false },
    },
  },
  nurse: {
    name: 'Nurse',
    features: {
      dashboard: { view: true, edit: false },
      myProfile: { view: true, edit: true },
      viewPatients: { view: true, edit: false },
      addEditPatient: { view: false, edit: false },
      dischargePatient: { view: false, edit: false },
      treatmentPlans: { view: true, edit: false },
      progressNotes: { view: true, edit: true },
      viewMedicines: { view: true, edit: false },
      prescribeMedicine: { view: false, edit: false },
      dispenseMedicine: { view: true, edit: true },
      visits: { view: true, edit: true },
      dischargeRecords: { view: false, edit: false },
      reports: { view: false, edit: false },
    },
  },
  counselor: {
    name: 'Counselor',
    features: {
      dashboard: { view: true, edit: false },
      myProfile: { view: true, edit: true },
      viewPatients: { view: true, edit: false },
      addEditPatient: { view: false, edit: false },
      dischargePatient: { view: false, edit: false },
      treatmentPlans: { view: true, edit: true },
      progressNotes: { view: true, edit: true },
      viewMedicines: { view: true, edit: false },
      prescribeMedicine: { view: false, edit: false },
      dispenseMedicine: { view: false, edit: false },
      visits: { view: true, edit: true },
      dischargeRecords: { view: false, edit: false },
      reports: { view: true, edit: false },
    },
  },
  therapist: {
    name: 'Therapist',
    features: {
      dashboard: { view: true, edit: false },
      myProfile: { view: true, edit: true },
      viewPatients: { view: true, edit: false },
      addEditPatient: { view: false, edit: false },
      dischargePatient: { view: false, edit: false },
      treatmentPlans: { view: true, edit: true },
      progressNotes: { view: true, edit: true },
      viewMedicines: { view: true, edit: false },
      prescribeMedicine: { view: false, edit: false },
      dispenseMedicine: { view: false, edit: false },
      visits: { view: true, edit: true },
      dischargeRecords: { view: true, edit: false },
      reports: { view: true, edit: false },
    },
  },
  receptionist: {
    name: 'Receptionist',
    features: {
      dashboard: { view: true, edit: false },
      myProfile: { view: true, edit: true },
      viewPatients: { view: true, edit: false },
      addEditPatient: { view: false, edit: false },
      dischargePatient: { view: false, edit: false },
      treatmentPlans: { view: false, edit: false },
      progressNotes: { view: false, edit: false },
      viewMedicines: { view: true, edit: false },
      prescribeMedicine: { view: false, edit: false },
      dispenseMedicine: { view: false, edit: false },
      visits: { view: true, edit: false },
      dischargeRecords: { view: true, edit: false },
      reports: { view: false, edit: false },
    },
  },
  compounder: {
    name: 'Compounder',
    features: {
      dashboard: { view: true, edit: false },
      myProfile: { view: true, edit: true },
      viewPatients: { view: false, edit: false },
      addEditPatient: { view: false, edit: false },
      dischargePatient: { view: false, edit: false },
      treatmentPlans: { view: false, edit: false },
      progressNotes: { view: false, edit: false },
      viewMedicines: { view: true, edit: false },
      prescribeMedicine: { view: false, edit: false },
      dispenseMedicine: { view: true, edit: true },
      visits: { view: true, edit: false },
      dischargeRecords: { view: false, edit: false },
      reports: { view: false, edit: false },
    },
  },
};

/**
 * Check if a role can view a specific feature
 */
export const canView = (role: StaffRole | undefined, feature: string): boolean => {
  if (!role) return false;
  const perms = rolePermissions[role];
  return perms?.features[feature]?.view ?? false;
};

/**
 * Check if a role can edit a specific feature
 */
export const canEdit = (role: StaffRole | undefined, feature: string): boolean => {
  if (!role) return false;
  const perms = rolePermissions[role];
  return perms?.features[feature]?.edit ?? false;
};

/**
 * Check if a role has any access (view or edit) to a feature
 */
export const hasAccess = (role: StaffRole | undefined, feature: string): boolean => {
  return canView(role, feature) || canEdit(role, feature);
};

/**
 * Get role name from role code
 */
export const getRoleName = (role: StaffRole | undefined): string => {
  if (!role) return 'Unknown';
  return rolePermissions[role]?.name ?? 'Unknown';
};

/**
 * Get all accessible features for a role
 */
export const getAccessibleFeatures = (role: StaffRole | undefined): string[] => {
  if (!role) return [];
  const perms = rolePermissions[role];
  return Object.entries(perms?.features ?? {})
    .filter(([_, perm]) => perm.view || perm.edit)
    .map(([feature]) => feature);
};

/**
 * Check if user has any of the specified roles
 */
export const hasRole = (role: StaffRole | undefined, ...allowedRoles: StaffRole[]): boolean => {
  if (!role) return false;
  return allowedRoles.includes(role);
};

/**
 * Get permission summary for UI display
 */
export const getPermissionSummary = (role: StaffRole | undefined) => {
  if (!role) return null;
  
  const perms = rolePermissions[role];
  const features = perms?.features ?? {};
  
  return {
    role: role,
    roleName: perms?.name,
    canViewFeatures: Object.entries(features)
      .filter(([_, p]) => p.view && !p.edit)
      .map(([f]) => f),
    canEditFeatures: Object.entries(features)
      .filter(([_, p]) => p.edit)
      .map(([f]) => f),
    totalAccessibleFeatures: Object.values(features).filter(f => f.view || f.edit).length,
  };
};
