# Role-Based Access Control (RBAC) Implementation Guide
## Recovery Hub - Access Control System

---

## 📋 Overview

This document explains the complete Role-Based Access Control (RBAC) system implemented in your Recovery Hub application. The system ensures that users can only access features they're authorized for based on their role.

### Roles Defined
- 🩺 **Doctor** - Full access to patient management, treatment, prescriptions
- 👩‍⚕️ **Nurse** - Patient care, medicine dispensing, progress notes
- 💬 **Counselor** - Counseling, treatment planning, progress notes
- 🧘 **Therapist** - Therapy, treatment planning, patient visits
- 📞 **Receptionist** - Patient records, scheduling, basic data entry
- 💊 **Compounder** - Medicine management and dispensing only

---

## 🔧 Backend Implementation

### 1. Configuration System
**Location**: `Backend/config/permissions.js`

Defines all role permissions:
```javascript
const rolePermissions = {
  doctor: {
    name: 'Doctor',
    features: {
      dashboard: { view: true, edit: false },
      viewPatients: { view: true, edit: false },
      addEditPatient: { view: true, edit: true },
      // ... more features
    }
  },
  // ... other roles
};
```

### 2. Authorization Middleware
**Location**: `Backend/middleware/rbac.js`

Two main middleware functions:

#### a) Feature-Based Authorization
```javascript
// Usage in routes
router.post('/patients', protect, authorize('addEditPatient', 'edit'), controller);

// What it does:
// - Checks if user's role can view/edit the specified feature
// - Returns 403 Forbidden if no access
```

#### b) Role-Based Authorization
```javascript
// Usage in routes
router.get('/doctor-panel', protect, authorizeRole('doctor', 'admin'), controller);

// What it does:
// - Checks if user's role is in the allowed roles list
// - Returns 403 Forbidden if role not allowed
```

### 3. Protected Routes
Routes have been updated with authorization checks:

**Patient Routes** (`Backend/routes/patientRoutes.js`)
```javascript
router.get('/', protect, authorize('viewPatients', 'view'), getPatients);        // View only
router.post('/', protect, authorize('addEditPatient', 'edit'), createPatient);   // Add/Edit
router.delete('/:id', protect, authorize('addEditPatient', 'edit'), deletePatient); // Delete
router.post('/:id/discharge', protect, authorize('dischargePatient', 'edit'), dischargePatient);
```

**Medicine Routes** (`Backend/routes/medicineRoutes.js`)
```javascript
router.get('/', protect, authorize('viewMedicines', 'view'), getMedicines);      // View
router.post('/', protect, authorize('prescribeMedicine', 'edit'), createMedicine); // Prescribe
router.put('/:id', protect, authorize('dispenseMedicine', 'edit'), updateMedicine); // Dispense
```

### 4. JWT Token Enhancement
**Location**: `Backend/controllers/authController.js`

Now includes `staffRole` in JWT:
```javascript
// Before
const token = generateToken(user._id);

// After
const token = generateToken(user._id, staffRole);
// JWT now contains: { id, staffRole }
```

### 5. Authentication Middleware
**Location**: `Backend/middleware/auth.js`

Extracts role from JWT:
```javascript
// JWT decoded to: { id, staffRole }
req.user = {
  _id: decoded.id,
  id: decoded.id,
  role: decoded.role,
  staffRole: decoded.staffRole  // ← Used by RBAC middleware
};
```

---

## 🎨 Frontend Implementation

### 1. Permission Utilities
**Location**: `Frontend/src/utils/permissions.ts`

Helper functions (mirrored from backend):
```typescript
// Check if user can view a feature
canView('viewPatients') → boolean

// Check if user can edit a feature
canEdit('addEditPatient') → boolean

// Check if user has any access to feature
hasAccess('viewPatients') → boolean

// Check if user has specific role
hasRole('doctor', 'nurse') → boolean

// Get all accessible features
getAccessibleFeatures() → string[]

// Get role name
getRoleName() → string
```

### 2. React Hooks
**Location**: `Frontend/src/hooks/usePermissions.ts`

