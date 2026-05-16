// React hook for using role-based access control in components
import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { 
  canView, 
  canEdit, 
  hasAccess, 
  getRoleName, 
  getAccessibleFeatures,
  hasRole,
  getPermissionSummary,
  type StaffRole
} from '@/utils/permissions';

interface UsePermissionsReturn {
  role: StaffRole | undefined;
  canView: (feature: string) => boolean;
  canEdit: (feature: string) => boolean;
  hasAccess: (feature: string) => boolean;
  hasRole: (...roles: StaffRole[]) => boolean;
  getRoleName: () => string;
  getAccessibleFeatures: () => string[];
  getPermissionSummary: () => ReturnType<typeof getPermissionSummary>;
}

/**
 * Hook to use role-based permissions in components
 * @returns Object with permission checking functions
 * 
 * Usage:
 * const { canView, canEdit, hasAccess } = usePermissions();
 * 
 * if (canEdit('viewPatients')) {
 *   // Show edit button
 * }
 */
export const usePermissions = (): UsePermissionsReturn => {
  const auth = useContext(AuthContext);
  
  if (!auth) {
    throw new Error('usePermissions must be used within AuthProvider');
  }

  // Get staffRole from user if available, otherwise use role
  const role: StaffRole | undefined = (auth.user?.staffRole || auth.user?.role) as StaffRole | undefined;

  return {
    role,
    canView: (feature: string) => canView(role, feature),
    canEdit: (feature: string) => canEdit(role, feature),
    hasAccess: (feature: string) => hasAccess(role, feature),
    hasRole: (...roles: StaffRole[]) => hasRole(role, ...roles),
    getRoleName: () => getRoleName(role),
    getAccessibleFeatures: () => getAccessibleFeatures(role),
    getPermissionSummary: () => getPermissionSummary(role),
  };
};

/**
 * Hook to check if current user has specific access
 * Shorter syntax for common checks
 */
export const useCanAccess = (feature: string) => {
  const { canView: canViewFeature, canEdit: canEditFeature, hasAccess: hasAccessFeature } = usePermissions();
  
  return {
    canView: canViewFeature(feature),
    canEdit: canEditFeature(feature),
    hasAccess: hasAccessFeature(feature),
  };
};

/**
 * Component wrapper for conditional rendering based on permissions
 */
export const CanAccess = ({ 
  feature, 
  action = 'view', 
  children,
  fallback = null 
}: { 
  feature: string; 
  action?: 'view' | 'edit'; 
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) => {
  const { canView: canViewFeature, canEdit: canEditFeature } = usePermissions();
  
  const hasPermission = action === 'view' 
    ? canViewFeature(feature)
    : canEditFeature(feature);

  return hasPermission ? <>{children}</> : <>{fallback}</>;
};
