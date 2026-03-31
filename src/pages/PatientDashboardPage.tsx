import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  User, Phone, Mail, MapPin, Heart, Pill, ClipboardList,
  CalendarDays, Clock, Activity, UserCog, Stethoscope,
  TrendingUp, FileText, AlertCircle, CheckCircle2, Shield,
} from 'lucide-react';

// ── Mock patient data ────────────────────────────────────
const patientProfile = {
  name: 'Rahul Sharma',
  age: 32,
  gender: 'Male',
  phone: '555-0104',
  email: 'patient@rcms.com',
  address: '42 Green Valley, New Delhi',
  addictionType: 'Alcohol Dependency',
  medicalHistory: 'Mild hypertension, no allergies',
  admissionDate: '2025-11-15',
  dischargeDate: null as string | null,
  recoveryStatus: 'in-treatment' as const,
  emergencyContact: { name: 'Priya Sharma', phone: '555-0199', relationship: 'Spouse' },
};

const treatmentPlan = {
  plan: 'Cognitive Behavioral Therapy (CBT) combined with group counseling. Focus on coping mechanisms and relapse prevention.',
  assignedDoctor: 'Dr. Sarah Staff',
  assignedWorker: 'John Worker',
  startDate: '2025-11-18',
  updates: [
    { date: '2026-03-28', note: 'Positive response to CBT sessions. Reduced anxiety levels.' },
    { date: '2026-03-20', note: 'Started group therapy. Initial resistance but improving.' },
    { date: '2026-03-10', note: 'Medication adjusted. Better sleep patterns observed.' },
  ],
};

const medicines = [
  { name: 'Naltrexone', dosage: '50mg', schedule: 'Once daily, morning', status: 'active' },
  { name: 'Diazepam', dosage: '5mg', schedule: 'Twice daily', status: 'active' },
  { name: 'Multivitamin', dosage: '1 tablet', schedule: 'Once daily, after meals', status: 'active' },
  { name: 'Melatonin', dosage: '3mg', schedule: 'Before bedtime', status: 'completed' },
];

const progressNotes = [
  { date: '2026-03-30', note: 'Patient showing excellent improvement in group sessions. Engaging well with peers.', addedBy: 'John Worker' },
  { date: '2026-03-27', note: 'Vitals stable. Blood pressure within normal range. Sleep quality improved.', addedBy: 'Dr. Sarah Staff' },
  { date: '2026-03-24', note: 'Completed 2nd milestone of recovery plan. Positive mindset observed.', addedBy: 'John Worker' },
  { date: '2026-03-20', note: 'Started physical exercise routine. Patient is cooperative and motivated.', addedBy: 'Dr. Sarah Staff' },
  { date: '2026-03-15', note: 'Initial assessment complete. Treatment plan approved and started.', addedBy: 'Dr. Sarah Staff' },
];

const statusColorMap: Record<string, string> = {
  'admitted': 'bg-info/15 text-info border-info/30',
  'in-treatment': 'bg-warning/15 text-warning border-warning/30',
  'recovering': 'bg-success/15 text-success border-success/30',
  'discharged': 'bg-muted text-muted-foreground border-border',
  'relapsed': 'bg-destructive/15 text-destructive border-destructive/30',
};

const daysSince = (dateStr: string) => {
  const diff = new Date().getTime() - new Date(dateStr).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

const InfoRow = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) => (
  <div className="flex items-start gap-3 py-2">
    <Icon className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  </div>
);

