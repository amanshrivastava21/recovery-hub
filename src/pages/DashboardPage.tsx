import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import type { DashboardStats, Patient, Visit, Worker, StaffMember, Medicine } from '@/types';
import StatCard from '@/components/StatCard';
import {
  Users, UserCheck, UserMinus, UserCog, Stethoscope,
  Pill, Clock, TrendingUp, Plus, ClipboardList, FileText,
  Activity, ArrowRight, CalendarDays, Shield, Heart,
  BarChart3, AlertTriangle, CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
  BarChart, Bar,
} from 'recharts';
import healthcareBanner from '@/assets/healthcare-banner.png';

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

const tooltipStyle = {
  backgroundColor: 'hsl(0, 0%, 100%)',
  border: '1px solid hsl(214, 20%, 90%)',
  borderRadius: '8px',
  fontSize: '12px',
};

const axisTick = { fontSize: 12, fill: 'hsl(215, 12%, 50%)' };

// ── Shared Components ────────────────────────────────────

const HeroBanner = ({ firstName, subtitle, actions }: { firstName: string; subtitle: string; actions: React.ReactNode }) => (
  <div className="relative overflow-hidden rounded-2xl gradient-primary p-6 md:p-8 shadow-elevated">
    <img src={healthcareBanner} alt="" className="absolute right-0 top-0 h-full w-1/2 object-cover opacity-20 pointer-events-none" width={1280} height={512} />
    <div className="relative z-10 max-w-2xl">
      <p className="text-sm font-medium text-primary-foreground/80">Welcome back,</p>
      <h1 className="mt-1 font-display text-2xl md:text-3xl font-bold text-primary-foreground">{firstName} 👋</h1>
      <p className="mt-2 text-sm text-primary-foreground/70 max-w-lg">{subtitle}</p>
      <div className="mt-4 flex flex-wrap gap-2">{actions}</div>
    </div>
  </div>
);

const BannerButton = ({ onClick, icon: Icon, label }: { onClick: () => void; icon: React.ElementType; label: string }) => (
  <Button size="sm" variant="secondary" className="bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30 border-0" onClick={onClick}>
    <Icon className="mr-1 h-4 w-4" /> {label}
  </Button>
);

const SectionCard = ({ title, subtitle, headerAction, children }: { title: string; subtitle?: string; headerAction?: React.ReactNode; children: React.ReactNode }) => (
  <div className="rounded-xl border bg-card shadow-card">
    <div className="flex items-center justify-between p-5 pb-3">
      <div>
        <h2 className="font-display text-base font-semibold text-foreground">{title}</h2>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {headerAction}
    </div>
    <div className="px-5 pb-5">{children}</div>
  </div>
);

const PatientRow = ({ p }: { p: Patient }) => (
  <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
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
);

