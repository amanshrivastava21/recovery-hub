# RBAC Quick Reference

## 🎯 Quick Start

### Backend - Protect a Route
```javascript
const { authorize, authorizeRole } = require('../middleware/rbac');

// Feature-based (recommended)
router.post('/patients', protect, authorize('addEditPatient', 'edit'), controller);

// Role-based
router.get('/admin-panel', protect, authorizeRole('doctor', 'admin'), controller);
```

### Frontend - Check Permission
```typescript
import { usePermissions } from '@/hooks/usePermissions';

const { canEdit, canView, hasAccess } = usePermissions();

if (canEdit('viewPatients')) {
  // Show edit button
}
```

---

## 📋 Feature Names

Use these exact names in `authorize()` calls:

| Feature Name | Description |
|---|---|
| `dashboard` | Dashboard access |
| `myProfile` | User profile page |
| `viewPatients` | View patient list |
| `addEditPatient` | Add/edit patients |
| `dischargePatient` | Discharge patients |
| `treatmentPlans` | Treatment planning |
| `progressNotes` | Progress notes |
| `viewMedicines` | View medicines |
| `prescribeMedicine` | Prescribe medicines |
| `dispenseMedicine` | Dispense medicines |
| `visits` | Patient visits |
| `dischargeRecords` | Discharge records |
| `reports` | Reports & analytics |

---

## 👥 Role Names

Use these exact names in `authorizeRole()` calls:

- `doctor`
- `nurse`
- `counselor`
- `therapist`
- `receptionist`
- `compounder`

---

## 🔧 Middleware Usage

```javascript
// Single middleware
router.post('/api/patients', 
  protect,                                    // Auth middleware
  authorize('addEditPatient', 'edit'),        // RBAC middleware
  controller
);

// Multiple middlewares in sequence
router.get('/api/reports',
  protect,
  authorize('reports', 'view'),
  controller
);
```

---

## 🎨 Frontend Patterns

### Pattern 1: Button Protection
```typescript
{canEdit('addEditPatient') && <button>Add Patient</button>}
```

### Pattern 2: Section Hiding
```typescript
{hasAccess('treatmentPlans') && (
  <div>
    <h2>Treatment Plans</h2>
    {/* content */}
  </div>
)}
```

### Pattern 3: Form Field Control
```typescript
<input type="text" name="contact" disabled={!canEdit('addEditPatient')} />
```

### Pattern 4: Navigation Menu
```typescript
{getAccessibleFeatures().includes('viewPatients') && (
  <NavLink to="/patients">Patients</NavLink>
)}
```

---

## 🔑 Hook Functions

### usePermissions()
```typescript
const {
  role,                    // User's current role
  canView,                 // (feature: string) => boolean
  canEdit,                 // (feature: string) => boolean
  hasAccess,               // (feature: string) => boolean
  hasRole,                 // (...roles) => boolean
  getRoleName,             // () => string
  getAccessibleFeatures,   // () => string[]
  getPermissionSummary     // () => {role, roleName, ...}
} = usePermissions();
```

### useCanAccess(feature)
```typescript
const { canView, canEdit, hasAccess } = useCanAccess('viewPatients');
```

### CanAccess Component
```typescript
<CanAccess feature="addEditPatient" action="edit">
  <button>Edit</button>
</CanAccess>
```

---

## 📁 File Locations

### Backend
- **Config**: `Backend/config/permissions.js`
- **Middleware**: `Backend/middleware/rbac.js`
- **Routes**: `Backend/routes/*.js`
- **Auth Controller**: `Backend/controllers/authController.js`

### Frontend
- **Utils**: `Frontend/src/utils/permissions.ts`
- **Hook**: `Frontend/src/hooks/usePermissions.ts`
- **Types**: `Frontend/src/types/index.ts`
- **Context**: `Frontend/src/contexts/AuthContext.tsx`

---

## 🧪 Testing

### Test Backend Permission
```bash
# Should succeed (Doctor has access)
curl -H "Authorization: Bearer <doctor_token>" \
  -X POST http://localhost:5000/api/patients \
  -H "Content-Type: application/json" \
  -d '{...}'

# Should fail (Compounder has no access)
curl -H "Authorization: Bearer <compounder_token>" \
  -X POST http://localhost:5000/api/patients \
  -H "Content-Type: application/json" \
  -d '{...}'
# Response: 403 Forbidden
```

### Test Frontend Permission
```typescript
// Temporary test in browser console
const user = JSON.parse(localStorage.getItem('rcms_user'));
console.log('User Role:', user.staffRole);
console.log('Can Edit:', canEdit('viewPatients'));
```

---

## ⚠️ Common Mistakes

❌ **Wrong**: Using string `'view'` instead of exact feature name
```javascript
authorize('view', 'edit')  // ❌ 'view' is not a feature name
```

✅ **Correct**: Use exact feature name
```javascript
authorize('viewPatients', 'edit')  // ✅ Correct feature name
```

---

❌ **Wrong**: Forgetting to include `protect` middleware
```javascript
router.post('/patients', authorize('addEditPatient', 'edit'), controller);  // ❌ No auth!
```

✅ **Correct**: Include both auth and RBAC
```javascript
router.post('/patients', protect, authorize('addEditPatient', 'edit'), controller);  // ✅
```

---

❌ **Wrong**: Using hook outside AuthProvider
```typescript
// In component not wrapped by AuthProvider
usePermissions();  // ❌ Error!
```

✅ **Correct**: Ensure component is within AuthProvider
```typescript
// In your App.tsx or main.tsx
<AuthProvider>
  <App />  {/* Now hooks work */}
</AuthProvider>
```

---

## 📊 Permission Matrix at a Glance

```
          Doc  Nur  Cou  The  Rec  Com
Dashboard ✓    ✓    ✓    ✓    ✓    ✓
Patients  ✓✓   ✓    ✓    ✓    ✓    ✗
Treat     ✓✓   ✓    ✓✓   ✓✓   ✗    ✗
Meds      ✓✓   ✓✓   ✓    ✓    ✓    ✓✓
Visits    ✓✓   ✓✓   ✓✓   ✓✓   ✓    ✓
Reports   ✓    ✗    ✓    ✓    ✗    ✗

✓  = Can view
✓✓ = Can view & edit
✗  = No access
```

---

## 🔗 Full Documentation

See `RBAC_IMPLEMENTATION_GUIDE.md` for complete documentation with examples.
