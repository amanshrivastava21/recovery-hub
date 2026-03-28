import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import type { DashboardStats, Patient, Visit } from '@/types';
import StatCard from '@/components/StatCard';
import {
  Users, UserCheck, UserMinus, UserCog, Stethoscope,
  Pill, Clock, TrendingUp, Plus, ClipboardList, FileText,
  Activity, ArrowRight, CalendarDays,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import healthcareBanner from '@/assets/healthcare-banner.png';

// Chart data
const recoveryTrend = [
  { month: 'Oct', admissions: 8, discharges: 3, recovery: 38 },
  { month: 'Nov', admissions: 12, discharges: 5, recovery: 42 },
  { month: 'Dec', admissions: 10, discharges: 7, recovery: 55 },
  { month: 'Jan', admissions: 15, discharges: 9, recovery: 60 },
  { month: 'Feb', admissions: 11, discharges: 8, recovery: 65 },
  { month: 'Mar', admissions: 9, discharges: 6, recovery: 70 },
];

const COLORS = [
  'hsl(168, 70%, 34%)', 'hsl(210, 92%, 55%)',
  'hsl(38, 92%, 50%)', 'hsl(142, 72%, 40%)',
  'hsl(0, 72%, 51%)',
];

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);

  useEffect(() => {
    Promise.all([
      api.getDashboardStats(),
      api.getPatients(),
      api.getVisits(),
    ]).then(([s, p, v]) => {
      setStats(s);
      setPatients(p);
      setVisits(v);
    });
  }, []);

  if (!stats) return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );

  // Pie chart data from patients
  const statusCounts = patients.reduce((acc, p) => {
    acc[p.recoveryStatus] = (acc[p.recoveryStatus] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(statusCounts).map(([name, value]) => ({
    name: name.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase()),
    value,
  }));

  const recentPatients = [...patients]
    .sort((a, b) => new Date(b.admissionDate).getTime() - new Date(a.admissionDate).getTime())
    .slice(0, 5);

  const recentVisits = [...visits]
    .sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime())
    .slice(0, 4);

  const firstName = user?.name?.split(' ')[0];
  const roleLabel = user?.role === 'admin' ? 'Administrator' : user?.role === 'worker' ? 'Rehabilitation Worker' : 'Medical Staff';

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl gradient-primary p-6 md:p-8 shadow-elevated">
        <img
          src={healthcareBanner}
          alt=""
          className="absolute right-0 top-0 h-full w-1/2 object-cover opacity-20 pointer-events-none"
          width={1280}
          height={512}
        />
        <div className="relative z-10 max-w-2xl">
          <p className="text-sm font-medium text-primary-foreground/80">Welcome back,</p>
          <h1 className="mt-1 font-display text-2xl md:text-3xl font-bold text-primary-foreground">
            {firstName} 👋
          </h1>
          <p className="mt-2 text-sm text-primary-foreground/70 max-w-lg">
            {user?.role === 'admin'
              ? 'You have full access to all modules. Here\'s your system overview for today.'
              : `Your ${roleLabel} dashboard is ready. Let's make a difference today.`}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="secondary"
              className="bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30 border-0"
              onClick={() => navigate('/patients')}
            >
              <Plus className="mr-1 h-4 w-4" /> Add Patient
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30 border-0"
              onClick={() => navigate('/visits')}
            >
              <ClipboardList className="mr-1 h-4 w-4" /> Log Visit
            </Button>
            {user?.role === 'admin' && (
              <Button
                size="sm"
                variant="secondary"
                className="bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30 border-0"
                onClick={() => navigate('/reports')}
              >
                <FileText className="mr-1 h-4 w-4" /> View Reports
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Patients" value={stats.totalPatients} icon={Users} variant="primary" />
        <StatCard title="Active Patients" value={stats.activePatients} icon={UserCheck} variant="info" />
        <StatCard title="Discharged" value={stats.dischargedPatients} icon={UserMinus} variant="success" />
        <StatCard
          title={user?.role === 'admin' ? 'Recovery Rate' : 'Avg Recovery'}
          value={user?.role === 'admin' ? `${stats.recoveryRate}%` : `${stats.averageRecoveryDays}d`}
          icon={user?.role === 'admin' ? TrendingUp : Clock}
          variant={user?.role === 'admin' ? 'success' : 'warning'}
          description={user?.role === 'admin' ? 'Of total patients' : undefined}
        />
      </div>

      {user?.role === 'admin' && (
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <StatCard title="Workers" value={stats.totalWorkers} icon={UserCog} variant="info" />
          <StatCard title="Staff" value={stats.totalStaff} icon={Stethoscope} variant="warning" />
          <StatCard title="Medicines" value={stats.totalMedicines} icon={Pill} variant="primary" />
          <StatCard title="Avg Recovery" value={`${stats.averageRecoveryDays} days`} icon={Clock} variant="default" />
        </div>
      )}

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Line Chart */}
        <div className="lg:col-span-3 rounded-xl border bg-card p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-base font-semibold text-foreground">Recovery Trend</h2>
              <p className="text-xs text-muted-foreground">Monthly admissions, discharges &amp; recovery rate</p>
            </div>
            <Activity className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={recoveryTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'hsl(215, 12%, 50%)' }} />
                <YAxis tick={{ fontSize: 12, fill: 'hsl(215, 12%, 50%)' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(0, 0%, 100%)',
                    border: '1px solid hsl(214, 20%, 90%)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Line type="monotone" dataKey="admissions" stroke="hsl(210, 92%, 55%)" strokeWidth={2} dot={{ r: 3 }} name="Admissions" />
                <Line type="monotone" dataKey="discharges" stroke="hsl(142, 72%, 40%)" strokeWidth={2} dot={{ r: 3 }} name="Discharges" />
                <Line type="monotone" dataKey="recovery" stroke="hsl(168, 70%, 34%)" strokeWidth={2.5} dot={{ r: 4 }} name="Recovery %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="lg:col-span-2 rounded-xl border bg-card p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-base font-semibold text-foreground">Patient Distribution</h2>
              <p className="text-xs text-muted-foreground">By recovery status</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="45%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(0, 0%, 100%)',
                    border: '1px solid hsl(214, 20%, 90%)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px' }}
                  formatter={(value) => <span className="text-muted-foreground">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Activity + Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Admissions */}
        <div className="lg:col-span-2 rounded-xl border bg-card shadow-card">
          <div className="flex items-center justify-between p-5 pb-3">
            <div>
              <h2 className="font-display text-base font-semibold text-foreground">Recent Admissions</h2>
              <p className="text-xs text-muted-foreground">Latest patient activity</p>
            </div>
            <Button variant="ghost" size="sm" className="text-xs text-primary" onClick={() => navigate('/patients')}>
              View all <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </div>
          <div className="px-5 pb-5 space-y-3">
            {recentPatients.map((p) => (
              <div key={p.id} className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {p.fullName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{p.fullName}</p>
                  <p className="text-xs text-muted-foreground">{p.addictionType}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                    p.recoveryStatus === 'discharged' ? 'bg-success/10 text-success' :
                    p.recoveryStatus === 'recovering' ? 'bg-info/10 text-info' :
                    p.recoveryStatus === 'in-treatment' ? 'bg-warning/10 text-warning' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {p.recoveryStatus.replace('-', ' ')}
                  </span>
                  <p className="mt-0.5 text-xs text-muted-foreground flex items-center justify-end gap-1">
                    <CalendarDays className="h-3 w-3" />
                    {new Date(p.admissionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column: Recent Visits + Quick Actions */}
        <div className="space-y-6">
          {/* Recent Visits */}
          <div className="rounded-xl border bg-card shadow-card">
            <div className="flex items-center justify-between p-5 pb-3">
              <h2 className="font-display text-base font-semibold text-foreground">Latest Visits</h2>
              <Button variant="ghost" size="sm" className="text-xs text-primary" onClick={() => navigate('/visits')}>
                All <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
            <div className="px-5 pb-5 space-y-2.5">
              {recentVisits.map((v) => (
                <div key={v.id} className="flex items-start gap-3 rounded-lg p-2 hover:bg-muted/40 transition-colors">
                  <div className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${
                    v.patientCondition === 'improving' ? 'bg-success' :
                    v.patientCondition === 'stable' ? 'bg-info' :
                    v.patientCondition === 'declining' ? 'bg-warning' :
                    'bg-muted-foreground'
                  }`} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{v.patientName}</p>
                    <p className="text-xs text-muted-foreground truncate">{v.notes?.slice(0, 50)}...</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      by {v.workerName} • {new Date(v.visitDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-xl border bg-card p-5 shadow-card">
            <h2 className="font-display text-base font-semibold text-foreground mb-3">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="justify-start text-xs h-9" onClick={() => navigate('/patients')}>
                <Plus className="mr-1.5 h-3.5 w-3.5 text-primary" /> Add Patient
              </Button>
              <Button variant="outline" size="sm" className="justify-start text-xs h-9" onClick={() => navigate('/visits')}>
                <ClipboardList className="mr-1.5 h-3.5 w-3.5 text-info" /> Log Visit
              </Button>
              {user?.role === 'admin' && (
                <>
                  <Button variant="outline" size="sm" className="justify-start text-xs h-9" onClick={() => navigate('/workers')}>
                    <UserCog className="mr-1.5 h-3.5 w-3.5 text-warning" /> Workers
                  </Button>
                  <Button variant="outline" size="sm" className="justify-start text-xs h-9" onClick={() => navigate('/reports')}>
                    <FileText className="mr-1.5 h-3.5 w-3.5 text-success" /> Reports
                  </Button>
                </>
              )}
              <Button variant="outline" size="sm" className="justify-start text-xs h-9" onClick={() => navigate('/medicines')}>
                <Pill className="mr-1.5 h-3.5 w-3.5 text-primary" /> Medicines
              </Button>
              <Button variant="outline" size="sm" className="justify-start text-xs h-9" onClick={() => navigate('/staff')}>
                <Stethoscope className="mr-1.5 h-3.5 w-3.5 text-info" /> Staff
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
