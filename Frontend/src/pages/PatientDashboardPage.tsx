import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import type { Patient, TreatmentPlan } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Pill, ClipboardList, CalendarDays, Clock, Activity, UserCog, Stethoscope,
  TrendingUp, CheckCircle2, Shield,
  ArrowRight,
} from 'lucide-react';

const daysSince = (dateStr: string) => {
  const diff = new Date().getTime() - new Date(dateStr).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

const PatientDashboardPage = () => {
  const { user } = useAuth();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [treatmentPlan, setTreatmentPlan] = useState<TreatmentPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMedicines, setShowMedicines] = useState(false);
  const [showTreatmentPlan, setShowTreatmentPlan] = useState(false);
  const [medicineDetails, setMedicineDetails] = useState<Record<string, any>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const myPatient = await api.getMyPatient();
        if (myPatient) {
          setPatient(myPatient);
          
          // Fetch medicine details for patient's medicines
          if (Array.isArray(myPatient.medicines) && myPatient.medicines.length > 0) {
            const medicinesToFetch = myPatient.medicines.filter((m: any) => typeof m === 'string');
            if (medicinesToFetch.length > 0) {
              const medicineMap: Record<string, any> = {};
              for (const medicineId of medicinesToFetch) {
                try {
                  const medicineDetail = await api.getMedicine(medicineId);
                  medicineMap[medicineId] = medicineDetail;
                } catch (err) {
                  console.error(`Failed to fetch medicine ${medicineId}:`, err);
                }
              }
              setMedicineDetails(medicineMap);
            }
          }
          
          // Treatment plan fetch karo agar hai
          if (myPatient.treatmentPlan && typeof myPatient.treatmentPlan === 'string') {
            try {
              const plan = await api.getTreatmentPlan(myPatient.treatmentPlan);
              setTreatmentPlan(plan);
            } catch {}
          } else if (myPatient.treatmentPlan) {
            setTreatmentPlan(myPatient.treatmentPlan as unknown as TreatmentPlan);
          }
        }
      } catch (err) {
        console.error('Failed to fetch patient data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading your dashboard...</div>;
  if (!patient) return <div className="flex items-center justify-center h-64 text-muted-foreground">Patient profile not found.</div>;

  const firstName = user?.name?.split(' ')[0] || 'Patient';
  const stayDays = daysSince(patient.admissionDate);
  const recoveryProgress = Math.min(Math.round((stayDays / 180) * 100), 95);
  const activeMedicines = Array.isArray((patient as any).medicines) ? (patient as any).medicines : [];

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl gradient-primary p-6 md:p-8 shadow-elevated">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,hsl(168_70%_45%/0.4),transparent_50%)]" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-primary-foreground/70 text-sm">Welcome back</p>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-primary-foreground">
              Hello, {firstName} 
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

      {/* Quick Stats - Info Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: CalendarDays, label: 'Admission', value: new Date(patient.admissionDate).toLocaleDateString(), color: 'text-info' },
          { icon: Activity, label: 'Status', value: patient.recoveryStatus.replace('-', ' '), color: 'text-warning' },
         { icon: Pill, label: 'Active Medicines', value: `${activeMedicines.length}`, color: 'text-success', onClick: () => setShowMedicines(true) },
          { icon: ClipboardList, label: 'Progress Notes', value: `${patient.progressNotes?.length || 0}`, color: 'text-primary' },
        ].map(s => (
          <Card
            key={s.label}
            role={s.onClick ? 'button' : undefined}
            tabIndex={s.onClick ? 0 : undefined}
            onClick={s.onClick}
            onKeyDown={(event) => {
              if (s.onClick && (event.key === 'Enter' || event.key === ' ')) {
                event.preventDefault();
                s.onClick();
              }
            }}
            className={`shadow-card border-border/50 ${s.onClick ? 'cursor-pointer transition hover:border-primary/50 hover:shadow-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary' : ''}`}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`rounded-lg bg-muted p-2.5 ${s.color}`}>
                <s.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-sm font-semibold text-foreground capitalize">{s.value}</p>
              </div>
              {s.onClick && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Treatment Plan & Recovery Progress */}
        <div className="lg:col-span-2 space-y-6">
          {/* Treatment Plan */}
          <Card
            role="button"
            tabIndex={0}
            onClick={() => setShowTreatmentPlan(true)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                setShowTreatmentPlan(true);
              }
            }}
            className="shadow-card border-border/50 cursor-pointer transition hover:border-primary/50 hover:shadow-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Stethoscope className="h-4 w-4 text-primary" />
                Treatment Plan
              </CardTitle>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 text-xs"
                onClick={(event) => {
                  event.stopPropagation();
                  setShowTreatmentPlan(true);
                }}
              >
                View details <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </CardHeader>
            <CardContent>
              {treatmentPlan ? (
                <>
                  <p className="text-sm text-foreground leading-relaxed mb-4">{treatmentPlan.notes || 'No notes available'}</p>
                  <div className="grid sm:grid-cols-2 gap-3 mb-4">
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground">Plan Type</p>
                      <p className="text-sm font-medium text-foreground flex items-center gap-1.5 mt-0.5">
                        <Stethoscope className="h-3.5 w-3.5 text-success" />{treatmentPlan.planType}
                      </p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground">Status</p>
                      <p className="text-sm font-medium text-foreground flex items-center gap-1.5 mt-0.5">
                        <UserCog className="h-3.5 w-3.5 text-info" />{treatmentPlan.status}
                      </p>
                    </div>
                  </div>
                  {treatmentPlan.progressReviews && treatmentPlan.progressReviews.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">Recent Updates</p>
                      <div className="space-y-2">
                        {treatmentPlan.progressReviews.slice(0, 3).map((u, i) => (
                          <div key={i} className="flex gap-3 text-sm">
                            <span className="text-xs text-muted-foreground whitespace-nowrap mt-0.5">{new Date(u.date).toLocaleDateString()}</span>
                            <p className="text-foreground">{u.notes}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No treatment plan assigned yet.</p>
              )}
            </CardContent>
          </Card>

          {/* Recovery Progress */}
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
                <div className="mt-3 text-xs text-muted-foreground">
                  ~{Math.max(180 - stayDays, 0)} days remaining
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progress Notes */}
          <Card className="shadow-card border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <ClipboardList className="h-4 w-4 text-primary" />
                Progress Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {patient.progressNotes && patient.progressNotes.length > 0 ? (
                <div className="space-y-4">
                  {patient.progressNotes.slice(0, 3).map((n, i) => (
                    <div key={i} className="relative pl-6 pb-4 last:pb-0">
                      <div className="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-primary" />
                      <p className="text-xs text-muted-foreground">{new Date(n.date).toLocaleDateString()} • {n.addedBy}</p>
                      <p className="text-sm text-foreground mt-0.5 line-clamp-2">{n.note}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No progress notes yet.</p>
              )}
            </CardContent>
          </Card>

          {/* My Medicines */}
          <Card className="shadow-card border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Pill className="h-4 w-4 text-primary" />
                My Medicines
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeMedicines.length > 0 ? (
                <div className="space-y-3">
                  {activeMedicines.map((m: any, i: number) => {
                    let medicineName = 'Medicine';
                    let medicineCategory = 'General';
                    let medicineUnit = 'unit';
                    
                    if (typeof m === 'string') {
                      // It's a medicine ID, get details from fetched data
                      const detail = medicineDetails[m];
                      if (detail) {
                        medicineName = detail.name || 'Medicine';
                        medicineCategory = detail.category || 'General';
                        medicineUnit = detail.unit || 'unit';
                      }
                    } else if (typeof m === 'object' && m.name) {
                      // It's already a full object
                      medicineName = m.name;
                      medicineCategory = m.category || 'General';
                      medicineUnit = m.unit || 'unit';
                    }
                    
                    return (
                      <div key={i} className="flex items-center justify-between rounded-lg border p-3 border-border bg-card">
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg p-2 bg-success/10 text-success">
                            <Pill className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{medicineName}</p>
                            <p className="text-xs text-muted-foreground">{medicineCategory} - {medicineUnit}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs border-success/30 text-success bg-success/10">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          active
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No medicines assigned yet.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Motivational Tip */}
        <div className="space-y-6">
          {/* Motivational Tip */}
          <Card className="shadow-card border-border/50 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Motivational tip</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border-l-4 border-primary bg-primary/5 p-4">
                <p className="text-sm text-foreground italic">
                  "Har din ek kadam aage hai — 52 din ka safar mushkil nahi tha, aage bhi nahi hoga."
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Admission & Stay Details Timeline */}
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
              <p className="text-sm font-semibold text-foreground">{new Date(patient.admissionDate).toLocaleDateString()}</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <CalendarDays className="h-5 w-5 mx-auto text-success mb-1" />
              <p className="text-xs text-muted-foreground">Discharge Date</p>
              <p className="text-sm font-semibold text-foreground">{patient.dischargeDate ? new Date(patient.dischargeDate).toLocaleDateString() : 'Ongoing'}</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <Clock className="h-5 w-5 mx-auto text-warning mb-1" />
              <p className="text-xs text-muted-foreground">Total Stay</p>
              <p className="text-sm font-semibold text-foreground">{stayDays} days</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showMedicines} onOpenChange={setShowMedicines}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5 text-primary" />
              Active Medicines
            </DialogTitle>
            <DialogDescription>Medicines currently assigned as part of your care plan.</DialogDescription>
          </DialogHeader>
          {activeMedicines.length > 0 ? (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {activeMedicines.map((medicine: any, index: number) => {
                let medicineName = 'Medicine';
                let medicineDesc = 'No description added.';
                let medicineCategory = 'General';
                let medicineStock = '-';
                let medicineUnit = '';
                let medicineExpiry = '-';
                
                if (typeof medicine === 'string') {
                  // It's a medicine ID, get details from fetched data
                  const detail = medicineDetails[medicine];
                  if (detail) {
                    medicineName = detail.name || 'Medicine';
                    medicineDesc = detail.description || 'No description added.';
                    medicineCategory = detail.category || 'General';
                    medicineStock = detail.stockQuantity ?? detail.inventory?.quantity ?? '-';
                    medicineUnit = detail.unit || detail.inventory?.unit || '';
                    medicineExpiry = detail.expiryDate ? new Date(detail.expiryDate).toLocaleDateString() : '-';
                  }
                } else if (typeof medicine === 'object' && medicine.name) {
                  // It's already a full object
                  medicineName = medicine.name;
                  medicineDesc = medicine.description || 'No description added.';
                  medicineCategory = medicine.category || 'General';
                  medicineStock = medicine.stockQuantity ?? medicine.inventory?.quantity ?? '-';
                  medicineUnit = medicine.unit || medicine.inventory?.unit || '';
                  medicineExpiry = medicine.expiryDate ? new Date(medicine.expiryDate).toLocaleDateString() : '-';
                }
                
                return (
                  <div key={medicine?._id || medicine?.id || index} className="rounded-lg border bg-card p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex items-start gap-3">
                        <div className="rounded-lg bg-success/10 p-2 text-success">
                          <Pill className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{medicineName}</p>
                          <p className="mt-1 text-sm text-muted-foreground">{medicineDesc}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="w-fit border-success/30 bg-success/10 text-success">active</Badge>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-md bg-muted/50 p-3">
                        <p className="text-xs text-muted-foreground">Category</p>
                        <p className="text-sm font-medium text-foreground">{medicineCategory}</p>
                      </div>
                      <div className="rounded-md bg-muted/50 p-3">
                        <p className="text-xs text-muted-foreground">Available Stock</p>
                        <p className="text-sm font-medium text-foreground">{medicineStock} {medicineUnit}</p>
                      </div>
                      <div className="rounded-md bg-muted/50 p-3">
                        <p className="text-xs text-muted-foreground">Expiry</p>
                        <p className="text-sm font-medium text-foreground">{medicineExpiry}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">No medicines assigned yet.</div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showTreatmentPlan} onOpenChange={setShowTreatmentPlan}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-primary" />
              Treatment Plan Details
            </DialogTitle>
            <DialogDescription>Your current treatment plan, goals, activities, medicines, and progress reviews.</DialogDescription>
          </DialogHeader>
          {treatmentPlan ? (
            <div className="space-y-5 max-h-[65vh] overflow-y-auto pr-1">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Plan Type</p>
                  <p className="text-sm font-semibold capitalize text-foreground">{treatmentPlan.planType}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className="text-sm font-semibold capitalize text-foreground">{treatmentPlan.status}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Start Date</p>
                  <p className="text-sm font-semibold text-foreground">{treatmentPlan.startDate ? new Date(treatmentPlan.startDate).toLocaleDateString() : '-'}</p>
                </div>
              </div>

              <div className="rounded-lg border bg-muted/20 p-3">
                <p className="text-xs text-muted-foreground">Plan History</p>
                <p className="text-sm font-semibold text-foreground">
                  Current version {treatmentPlan.version || 1} | {treatmentPlan.history?.length || 0} previous plan{(treatmentPlan.history?.length || 0) === 1 ? '' : 's'}
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-foreground">Notes</p>
                <p className="mt-1 rounded-lg bg-muted/40 p-3 text-sm text-muted-foreground">{treatmentPlan.notes || 'No notes available.'}</p>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div>
                  <p className="mb-2 text-sm font-semibold text-foreground">Goals</p>
                  {treatmentPlan.goals?.length ? (
                    <div className="space-y-2">
                      {treatmentPlan.goals.map((goal, index) => (
                        <div key={index} className="flex gap-2 rounded-lg border p-3 text-sm">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                          <span>{goal}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">No goals added.</p>
                  )}
                </div>

                <div>
                  <p className="mb-2 text-sm font-semibold text-foreground">Therapy</p>
                  {treatmentPlan.therapy?.length ? (
                    <div className="flex flex-wrap gap-2">
                      {treatmentPlan.therapy.map((therapy, index) => (
                        <Badge key={index} variant="outline" className="capitalize">{therapy}</Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">No therapy items added.</p>
                  )}
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold text-foreground">Activities</p>
                {treatmentPlan.activities?.length ? (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {treatmentPlan.activities.map((activity, index) => (
                      <div key={index} className="rounded-lg border p-3">
                        <p className="text-sm font-medium text-foreground">{activity.activity}</p>
                        <p className="text-xs text-muted-foreground">{activity.frequency}{activity.duration ? ` - ${activity.duration} min` : ''}</p>
                        {activity.notes && <p className="mt-1 text-xs text-muted-foreground">{activity.notes}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">No activities added.</p>
                )}
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold text-foreground">Plan Medicines</p>
                {treatmentPlan.medicines?.length ? (
                  <div className="space-y-2">
                    {treatmentPlan.medicines.map((medicine: any, index) => {
                      const medName = typeof medicine.medicineId === 'object' ? medicine.medicineId?.name : medicine.medicineId;
                      return (
                        <div key={index} className="rounded-lg border p-3">
                          <p className="text-sm font-medium text-foreground">{medName || 'Medicine'}</p>
                          <p className="text-xs text-muted-foreground">Dosage: {medicine.dosage || '-'} | Frequency: {medicine.frequency || '-'}</p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">No medicines added to treatment plan.</p>
                )}
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold text-foreground">Progress Reviews</p>
                {treatmentPlan.progressReviews?.length ? (
                  <div className="space-y-2">
                    {treatmentPlan.progressReviews.map((review, index) => (
                      <div key={index} className="rounded-lg border p-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-xs text-muted-foreground">{new Date(review.date).toLocaleDateString()}</p>
                          <Badge variant="outline" className="capitalize">{review.status}</Badge>
                        </div>
                        <p className="mt-1 text-sm text-foreground">{review.notes}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">No progress reviews yet.</p>
                )}
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold text-foreground">Previous Treatment Plans</p>
                {treatmentPlan.history?.length ? (
                  <div className="space-y-2">
                    {[...treatmentPlan.history].reverse().map((item) => (
                      <div key={`${item.version}-${item.archivedAt}`} className="rounded-lg border p-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-sm font-medium text-foreground">Version {item.version}</p>
                          {item.status && <Badge variant="outline" className="capitalize">{item.status}</Badge>}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Saved on {item.archivedAt ? new Date(item.archivedAt).toLocaleString() : '-'}
                        </p>
                        {item.changeNote && <p className="mt-2 text-sm text-foreground">{item.changeNote}</p>}
                        <div className="mt-2 grid gap-2 sm:grid-cols-2">
                          <div className="rounded-md bg-muted/40 p-2">
                            <p className="text-xs text-muted-foreground">Plan Type</p>
                            <p className="text-sm capitalize text-foreground">{item.planType || '-'}</p>
                          </div>
                          <div className="rounded-md bg-muted/40 p-2">
                            <p className="text-xs text-muted-foreground">Therapy</p>
                            <p className="text-sm text-foreground">{item.therapy?.join(', ') || '-'}</p>
                          </div>
                        </div>
                        {item.goals?.length ? (
                          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                            {item.goals.slice(0, 3).map((goal, index) => <li key={index}>{goal}</li>)}
                          </ul>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">No previous treatment plans yet.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">No treatment plan assigned yet.</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientDashboardPage;
