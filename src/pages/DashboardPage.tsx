import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import type { DashboardStats } from '@/types';
import StatCard from '@/components/StatCard';
import PageHeader from '@/components/PageHeader';
import {
  Users, UserCheck, UserMinus, UserCog, Stethoscope,
  Pill, Clock, TrendingUp,
} from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    api.getDashboardStats().then(setStats);
  }, []);

  if (!stats) return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user?.name?.split(' ')[0]}`}
        description={`${user?.role === 'admin' ? 'System Administrator' : user?.role === 'worker' ? 'Rehabilitation Worker' : 'Medical Staff'} Dashboard`}
      />

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Patients" value={stats.totalPatients} icon={Users} variant="primary" />
        <StatCard title="Active Patients" value={stats.activePatients} icon={UserCheck} variant="info" />
        <StatCard title="Discharged" value={stats.dischargedPatients} icon={UserMinus} variant="success" />
        {user?.role === 'admin' && (
          <StatCard title="Recovery Rate" value={`${stats.recoveryRate}%`} icon={TrendingUp} variant="success" description="Of total patients" />
        )}
        {user?.role !== 'admin' && (
          <StatCard title="Avg Recovery" value={`${stats.averageRecoveryDays} days`} icon={Clock} variant="warning" />
        )}
      </div>

      {user?.role === 'admin' && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Workers" value={stats.totalWorkers} icon={UserCog} variant="info" />
          <StatCard title="Staff" value={stats.totalStaff} icon={Stethoscope} variant="warning" />
          <StatCard title="Medicines" value={stats.totalMedicines} icon={Pill} variant="primary" />
          <StatCard title="Avg Recovery" value={`${stats.averageRecoveryDays} days`} icon={Clock} variant="default" />
        </div>
      )}

      {/* Quick Info */}
      <div className="mt-8 rounded-xl border bg-card p-6 shadow-card">
        <h2 className="font-display text-lg font-semibold">System Overview</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {user?.role === 'admin'
            ? 'You have full access to all modules including patient management, staff coordination, medicine inventory, and analytics reports.'
            : user?.role === 'worker'
            ? 'You can view your assigned patients, log visits, and add progress notes. Visit the Patients or Visits page to get started.'
            : 'You can manage patient records, update treatment plans, prescribe medicines, and handle discharges.'}
        </p>
      </div>
    </div>
  );
};

export default DashboardPage;
