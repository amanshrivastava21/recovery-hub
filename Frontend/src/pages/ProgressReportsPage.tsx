import { useEffect, useMemo, useState } from 'react';
import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import type { Patient, ProgressReport, Worker } from '@/types';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Eye, FilePenLine, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ProgressReportsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reports, setReports] = useState<ProgressReport[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ProgressReport | null>(null);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const progressDeleteRoles = ['admin', 'staff', 'worker', 'doctor', 'nurse', 'counselor', 'therapist'];
  const canDelete = progressDeleteRoles.includes(user?.staffRole || user?.role || '');
  const canChooseWorker = user?.role === 'admin';

  const loadReports = () => api.getProgressReports().then(setReports);

  useEffect(() => {
    loadReports();
    api.getPatients().then(setPatients).catch(() => setPatients([]));
    if (canChooseWorker) api.getWorkers().then(setWorkers).catch(() => setWorkers([]));
  }, [canChooseWorker]);

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return reports.filter((report) => (
      (report.patientName || '').toLowerCase().includes(term) ||
      report.workerName.toLowerCase().includes(term) ||
      report.report.toLowerCase().includes(term)
    ));
  }, [reports, search]);

  const handleAdd = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    setIsLoading(true);
    try {
      const fd = new FormData(form);
      await api.createProgressReport({
        patient: fd.get('patient') as string,
        patientName: '',
        worker: (fd.get('worker') as string) || undefined,
        workerName: user?.name || '',
        reportDate: fd.get('reportDate') as string,
        report: fd.get('report') as string,
        medicineTaken: fd.get('medicineTaken') === 'yes',
        medicineNotes: fd.get('medicineNotes') as string,
      });
      toast({ title: 'Progress report saved' });
      form.reset();
      setAddOpen(false);
      loadReports();
    } catch (error) {
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Unable to save report', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteReport = async (report: ProgressReport) => {
    if (!window.confirm('Delete this progress report?')) return;
    await api.deleteProgressReport(report.id);
    toast({ title: 'Progress report deleted' });
    loadReports();
  };

  return (
    <div>
      <PageHeader title="Progress Reports" description={`${reports.length} patient progress records`}>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Add Progress</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
            <DialogHeader><DialogTitle>Write Patient Progress</DialogTitle></DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <Label>Patient</Label>
                <Select name="patient" required>
                  <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>{patient.fullName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {canChooseWorker && (
                <div>
                  <Label>Worker</Label>
                  <Select name="worker">
                    <SelectTrigger><SelectValue placeholder="Select worker" /></SelectTrigger>
                    <SelectContent>
                      {workers.map((worker) => (
                        <SelectItem key={worker.id || worker._id} value={worker.id || worker._id || ''}>{worker.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label>Report Date</Label>
                  <Input name="reportDate" type="date" defaultValue={new Date().toISOString().split('T')[0]} required />
                </div>
                <div>
                  <Label>Medicine Taken?</Label>
                  <select name="medicineTaken" className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm" defaultValue="yes" required>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
              </div>
              <div>
                <Label>Progress Report</Label>
                <Textarea name="report" rows={4} placeholder="Patient condition, behavior, improvement, daily update..." required />
              </div>
              <div>
                <Label>Medicine Notes</Label>
                <Textarea name="medicineNotes" rows={2} placeholder="Medicine name, dose, reason if not taken..." />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save Progress Report'}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="mb-4">
        <Input placeholder="Search progress reports..." value={search} onChange={(event) => setSearch(event.target.value)} />
      </div>

      <div className="rounded-xl border bg-card shadow-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Worker</TableHead>
              <TableHead>Medicine</TableHead>
              <TableHead>Report</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="py-8 text-center text-muted-foreground">No progress reports found</TableCell></TableRow>
            ) : filtered.map((report) => (
              <TableRow key={report.id}>
                <TableCell>{new Date(report.reportDate).toLocaleDateString()}</TableCell>
                <TableCell className="font-medium">{report.patientName || 'N/A'}</TableCell>
                <TableCell>{report.workerName || 'N/A'}</TableCell>
                <TableCell><StatusBadge status={report.medicineTaken ? 'taken' : 'not-taken'} /></TableCell>
                <TableCell className="max-w-sm truncate">{report.report}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" title="View report" onClick={() => setSelectedReport(report)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    {canDelete && (
                      <Button variant="ghost" size="icon" title="Delete report" onClick={() => deleteReport(report)}>
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

      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><FilePenLine className="h-5 w-5" />Progress Details</DialogTitle></DialogHeader>
          {selectedReport && (
            <div className="space-y-4 text-sm">
              <div className="grid gap-3 sm:grid-cols-2">
                <div><p className="text-muted-foreground">Patient</p><p className="font-medium">{selectedReport.patientName || 'N/A'}</p></div>
                <div><p className="text-muted-foreground">Worker</p><p className="font-medium">{selectedReport.workerName || 'N/A'}</p></div>
                <div><p className="text-muted-foreground">Date</p><p className="font-medium">{new Date(selectedReport.reportDate).toLocaleDateString()}</p></div>
                <div><p className="text-muted-foreground">Medicine Taken</p><StatusBadge status={selectedReport.medicineTaken ? 'taken' : 'not-taken'} /></div>
              </div>
              <div><p className="text-muted-foreground">Report</p><p className="whitespace-pre-wrap rounded-lg bg-muted p-3">{selectedReport.report}</p></div>
              {selectedReport.medicineNotes && (
                <div><p className="text-muted-foreground">Medicine Notes</p><p className="whitespace-pre-wrap rounded-lg bg-muted p-3">{selectedReport.medicineNotes}</p></div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProgressReportsPage;
