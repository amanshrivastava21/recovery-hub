# Installation & Setup Guide

## ✅ What's Already Done (No action needed)

### Backend
- ✅ All 7 mongoose models created with proper schemas
- ✅ All controllers with full CRUD operations
- ✅ All route handlers registered
- ✅ Server.js updated with all new routes

### Frontend
- ✅ All TypeScript types defined for new features
- ✅ New API method templates created (in API_METHODS_TO_ADD.js)

---

## 🔧 What You Need to Do Now

### Step 1: Add Missing Frontend Dependencies
```bash
cd Frontend
npm install recharts axios
npm install --save-dev @types/recharts
```

**Why:**
- `recharts`: Professional charts for dashboard
- `axios`: Already used, but ensure it's installed

### Step 2: Update Frontend API Service
**File:** `src/services/api.ts`

1. Add imports at the top:
```typescript
import type { Discharge, Attendance, TreatmentPlan, Room } from '@/types';
```

2. Add all methods from `API_METHODS_TO_ADD.js` before the final `};`

3. Make sure the api object exports all new methods

### Step 3: Create Critical Frontend Pages

#### Create: `src/pages/EnhancedDashboardPage.tsx`
```typescript
// Key components:
- Total Patients | Active | Discharged | Recovery Rate
- Staff Attendance % | Medicine Stock Status
- Charts (Recharts): Recovery Trend, Admission/Discharge Timeline
- Quick actions: Add Patient, Mark Attendance, View Reports
```

#### Create: `src/pages/DischargeRecordsPage.tsx`
```typescript
// Key features:
- List all discharge records with filters
- View recovery statistics
- Create new discharge records
- Download discharge summary
```

#### Create: `src/pages/TreatmentPlansPage.tsx`
```typescript
// Key features:
- List all active treatment plans
- Create new treatment plans
- Link plans to patients
- Edit and track progress
- View plan details
```

#### Create: `src/pages/AttendancePage.tsx`
```typescript
// Key features:
- Calendar-based attendance marking
- Monthly attendance reports
- Staff-wise attendance tracking
- Filter by date range, staff
```

### Step 4: Add Routes to App.tsx
```typescript
import EnhancedDashboardPage from '@/pages/EnhancedDashboardPage';
import DischargeRecordsPage from '@/pages/DischargeRecordsPage';
import TreatmentPlansPage from '@/pages/TreatmentPlansPage';
import AttendancePage from '@/pages/AttendancePage';

// Add to routes:
<Route path="/dashboard" element={<ProtectedLayout><EnhancedDashboardPage /></ProtectedLayout>} />
<Route path="/discharge" element={<ProtectedLayout><DischargeRecordsPage /></ProtectedLayout>} />
<Route path="/treatment-plans" element={<ProtectedLayout><TreatmentPlansPage /></ProtectedLayout>} />
<Route path="/attendance" element={<ProtectedLayout><AttendancePage /></ProtectedLayout>} />
```

### Step 5: Update Navigation

**File:** `src/components/layout/AppSidebar.tsx`

Add menu items:
```typescript
{ name: 'Enhanced Dashboard', path: '/dashboard', icon: BarChart3 },
{ name: 'Discharge Records', path: '/discharge', icon: FileCheck },
{ name: 'Treatment Plans', path: '/treatment-plans', icon: Pill },
{ name: 'Attendance', path: '/attendance', icon: Calendar },
{ name: 'Rooms', path: '/rooms', icon: DoorOpen },
```

### Step 6: Update Styling (Optional but Recommended)
**File:** `tailwind.config.ts`

Add healthcare color palette:
```javascript
colors: {
  // ... existing colors
  'medical-teal': '#0d6e6e',
  'medical-blue': '#1e40af',
  'health-green': '#059669',
  'recovery-gold': '#d97706',
}
```

Update AppLayout background:
```typescript
// Use medical-teal for header, medical-blue for sidebar
```

---

## 🚀 Testing Checklist

After implementing above steps:

### Backend Testing:
```bash
# Test new endpoints with Postman or curl
curl http://localhost:5001/api/discharge
curl http://localhost:5001/api/attendance
curl http://localhost:5001/api/treatment-plans
curl http://localhost:5001/api/rooms
```

### Frontend Testing:
```bash
# Check if pages load
- http://localhost:8080/dashboard
- http://localhost:8080/discharge
- http://localhost:8080/treatment-plans
- http://localhost:8080/attendance

# Check API calls work
- Open DevTools > Network tab
- Create a patient
- Link to treatment plan
- Assign to room
- Create discharge record
```

---

## 📋 Implementation Order (Recommended)

1. **Day 1**: Update API service + Install dependencies
2. **Day 2**: Create Enhanced Dashboard page
3. **Day 3**: Create Discharge + Treatment Plans pages
4. **Day 4**: Create Attendance page + Room management
5. **Day 5**: SMS integration (Twilio) + PDF export
6. **Day 6**: Testing & final refinements

---

## 💰 Optional Enhancements (If Time Permits)

### Add SMS Integration:
```bash
npm install twilio
```

Create `src/utils/smsService.ts` for sending notifications

### Add PDF Export:
```bash
npm install pdfkit @react-pdf/renderer
```

Create `src/utils/pdfExport.ts` for generating PDFs

### Add Real-Time Notifications:
```bash
npm install socket.io-client
```

**Note**: Requires Socket.IO setup on backend

---

## 🎯 Success Criteria

After implementation, you should be able to:
- ✅ View enhanced dashboard with charts
- ✅ Manage discharge records
- ✅ Create and track treatment plans
- ✅ Mark staff attendance
- ✅ Allocate patients to rooms
- ✅ Export data to PDF
- ✅ Generate reports with statistics
- ✅ Send SMS notifications (if added)

---

## ❓ Troubleshooting

### API Routes Not Working?
- Check if server is running: `npm start` in Backend folder
- Check VITE_API_URL in `.env`
- Look at browser Network tab for errors

### TypeScript Errors?
- Make sure all types are imported in files
- Check tsconfig.json for compilation options
- Run `npm run build` to check for errors

### Components Not Rendering?
- Check if routes are properly added in App.tsx
- Verify sidebar menu items link to correct paths
- Check browser console for React errors

---

**Need Help?** All backend APIs are ready to use. Focus on frontend implementation.
Good luck! 🚀