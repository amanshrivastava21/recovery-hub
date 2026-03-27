import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import type { Visit } from '@/types';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const VisitsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [addOpen, setAddOpen] = useState(false);

  const load = () => api.getVisits().then(setVisits);
  useEffect(() => { load(); }, []);

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await api.createVisit({
      patient: fd.get('patient') as string,
      patientName: fd.get('patientName') as string,
      worker: user?.id || '',
      workerName: user?.name || '',
      visitDate: fd.get('visitDate') as string,
      notes: fd.get('notes') as string,
      patientCondition: fd.get('patientCondition') as Visit['patientCondition'],
      behaviorReport: fd.get('behaviorReport') as string,
      recommendations: fd.get('recommendations') as string,
    });
    toast({ title: 'Visit logged' });
    setAddOpen(false);
    load();
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
              <div><Label>Patient Name</Label><Input name="patientName" required /></div>
              <input type="hidden" name="patient" value="p1" />
              <div><Label>Visit Date</Label><Input name="visitDate" type="date" required defaultValue={new Date().toISOString().split('T')[0]} /></div>
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
              <Button type="submit" className="w-full">Log Visit</Button>
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {visits.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="py-8 text-center text-muted-foreground">No visit logs</TableCell></TableRow>
            ) : visits.map((v) => (
              <TableRow key={v.id}>
                <TableCell>{new Date(v.visitDate).toLocaleDateString()}</TableCell>
                <TableCell className="font-medium">{v.patientName}</TableCell>
                <TableCell>{v.workerName}</TableCell>
                <TableCell><StatusBadge status={v.patientCondition} /></TableCell>
                <TableCell className="max-w-xs truncate">{v.notes}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default VisitsPage;