const VisitRow = ({ v }: { v: Visit }) => (
  <div className="flex items-start gap-3 rounded-lg p-2 hover:bg-muted/40 transition-colors">
    <div className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${
      v.patientCondition === 'improving' ? 'bg-success' :
      v.patientCondition === 'stable' ? 'bg-info' :
      v.patientCondition === 'declining' ? 'bg-warning' : 'bg-muted-foreground'
    }`} />
    <div className="min-w-0">
      <p className="text-sm font-medium text-foreground truncate">{v.patientName}</p>
      <p className="text-xs text-muted-foreground truncate">{v.notes?.slice(0, 50)}...</p>
      <p className="text-xs text-muted-foreground mt-0.5">by {v.workerName} • {new Date(v.visitDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
    </div>
  </div>
);

// ── Admin Dashboard ──────────────────────────────────────

const AdminDashboard = ({ stats, patients, visits, workers, staff, medicines, navigate }: DashboardViewProps) => {
  const statusCounts = patients.reduce((acc, p) => { acc[p.recoveryStatus] = (acc[p.recoveryStatus] || 0) + 1; return acc; }, {} as Record<string, number>);
  const pieData = Object.entries(statusCounts).map(([name, value]) => ({ name: name.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase()), value }));

  const workerPerformance = workers.map(w => ({
    name: w.user.name.split(' ')[0],
    patients: w.assignedPatients.length,
    score: w.performanceScore,
  }));

  const lowStockMeds = medicines.filter(m => m.stockQuantity < 100);

  return (
    <div className="space-y-6">
      <HeroBanner
        firstName={stats._firstName}
        subtitle="Full system access. Monitor all modules, manage staff, and view analytics."
        actions={<>
          <BannerButton onClick={() => navigate('/patients')} icon={Plus} label="Add Patient" />
          <BannerButton onClick={() => navigate('/reports')} icon={FileText} label="View Reports" />
          <BannerButton onClick={() => navigate('/users')} icon={Shield} label="Manage Users" />
        </>}
      />

      {/* Primary Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Patients" value={stats.totalPatients} icon={Users} variant="primary" />
        <StatCard title="Active Patients" value={stats.activePatients} icon={UserCheck} variant="info" />
        <StatCard title="Discharged" value={stats.dischargedPatients} icon={UserMinus} variant="success" />
        <StatCard title="Recovery Rate" value={`${stats.recoveryRate}%`} icon={TrendingUp} variant="success" description="Of total patients" />
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard title="Workers" value={stats.totalWorkers} icon={UserCog} variant="info" />
        <StatCard title="Staff" value={stats.totalStaff} icon={Stethoscope} variant="warning" />
        <StatCard title="Medicines" value={stats.totalMedicines} icon={Pill} variant="primary" />
        <StatCard title="Avg Recovery" value={`${stats.averageRecoveryDays} days`} icon={Clock} variant="default" />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 rounded-xl border bg-card p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-base font-semibold text-foreground">Recovery Trend</h2>
              <p className="text-xs text-muted-foreground">Monthly admissions, discharges & recovery rate</p>
            </div>
            <Activity className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={recoveryTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
                <XAxis dataKey="month" tick={axisTick} />
                <YAxis tick={axisTick} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="admissions" stroke="hsl(210, 92%, 55%)" strokeWidth={2} dot={{ r: 3 }} name="Admissions" />
                <Line type="monotone" dataKey="discharges" stroke="hsl(142, 72%, 40%)" strokeWidth={2} dot={{ r: 3 }} name="Discharges" />
                <Line type="monotone" dataKey="recovery" stroke="hsl(168, 70%, 34%)" strokeWidth={2.5} dot={{ r: 4 }} name="Recovery %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2 rounded-xl border bg-card p-5 shadow-card">
          <div className="mb-4">
            <h2 className="font-display text-base font-semibold text-foreground">Patient Distribution</h2>
            <p className="text-xs text-muted-foreground">By recovery status</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="45%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '11px' }} formatter={(v) => <span className="text-muted-foreground">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Worker Performance + Low Stock */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-base font-semibold text-foreground">Worker Performance</h2>
              <p className="text-xs text-muted-foreground">Assigned patients & performance scores</p>
            </div>
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workerPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
                <XAxis dataKey="name" tick={axisTick} />
                <YAxis tick={axisTick} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="patients" fill="hsl(210, 92%, 55%)" radius={[4, 4, 0, 0]} name="Patients" />
                <Bar dataKey="score" fill="hsl(168, 70%, 34%)" radius={[4, 4, 0, 0]} name="Score" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-base font-semibold text-foreground">Medicine Alerts</h2>
              <p className="text-xs text-muted-foreground">{lowStockMeds.length > 0 ? `${lowStockMeds.length} items need attention` : 'All stock levels healthy'}</p>
            </div>
            <AlertTriangle className={`h-5 w-5 ${lowStockMeds.length > 0 ? 'text-warning' : 'text-success'}`} />
          </div>
          <div className="space-y-2.5">
            {lowStockMeds.length > 0 ? lowStockMeds.map(m => (
              <div key={m.id} className="flex items-center justify-between rounded-lg border border-warning/20 bg-warning/5 p-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{m.name}</p>
                  <p className="text-xs text-muted-foreground">{m.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-warning">{m.stockQuantity} {m.unit}</p>
                  <p className="text-xs text-muted-foreground">Low stock</p>
                </div>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <CheckCircle2 className="h-10 w-10 text-success mb-2" />
                <p className="text-sm">All medicines are well-stocked</p>
              </div>
            )}
            <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => navigate('/medicines')}>
              <Pill className="mr-1.5 h-3.5 w-3.5" /> View Full Inventory
            </Button>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        <SectionCard title="Recent Admissions" subtitle="Latest patient activity" headerAction={
          <Button variant="ghost" size="sm" className="text-xs text-primary" onClick={() => navigate('/patients')}>View all <ArrowRight className="ml-1 h-3 w-3" /></Button>
        }>
          <div className="space-y-3">
            {patients.sort((a, b) => new Date(b.admissionDate).getTime() - new Date(a.admissionDate).getTime()).slice(0, 4).map(p => <PatientRow key={p.id} p={p} />)}
          </div>
        </SectionCard>

        <SectionCard title="Latest Visits" headerAction={
          <Button variant="ghost" size="sm" className="text-xs text-primary" onClick={() => navigate('/visits')}>All <ArrowRight className="ml-1 h-3 w-3" /></Button>
        }>
          <div className="space-y-2.5">
            {visits.sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime()).slice(0, 4).map(v => <VisitRow key={v.id} v={v} />)}
          </div>
        </SectionCard>

        <div className="space-y-6">
          <div className="rounded-xl border bg-card p-5 shadow-card">
            <h2 className="font-display text-base font-semibold text-foreground mb-3">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="justify-start text-xs h-9" onClick={() => navigate('/patients')}><Plus className="mr-1.5 h-3.5 w-3.5 text-primary" /> Add Patient</Button>
              <Button variant="outline" size="sm" className="justify-start text-xs h-9" onClick={() => navigate('/visits')}><ClipboardList className="mr-1.5 h-3.5 w-3.5 text-info" /> Log Visit</Button>
              <Button variant="outline" size="sm" className="justify-start text-xs h-9" onClick={() => navigate('/workers')}><UserCog className="mr-1.5 h-3.5 w-3.5 text-warning" /> Workers</Button>
              <Button variant="outline" size="sm" className="justify-start text-xs h-9" onClick={() => navigate('/reports')}><FileText className="mr-1.5 h-3.5 w-3.5 text-success" /> Reports</Button>
              <Button variant="outline" size="sm" className="justify-start text-xs h-9" onClick={() => navigate('/medicines')}><Pill className="mr-1.5 h-3.5 w-3.5 text-primary" /> Medicines</Button>
              <Button variant="outline" size="sm" className="justify-start text-xs h-9" onClick={() => navigate('/users')}><Shield className="mr-1.5 h-3.5 w-3.5 text-info" /> Users</Button>
            </div>
          </div>

          {/* Staff overview mini */}
          <div className="rounded-xl border bg-card p-5 shadow-card">
            <h2 className="font-display text-base font-semibold text-foreground mb-3">Staff Overview</h2>
            <div className="space-y-2">
              {staff.slice(0, 3).map(s => (
                <div key={s.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/40 transition-colors">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-info/10 text-xs font-semibold text-info">
                    {s.user.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{s.user.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{s.staffRole} · {s.department}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Worker Dashboard ─────────────────────────────────────

const WorkerDashboard = ({ stats, patients, visits, navigate, userName }: DashboardViewProps & { userName: string }) => {
  // Workers see their assigned patients & visits
  const myPatients = patients.filter(p => p.assignedWorker);
  const activePatients = myPatients.filter(p => p.recoveryStatus !== 'discharged');
  const myVisits = visits.sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime());

  const conditionData = myVisits.reduce((acc, v) => {
    acc[v.patientCondition] = (acc[v.patientCondition] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const conditionPie = Object.entries(conditionData).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

  const visitsByMonth = recoveryTrend.map(r => ({ month: r.month, visits: Math.floor(Math.random() * 8) + 2 }));

  return (
    <div className="space-y-6">
      <HeroBanner
        firstName={stats._firstName}
        subtitle="Track your assigned patients, log visits, and monitor their recovery progress."
        actions={<>
          <BannerButton onClick={() => navigate('/visits')} icon={ClipboardList} label="Log Visit" />
          <BannerButton onClick={() => navigate('/patients')} icon={Users} label="My Patients" />
        </>}
      />

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard title="My Patients" value={myPatients.length} icon={Users} variant="primary" />
        <StatCard title="Active Cases" value={activePatients.length} icon={Heart} variant="info" />
        <StatCard title="Total Visits" value={myVisits.length} icon={ClipboardList} variant="warning" />
        <StatCard title="Avg Recovery" value={`${stats.averageRecoveryDays}d`} icon={Clock} variant="success" />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-5 shadow-card">
          <div className="mb-4">
            <h2 className="font-display text-base font-semibold text-foreground">My Visit History</h2>
            <p className="text-xs text-muted-foreground">Monthly visits logged</p>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={visitsByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
                <XAxis dataKey="month" tick={axisTick} />
                <YAxis tick={axisTick} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="visits" fill="hsl(168, 70%, 34%)" radius={[4, 4, 0, 0]} name="Visits" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-card">
          <div className="mb-4">
            <h2 className="font-display text-base font-semibold text-foreground">Patient Conditions</h2>
            <p className="text-xs text-muted-foreground">From my recent visits</p>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={conditionPie} cx="50%" cy="45%" innerRadius={45} outerRadius={75} paddingAngle={4} dataKey="value">
                  {conditionPie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '11px' }} formatter={(v) => <span className="text-muted-foreground">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Patients & Visits */}
      <div className="grid gap-6 lg:grid-cols-3">
        <SectionCard title="Assigned Patients" subtitle={`${activePatients.length} active`} headerAction={
          <Button variant="ghost" size="sm" className="text-xs text-primary" onClick={() => navigate('/patients')}>View all <ArrowRight className="ml-1 h-3 w-3" /></Button>
        }>
          <div className="space-y-3 lg:col-span-2">
            {activePatients.slice(0, 5).map(p => <PatientRow key={p.id} p={p} />)}
            {activePatients.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">No active patients assigned</p>}
          </div>
        </SectionCard>

        <SectionCard title="Recent Visits" headerAction={
          <Button variant="ghost" size="sm" className="text-xs text-primary" onClick={() => navigate('/visits')}>All <ArrowRight className="ml-1 h-3 w-3" /></Button>
        }>
          <div className="space-y-2.5">
            {myVisits.slice(0, 5).map(v => <VisitRow key={v.id} v={v} />)}
          </div>
        </SectionCard>

        <div className="rounded-xl border bg-card p-5 shadow-card">
          <h2 className="font-display text-base font-semibold text-foreground mb-3">Quick Actions</h2>
          <div className="space-y-2">
            <Button variant="outline" size="sm" className="justify-start text-xs h-9 w-full" onClick={() => navigate('/visits')}><ClipboardList className="mr-1.5 h-3.5 w-3.5 text-primary" /> Log New Visit</Button>
            <Button variant="outline" size="sm" className="justify-start text-xs h-9 w-full" onClick={() => navigate('/patients')}><Users className="mr-1.5 h-3.5 w-3.5 text-info" /> View Patients</Button>
          </div>
          <div className="mt-6 rounded-lg bg-accent/50 p-4">
            <h3 className="text-sm font-semibold text-foreground mb-1">💡 Tip of the Day</h3>
            <p className="text-xs text-muted-foreground">Regular visit documentation improves patient outcomes by 40%. Keep your notes detailed and consistent.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Staff Dashboard ──────────────────────────────────────

const StaffDashboard = ({ stats, patients, medicines, navigate }: DashboardViewProps) => {
  const activePatients = patients.filter(p => p.recoveryStatus !== 'discharged');
  const inTreatment = patients.filter(p => p.recoveryStatus === 'in-treatment').length;
  const recovering = patients.filter(p => p.recoveryStatus === 'recovering').length;

  const lowStockMeds = medicines.filter(m => m.stockQuantity < 100);

  const treatmentData = [
    { name: 'In Treatment', value: inTreatment },
    { name: 'Recovering', value: recovering },
    { name: 'Admitted', value: patients.filter(p => p.recoveryStatus === 'admitted').length },
    { name: 'Discharged', value: patients.filter(p => p.recoveryStatus === 'discharged').length },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      <HeroBanner
        firstName={stats._firstName}
        subtitle="Manage patient treatments, prescribe medicines, and track recovery progress."
        actions={<>
          <BannerButton onClick={() => navigate('/patients')} icon={Plus} label="Add Patient" />
          <BannerButton onClick={() => navigate('/medicines')} icon={Pill} label="Medicine Inventory" />
        </>}
      />

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard title="Active Patients" value={stats.activePatients} icon={UserCheck} variant="primary" />
        <StatCard title="In Treatment" value={inTreatment} icon={Activity} variant="info" />
        <StatCard title="Recovering" value={recovering} icon={Heart} variant="success" />
        <StatCard title="Medicines" value={stats.totalMedicines} icon={Pill} variant="warning" />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-5 shadow-card">
          <div className="mb-4">
            <h2 className="font-display text-base font-semibold text-foreground">Treatment Overview</h2>
            <p className="text-xs text-muted-foreground">Current patient status breakdown</p>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={treatmentData} cx="50%" cy="45%" innerRadius={45} outerRadius={75} paddingAngle={4} dataKey="value">
                  {treatmentData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '11px' }} formatter={(v) => <span className="text-muted-foreground">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-base font-semibold text-foreground">Medicine Inventory</h2>
              <p className="text-xs text-muted-foreground">{lowStockMeds.length} low-stock alerts</p>
            </div>
            <AlertTriangle className={`h-5 w-5 ${lowStockMeds.length > 0 ? 'text-warning' : 'text-success'}`} />
          </div>
          <div className="space-y-2">
            {medicines.slice(0, 5).map(m => (
              <div key={m.id} className={`flex items-center justify-between rounded-lg border p-2.5 ${m.stockQuantity < 100 ? 'border-warning/20 bg-warning/5' : 'bg-muted/20'}`}>
                <div>
                  <p className="text-sm font-medium text-foreground">{m.name}</p>
                  <p className="text-xs text-muted-foreground">{m.category}</p>
                </div>
                <p className={`text-sm font-semibold ${m.stockQuantity < 100 ? 'text-warning' : 'text-foreground'}`}>{m.stockQuantity} {m.unit}</p>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" className="w-full mt-3" onClick={() => navigate('/medicines')}>
            <Pill className="mr-1.5 h-3.5 w-3.5" /> Full Inventory
          </Button>
        </div>
      </div>

      {/* Patients & Actions */}
      <div className="grid gap-6 lg:grid-cols-3">
        <SectionCard title="Patients Under Care" subtitle={`${activePatients.length} active`} headerAction={
          <Button variant="ghost" size="sm" className="text-xs text-primary" onClick={() => navigate('/patients')}>View all <ArrowRight className="ml-1 h-3 w-3" /></Button>
        }>
          <div className="space-y-3 lg:col-span-2">
            {activePatients.slice(0, 5).map(p => <PatientRow key={p.id} p={p} />)}
          </div>
        </SectionCard>

        <SectionCard title="Recent Progress Notes">
          <div className="space-y-3">
            {patients.flatMap(p => p.progressNotes.map(n => ({ ...n, patientName: p.fullName, patientId: p.id })))
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .slice(0, 5)
              .map((note, i) => (
                <div key={i} className="rounded-lg p-2.5 hover:bg-muted/40 transition-colors">
                  <p className="text-sm font-medium text-foreground">{note.patientName}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{note.note}</p>
                  <p className="text-xs text-muted-foreground mt-1">by {note.addedBy} · {new Date(note.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                </div>
              ))
            }
          </div>
        </SectionCard>

        <div className="rounded-xl border bg-card p-5 shadow-card">
          <h2 className="font-display text-base font-semibold text-foreground mb-3">Quick Actions</h2>
          <div className="space-y-2">
            <Button variant="outline" size="sm" className="justify-start text-xs h-9 w-full" onClick={() => navigate('/patients')}><Plus className="mr-1.5 h-3.5 w-3.5 text-primary" /> Add Patient</Button>
            <Button variant="outline" size="sm" className="justify-start text-xs h-9 w-full" onClick={() => navigate('/medicines')}><Pill className="mr-1.5 h-3.5 w-3.5 text-warning" /> Manage Medicines</Button>
          </div>
          <div className="mt-6 rounded-lg bg-accent/50 p-4">
            <h3 className="text-sm font-semibold text-foreground mb-1">📋 Reminder</h3>
            <p className="text-xs text-muted-foreground">Update treatment plans regularly. Patients with updated plans show 35% faster recovery.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main Dashboard Router ────────────────────────────────

interface DashboardViewProps {
  stats: DashboardStats & { _firstName: string };
  patients: Patient[];
  visits: Visit[];
  workers: Worker[];
  staff: StaffMember[];
  medicines: Medicine[];
  navigate: (path: string) => void;
  userName: string;
}

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);

  useEffect(() => {
    Promise.all([
      api.getDashboardStats(),
      api.getPatients(),
      api.getVisits(),
      api.getWorkers().catch(() => []),
      api.getStaff().catch(() => []),
      api.getMedicines().catch(() => []),
    ]).then(([s, p, v, w, st, m]) => {
      setStats(s);
      setPatients(p);
      setVisits(v);
      setWorkers(w);
      setStaff(st);
      setMedicines(m);
    });
  }, []);

  if (!stats) return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );

  const firstName = user?.name?.split(' ')[0] || 'User';
  const enrichedStats = { ...stats, _firstName: firstName };
  const props: DashboardViewProps = { stats: enrichedStats, patients, visits, workers, staff, medicines, navigate, userName: user?.name || '' };

  if (user?.role === 'worker') return <WorkerDashboard {...props} />;
  if (user?.role === 'staff') return <StaffDashboard {...props} />;
  return <AdminDashboard {...props} />;
};

export default DashboardPage;
