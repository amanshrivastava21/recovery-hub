import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import type { DashboardStats } from '@/types';
import PageHeader from '@/components/PageHeader';
import StatCard from '@/components/StatCard';
import {
  Users, UserCheck, UserMinus, TrendingUp, Clock, Pill,
  UserCog, Stethoscope,
} from 'lucide-react';

const ReportsPage = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => { api.getDashboardStats().then(setStats); }, []);

  if (!stats) return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );

  return (
    <div>
      <PageHeader title="Reports & Analytics" description="System-wide statistics and insights" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard title="Total Patients" value={stats.totalPatients} icon={Users} variant="primary" />
        <StatCard title="Active Patients" value={stats.activePatients} icon={UserCheck} variant="info" />
        <StatCard title="Discharged" value={stats.dischargedPatients} icon={UserMinus} variant="success" />
        <StatCard title="Recovery Rate" value={`${stats.recoveryRate}%`} icon={TrendingUp} variant="success" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard title="Workers" value={stats.totalWorkers} icon={UserCog} variant="info" />
        <StatCard title="Staff" value={stats.totalStaff} icon={Stethoscope} variant="warning" />
        <StatCard title="Medicines" value={stats.totalMedicines} icon={Pill} variant="primary" />
        <StatCard title="Avg Recovery" value={`${stats.averageRecoveryDays} days`} icon={Clock} variant="default" />
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-6 shadow-card">
          <h3 className="font-display text-lg font-semibold mb-4">Patient Status Breakdown</h3>
          <div className="space-y-3">
            {[
              { label: 'Admitted', value: stats.totalPatients - stats.dischargedPatients - 1, color: 'bg-info' },
              { label: 'In Treatment', value: 1, color: 'bg-warning' },
              { label: 'Recovering', value: 1, color: 'bg-primary' },
              { label: 'Discharged', value: stats.dischargedPatients, color: 'bg-success' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full ${item.color}`} />
                  <span className="text-sm">{item.label}</span>
                </div>
                <span className="font-semibold">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-card">
          <h3 className="font-display text-lg font-semibold mb-4">Key Metrics</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Recovery Rate</span>
                <span className="font-medium">{stats.recoveryRate}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-success transition-all" style={{ width: `${stats.recoveryRate}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Bed Occupancy</span>
                <span className="font-medium">{Math.round((stats.activePatients / Math.max(stats.totalPatients, 1)) * 100)}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-info transition-all" style={{ width: `${(stats.activePatients / Math.max(stats.totalPatients, 1)) * 100}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Staff-to-Patient Ratio</span>
                <span className="font-medium">1:{Math.round(stats.activePatients / Math.max(stats.totalStaff, 1))}</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Average Recovery Time</span>
                <span className="font-medium">{stats.averageRecoveryDays} days</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