const PatientDashboardPage = () => {
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] || 'Patient';
  const stayDays = daysSince(patientProfile.admissionDate);
  const recoveryProgress = Math.min(Math.round((stayDays / 180) * 100), 95);

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl gradient-primary p-6 md:p-8 shadow-elevated">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,hsl(168_70%_45%/0.4),transparent_50%)]" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-primary-foreground/70 text-sm">Welcome back</p>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-primary-foreground">
              Hello, {firstName} 👋
            </h1>
            <p className="mt-1 text-primary-foreground/80 text-sm max-w-md">
              Your health journey is our priority. Here's your latest treatment overview and progress.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary-foreground/15 backdrop-blur-sm px-4 py-3 text-center">
              <p className="text-2xl font-bold text-primary-foreground">{stayDays}</p>
              <p className="text-xs text-primary-foreground/70">Days in Program</p>
            </div>
            <div className="rounded-xl bg-primary-foreground/15 backdrop-blur-sm px-4 py-3 text-center">
              <p className="text-2xl font-bold text-primary-foreground">{recoveryProgress}%</p>
              <p className="text-xs text-primary-foreground/70">Recovery</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: CalendarDays, label: 'Admission', value: new Date(patientProfile.admissionDate).toLocaleDateString(), color: 'text-info' },
          { icon: Activity, label: 'Status', value: patientProfile.recoveryStatus.replace('-', ' '), color: 'text-warning' },
          { icon: Pill, label: 'Active Medicines', value: `${medicines.filter(m => m.status === 'active').length}`, color: 'text-success' },
          { icon: ClipboardList, label: 'Progress Notes', value: `${progressNotes.length}`, color: 'text-primary' },
        ].map(s => (
          <Card key={s.label} className="shadow-card border-border/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`rounded-lg bg-muted p-2.5 ${s.color}`}>
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-sm font-semibold text-foreground capitalize">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:row-span-2 shadow-card border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4 text-primary" />
              My Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="flex items-center gap-4 mb-4 pb-4 border-b border-border">
              <div className="h-16 w-16 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-xl shrink-0">
                {patientProfile.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{patientProfile.name}</h3>
                <p className="text-sm text-muted-foreground">{patientProfile.age} yrs • {patientProfile.gender}</p>
                <Badge variant="outline" className={`mt-1 text-xs ${statusColorMap[patientProfile.recoveryStatus]}`}>
                  {patientProfile.recoveryStatus.replace('-', ' ')}
                </Badge>
              </div>
            </div>
            <InfoRow icon={Phone} label="Phone" value={patientProfile.phone} />
            <InfoRow icon={Mail} label="Email" value={patientProfile.email} />
            <InfoRow icon={MapPin} label="Address" value={patientProfile.address} />
            <InfoRow icon={Heart} label="Condition" value={patientProfile.addictionType} />
            <InfoRow icon={FileText} label="Medical History" value={patientProfile.medicalHistory} />
            <div className="pt-3 mt-3 border-t border-border">
              <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5" /> Emergency Contact
              </p>
              <p className="text-sm font-medium text-foreground">{patientProfile.emergencyContact.name}</p>
              <p className="text-xs text-muted-foreground">{patientProfile.emergencyContact.relationship} • {patientProfile.emergencyContact.phone}</p>
            </div>
          </CardContent>
        </Card>

        {/* Treatment Plan */}
        <Card className="lg:col-span-2 shadow-card border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Stethoscope className="h-4 w-4 text-primary" />
              Treatment Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground leading-relaxed mb-4">{treatmentPlan.plan}</p>
            <div className="grid sm:grid-cols-2 gap-3 mb-4">
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">Assigned Doctor</p>
                <p className="text-sm font-medium text-foreground flex items-center gap-1.5 mt-0.5">
                  <Stethoscope className="h-3.5 w-3.5 text-success" />{treatmentPlan.assignedDoctor}
                </p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">Assigned Worker</p>
                <p className="text-sm font-medium text-foreground flex items-center gap-1.5 mt-0.5">
                  <UserCog className="h-3.5 w-3.5 text-info" />{treatmentPlan.assignedWorker}
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Recent Updates</p>
              <div className="space-y-2">
                {treatmentPlan.updates.map((u, i) => (
                  <div key={i} className="flex gap-3 text-sm">
                    <span className="text-xs text-muted-foreground whitespace-nowrap mt-0.5">{new Date(u.date).toLocaleDateString()}</span>
                    <p className="text-foreground">{u.note}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Medicines */}
        <Card className="lg:col-span-2 shadow-card border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Pill className="h-4 w-4 text-primary" />
              My Medicines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {medicines.map((m, i) => (
                <div key={i} className={`flex items-center justify-between rounded-lg border p-3 ${m.status === 'active' ? 'border-border bg-card' : 'border-border/50 bg-muted/30 opacity-70'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`rounded-lg p-2 ${m.status === 'active' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                      <Pill className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{m.name}</p>
                      <p className="text-xs text-muted-foreground">{m.dosage} • {m.schedule}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={`text-xs ${m.status === 'active' ? 'border-success/30 text-success bg-success/10' : 'border-border text-muted-foreground'}`}>
                    {m.status === 'active' ? <CheckCircle2 className="h-3 w-3 mr-1" /> : null}
                    {m.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recovery Progress + Progress Notes */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="shadow-card border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-primary" />
              Recovery Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Overall Progress</span>
                <span className="font-semibold text-foreground">{recoveryProgress}%</span>
              </div>
              <Progress value={recoveryProgress} className="h-3" />
            </div>
            {[
              { label: 'Physical Health', value: 80 },
              { label: 'Mental Wellbeing', value: 65 },
              { label: 'Social Reintegration', value: 50 },
              { label: 'Relapse Prevention', value: 72 },
            ].map(m => (
              <div key={m.label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-muted-foreground">{m.label}</span>
                  <span className="font-medium text-foreground">{m.value}%</span>
                </div>
                <Progress value={m.value} className="h-2" />
              </div>
            ))}
            <div className="rounded-lg bg-muted/50 p-3 mt-2">
              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-primary" />
                <span className="text-foreground font-medium">Estimated completion: ~{180 - stayDays} days remaining</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <ClipboardList className="h-4 w-4 text-primary" />
              Progress Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {progressNotes.map((n, i) => (
                <div key={i} className="relative pl-6 pb-4 last:pb-0 border-l-2 border-border last:border-transparent">
                  <div className="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-primary" />
                  <p className="text-xs text-muted-foreground">{new Date(n.date).toLocaleDateString()} • {n.addedBy}</p>
                  <p className="text-sm text-foreground mt-0.5">{n.note}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stay Info */}
      <Card className="shadow-card border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4 text-primary" />
            Admission & Stay Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <CalendarDays className="h-5 w-5 mx-auto text-info mb-1" />
              <p className="text-xs text-muted-foreground">Admission Date</p>
              <p className="text-sm font-semibold text-foreground">{new Date(patientProfile.admissionDate).toLocaleDateString()}</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <CalendarDays className="h-5 w-5 mx-auto text-success mb-1" />
              <p className="text-xs text-muted-foreground">Discharge Date</p>
              <p className="text-sm font-semibold text-foreground">{patientProfile.dischargeDate ? new Date(patientProfile.dischargeDate).toLocaleDateString() : 'Ongoing'}</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <Clock className="h-5 w-5 mx-auto text-warning mb-1" />
              <p className="text-xs text-muted-foreground">Total Stay</p>
              <p className="text-sm font-semibold text-foreground">{stayDays} days</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientDashboardPage;