#### Main Hook - `usePermissions()`
```typescript
const { 
  role,                    // Current user's role
  canView,                 // Function to check view access
  canEdit,                 // Function to check edit access
  hasAccess,               // Function to check any access
  hasRole,                 // Function to check specific roles
  getRoleName,             // Function to get role display name
  getAccessibleFeatures,   // Function to get all accessible features
  getPermissionSummary     // Function to get detailed summary
} = usePermissions();

// Usage
if (canEdit('addEditPatient')) {
  // Show edit button
}
```

#### Shorthand Hook - `useCanAccess()`
```typescript
const { canView, canEdit, hasAccess } = useCanAccess('viewPatients');

// Usage
if (canEdit) {
  // Show edit controls
}
```

#### Component Wrapper - `CanAccess`
```typescript
<CanAccess feature="viewPatients" action="edit">
  <button onClick={handleEdit}>Edit Patient</button>
</CanAccess>

// With fallback
<CanAccess 
  feature="viewPatients" 
  action="edit"
  fallback={<p>You don't have permission</p>}
>
  <button onClick={handleEdit}>Edit Patient</button>
</CanAccess>
```

### 3. Updated User Type
**Location**: `Frontend/src/types/index.ts`

```typescript
interface User {
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
```

---

## 💡 Usage Examples

### Example 1: Protecting a Button
```typescript
import { usePermissions } from '@/hooks/usePermissions';

export function PatientsPage() {
  const { canEdit } = usePermissions();

  return (
    <div>
      <h1>Patients</h1>
      
      {canEdit('addEditPatient') && (
        <button className="btn-primary">+ Add Patient</button>
      )}
      
      {canEdit('dischargePatient') && (
        <button className="btn-danger">Discharge Patient</button>
      )}
    </div>
  );
}
```

### Example 2: Conditional Form Display
```typescript
import { usePermissions } from '@/hooks/usePermissions';

export function PatientForm() {
  const { canEdit, canView } = usePermissions();

  if (!canView('viewPatients')) {
    return <div>You don't have access to patients</div>;
  }

  return (
    <form>
      <input type="text" placeholder="Name" />
      
      {canEdit('addEditPatient') && (
        <div>
          <input type="text" placeholder="Contact" />
          <input type="text" placeholder="Address" />
        </div>
      )}
      
      {canEdit('addEditPatient') && (
        <button type="submit">Save Patient</button>
      )}
    </form>
  );
}
```

### Example 3: Role-Based Navigation Menu
```typescript
import { usePermissions } from '@/hooks/usePermissions';

export function Sidebar() {
  const { hasAccess } = usePermissions();

  return (
    <nav>
      <ul>
        <li><Link to="/dashboard">Dashboard</Link></li>
        
        {hasAccess('viewPatients') && (
          <li><Link to="/patients">Patients</Link></li>
        )}
        
        {hasAccess('treatmentPlans') && (
          <li><Link to="/treatment-plans">Treatment Plans</Link></li>
        )}
        
        {hasAccess('viewMedicines') && (
          <li><Link to="/medicines">Medicines</Link></li>
        )}
        
        {hasAccess('reports') && (
          <li><Link to="/reports">Reports</Link></li>
        )}
      </ul>
    </nav>
  );
}
```

### Example 4: Component Wrapper Usage
```typescript
import { CanAccess } from '@/hooks/usePermissions';

export function PatientActions() {
  return (
    <div className="actions">
      <CanAccess feature="addEditPatient" action="edit">
        <button>Edit</button>
      </CanAccess>
      
      <CanAccess feature="dischargePatient" action="edit">
        <button>Discharge</button>
      </CanAccess>
      
      <CanAccess 
        feature="addEditPatient" 
        action="edit"
        fallback={<span className="disabled">Edit (No Permission)</span>}
      >
        <button>Edit Patient</button>
      </CanAccess>
    </div>
  );
}
```

### Example 5: Permission Summary
```typescript
import { usePermissions } from '@/hooks/usePermissions';

export function PermissionsDashboard() {
  const { getPermissionSummary } = usePermissions();
  const summary = getPermissionSummary();

  return (
    <div>
      <h2>Your Role: {summary?.roleName}</h2>
      
      <section>
        <h3>Features You Can View</h3>
        <ul>
          {summary?.canViewFeatures.map(f => <li key={f}>{f}</li>)}
        </ul>
      </section>
      
      <section>
        <h3>Features You Can Edit</h3>
        <ul>
          {summary?.canEditFeatures.map(f => <li key={f}>{f}</li>)}
        </ul>
      </section>
      
      <p>Total Accessible Features: {summary?.totalAccessibleFeatures}</p>
    </div>
  );
}
```

