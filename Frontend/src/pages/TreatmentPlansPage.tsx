import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, CheckCircle, Download, MessageSquare, Pencil, History, Eye, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { api } from '@/services/api';
import type { TreatmentPlan, Patient, StaffMember, Medicine } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { generateTreatmentPlan } from '@/utils/pdfExport';
import { useAuth } from '@/contexts/AuthContext';

interface CreatePlanFormValues {
  patient: string;
  therapist: string;
  planType: 'detox' | 'rehabilitation' | 'counseling' | 'medication' | 'combined';
  startDate: string;
  endDate: string;
  goals: string;
  activity: string;
  activityFrequency: 'daily' | 'twice-daily' | 'thrice-daily' | 'weekly';
  activityDuration: number;
  activityNotes: string;
  medicine: string;
  dosage: string;
  medicineFrequency: 'daily' | 'twice-daily' | 'thrice-daily' | 'weekly';
  medicineStartDate: string;
  medicineEndDate: string;
  therapy: string;
  notes: string;
}

type PlanFilter = 'all' | 'running' | 'completed';

const treatmentFilters: Array<{ label: string; value: PlanFilter }> = [
  { label: 'All', value: 'all' },
  { label: 'Running', value: 'running' },
  { label: 'Completed', value: 'completed' },
];

const getTodayInputDate = () => {
  const today = new Date();
  const timezoneOffset = today.getTimezoneOffset() * 60000;
  return new Date(today.getTime() - timezoneOffset).toISOString().split('T')[0];
};

