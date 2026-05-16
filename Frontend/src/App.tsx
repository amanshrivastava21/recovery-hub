import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { LandingContentProvider } from "@/contexts/LandingContentContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";
import LoginPage from "@/pages/LoginPage";
import HomePage from "@/pages/HomePage";
import AboutPage from "@/pages/AboutPage";
import ContactPage from "@/pages/ContactPage";
import DashboardPage from "@/pages/DashboardPage";
import PatientDashboardPage from "@/pages/PatientDashboardPage";
import PatientsPage from "@/pages/PatientsPage";
import WorkersPage from "@/pages/WorkersPage";
import StaffPage from "@/pages/StaffPage";
import MedicinesPage from "@/pages/MedicinesPage";
import VisitsPage from "@/pages/VisitsPage";
import CampaignsPage from "@/pages/CampaignsPage";
import ProgressReportsPage from "@/pages/ProgressReportsPage";
import ReportsPage from "@/pages/ReportsPage";
import UsersPage from "@/pages/UsersPage";
import ResourcesPage from "@/pages/ResourcesPage";
import DischargeRecordsPage from "@/pages/DischargeRecordsPage";
import TreatmentPlansPage from "@/pages/TreatmentPlansPage";
import UpdateTreatmentPlanPage from "@/pages/UpdateTreatmentPlanPage";
import TodaySessionsPage from "@/pages/TodaySessionsPage";
import NewSessionPage from "@/pages/NewSessionPage";
import StartSessionPage from "@/pages/StartSessionPage";
import AttendancePage from "@/pages/AttendancePage";
import SystemSettingsPage from "@/pages/SystemSettingsPage";
import NotFound from "@/pages/NotFound";
import ProfilePage from './pages/ProfilePage';
import PatientTreatmentPlanPage from "@/pages/PatientTreatmentPlanPage";
import PatientProgressNotesPage from "@/pages/PatientProgressNotesPage";
import ProgressNotesPage from "@/pages/ProgressNotesPage";

const queryClient = new QueryClient();

const ProtectedLayout = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: ('admin' | 'worker' | 'staff' | 'patient' | 'doctor' | 'nurse' | 'counselor' | 'therapist' | 'receptionist' | 'compounder')[] }) => (
  <ProtectedRoute allowedRoles={allowedRoles}>
    <AppLayout>{children}</AppLayout>
  </ProtectedRoute>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <LandingContentProvider>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/dashboard" element={
                <ProtectedLayout allowedRoles={['admin', 'worker', 'staff', 'doctor', 'nurse', 'counselor', 'receptionist']}>
                  <DashboardPage />
                </ProtectedLayout>
              } />
              <Route path="/patient-dashboard" element={<ProtectedLayout allowedRoles={['patient']}><PatientDashboardPage /></ProtectedLayout>} />
              <Route path="/patient-treatment-plan" element={<ProtectedLayout allowedRoles={['patient']}><PatientTreatmentPlanPage /></ProtectedLayout>} />
              <Route path="/patient-progress-notes" element={<ProtectedLayout allowedRoles={['patient']}><PatientProgressNotesPage /></ProtectedLayout>} />
              <Route path="/progress-notes" element={<ProtectedLayout allowedRoles={['admin', 'worker', 'staff', 'doctor', 'nurse', 'counselor', 'therapist']}><ProgressNotesPage /></ProtectedLayout>} />
              <Route path="/patients" element={<ProtectedLayout allowedRoles={['admin', 'worker', 'staff']}><PatientsPage /></ProtectedLayout>} />
              <Route path="/workers" element={<ProtectedLayout allowedRoles={['admin']}><WorkersPage /></ProtectedLayout>} />
              <Route path="/staff" element={<ProtectedLayout allowedRoles={['admin']}><StaffPage /></ProtectedLayout>} />
              <Route path="/medicines" element={<ProtectedLayout allowedRoles={['admin', 'staff']}><MedicinesPage /></ProtectedLayout>} />
              <Route path="/visits" element={<ProtectedLayout allowedRoles={['admin', 'worker']}><VisitsPage /></ProtectedLayout>} />
              <Route path="/campaigns" element={<ProtectedLayout allowedRoles={['admin', 'worker']}><CampaignsPage /></ProtectedLayout>} />
              <Route path="/progress-reports" element={<ProtectedLayout allowedRoles={['admin', 'worker', 'staff', 'doctor', 'nurse', 'counselor', 'therapist']}><ProgressReportsPage /></ProtectedLayout>} />
              <Route path="/resources" element={<ProtectedLayout allowedRoles={['admin', 'staff', 'worker']}><ResourcesPage /></ProtectedLayout>} />
              <Route path="/reports" element={<ProtectedLayout allowedRoles={['admin']}><ReportsPage /></ProtectedLayout>} />
              <Route path="/users" element={<ProtectedLayout allowedRoles={['admin']}><UsersPage /></ProtectedLayout>} />
              <Route path="/discharge" element={<ProtectedLayout allowedRoles={['admin', 'staff']}><DischargeRecordsPage /></ProtectedLayout>} />
              <Route path="/treatment-plans" element={<ProtectedLayout allowedRoles={['admin', 'staff', 'doctor', 'nurse', 'counselor', 'therapist']}><TreatmentPlansPage /></ProtectedLayout>} />
              <Route path="/treatment-plans/new" element={<ProtectedLayout allowedRoles={['admin', 'staff', 'doctor', 'nurse', 'counselor', 'therapist']}><TreatmentPlansPage /></ProtectedLayout>} />
              <Route path="/treatment-plans/:planId/update" element={<ProtectedLayout allowedRoles={['admin', 'staff', 'doctor', 'nurse', 'counselor', 'therapist']}><UpdateTreatmentPlanPage /></ProtectedLayout>} />
              <Route path="/sessions/today" element={<ProtectedLayout allowedRoles={['admin', 'staff', 'doctor', 'nurse', 'counselor']}><TodaySessionsPage /></ProtectedLayout>} />
              <Route path="/sessions/new" element={<ProtectedLayout allowedRoles={['admin', 'staff', 'doctor', 'nurse', 'counselor']}><NewSessionPage /></ProtectedLayout>} />
              <Route path="/sessions/:sessionId/start" element={<ProtectedLayout allowedRoles={['admin', 'staff', 'doctor', 'nurse', 'counselor']}><StartSessionPage /></ProtectedLayout>} />
              <Route path="/attendance" element={<ProtectedLayout allowedRoles={['admin']}><AttendancePage /></ProtectedLayout>} />
              <Route path="/system-settings" element={<ProtectedLayout allowedRoles={['admin']}><SystemSettingsPage /></ProtectedLayout>} />
              <Route path="/profile" element={
                <ProtectedLayout allowedRoles={['admin', 'staff', 'worker', 'patient', 'doctor', 'nurse', 'counselor', 'therapist', 'receptionist', 'compounder']}>
                  <ProfilePage />
                </ProtectedLayout>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </LandingContentProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
