import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, History, Save, Stethoscope, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/services/api';
import type { Medicine, TreatmentPlan } from '@/types';

type PlanStatus = 'active' | 'completed' | 'paused' | 'discontinued';
type PlanType = 'detox' | 'rehabilitation' | 'counseling' | 'medication' | 'combined';
type Frequency = 'daily' | 'twice-daily' | 'thrice-daily' | 'weekly';

interface FormState {
  planType: PlanType;
  status: PlanStatus;
  startDate: string;
  endDate: string;
  goals: string;
  therapy: string;
  notes: string;
  activity: string;
  activityFrequency: Frequency;
  activityDuration: number;
  activityNotes: string;
  medicineId: string;
  dosage: string;
  medicineFrequency: string;
  medicineStartDate: string;
  medicineEndDate: string;
  changeNote: string;
}

const toDateInput = (value?: string) => value ? new Date(value).toISOString().slice(0, 10) : '';

const planTypeLabels: Record<PlanType, string> = {
  detox: 'Detoxification',
  rehabilitation: 'Rehabilitation',
  counseling: 'Counseling',
  medication: 'Medication',
  combined: 'Combined',
};

const statusColors: Record<PlanStatus, string> = {
  active: 'bg-blue-600 text-white',
  completed: 'bg-emerald-600 text-white',
  paused: 'bg-yellow-500 text-white',
  discontinued: 'bg-red-600 text-white',
};