export default function TreatmentPlansPage() {
  const [plans, setPlans] = useState<TreatmentPlan[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [medicineQuery, setMedicineQuery] = useState('');
  const [showMedicineSuggestions, setShowMedicineSuggestions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<TreatmentPlan | null>(null);
  const [viewPlan, setViewPlan] = useState<TreatmentPlan | null>(null);
  const [planFilter, setPlanFilter] = useState<PlanFilter>('running');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isCreatePage = location.pathname.endsWith('/new');
  const { toast } = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const currentRole = user?.staffRole || user?.role;
  const canDeletePlans = ['admin', 'doctor', 'therapist'].includes(currentRole || '');
  const shouldShowAssignedOnly = !isAdmin && ['doctor', 'therapist'].includes(currentRole || '');
  const treatmentStaff = staff.filter((member) => ['doctor', 'therapist'].includes(member.staffRole));
  const todayDate = getTodayInputDate();

  const currentStaff = staff.find((member) => {
    const staffUser = member.user as any;
    return (
      staffUser?._id === user?._id ||
      staffUser?.id === user?.id ||
      staffUser?.email === user?.email ||
      member._id === user?._id ||
      member.id === user?.id
    );
  });

  const getStaffNameById = (staffId?: string) => {
    if (!staffId) return '';
    const member = staff.find((item) => (item._id ?? item.id) === staffId);
    return member?.user?.name || '';
  };

  const getTreatingStaffName = (plan: TreatmentPlan) => {
    if (plan.therapistName) return plan.therapistName;

    const therapistId = typeof plan.therapist === 'string' ? plan.therapist : (plan.therapist as any)?._id || (plan.therapist as any)?.id;
    const therapistName = getStaffNameById(therapistId);
    if (therapistName) return therapistName;

    const patientId = typeof plan.patient === 'string' ? plan.patient : (plan.patient as any)?._id || (plan.patient as any)?.id;
    const patient = patients.find((item) => (item as any)._id === patientId || item.id === patientId || item.fullName === plan.patientName);
    const assignedStaff = patient?.assignedStaff as any;
    if (!assignedStaff) return 'Not assigned';

    if (typeof assignedStaff === 'string') {
      return getStaffNameById(assignedStaff) || 'Assigned staff';
    }

    return assignedStaff.user?.name || assignedStaff.name || 'Assigned staff';
  };

  const getPlanPatient = (plan: TreatmentPlan) => {
    const patientId = typeof plan.patient === 'string' ? plan.patient : (plan.patient as any)?._id || (plan.patient as any)?.id;
    return patients.find((item) => (item as any)._id === patientId || item.id === patientId || item.fullName === plan.patientName);
  };

  const isPlanAssignedToCurrentStaff = (plan: TreatmentPlan) => {
    if (!shouldShowAssignedOnly) return true;
    if (!currentStaff) return false;

    const currentStaffId = currentStaff._id ?? currentStaff.id;
    const therapistId = typeof plan.therapist === 'string' ? plan.therapist : (plan.therapist as any)?._id || (plan.therapist as any)?.id;
    if (therapistId && therapistId === currentStaffId) return true;

    const assignedStaff = getPlanPatient(plan)?.assignedStaff as any;
    const assignedStaffId = typeof assignedStaff === 'string' ? assignedStaff : assignedStaff?._id || assignedStaff?.id;
    return assignedStaffId === currentStaffId;
  };

  const reviewForm = useForm({
    defaultValues: {
      notes: '',
      status: 'improving',
      rating: 5,
    },
  });

  const createForm = useForm<CreatePlanFormValues>({
    defaultValues: {
      patient: '',
      therapist: '',
      planType: 'combined',
      startDate: getTodayInputDate(),
      endDate: '',
      goals: '',
      activity: '',
      activityFrequency: 'daily',
      activityDuration: 7,
      activityNotes: '',
      medicine: '',
      dosage: '',
      medicineFrequency: 'daily',
      medicineStartDate: getTodayInputDate(),
      medicineEndDate: '',
      therapy: '',
      notes: '',
    },
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [plansData, patientsData, staffData, medicinesData] = await Promise.all([
        api.getTreatmentPlans?.() || Promise.resolve([]),
        api.getPatients(),
        api.getStaff(),
        api.getMedicines(),
      ]);
      setPlans(plansData || []);
      setPatients(patientsData);
      setStaff(staffData);
      setMedicines(medicinesData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({ title: 'Error', description: 'Failed to load data', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const filteredMedicineSuggestions = medicines.filter((medicine) =>
    medicine.name.toLowerCase().includes(medicineQuery.toLowerCase()),
  );

  const handleMedicineInputChange = (value: string) => {
    setMedicineQuery(value);
    createForm.setValue('medicine', '');
    setShowMedicineSuggestions(true);
  };

  const handleSelectMedicine = (medicine: Medicine) => {
    createForm.setValue('medicine', medicine.id);
    setMedicineQuery(medicine.name);
    setShowMedicineSuggestions(false);
  };

  const handleCreatePlan = async (data: CreatePlanFormValues) => {
    if (!data.patient) {
      toast({ title: 'Validation Error', description: 'Please select a patient', variant: 'destructive' });
      return;
    }
    if (data.endDate && data.endDate < data.startDate) {
      createForm.setError('endDate', { type: 'validate', message: 'End date cannot be before start date' });
      toast({ title: 'Validation Error', description: 'End date cannot be before start date', variant: 'destructive' });
      return;
    }
    if (data.medicineEndDate && data.medicineEndDate < data.medicineStartDate) {
      createForm.setError('medicineEndDate', { type: 'validate', message: 'End date cannot be before start date' });
      toast({ title: 'Validation Error', description: 'End date cannot be before start date', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedMedicineId = data.medicine === 'none' ? undefined : data.medicine;
      const medicinesPayload = selectedMedicineId
        ? [
            {
              medicineId: selectedMedicineId,
              dosage: data.dosage,
              frequency: data.medicineFrequency,
              startDate: data.medicineStartDate,
              endDate: data.medicineEndDate || undefined,
            },
          ]
        : [];

      const payload = {
        patient: data.patient,
        therapist: isAdmin && data.therapist !== 'none' ? data.therapist || undefined : undefined,
        planType: data.planType,
        startDate: data.startDate,
        endDate: data.endDate || undefined,
        goals: data.goals.split('\n').map((goal) => goal.trim()).filter(Boolean),
        activities: [
          {
            activity: data.activity,
            frequency: data.activityFrequency,
            duration: Number(data.activityDuration) || 0,
            notes: data.activityNotes,
          },
        ],
        medicines: medicinesPayload,
        therapy: data.therapy.split('\n').map((item) => item.trim()).filter(Boolean),
        notes: data.notes,
      };

      const newPlan = await api.createTreatmentPlan(payload);
      if (newPlan) {
        setPlans((prev) => [newPlan, ...prev]);
        toast({ title: 'Success', description: 'Treatment plan created' });
        navigate('/treatment-plans');
      }
    } catch (error) {
      console.error('Failed to create treatment plan:', error);
      toast({ title: 'Error', description: 'Unable to create treatment plan', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComplete = async (id: string) => {
    if (!id) {
      toast({ title: 'Error', description: 'Unable to complete plan', variant: 'destructive' });
      return;
    }
    try {
      const updated = await api.completeTreatmentPlan?.(id);
      if (updated) {
        setPlans((prev) => prev.map((p) => {
          const planId = p.id ?? (p as any)._id;
          return planId === id ? updated : p;
        }));
        toast({ title: 'Success', description: 'Treatment plan marked as complete' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update plan', variant: 'destructive' });
    }
  };

  const handleDeletePlan = async (plan: TreatmentPlan) => {
    const planId = String(plan.id ?? (plan as any)._id ?? '');
    if (!planId) {
      toast({ title: 'Error', description: 'Unable to delete plan', variant: 'destructive' });
      return;
    }
    if (!window.confirm('Delete this treatment plan?')) return;

    try {
      await api.deleteTreatmentPlan(planId);
      setPlans((prev) => prev.filter((item) => String(item.id ?? (item as any)._id ?? '') !== planId));
      toast({ title: 'Deleted', description: 'Treatment plan deleted successfully' });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete plan',
        variant: 'destructive',
      });
    }
  };

  const handleAddReview = async (data: any) => {
    if (!selectedPlan) {
      toast({ title: 'Error', description: 'Unable to add review', variant: 'destructive' });
      return;
    }
    const selectedPlanId = selectedPlan.id ?? (selectedPlan as any)._id;
    if (!selectedPlanId) {
      toast({ title: 'Error', description: 'Unable to determine plan ID', variant: 'destructive' });
      return;
    }
    try {
      const updated = await api.addProgressReview?.(selectedPlanId, {
        ...data,
        reviewer: 'Current User', // Should come from auth
        reviewDate: new Date().toISOString(),
      });
      if (updated) {
        setPlans((prev) => prev.map((p) => {
          const planId = p.id ?? (p as any)._id;
          return planId === selectedPlanId ? updated : p;
        }));
        setReviewOpen(false);
        reviewForm.reset();
        toast({ title: 'Success', description: 'Progress review added' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to add review', variant: 'destructive' });
    }
  };

  const handleExportPDF = async (plan: TreatmentPlan) => {
    try {
      const planForPdf = {
        ...plan,
        medicines: (plan.medicines || []).map((medicine) => ({
          ...medicine,
          medicineName: getMedicineName(String(medicine.medicineId || '')),
        })),
      };
      await generateTreatmentPlan(planForPdf);
      toast({ title: 'Success', description: 'Treatment plan PDF generated' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to generate PDF', variant: 'destructive' });
    }
  };

  const getMedicineName = (medicineId: string) => {
    return medicines.find((medicine) => medicine.id === medicineId || (medicine as any)._id === medicineId)?.name || medicineId || 'Medicine';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-medical-blue text-white',
      completed: 'bg-health-green text-white',
      paused: 'bg-yellow-500 text-white',
      discontinued: 'bg-red-500 text-white',
    };
    return colors[status] || 'bg-gray-500 text-white';
  };

  const visiblePlans = plans || [];
  const filteredPlans = visiblePlans.filter((plan) => {
    if (planFilter === 'all') return true;
    if (planFilter === 'running') return plan.status === 'active';
    return plan.status === 'completed';
  });
  const startDateValue = createForm.watch('startDate') || todayDate;
  const medicineStartDateValue = createForm.watch('medicineStartDate') || todayDate;
  const dateErrors = createForm.formState.errors;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Treatment Plans</h1>
          <p className="text-slate-600 mt-2">Create and manage patient treatment plans</p>
        </div>
        <Button onClick={() => navigate('/treatment-plans/new')} className="bg-medical-teal hover:bg-medical-teal/90 text-white">
          <Plus className="w-4 h-4 mr-2" /> New Plan
        </Button>
      </div>

      <div className="mb-6 flex flex-col gap-3 rounded-xl border bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">Filter treatment plans</p>
          <p className="text-xs text-slate-500">Showing {filteredPlans.length} of {visiblePlans.length} plan{visiblePlans.length === 1 ? '' : 's'}</p>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:flex sm:w-auto">
          {treatmentFilters.map((filter) => {
            const isActive = planFilter === filter.value;
            return (
              <Button
                key={filter.value}
                type="button"
                variant={isActive ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPlanFilter(filter.value)}
                className={isActive ? 'bg-medical-teal text-white hover:bg-medical-teal/90' : 'bg-white'}
              >
                {filter.label}
              </Button>
            );
          })}
        </div>
      </div>

      {isCreatePage && (
        <Card className="mb-8 max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Create New Treatment Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit(handleCreatePlan)} className="space-y-6" noValidate>
              <div className="grid gap-4 lg:grid-cols-2">
                <div>
                  <FormLabel>Patient *</FormLabel>
                  <Select value={createForm.watch('patient') ?? ''} onValueChange={(value) => createForm.setValue('patient', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder={loading ? 'Loading patients...' : 'Select patient'} />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((patient) => {
                        const patientId = (patient as any)._id ?? patient.id;
                        return (
                          <SelectItem key={patientId} value={patientId}>{patient.fullName}</SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                {isAdmin && (
                  <div>
                    <FormLabel>Treating Doctor / Therapist</FormLabel>
                    <Select value={createForm.watch('therapist') ?? ''} onValueChange={(value) => createForm.setValue('therapist', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder={loading ? 'Loading staff...' : 'Select doctor or therapist'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Use patient assignment</SelectItem>
                        {treatmentStaff.map((member) => (
                          <SelectItem key={member._id ?? member.id} value={member._id ?? member.id}>
                            {member.user?.name || member.staffRole || 'Staff member'} ({member.staffRole})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div>
                  <FormLabel>Plan Type</FormLabel>
                  <Select value={createForm.watch('planType') ?? ''} onValueChange={(value) => createForm.setValue('planType', value as CreatePlanFormValues['planType'])}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="detox">Detoxification</SelectItem>
                      <SelectItem value="rehabilitation">Rehabilitation</SelectItem>
                      <SelectItem value="counseling">Counseling</SelectItem>
                      <SelectItem value="medication">Medication</SelectItem>
                      <SelectItem value="combined">Combined</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <FormLabel>Start Date</FormLabel>
                    <Input
                      type="date"
                      min={todayDate}
                      {...createForm.register('startDate', {
                        validate: (value) => !value || value >= todayDate || 'Date cannot be before today',
                        onChange: () => void createForm.trigger('endDate'),
                      })}
                    />
                    {dateErrors.startDate?.message && <p className="mt-1 text-xs text-destructive">{dateErrors.startDate.message}</p>}
                  </div>
                  <div>
                    <FormLabel>End Date</FormLabel>
                    <Input
                      type="date"
                      min={startDateValue}
                      {...createForm.register('endDate', {
                        validate: (value) => !value || value >= startDateValue || 'End date cannot be before start date',
                      })}
                    />
                    {dateErrors.endDate?.message && <p className="mt-1 text-xs text-destructive">{dateErrors.endDate.message}</p>}
                  </div>
                </div>
              </div>

              <div>
                <FormLabel>Goals</FormLabel>
                <Textarea {...createForm.register('goals')} placeholder="Enter each goal on a new line" rows={4} />
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div>
                  <FormLabel>Primary Activity</FormLabel>
                  <Input {...createForm.register('activity')} placeholder="E.g. daily counseling session" />
                </div>
                <div>
                  <FormLabel>Frequency</FormLabel>
                  <Select value={createForm.watch('activityFrequency') ?? ''} onValueChange={(value) => createForm.setValue('activityFrequency', value as CreatePlanFormValues['activityFrequency'])}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="twice-daily">Twice daily</SelectItem>
                      <SelectItem value="thrice-daily">Thrice daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                <div>
                  <FormLabel>Duration (days)</FormLabel>
                  <Input type="number" {...createForm.register('activityDuration', { valueAsNumber: true })} min={0} />
                </div>
                <div className="lg:col-span-2">
                  <FormLabel>Activity Notes</FormLabel>
                  <Textarea {...createForm.register('activityNotes')} rows={3} />
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="relative">
                  <FormLabel>Medicine / Supplement</FormLabel>
                  <Input
                    value={medicineQuery}
                    onChange={(event) => handleMedicineInputChange(event.target.value)}
                    onFocus={() => setShowMedicineSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowMedicineSuggestions(false), 100)}
                    placeholder={loading ? 'Loading medicines...' : 'Type medicine name'}
                  />
                  {showMedicineSuggestions && medicineQuery.trim().length > 0 && (
                    <div className="absolute z-10 mt-1 max-h-52 w-full overflow-y-auto rounded-md border bg-background shadow-lg">
                      {filteredMedicineSuggestions.length > 0 ? (
                        filteredMedicineSuggestions.map((medicine) => (
                          <button
                            key={medicine.id}
                            type="button"
                            onMouseDown={(event) => {
                              event.preventDefault();
                              handleSelectMedicine(medicine);
                            }}
                            className="block w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                          >
                            {medicine.name}
                          </button>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-sm text-muted-foreground">No matching medicine found</div>
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <FormLabel>Dosage</FormLabel>
                  <Input {...createForm.register('dosage')} placeholder="E.g. 10mg" />
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                <div>
                  <FormLabel>Medicine Frequency</FormLabel>
                  <Select value={createForm.watch('medicineFrequency') ?? ''} onValueChange={(value) => createForm.setValue('medicineFrequency', value as CreatePlanFormValues['medicineFrequency'])}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="twice-daily">Twice daily</SelectItem>
                      <SelectItem value="thrice-daily">Thrice daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <FormLabel>Medicine Start</FormLabel>
                  <Input
                    type="date"
                    min={todayDate}
                    {...createForm.register('medicineStartDate', {
                      validate: (value) => !value || value >= todayDate || 'Date cannot be before today',
                      onChange: () => void createForm.trigger('medicineEndDate'),
                    })}
                  />
                  {dateErrors.medicineStartDate?.message && <p className="mt-1 text-xs text-destructive">{dateErrors.medicineStartDate.message}</p>}
                </div>
                <div>
                  <FormLabel>Medicine End</FormLabel>
                  <Input
                    type="date"
                    min={medicineStartDateValue}
                    {...createForm.register('medicineEndDate', {
                      validate: (value) => !value || value >= medicineStartDateValue || 'End date cannot be before start date',
                    })}
                  />
                  {dateErrors.medicineEndDate?.message && <p className="mt-1 text-xs text-destructive">{dateErrors.medicineEndDate.message}</p>}
                </div>
              </div>

              <div>
                <FormLabel>Therapy Modalities</FormLabel>
                <Textarea {...createForm.register('therapy')} placeholder="Enter each therapy on a new line" rows={4} />
              </div>

              <div>
                <FormLabel>Notes</FormLabel>
                <Textarea {...createForm.register('notes')} rows={4} />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => navigate('/treatment-plans')}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-medical-teal hover:bg-medical-teal/90 text-white" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Create Plan'}
                </Button>
              </div>
            </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Progress Review Dialog */}
      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Progress Review</DialogTitle>
          </DialogHeader>
          <Form {...reviewForm}>
            <form onSubmit={reviewForm.handleSubmit(handleAddReview)} className="space-y-4">
            <FormField
              control={reviewForm.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Progress Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value ?? ''}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="improving">Improving</SelectItem>
                      <SelectItem value="stable">Stable</SelectItem>
                      <SelectItem value="declining">Declining</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={reviewForm.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rating (1-10)</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" max="10" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={reviewForm.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Review Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Detailed progress review..." {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full bg-medical-teal hover:bg-medical-teal/90 text-white">
              Add Review
            </Button>
          </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewPlan} onOpenChange={() => setViewPlan(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Treatment Plan Details</DialogTitle>
          </DialogHeader>
          {viewPlan && (
            <div className="space-y-5 text-sm">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-slate-500">Patient</p>
                  <p className="font-semibold">{viewPlan.patientName || 'Unknown Patient'}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-slate-500">Plan Type</p>
                  <p className="font-semibold capitalize">{viewPlan.planType}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-slate-500">Status</p>
                  <Badge className={getStatusColor(viewPlan.status)}>{viewPlan.status}</Badge>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-slate-500">Treating Staff</p>
                  <p className="font-semibold">{getTreatingStaffName(viewPlan)}</p>
                </div>
              </div>

              <div>
                <p className="mb-2 font-semibold">Goals</p>
                <div className="space-y-2">
                  {(viewPlan.goals || []).length ? viewPlan.goals.map((goal, index) => (
                    <div key={index} className="rounded-lg border p-3">{goal}</div>
                  )) : <p className="text-slate-500">No goals added.</p>}
                </div>
              </div>

              <div>
                <p className="mb-2 font-semibold">Medicines</p>
                <div className="space-y-2">
                  {(viewPlan.medicines || []).length ? viewPlan.medicines.map((medicine, index) => (
                    <div key={index} className="rounded-lg border p-3">
                      <p className="font-medium">{getMedicineName(String(medicine.medicineId || ''))}</p>
                      <p className="text-slate-600">
                        Dosage: {medicine.dosage || '-'} | Frequency: {medicine.frequency || '-'}
                      </p>
                      <p className="text-slate-500">
                        {medicine.startDate ? new Date(medicine.startDate).toLocaleDateString() : '-'}
                        {medicine.endDate ? ` to ${new Date(medicine.endDate).toLocaleDateString()}` : ''}
                      </p>
                    </div>
                  )) : <p className="text-slate-500">No medicine added.</p>}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="mb-2 font-semibold">Activities</p>
                  <div className="space-y-2">
                    {(viewPlan.activities || []).length ? viewPlan.activities.map((activity, index) => (
                      <div key={index} className="rounded-lg border p-3">
                        <p className="font-medium">{activity.activity}</p>
                        <p className="text-slate-600">{activity.frequency} | {activity.duration || 0} days</p>
                        {activity.notes && <p className="text-slate-500">{activity.notes}</p>}
                      </div>
                    )) : <p className="text-slate-500">No activities added.</p>}
                  </div>
                </div>
                <div>
                  <p className="mb-2 font-semibold">Therapy</p>
                  <div className="flex flex-wrap gap-2">
                    {(viewPlan.therapy || []).length ? viewPlan.therapy.map((therapy, index) => (
                      <Badge key={index} variant="outline">{therapy}</Badge>
                    )) : <p className="text-slate-500">No therapy added.</p>}
                  </div>
                </div>
              </div>

              <div>
                <p className="mb-2 font-semibold">Notes</p>
                <p className="whitespace-pre-wrap rounded-lg bg-slate-50 p-3">{viewPlan.notes || 'No notes available.'}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Total Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{visiblePlans.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-medical-blue">
              {visiblePlans.filter((p) => p.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-health-green">
              {visiblePlans.filter((p) => p.status === 'completed').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Most Common</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {(visiblePlans && visiblePlans.length > 0)
                ? visiblePlans.reduce((acc: Record<string, number>, p) => {
                    acc[p.planType] = (acc[p.planType] || 0) + 1;
                    return acc;
                  }, {})[Object.keys(visiblePlans.reduce((acc: Record<string, number>, p) => {
                    acc[p.planType] = (acc[p.planType] || 0) + 1;
                    return acc;
                  }, {}))[0]] || '-'
                : '-'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Treatment Plans Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredPlans.map((plan) => {
          const planId = plan.id ?? (plan as any)._id;
          return (
            <Card key={planId} className="shadow-lg">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle>{plan.patientName || (typeof plan.patient === 'string' ? plan.patient : (plan.patient as any)?.fullName || (plan.patient as any)?.name) || 'Unknown Patient'}</CardTitle>
                    <CardDescription>
                      {plan.planType} | Treating: {getTreatingStaffName(plan)}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(plan.status)}>{plan.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-2">Goals</p>
                  <ul className="space-y-1">
                    {(plan.goals || []).slice(0, 3).map((goal, idx) => (
                      <li key={idx} className="text-xs text-slate-600">
                        • {goal}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-700 mb-2">Therapy Types</p>
                  <div className="flex flex-wrap gap-2">
                    {(plan.therapy || []).slice(0, 2).map((t, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-600">Start Date</p>
                    <p className="font-medium">{new Date(plan.startDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Progress Reviews</p>
                    <p className="font-medium">{plan.progressReviews?.length || 0}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                  <span className="flex items-center gap-2 text-slate-600">
                    <History className="h-4 w-4" />
                    Plan version
                  </span>
                  <span className="font-medium text-slate-900">
                    v{plan.version || 1} | {plan.history?.length || 0} previous
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-start gap-2 pt-4">
                  <Button size="sm" variant="outline" className="min-w-[108px] justify-center" onClick={() => setViewPlan(plan)}>
                    <Eye className="w-3 h-3 mr-1" /> View
                  </Button>
                  <Button size="sm" variant="outline" className="min-w-[108px] justify-center" onClick={() => { setSelectedPlan(plan); setReviewOpen(true); }}>
                    <MessageSquare className="w-3 h-3 mr-1" /> Review
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="min-w-[98px] justify-center border-medical-teal text-medical-teal hover:bg-medical-teal/10"
                    onClick={() => navigate(`/treatment-plans/${planId}/update`)}
                  >
                    <Pencil className="w-3 h-3 mr-1" /> Edit
                  </Button>
                  <Button size="sm" variant="outline" className="w-12 px-0" onClick={() => handleExportPDF(plan)}>
                    <Download className="w-3 h-3 mr-1" />
                  </Button>
                  {canDeletePlans && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="min-w-[108px] justify-center border-destructive/30 text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeletePlan(plan)}
                    >
                      <Trash2 className="w-3 h-3 mr-1" /> Delete
                    </Button>
                  )}
                  {plan.status === 'active' && (
                    <Button size="sm" className="min-w-[132px] justify-center bg-health-green hover:bg-health-green/90 text-white"
                      onClick={() => handleComplete(planId)}>
                      <CheckCircle className="w-3 h-3 mr-1" /> Complete
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredPlans.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-slate-500 mb-4">
              {visiblePlans.length === 0
                ? 'No treatment plans yet. Create one to get started.'
                : `No ${planFilter === 'running' ? 'running' : planFilter} treatment plans found.`}
            </p>
            {visiblePlans.length === 0 && (
              <Button onClick={() => navigate('/treatment-plans/new')} className="bg-medical-teal hover:bg-medical-teal/90 text-white">
                <Plus className="w-4 h-4 mr-2" /> Create First Plan
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
