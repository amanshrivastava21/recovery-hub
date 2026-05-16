import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import type { Patient, StaffMember } from '@/types';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, Trash2, Eye, UserMinus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import PasswordStrengthBar from '@/components/ui/PasswordStrengthBar';
import { validatePhone, validatePassword } from '@/utils/validators';

const PatientsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterTreatmentPlan, setFilterTreatmentPlan] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [detailPatient, setDetailPatient] = useState<Patient | null>(null);
  const [dischargePatient, setDischargePatient] = useState<Patient | null>(null);
  const [dischargeDate, setDischargeDate] = useState('');
  const [finalReport, setFinalReport] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    age: '',
    gender: 'male' as const,
    phone: '',
    address: '',
    password: '',
    addictionType: '',
    medicalHistory: '',
    admissionDate: new Date().toISOString().split('T')[0],
    ecName: '',
    ecPhone: '',
    ecRelation: '',
    assignedStaff: ''
  });
  const [errors, setErrors] = useState({
    phone: '',
    password: ''
  });

  const treatmentStaff = staff.filter((member) => ['doctor', 'therapist'].includes(member.staffRole));
  const getAssignedStaffName = (patient: Patient) => {
    const assigned = patient.assignedStaff as any;
    if (!assigned) return 'Not assigned';
    return assigned.user?.name || assigned.name || treatmentStaff.find((member) => (member._id ?? member.id) === assigned)?.user?.name || 'Assigned staff';
  };

  const loadPatients = () => api.getPatients().then(setPatients);
  const loadPageData = async () => {
    const [patientsData, staffData] = await Promise.all([
      api.getPatients(),
      user?.role === 'admin' ? api.getStaff() : Promise.resolve([]),
    ]);
    setPatients(patientsData);
    setStaff(staffData);
  };
  useEffect(() => { loadPageData(); }, []);
  useEffect(() => {
    setSearch(searchParams.get('q') || '');
  }, [searchParams]);

  const filtered = patients.filter(p => {
    const term = search.toLowerCase();
    const matchSearch = p.fullName.toLowerCase().includes(term) || p.addictionType.toLowerCase().includes(term) || p.contact.phone?.toLowerCase().includes(term) || p.contact.email?.toLowerCase().includes(term);
    const matchStatus = filterStatus === 'all' || p.recoveryStatus === filterStatus;
    
    let matchTreatmentPlan = true;
    if (filterTreatmentPlan) {
      const hasActivePlan = p.treatmentPlan && typeof p.treatmentPlan === 'object' && (p.treatmentPlan as any).status === 'active';
      matchTreatmentPlan = !!hasActivePlan;
    }
    
    return matchSearch && matchStatus && matchTreatmentPlan;
  });

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    console.log('[PatientsPage] Form submission started');
    e.preventDefault();
    setErrors({ phone: '', password: '' });

    // Validate phone
    const phoneValidation = validatePhone(formData.phone);
    if (!phoneValidation.valid) {
      setErrors(prev => ({ ...prev, phone: phoneValidation.message }));
      return;
    }

    // Validate password
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.valid) {
      setErrors(prev => ({ ...prev, password: passwordValidation.message }));
      return;
    }

    const patientData = {
      fullName: formData.fullName,
      email: formData.email.trim().toLowerCase(),
      age: Number(formData.age),
      gender: formData.gender as Patient['gender'],
      contact: { phone: formData.phone, email: formData.email, address: formData.address },
      emergencyContact: { name: formData.ecName, phone: formData.ecPhone, relationship: formData.ecRelation },
      addictionType: formData.addictionType,
      medicalHistory: formData.medicalHistory,
      admissionDate: formData.admissionDate,
      password: formData.password,
      recoveryStatus: 'admitted',
      assignedStaff: formData.assignedStaff || undefined,
    } as any;

    console.log('[PatientsPage] Patient data collected:', patientData);

    try {
      console.log('[PatientsPage] Calling api.createPatient...');
      const result = await api.createPatient(patientData);
      console.log('[PatientsPage] Patient created successfully:', result);

      toast({ title: 'Patient added successfully' });
      setAddOpen(false);
      setSearch('');
      setFormData({
        fullName: '',
        email: '',
        age: '',
        gender: 'male',
        phone: '',
        address: '',
        password: '',
        addictionType: '',
        medicalHistory: '',
        admissionDate: new Date().toISOString().split('T')[0],
        ecName: '',
        ecPhone: '',
        ecRelation: '',
        assignedStaff: ''
      });

      console.log('[PatientsPage] Reloading patients list...');
      await loadPatients();
      console.log('[PatientsPage] Patients list reloaded');
    } catch (error) {
      console.error('[PatientsPage] Error creating patient:', error);
      toast({ title: 'Error', description: `Failed to add patient: ${error instanceof Error ? error.message : 'Unknown error'}` });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this patient record?')) return;
    await api.deletePatient(id);
    toast({ title: 'Patient deleted' });
    loadPatients();
  };

  const handleDischarge = async () => {
    if (!dischargePatient) return;
    await api.dischargePatient(dischargePatient.id, dischargeDate, finalReport);
    toast({ title: 'Patient discharged successfully' });
    setDischargePatient(null);
    setDischargeDate('');
    setFinalReport('');
    loadPatients();
  };

  const canEdit = user?.role === 'admin' || user?.role === 'staff';

  return (
    <div>
      <PageHeader title="Patients" description={`${patients.length} total patients`}>
        {canEdit && (
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" />Add Patient</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
              <DialogHeader><DialogTitle>Admit New Patient</DialogTitle></DialogHeader>
              <form onSubmit={handleAdd} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <Label>Full Name</Label>
                    <Input
                      name="fullName"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Age</Label>
                    <Input
                      name="age"
                      type="number"
                      min="1"
                      max="150"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Gender</Label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                      className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
                      required
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input
                      name="phone"
                      value={formData.phone}
                      onChange={(e) => {
                        setFormData({ ...formData, phone: e.target.value });
                        if (e.target.value) setErrors(prev => ({ ...prev, phone: '' }));
                      }}
                      placeholder="10-digit number"
                      required
                    />
                    {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                  </div>
                  <div className="col-span-2">
                    <Label>Email</Label>
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Password</Label>
                    <Input
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => {
                        setFormData({ ...formData, password: e.target.value });
                        if (e.target.value) setErrors(prev => ({ ...prev, password: '' }));
                      }}
                      required
                    />
                    {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                    <PasswordStrengthBar password={formData.password} />
                  </div>
                  <div className="col-span-2">
                    <Label>Address</Label>
                    <Input
                      name="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Addiction Type / Condition</Label>
                    <Input
                      name="addictionType"
                      value={formData.addictionType}
                      onChange={(e) => setFormData({ ...formData, addictionType: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Medical History</Label>
                    <Textarea
                      name="medicalHistory"
                      value={formData.medicalHistory}
                      onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Admission Date</Label>
                    <Input
                      name="admissionDate"
                      type="date"
                      value={formData.admissionDate}
                      onChange={(e) => setFormData({ ...formData, admissionDate: e.target.value })}
                      required
                    />
                  </div>
                  {user?.role === 'admin' && (
                    <div className="col-span-2">
                      <Label>Assign Doctor / Therapist</Label>
                      <Select value={formData.assignedStaff || 'none'} onValueChange={(value) => setFormData({ ...formData, assignedStaff: value === 'none' ? '' : value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select doctor or therapist" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Not assigned</SelectItem>
                          {treatmentStaff.map((member) => (
                            <SelectItem key={member._id ?? member.id} value={member._id ?? member.id}>
                              {member.user?.name || 'Staff member'} ({member.staffRole})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                <p className="text-xs font-medium text-muted-foreground mt-4">Emergency Contact</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Name</Label>
                    <Input
                      name="ecName"
                      value={formData.ecName}
                      onChange={(e) => setFormData({ ...formData, ecName: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input
                      name="ecPhone"
                      value={formData.ecPhone}
                      onChange={(e) => setFormData({ ...formData, ecPhone: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Relationship</Label>
                    <Input
                      name="ecRelation"
                      value={formData.ecRelation}
                      onChange={(e) => setFormData({ ...formData, ecRelation: e.target.value })}
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full">Admit Patient</Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </PageHeader>

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search patients..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="admitted">Admitted</SelectItem>
            <SelectItem value="in-treatment">In Treatment</SelectItem>
            <SelectItem value="recovering">Recovering</SelectItem>
            <SelectItem value="discharged">Discharged</SelectItem>
          </SelectContent>
        </Select>
        <Button 
          variant={filterTreatmentPlan ? "default" : "outline"}
          onClick={() => setFilterTreatmentPlan(!filterTreatmentPlan)}
          className="w-full sm:w-auto"
        >
          {filterTreatmentPlan ? '✓ ' : ''}Treatment Plans
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card shadow-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Condition</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Treatment Plan</TableHead>
              {user?.role === 'admin' && <TableHead>Assigned To</TableHead>}
              <TableHead>Admission</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow><TableCell colSpan={user?.role === 'admin' ? 8 : 7} className="text-center py-8 text-muted-foreground">No patients found</TableCell></TableRow>
            ) : filtered.map((p) => {
              const hasActivePlan = p.treatmentPlan && typeof p.treatmentPlan === 'object' && (p.treatmentPlan as any).status === 'active';
              return (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.fullName}</TableCell>
                <TableCell>{p.age}</TableCell>
                <TableCell>{p.addictionType}</TableCell>
                <TableCell><StatusBadge status={p.recoveryStatus} /></TableCell>
                <TableCell>
                  {hasActivePlan ? (
                    <span className="inline-block rounded-full px-2 py-1 text-xs font-medium bg-success/10 text-success">
                      {(p.treatmentPlan as any).planType}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
                {user?.role === 'admin' && <TableCell>{getAssignedStaffName(p)}</TableCell>}
                <TableCell>{new Date(p.admissionDate).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => setDetailPatient(p)} title="View">
                      <Eye className="h-4 w-4" />
                    </Button>
                    {canEdit && p.recoveryStatus !== 'discharged' && (
                      <Button variant="ghost" size="icon" onClick={() => setDischargePatient(p)} title="Discharge">
                        <UserMinus className="h-4 w-4" />
                      </Button>
                    )}
                    {user?.role === 'admin' && (
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)} title="Delete">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!detailPatient} onOpenChange={() => setDetailPatient(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader><DialogTitle>{detailPatient?.fullName}</DialogTitle></DialogHeader>
          {detailPatient && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-muted-foreground">Age</p><p className="font-medium">{detailPatient.age}</p></div>
                <div><p className="text-muted-foreground">Gender</p><p className="font-medium capitalize">{detailPatient.gender}</p></div>
                <div><p className="text-muted-foreground">Phone</p><p className="font-medium">{detailPatient.contact.phone}</p></div>
                <div><p className="text-muted-foreground">Status</p><StatusBadge status={detailPatient.recoveryStatus} /></div>
                <div className="col-span-2"><p className="text-muted-foreground">Addiction Type</p><p className="font-medium">{detailPatient.addictionType}</p></div>
                {user?.role === 'admin' && (
                  <div className="col-span-2"><p className="text-muted-foreground">Assigned Doctor / Therapist</p><p className="font-medium">{getAssignedStaffName(detailPatient)}</p></div>
                )}
                {detailPatient.treatmentPlan && (
                  <div className="col-span-2"><p className="text-muted-foreground">Treatment Plan</p><p className="font-medium">{detailPatient.treatmentPlan}</p></div>
                )}
                <div><p className="text-muted-foreground">Admitted</p><p className="font-medium">{new Date(detailPatient.admissionDate).toLocaleDateString()}</p></div>
                {detailPatient.dischargeDate && (
                  <div><p className="text-muted-foreground">Discharged</p><p className="font-medium">{new Date(detailPatient.dischargeDate).toLocaleDateString()}</p></div>
                )}
                {detailPatient.recoveryDuration !== undefined && (
                  <div><p className="text-muted-foreground">Recovery Duration</p><p className="font-medium">{detailPatient.recoveryDuration} days</p></div>
                )}
              </div>
              <div><p className="text-muted-foreground">Emergency Contact</p><p className="font-medium">{detailPatient.emergencyContact.name} ({detailPatient.emergencyContact.phone})</p></div>
              {detailPatient.progressNotes.length > 0 && (
                <div>
                  <p className="mb-2 font-medium text-muted-foreground">Progress Notes</p>
                  <div className="space-y-2">
                    {detailPatient.progressNotes.map((n, i) => (
                      <div key={i} className="rounded-lg bg-muted p-3">
                        <p className="text-xs text-muted-foreground">{new Date(n.date).toLocaleDateString()} — {n.addedBy}</p>
                        <p className="mt-1">{n.note}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {detailPatient.finalReport && (
                <div><p className="text-muted-foreground">Final Report</p><p className="rounded-lg bg-muted p-3">{detailPatient.finalReport}</p></div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Discharge Dialog */}
      <Dialog open={!!dischargePatient} onOpenChange={() => setDischargePatient(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Discharge {dischargePatient?.fullName}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Discharge Date</Label><Input type="date" value={dischargeDate} onChange={(e) => setDischargeDate(e.target.value)} required /></div>
            <div><Label>Final Report</Label><Textarea value={finalReport} onChange={(e) => setFinalReport(e.target.value)} rows={4} placeholder="Summary of treatment and recovery..." /></div>
            <Button onClick={handleDischarge} className="w-full" disabled={!dischargeDate}>Confirm Discharge</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientsPage;