const UpdateTreatmentPlanPage = () => {
  const navigate = useNavigate();
  const { planId } = useParams();
  const { toast } = useToast();
  const [plan, setPlan] = useState<TreatmentPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [form, setForm] = useState<FormState>({
    planType: 'combined',
    status: 'active',
    startDate: '',
    endDate: '',
    goals: '',
    therapy: '',
    notes: '',
    activity: '',
    activityFrequency: 'daily',
    activityDuration: 0,
    activityNotes: '',
    medicineId: '',
    dosage: '',
    medicineFrequency: '',
    medicineStartDate: '',
    medicineEndDate: '',
    changeNote: '',
  });

  useEffect(() => {
    const loadPlan = async () => {
      if (!planId) return;
      try {
        const [data, medicinesData] = await Promise.all([
          api.getTreatmentPlan(planId),
          api.getMedicines().catch(() => []),
        ]);
        setMedicines(medicinesData);
        setPlan(data);
        const firstActivity = data.activities?.[0];
        const firstMedicine = data.medicines?.[0];
        setForm({
          planType: data.planType,
          status: data.status,
          startDate: toDateInput(data.startDate),
          endDate: toDateInput(data.endDate),
          goals: data.goals?.join('\n') || '',
          therapy: data.therapy?.join('\n') || '',
          notes: data.notes || '',
          activity: firstActivity?.activity || '',
          activityFrequency: (firstActivity?.frequency as Frequency) || 'daily',
          activityDuration: firstActivity?.duration || 0,
          activityNotes: firstActivity?.notes || '',
          medicineId: String(firstMedicine?.medicineId || ''),
          dosage: firstMedicine?.dosage || '',
          medicineFrequency: firstMedicine?.frequency || '',
          medicineStartDate: toDateInput(firstMedicine?.startDate),
          medicineEndDate: toDateInput(firstMedicine?.endDate),
          changeNote: '',
        });
      } catch (error) {
        toast({ title: 'Error', description: 'Unable to load treatment plan', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };

    loadPlan();
  }, [planId, toast]);

  const updateField = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSave = async () => {
    if (!planId || !plan) return;

    setSaving(true);
    try {
      const payload = {
        planType: form.planType,
        status: form.status,
        startDate: form.startDate,
        endDate: form.endDate || undefined,
        goals: form.goals.split('\n').map((goal) => goal.trim()).filter(Boolean),
        activities: form.activity
          ? [{
              activity: form.activity,
              frequency: form.activityFrequency,
              duration: Number(form.activityDuration) || 0,
              notes: form.activityNotes,
            }]
          : [],
        medicines: form.medicineId
          ? [{
              medicineId: form.medicineId,
              dosage: form.dosage,
              frequency: form.medicineFrequency,
              startDate: form.medicineStartDate || form.startDate,
              endDate: form.medicineEndDate || undefined,
            }]
          : [],
        therapy: form.therapy.split('\n').map((item) => item.trim()).filter(Boolean),
        notes: form.notes,
        changeNote: form.changeNote || 'Treatment plan updated',
      };

      const updated = await api.updateTreatmentPlan(planId, payload);
      setPlan(updated);
      setForm((current) => ({ ...current, changeNote: '' }));
      toast({ title: 'Success', description: 'Treatment plan updated and previous version saved' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update treatment plan', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const clearMedicine = () => {
    setForm((current) => ({
      ...current,
      medicineId: '',
      dosage: '',
      medicineFrequency: '',
      medicineStartDate: '',
      medicineEndDate: '',
    }));
  };

  if (loading) {
    return <div className="p-8 text-muted-foreground">Loading treatment plan...</div>;
  }

  if (!plan) {
    return <div className="p-8 text-muted-foreground">Treatment plan not found.</div>;
  }

  const patientName = plan.patientName || (typeof plan.patient === 'string' ? plan.patient : (plan.patient as any)?.fullName || 'Unknown patient');
  const history = plan.history || [];

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Update Treatment Plan</h1>
            <p className="text-sm text-muted-foreground">
              {patientName} | Treating: {plan.therapistName || 'Not assigned'} | Current version {plan.version || 1}
            </p>
          </div>
        </div>
        <Badge className={statusColors[plan.status]}>{plan.status}</Badge>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-primary" />
                Current Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Plan Type</Label>
                  <Select value={form.planType} onValueChange={(value) => updateField('planType', value as PlanType)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(planTypeLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(value) => updateField('status', value as PlanStatus)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="discontinued">Discontinued</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input type="date" value={form.startDate} onChange={(event) => updateField('startDate', event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input type="date" value={form.endDate} onChange={(event) => updateField('endDate', event.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Goals</Label>
                <Textarea rows={5} value={form.goals} onChange={(event) => updateField('goals', event.target.value)} placeholder="Enter each goal on a new line" />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Primary Activity</Label>
                  <Input value={form.activity} onChange={(event) => updateField('activity', event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Activity Frequency</Label>
                  <Select value={form.activityFrequency} onValueChange={(value) => updateField('activityFrequency', value as Frequency)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="twice-daily">Twice daily</SelectItem>
                      <SelectItem value="thrice-daily">Thrice daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Activity Duration</Label>
                  <Input type="number" value={form.activityDuration} onChange={(event) => updateField('activityDuration', Number(event.target.value))} />
                </div>
              </div>

              <div className="rounded-xl border p-4">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Medicine</h3>
                    <p className="text-xs text-muted-foreground">Update, add, or remove medicine from this treatment plan.</p>
                  </div>
                  {form.medicineId && (
                    <Button type="button" variant="outline" size="sm" onClick={clearMedicine}>
                      <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                      Remove
                    </Button>
                  )}
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Medicine Name</Label>
                    <Select value={form.medicineId || 'none'} onValueChange={(value) => updateField('medicineId', value === 'none' ? '' : value)}>
                      <SelectTrigger><SelectValue placeholder="Select medicine" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No medicine</SelectItem>
                        {medicines.map((medicine) => (
                          <SelectItem key={medicine.id} value={medicine.id}>
                            {medicine.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Dosage</Label>
                    <Input value={form.dosage} onChange={(event) => updateField('dosage', event.target.value)} placeholder="E.g. 10mg" />
                  </div>
                  <div className="space-y-2">
                    <Label>Medicine Frequency</Label>
                    <Input value={form.medicineFrequency} onChange={(event) => updateField('medicineFrequency', event.target.value)} placeholder="E.g. daily" />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Medicine Start</Label>
                      <Input type="date" value={form.medicineStartDate} onChange={(event) => updateField('medicineStartDate', event.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Medicine End</Label>
                      <Input type="date" value={form.medicineEndDate} onChange={(event) => updateField('medicineEndDate', event.target.value)} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Activity Notes</Label>
                  <Textarea rows={3} value={form.activityNotes} onChange={(event) => updateField('activityNotes', event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Therapy</Label>
                  <Textarea rows={3} value={form.therapy} onChange={(event) => updateField('therapy', event.target.value)} placeholder="Enter each therapy on a new line" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Plan Notes</Label>
                <Textarea rows={4} value={form.notes} onChange={(event) => updateField('notes', event.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Update Note</Label>
                <Textarea rows={3} value={form.changeNote} onChange={(event) => updateField('changeNote', event.target.value)} placeholder="Why is this plan being updated?" />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => navigate('/treatment-plans')}>Cancel</Button>
                <Button onClick={handleSave} disabled={saving}>
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? 'Saving...' : 'Save Update'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              Previous Plans
            </CardTitle>
          </CardHeader>
          <CardContent>
            {history.length > 0 ? (
              <div className="space-y-3">
                {[...history].reverse().map((item) => (
                  <div key={`${item.version}-${item.archivedAt}`} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold">Version {item.version}</p>
                      {item.status && <Badge variant="outline">{item.status}</Badge>}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Saved on {item.archivedAt ? new Date(item.archivedAt).toLocaleString() : '-'}
                    </p>
                    {item.changeNote && <p className="mt-2 text-sm text-foreground">{item.changeNote}</p>}
                    <div className="mt-3 rounded-md bg-muted/40 p-2 text-xs text-muted-foreground">
                      <p>Type: {item.planType || '-'}</p>
                      <p>Goals: {item.goals?.length || 0}</p>
                      <p>Therapy: {item.therapy?.join(', ') || '-'}</p>
                      {item.notes && <p className="mt-1 line-clamp-3">Notes: {item.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No previous versions yet. The first update will save the current plan here.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UpdateTreatmentPlanPage;
