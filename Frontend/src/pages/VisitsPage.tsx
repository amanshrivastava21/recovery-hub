import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '@/services/api';
import type { Patient, Visit, Worker } from '@/types';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const VisitsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedWorker, setSelectedWorker] = useState('');
  const [visitType, setVisitType] = useState('counseling');
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const load = () => api.getVisits().then(setVisits);
  useEffect(() => {
    load();
    api.getPatients().then((data) => {
      setPatients(data);
      if (data.length > 0) setSelectedPatient(data[0].id);
    });
    api.getWorkers().then((data) => {
      setWorkers(data);
      if (user?.role === 'worker') {
        const currentWorker = data.find((w) => w.id === user.id || w._id === user.id);
        setSelectedWorker(currentWorker?.id || currentWorker?._id || data[0]?.id || data[0]?._id || '');
      } else {
        setSelectedWorker(data[0]?.id || data[0]?._id || '');
      }
    });
  }, [user]);

  useEffect(() => {
    setSearch(searchParams.get('q') || '');
  }, [searchParams]);

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const fd = new FormData(e.currentTarget);
      const form = e.currentTarget;
      const patientId = selectedPatient || (fd.get('patient') as string);
      const workerId = selectedWorker || (fd.get('worker') as string);
      const workerObj = workers.find((w) => w.id === workerId || w._id === workerId);

      await api.createVisit({
        patient: patientId,
        worker: workerId,
        workerName: workerObj?.name || user?.name || '',
        visitDate: fd.get('visitDate') as string,
        visitType: visitType as any,
        notes: fd.get('notes') as string,
        patientCondition: fd.get('patientCondition') as Visit['patientCondition'],
        behaviorReport: fd.get('behaviorReport') as string,
        recommendations: fd.get('recommendations') as string,
      });
      toast({ title: 'Visit logged successfully' });
      form.reset();
      setVisitType('counseling');
      setSelectedPatient(patients[0]?.id || '');
      setSelectedWorker(workers[0]?.id || workers[0]?._id || '');
      form.querySelector('input[name="visitDate"]')?.setAttribute('value', new Date().toISOString().split('T')[0]);
      setAddOpen(false);
      load();
    } catch (error) {
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to log visit' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title="Visit Logs" description={`${visits.length} visit records`}>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Add Visit Log</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Log New Visit</DialogTitle></DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <Label>Patient *</Label>
                <select 
                  name="patient" 
                  className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm" 
                  required
                  value={selectedPatient}
                  onChange={(e) => setSelectedPatient(e.target.value)}
                >
                  <option value="">Select Patient</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>{p.fullName}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Worker *</Label>
                <select 
                  name="worker" 
                  className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm" 
                  required
                  value={selectedWorker}
                  onChange={(e) => setSelectedWorker(e.target.value)}
                >
                  <option value="">Select Worker</option>
                  {workers.map((w) => (
                    <option key={w.id || w._id} value={w.id || w._id}>{w.name}</option>
                  ))}
                </select>
              </div>
              <div><Label>Visit Date</Label><Input name="visitDate" type="date" required defaultValue={new Date().toISOString().split('T')[0]} /></div>
              <div>
                <Label>Visit Type *</Label>
                <select 
                  name="visitType" 
                  className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm" 
                  required
                  value={visitType}
                  onChange={(e) => setVisitType(e.target.value)}
                >
                  <option value="counseling">Counseling</option>
                  <option value="health-check">Health Check</option>
                  <option value="activity">Activity</option>
                  <option value="assessment">Assessment</option>
                  <option value="follow-up">Follow-up</option>
                </select>
              </div>
              <div>
                <Label>Patient Condition</Label>
                <select name="patientCondition" className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm" required>
                  <option value="stable">Stable</option>
                  <option value="improving">Improving</option>
                  <option value="declining">Declining</option>
                  <option value="critical">Critical</option>
                  <option value="recovered">Recovered</option>
                </select>
              </div>
              <div><Label>Visit Notes</Label><Textarea name="notes" required rows={3} /></div>
              <div><Label>Behavior Report</Label><Textarea name="behaviorReport" rows={2} /></div>
              <div><Label>Recommendations</Label><Textarea name="recommendations" rows={2} /></div>
              <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? 'Logging...' : 'Log Visit'}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="rounded-xl border bg-card shadow-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Worker</TableHead>
              <TableHead>Condition</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visits.filter((v) => {
              const term = search.toLowerCase();
              return (
                (v.patientName ?? '').toLowerCase().includes(term) ||
                (v.workerName ?? '').toLowerCase().includes(term) ||
                (v.visitType ?? '').toLowerCase().includes(term) ||
                (v.notes ?? '').toLowerCase().includes(term)
              );
            }).length === 0 ? (
              <TableRow><TableCell colSpan={6} className="py-8 text-center text-muted-foreground">No visit logs</TableCell></TableRow>
            ) : visits.filter((v) => {
              const term = search.toLowerCase();
              return (
                (v.patientName ?? '').toLowerCase().includes(term) ||
                (v.workerName ?? '').toLowerCase().includes(term) ||
                (v.visitType ?? '').toLowerCase().includes(term) ||
                (v.notes ?? '').toLowerCase().includes(term)
              );
            }).map((v) => (
              <TableRow key={v.id}>
                <TableCell>{new Date(v.visitDate).toLocaleDateString()}</TableCell>
                <TableCell className="font-medium">{v.patientName}</TableCell>
                <TableCell>{v.workerName}</TableCell>
                <TableCell><StatusBadge status={v.patientCondition} /></TableCell>
                <TableCell className="max-w-xs truncate">{v.notes}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => setSelectedVisit(v)} title="View visit">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={async () => {
                      if (!window.confirm('Delete this visit record?')) return;
                      try {
                        await api.deleteVisit(v.id);
                        toast({ title: 'Deleted', description: 'Visit record deleted successfully' });
                        load();
                      } catch (error) {
                        toast({ title: 'Error', description: error instanceof Error ? error.message : 'Unable to delete visit', variant: 'destructive' });
                      }
                    }} title="Delete visit">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedVisit} onOpenChange={() => setSelectedVisit(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Visit Details</DialogTitle>
          </DialogHeader>
          {selectedVisit && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-muted-foreground">Patient</p><p className="font-medium">{selectedVisit.patientName}</p></div>
                <div><p className="text-muted-foreground">Worker</p><p className="font-medium">{selectedVisit.workerName}</p></div>
                <div><p className="text-muted-foreground">Visit Date</p><p className="font-medium">{new Date(selectedVisit.visitDate).toLocaleDateString()}</p></div>
                <div><p className="text-muted-foreground">Visit Type</p><p className="font-medium capitalize">{selectedVisit.visitType}</p></div>
                <div><p className="text-muted-foreground">Condition</p><StatusBadge status={selectedVisit.patientCondition} /></div>
              </div>
              <div><p className="text-muted-foreground">Notes</p><p className="whitespace-pre-wrap">{selectedVisit.notes}</p></div>
              {selectedVisit.behaviorReport && (
                <div><p className="text-muted-foreground">Behavior Report</p><p className="whitespace-pre-wrap">{selectedVisit.behaviorReport}</p></div>
              )}
              {selectedVisit.recommendations && (
                <div><p className="text-muted-foreground">Recommendations</p><p className="whitespace-pre-wrap">{selectedVisit.recommendations}</p></div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VisitsPage;
