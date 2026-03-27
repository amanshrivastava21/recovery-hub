import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import type { Patient } from '@/types';
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

const PatientsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [addOpen, setAddOpen] = useState(false);
  const [detailPatient, setDetailPatient] = useState<Patient | null>(null);
  const [dischargePatient, setDischargePatient] = useState<Patient | null>(null);
  const [dischargeDate, setDischargeDate] = useState('');
  const [finalReport, setFinalReport] = useState('');

  const loadPatients = () => api.getPatients().then(setPatients);
  useEffect(() => { loadPatients(); }, []);

  const filtered = patients.filter(p => {
    const matchSearch = p.fullName.toLowerCase().includes(search.toLowerCase()) || p.addictionType.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || p.recoveryStatus === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await api.createPatient({
      fullName: fd.get('fullName') as string,
      age: Number(fd.get('age')),
      gender: fd.get('gender') as Patient['gender'],
      contact: { phone: fd.get('phone') as string, email: fd.get('email') as string, address: fd.get('address') as string },
      emergencyContact: { name: fd.get('ecName') as string, phone: fd.get('ecPhone') as string, relationship: fd.get('ecRelation') as string },
      addictionType: fd.get('addictionType') as string,
      medicalHistory: fd.get('medicalHistory') as string,
      admissionDate: fd.get('admissionDate') as string,
      recoveryStatus: 'admitted',
    } as any);
    toast({ title: 'Patient added successfully' });
    setAddOpen(false);
    loadPatients();
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
                  <div className="col-span-2"><Label>Full Name</Label><Input name="fullName" required /></div>
                  <div><Label>Age</Label><Input name="age" type="number" min="1" max="150" required /></div>
                  <div>
                    <Label>Gender</Label>
                    <select name="gender" className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm" required>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div><Label>Phone</Label><Input name="phone" required /></div>
                  <div><Label>Email</Label><Input name="email" type="email" /></div>
                  <div className="col-span-2"><Label>Address</Label><Input name="address" /></div>
                  <div className="col-span-2"><Label>Addiction Type / Condition</Label><Input name="addictionType" required /></div>
                  <div className="col-span-2"><Label>Medical History</Label><Textarea name="medicalHistory" rows={2} /></div>
                  <div><Label>Admission Date</Label><Input name="admissionDate" type="date" required defaultValue={new Date().toISOString().split('T')[0]} /></div>
                </div>
                <p className="text-xs font-medium text-muted-foreground mt-4">Emergency Contact</p>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Name</Label><Input name="ecName" required /></div>
                  <div><Label>Phone</Label><Input name="ecPhone" required /></div>
                  <div className="col-span-2"><Label>Relationship</Label><Input name="ecRelation" /></div>
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
              <TableHead>Admission</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No patients found</TableCell></TableRow>
            ) : filtered.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.fullName}</TableCell>
                <TableCell>{p.age}</TableCell>
                <TableCell>{p.addictionType}</TableCell>
                <TableCell><StatusBadge status={p.recoveryStatus} /></TableCell>
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
            ))}
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