---

## 🔐 Security Flow

### Login Flow
```
User Login
    ↓
Backend validates credentials
    ↓
Fetch Staff record (if role='staff')
    ↓
Generate JWT with staffRole
    ↓
Return token + user data to frontend
    ↓
Frontend stores token & user in localStorage + AuthContext
```

### API Call Flow
```
Frontend makes API request
    ↓
Include JWT token in Authorization header
    ↓
Backend auth middleware extracts staffRole from JWT
    ↓
RBAC middleware checks if staffRole has permission
    ↓
If allowed → Execute controller → Return data
If denied → Return 403 Forbidden
```

### Component Render Flow
```
Component mounts
    ↓
usePermissions() hook called
    ↓
Reads user.staffRole from AuthContext
    ↓
Checks permissions against permission matrix
    ↓
Show/hide UI elements based on result
```

---

## 📊 Features & Access Matrix

| Feature | Doctor | Nurse | Counselor | Therapist | Receptionist | Compounder |
|---------|:------:|:-----:|:---------:|:---------:|:------------:|:----------:|
| Dashboard | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| My Profile | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Patients** | | | | | | |
| View Patients | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| Add/Edit Patient | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Discharge Patient | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| **Treatment** | | | | | | |
| Treatment Plans | ✓✓ | ✓ | ✓✓ | ✓✓ | ✗ | ✗ |
| Progress Notes | ✓✓ | ✓✓ | ✓✓ | ✓✓ | ✗ | ✗ |
| **Medicines** | | | | | | |
| View Medicines | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Prescribe Medicine | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Dispense Medicine | ✗ | ✓ | ✗ | ✗ | ✗ | ✓ |
| **Other** | | | | | | |
| Visits | ✓✓ | ✓✓ | ✓✓ | ✓✓ | ✓ | ✓ |
| Discharge Records | ✓ | ✗ | ✗ | ✓ | ✓ | ✗ |
| Reports | ✓ | ✗ | ✓ | ✓ | ✗ | ✗ |

Legend: ✓ = View only, ✓✓ = Can Edit

---

## 🚀 Implementation Checklist

### Backend ✅
- [x] Permission configuration file created
- [x] RBAC middleware implemented
- [x] JWT token includes staffRole
- [x] Auth middleware extracts staffRole
- [x] Patient routes protected
- [x] Medicine routes protected
- [x] Visit routes protected
- [x] Treatment plan routes protected
- [x] Discharge routes protected
- [x] Dashboard routes protected

### Frontend ✅
- [x] Permission utilities created
- [x] usePermissions hook implemented
- [x] useCanAccess hook implemented
- [x] CanAccess component wrapper created
- [x] User type updated with staffRole
- [x] AuthContext exported for use

### Next Steps (To Do)
- [ ] Update all frontend pages with permission checks
- [ ] Update navigation menu to show only accessible items
- [ ] Add role indicator in user profile section
- [ ] Create admin panel for role management
- [ ] Add permission-based API error handling
- [ ] Create user management page for admins
- [ ] Add audit logging for permission changes

---

## 🐛 Troubleshooting

### Issue: "usePermissions must be used within AuthProvider"
**Solution**: Ensure your app is wrapped with `<AuthProvider>` in main.tsx

### Issue: staffRole is undefined
**Solution**: Make sure the backend is returning staffRole in the user response

### Issue: Permission checks not working
**Solution**: Verify that:
1. User has correct staffRole in database
2. Token includes staffRole
3. AuthContext has user data

### Issue: API returns 403 Forbidden
**Solution**: Check if:
1. User's role has permission for that feature
2. Feature name matches exactly in permissions.js
3. RBAC middleware is applied to the route

---

## 📞 Support

For questions or issues with RBAC implementation, refer to:
- Backend: `Backend/config/permissions.js` - Permission definitions
- Middleware: `Backend/middleware/rbac.js` - Authorization logic
- Frontend Utils: `Frontend/src/utils/permissions.ts` - Helper functions
- Frontend Hooks: `Frontend/src/hooks/usePermissions.ts` - React hooks

