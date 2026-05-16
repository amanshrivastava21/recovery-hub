import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, FileText, Pencil, Save, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/services/api';
import type { Patient, TreatmentPlan } from '@/types';

type SessionType = 'Counseling' | 'Therapy' | 'Medication';
type PatientCondition = 'Stable' | 'Improving' | 'Critical';

interface ProgressNoteRecord {
  id: string;
  patientId: string;
  patientName?: string;
  treatmentId?: string;
  date: string;
  notes: string;
  sessionType: SessionType;
  condition: PatientCondition;
  nextAction?: string;
}

interface ProgressNoteForm {
  patientId: string;
  treatmentId: string;
  date: string;
  notes: string;
  sessionType: SessionType;
  condition: PatientCondition;
  nextAction: string;
}

const STORAGE_KEY = 'rcms_progress_notes';
const NO_TREATMENT_PLAN = 'none';

const getTodayInputDate = () => {
  const today = new Date();
  const timezoneOffset = today.getTimezoneOffset() * 60000;
  return new Date(today.getTime() - timezoneOffset).toISOString().split('T')[0];
};

const createEmptyForm = (): ProgressNoteForm => ({
  patientId: '',
  treatmentId: '',
  date: getTodayInputDate(),
  notes: '',
  sessionType: 'Counseling',
  condition: 'Stable',
  nextAction: '',
});

