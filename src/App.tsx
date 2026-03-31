import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import PatientDashboardPage from "@/pages/PatientDashboardPage";
import PatientsPage from "@/pages/PatientsPage";
import WorkersPage from "@/pages/WorkersPage";
import StaffPage from "@/pages/StaffPage";
import MedicinesPage from "@/pages/MedicinesPage";
import VisitsPage from "@/pages/VisitsPage";
import ReportsPage from "@/pages/ReportsPage";
import UsersPage from "@/pages/UsersPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const ProtectedLayout = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: ('admin' | 'worker' | 'staff' | 'patient')[] }) => (
  <ProtectedRoute allowedRoles={allowedRoles}>
    <AppLayout>{children}</AppLayout>
  </ProtectedRoute>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<ProtectedLayout><DashboardPage /></ProtectedLayout>} />
            <Route path="/patient-dashboard" element={<ProtectedLayout allowedRoles={['patient']}><PatientDashboardPage /></ProtectedLayout>} />
            <Route path="/patients" element={<ProtectedLayout allowedRoles={['admin', 'worker', 'staff']}><PatientsPage /></ProtectedLayout>} />
            <Route path="/workers" element={<ProtectedLayout allowedRoles={['admin']}><WorkersPage /></ProtectedLayout>} />
            <Route path="/staff" element={<ProtectedLayout allowedRoles={['admin']}><StaffPage /></ProtectedLayout>} />
            <Route path="/medicines" element={<ProtectedLayout allowedRoles={['admin', 'staff']}><MedicinesPage /></ProtectedLayout>} />
            <Route path="/visits" element={<ProtectedLayout allowedRoles={['admin', 'worker']}><VisitsPage /></ProtectedLayout>} />
            <Route path="/reports" element={<ProtectedLayout allowedRoles={['admin']}><ReportsPage /></ProtectedLayout>} />
            <Route path="/users" element={<ProtectedLayout allowedRoles={['admin']}><UsersPage /></ProtectedLayout>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
