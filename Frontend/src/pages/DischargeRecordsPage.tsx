import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Download, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { api } from '@/services/api';
import type { Discharge, Patient } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { sendDischargeNotification } from '@/utils/smsService';
import { generateDischargeReport } from '@/utils/pdfExport';

export default function DischargeRecordsPage() {
  const [searchParams] = useSearchParams();
  const [discharges, setDischarges] = useState<Discharge[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { toast } = useToast();

  const form = useForm({
    defaultValues: {
      patient: '',
      dischargeDate: new Date().toISOString().split('T')[0],
      recoveryStatus: 'fully-recovered',
      finalNotes: '',
      recommendedFollowUp: '',
      successRate: 100,
    },
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setSearch(searchParams.get('q') || '');
  }, [searchParams]);

  const loadData = async () => {
    try {
      const [dischargesData, patientsData] = await Promise.all([
        api.getDischarges?.() || Promise.resolve([]),
        api.getPatients(),
      ]);
      setDischarges(dischargesData);
      setPatients(patientsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({ title: 'Error', description: 'Failed to load data', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      const patient = patients.find((p) => p.id === data.patient);
      const newDischarge = await api.createDischarge?.({
        ...data,
        patientId: data.patient,
        patientName: patient?.fullName,
        admissionDate: patient?.admissionDate || new Date().toISOString(),
        dischargeDate: new Date(data.dischargeDate).toISOString(),
      });
      const dischargeRecord = (newDischarge as any)?.discharge ?? newDischarge;

      if (dischargeRecord) {
        setDischarges([dischargeRecord, ...discharges]);
        setOpen(false);
        form.reset();
        toast({ title: 'Success', description: 'Discharge record created successfully' });

        // Send SMS notification to emergency contact
        if (patient?.emergencyContact?.phone) {
          try {
            await sendDischargeNotification(
              patient.fullName,
              patient.emergencyContact.phone
            );
            toast({ title: 'SMS Sent', description: 'Notification sent to emergency contact' });
          } catch (smsError) {
            console.error('SMS failed:', smsError);
            toast({ title: 'Warning', description: 'Discharge created but SMS failed', variant: 'destructive' });
          }
        }
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to create discharge record', variant: 'destructive' });
    }
  };

  const handleExportPDF = async (discharge: Discharge) => {
    try {
      await generateDischargeReport(discharge);
      toast({ title: 'Success', description: 'PDF report generated successfully' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to generate PDF', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!id) {
      toast({ title: 'Error', description: 'Discharge record ID missing', variant: 'destructive' });
      return;
    }

    try {
      await api.deleteDischarge?.(id);
      setDischarges((current) => current.filter((discharge) => discharge.id !== id));
      toast({ title: 'Deleted', description: 'Discharge record removed successfully' });
    } catch (error) {
      console.error('Delete failed:', error);
      toast({ title: 'Error', description: 'Failed to delete discharge record', variant: 'destructive' });
    }
  };

  const getRecoveryStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'fully-recovered': 'bg-green-100 text-green-800',
      'partially-recovered': 'bg-yellow-100 text-yellow-800',
      relapsed: 'bg-red-100 text-red-800',
      transferred: 'bg-blue-100 text-blue-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Discharge Records</h1>
          <p className="text-slate-600 mt-2">Manage patient discharge and recovery tracking</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-medical-teal hover:bg-medical-teal/90 text-white">
              <Plus className="w-4 h-4 mr-2" /> New Discharge
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Discharge Record</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="patient"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Patient</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select patient" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {patients.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.fullName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                control={form.control}
                name="dischargeDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discharge Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="recoveryStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recovery Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="fully-recovered">Fully Recovered</SelectItem>
                        <SelectItem value="partially-recovered">Partially Recovered</SelectItem>
                        <SelectItem value="relapsed">Relapsed</SelectItem>
                        <SelectItem value="transferred">Transferred</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="successRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Success Rate (%)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" max="100" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="finalNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Final Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Summary of patient recovery..." {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-medical-teal hover:bg-medical-teal/90 text-white">
                Create Discharge Record
              </Button>
            </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Total Discharges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{discharges.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Fully Recovered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {discharges.filter((d) => d.recoveryStatus === 'fully-recovered').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Avg Recovery Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-medical-teal">
              {discharges.length > 0
                ? Math.round(
                    discharges.reduce((sum, d) => sum + (d.recoveryDays || 0), 0) /
                      discharges.filter((d) => d.recoveryDays).length,
                  )
                : 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Discharges Table */}
      <Card>
        <CardHeader>
          <CardTitle>Discharge Records</CardTitle>
          <CardDescription>All patient discharge records and recovery information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold">Patient</th>
                  <th className="text-left py-3 px-4 font-semibold">Discharge Date</th>
                  <th className="text-left py-3 px-4 font-semibold">Recovery Days</th>
                  <th className="text-left py-3 px-4 font-semibold">Status</th>
                  <th className="text-left py-3 px-4 font-semibold">Success Rate</th>
                  <th className="text-left py-3 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {discharges
                  .filter((discharge) => {
                    const term = String(search || '').toLowerCase();
                    const patientName = discharge.patientName || (discharge.patient != null && typeof discharge.patient === 'object' ? (discharge.patient as any).fullName : '') || '';
                    const status = discharge.recoveryStatus || '';
                    return (
                      patientName.toLowerCase().includes(term) ||
                      status.toLowerCase().includes(term) ||
                      String(discharge.successRate ?? '').includes(term)
                    );
                  })
                  .map((discharge, index) => (
                  <tr key={discharge.id ?? (discharge as any)._id ?? `discharge-${index}`} className="border-b hover:bg-slate-50">
                    <td className="py-3 px-4">{discharge.patientName || (discharge.patient != null && typeof discharge.patient === 'object' ? (discharge.patient as any).fullName : '') || 'Unknown'}</td>
                    <td className="py-3 px-4">{new Date(discharge.dischargeDate).toLocaleDateString()}</td>
                    <td className="py-3 px-4">{discharge.recoveryDays || '-'} days</td>
                    <td className="py-3 px-4">
                      <Badge className={getRecoveryStatusColor(discharge.recoveryStatus)}>
                        {discharge.recoveryStatus}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">{discharge.successRate}%</td>
                    <td className="py-3 px-4 flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleExportPDF(discharge)}>
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(discharge.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {discharges.length === 0 && (
              <div className="text-center py-12 text-slate-500">No discharge records found. Create one to get started.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