const readStoredNotes = (): ProgressNoteRecord[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const getPatientId = (patient: Patient) => String((patient as any)._id ?? patient.id ?? '');

const getTreatmentPlanId = (plan: TreatmentPlan) => String((plan as any)._id ?? plan.id ?? '');

const getPlanPatientId = (plan: TreatmentPlan) => {
  const patient = plan.patient as any;
  return String(typeof patient === 'string' ? patient : patient?._id ?? patient?.id ?? '');
};

const isLikelyTechnicalId = (value?: string) => {
  if (!value) return false;
  const trimmed = value.trim();
  return /^[a-f0-9]{24}$/i.test(trimmed) || trimmed.startsWith('runtime_') || trimmed.startsWith('demo_');
};

const isUsablePatientName = (name: string | undefined, patientId: string) => {
  if (!name) return false;
  const trimmed = name.trim();
  return trimmed.length > 0 && trimmed !== patientId && !isLikelyTechnicalId(trimmed);
};

const getConditionClassName = (condition: PatientCondition) => {
  const classes: Record<PatientCondition, string> = {
    Stable: 'border-blue-200 bg-blue-50 text-blue-700',
    Improving: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    Critical: 'border-red-200 bg-red-50 text-red-700',
  };

  return classes[condition];
};

export default function ProgressNotesPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [treatmentPlans, setTreatmentPlans] = useState<TreatmentPlan[]>([]);
  const [notes, setNotes] = useState<ProgressNoteRecord[]>([]);
  const [formData, setFormData] = useState<ProgressNoteForm>(createEmptyForm);
  const [errors, setErrors] = useState<{ patientId?: string; notes?: string }>({});
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const canDeleteNotes = user?.role === 'admin';

  useEffect(() => {
    setNotes(readStoredNotes());

    const loadOptions = async () => {
      try {
        const [patientsData, plansData] = await Promise.all([
          api.getPatients(),
          api.getTreatmentPlans?.() ?? Promise.resolve([]),
        ]);

        setPatients(patientsData);
        setTreatmentPlans(plansData || []);
      } catch (error) {
        console.error('Failed to load progress note options:', error);
        toast({
          title: 'Error',
          description: 'Failed to load patients and treatment plans',
          variant: 'destructive',
        });
      } finally {
        setLoadingOptions(false);
      }
    };

    loadOptions();
  }, [toast]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  const selectedPatient = patients.find((patient) => getPatientId(patient) === formData.patientId);

  const availableTreatmentPlans = useMemo(() => {
    if (!formData.patientId) return treatmentPlans;
    return treatmentPlans.filter((plan) => getPlanPatientId(plan) === formData.patientId);
  }, [formData.patientId, treatmentPlans]);

  const visibleNotes = useMemo(() => {
    const filtered = formData.patientId
      ? notes.filter((note) => note.patientId === formData.patientId)
      : notes;

    return [...filtered].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
  }, [formData.patientId, notes]);

  const patientNameById = useMemo(() => {
    return patients.reduce<Record<string, string>>((acc, patient) => {
      acc[getPatientId(patient)] = patient.fullName;
      return acc;
    }, {});
  }, [patients]);

  const treatmentPlanPatientNameById = useMemo(() => {
    return treatmentPlans.reduce<Record<string, string>>((acc, plan) => {
      const planId = getTreatmentPlanId(plan);
      if (planId && plan.patientName) acc[planId] = plan.patientName;
      return acc;
    }, {});
  }, [treatmentPlans]);

  const getNotePatientName = (note: ProgressNoteRecord) => {
    const savedPatientName = isUsablePatientName(note.patientName, note.patientId) ? note.patientName : '';

    return (
      patientNameById[note.patientId] ||
      savedPatientName ||
      (note.treatmentId ? treatmentPlanPatientNameById[note.treatmentId] : '') ||
      'Patient name unavailable'
    );
  };

  useEffect(() => {
    if (patients.length === 0 || notes.length === 0) return;

    setNotes((prev) => {
      let changed = false;
      const next = prev.map((note) => {
        const patientName = patientNameById[note.patientId];
        if (!patientName || note.patientName === patientName) return note;
        changed = true;
        return { ...note, patientName };
      });

      return changed ? next : prev;
    });
  }, [patients.length, patientNameById, notes.length]);

  const updateFormField = <K extends keyof ProgressNoteForm>(field: K, value: ProgressNoteForm[K]) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'patientId') next.treatmentId = '';
      return next;
    });

    if (field === 'patientId' || field === 'notes') {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const resetForm = () => {
    setFormData(createEmptyForm());
    setErrors({});
    setEditingNoteId(null);
  };

  const validateForm = () => {
    const nextErrors: { patientId?: string; notes?: string } = {};

    if (!formData.patientId) {
      nextErrors.patientId = 'Patient is required';
    }

    if (!formData.notes.trim()) {
      nextErrors.notes = 'Notes are required';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateForm()) return;

    const notePayload: ProgressNoteRecord = {
      id: editingNoteId ?? `${Date.now()}`,
      patientId: formData.patientId,
      patientName: selectedPatient?.fullName || patientNameById[formData.patientId] || '',
      treatmentId: formData.treatmentId === NO_TREATMENT_PLAN ? undefined : formData.treatmentId || undefined,
      date: formData.date,
      notes: formData.notes.trim(),
      sessionType: formData.sessionType,
      condition: formData.condition,
      nextAction: formData.nextAction.trim() || undefined,
    };

    setNotes((prev) => {
      if (!editingNoteId) return [notePayload, ...prev];
      return prev.map((note) => (note.id === editingNoteId ? notePayload : note));
    });

    toast({
      title: 'Success',
      description: 'Note saved successfully',
    });
    resetForm();
  };

  const handleEdit = (note: ProgressNoteRecord) => {
    setEditingNoteId(note.id);
    setFormData({
      patientId: note.patientId,
      treatmentId: note.treatmentId || '',
      date: note.date || getTodayInputDate(),
      notes: note.notes,
      sessionType: note.sessionType,
      condition: note.condition,
      nextAction: note.nextAction || '',
    });
    setErrors({});
  };

  const handleDelete = (noteId: string) => {
    if (!canDeleteNotes) {
      toast({
        title: 'Permission denied',
        description: 'Only admin can delete progress notes',
        variant: 'destructive',
      });
      return;
    }

    if (!window.confirm('Delete this progress note?')) return;
    setNotes((prev) => prev.filter((note) => note.id !== noteId));
    if (editingNoteId === noteId) resetForm();
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Progress Notes</h1>
            <p className="mt-1 text-sm text-slate-600">Record clinical updates and review patient note history.</p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm text-slate-600 shadow-sm">
            <CalendarDays className="h-4 w-4 text-medical-teal" />
            <span>{getTodayInputDate()}</span>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">{editingNoteId ? 'Edit Progress Note' : 'Add Progress Note'}</CardTitle>
              <CardDescription>Patient and note details marked with an asterisk are required.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-5" noValidate>
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="patientId">Patient *</Label>
                    <Select value={formData.patientId} onValueChange={(value) => updateFormField('patientId', value)}>
                      <SelectTrigger
                        id="patientId"
                        className={formData.patientId ? 'border-medical-teal ring-1 ring-medical-teal/25' : undefined}
                      >
                        <SelectValue placeholder={loadingOptions ? 'Loading patients...' : 'Select patient'} />
                      </SelectTrigger>
                      <SelectContent>
                        {patients.map((patient) => {
                          const patientId = getPatientId(patient);
                          return (
                            <SelectItem key={patientId} value={patientId}>
                              {patient.fullName}
                            </SelectItem>
                          );
                        })}
                        {patients.length === 0 && (
                          <SelectItem value="no-patients" disabled>
                            {loadingOptions ? 'Loading patients...' : 'No patients found'}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    {errors.patientId && <p className="text-xs font-medium text-destructive">{errors.patientId}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="treatmentId">Treatment Plan</Label>
                    <Select
                      value={formData.treatmentId}
                      onValueChange={(value) => updateFormField('treatmentId', value)}
                      disabled={availableTreatmentPlans.length === 0}
                    >
                      <SelectTrigger
                        id="treatmentId"
                        className={formData.treatmentId ? 'border-medical-teal ring-1 ring-medical-teal/25' : undefined}
                      >
                        <SelectValue placeholder={availableTreatmentPlans.length ? 'Select treatment plan' : 'No matching plans'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NO_TREATMENT_PLAN}>No treatment plan</SelectItem>
                        {availableTreatmentPlans.map((plan) => {
                          const planId = getTreatmentPlanId(plan);
                          return (
                            <SelectItem key={planId} value={planId}>
                              {plan.planType} plan {plan.status ? `(${plan.status})` : ''}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input id="date" type="date" value={formData.date} readOnly className="bg-slate-100" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sessionType">Session Type</Label>
                    <Select value={formData.sessionType} onValueChange={(value) => updateFormField('sessionType', value as SessionType)}>
                      <SelectTrigger id="sessionType" className="border-medical-teal ring-1 ring-medical-teal/25">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Counseling">Counseling</SelectItem>
                        <SelectItem value="Therapy">Therapy</SelectItem>
                        <SelectItem value="Medication">Medication</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="condition">Condition / Status</Label>
                    <Select value={formData.condition} onValueChange={(value) => updateFormField('condition', value as PatientCondition)}>
                      <SelectTrigger id="condition" className="border-medical-teal ring-1 ring-medical-teal/25">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Stable">Stable</SelectItem>
                        <SelectItem value="Improving">Improving</SelectItem>
                        <SelectItem value="Critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes *</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(event) => updateFormField('notes', event.target.value)}
                    placeholder="Write patient progress, response to treatment, observations, and relevant context..."
                    className="min-h-[160px] resize-y"
                  />
                  {errors.notes && <p className="text-xs font-medium text-destructive">{errors.notes}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nextAction">Next Action / Recommendation</Label>
                  <Textarea
                    id="nextAction"
                    value={formData.nextAction}
                    onChange={(event) => updateFormField('nextAction', event.target.value)}
                    placeholder="Optional recommendations or follow-up actions..."
                    className="min-h-[96px] resize-y"
                  />
                </div>

                <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end">
                  {editingNoteId && (
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel Edit
                    </Button>
                  )}
                  <Button type="submit" className="bg-medical-teal text-white hover:bg-medical-teal/90">
                    <Save className="mr-2 h-4 w-4" />
                    {editingNoteId ? 'Update Note' : 'Save Note'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <FileText className="h-5 w-5 text-medical-teal" />
                Notes History
              </CardTitle>
              <CardDescription>
                {selectedPatient ? `Filtered for ${selectedPatient.fullName}` : 'Select a patient to focus the history list.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {visibleNotes.length === 0 ? (
                <div className="rounded-lg border border-dashed bg-slate-50 px-4 py-10 text-center">
                  <p className="font-medium text-slate-700">No progress notes available</p>
                  <p className="mt-1 text-sm text-slate-500">Saved notes will appear here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {visibleNotes.map((note) => (
                    <div key={note.id} className="rounded-lg border bg-white p-4 shadow-sm">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold text-slate-900">{note.date}</p>
                            <Badge variant="outline" className={getConditionClassName(note.condition)}>
                              {note.condition}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-500">
                            {getNotePatientName(note)} | {note.sessionType}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button type="button" variant="outline" size="sm" onClick={() => handleEdit(note)}>
                            <Pencil className="mr-1.5 h-3.5 w-3.5" />
                            Edit
                          </Button>
                          {canDeleteNotes && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="border-destructive/30 text-destructive hover:bg-destructive/10"
                              onClick={() => handleDelete(note.id)}
                            >
                              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                              Delete
                            </Button>
                          )}
                        </div>
                      </div>

                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-700">
                        {note.notes.length > 150 ? `${note.notes.slice(0, 150)}...` : note.notes}
                      </p>
                      {note.nextAction && (
                        <p className="mt-2 text-xs text-slate-500">
                          Next: {note.nextAction.length > 90 ? `${note.nextAction.slice(0, 90)}...` : note.nextAction}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
