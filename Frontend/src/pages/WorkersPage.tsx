import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import type { Worker } from '@/types';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Eye, Trash2 } from 'lucide-react';
import PasswordStrengthBar from '@/components/ui/PasswordStrengthBar';
import { validatePhone, validatePassword } from '@/utils/validators';

const WorkersPage = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [search, setSearch] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({ phone: '', password: '' });

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    shift: 'flexible'
  });

  useEffect(() => { loadWorkers(); }, []);
  useEffect(() => {
    setSearch(searchParams.get('q') || '');
  }, [searchParams]);

  const loadWorkers = async () => {
    try {
      const data = await api.getWorkers();
      setWorkers(data);
      localStorage.setItem('rcms_workers_cache', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to load workers:', error);
    }
  };

  const handleCreateWorker = async () => {
    // Validation
    if (!formData.name.trim()) {
      toast({ title: 'Validation Error', description: 'Name is required', variant: 'destructive' });
      return;
    }
    if (!formData.email.trim()) {
      toast({ title: 'Validation Error', description: 'Email is required', variant: 'destructive' });
      return;
    }
    if (!formData.password.trim()) {
      toast({ title: 'Validation Error', description: 'Password is required', variant: 'destructive' });
      return;
    }

    setErrors({ phone: '', password: '' });
    if (formData.phone) {
      const phoneVal = validatePhone(formData.phone);
      if (!phoneVal.valid) {
        toast({ title: 'Error', description: phoneVal.message, variant: 'destructive' });
        return;
      }
    }
    const passVal = validatePassword(formData.password);
    if (!passVal.valid) {
      toast({ title: 'Error', description: passVal.message, variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const createdWorker = await api.createWorker(formData);
      const nextWorkers = [...workers.filter((worker) => worker.email !== createdWorker.email), createdWorker];
      setWorkers(nextWorkers);
      localStorage.setItem('rcms_workers_cache', JSON.stringify(nextWorkers));
      toast({ title: 'Success', description: 'Worker created successfully' });
      setIsCreateDialogOpen(false);
      setFormData({
        name: '',
        email: '',
        password: '',
        phone: '',
        address: '',
        shift: 'flexible'
      });
      await loadWorkers(); // Refresh the list
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create worker';
      console.error('Failed to create worker:', error);
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleViewWorker = async (id: string) => {
    try {
      const worker = await api.getWorker(id);
      setSelectedWorker(worker);
      setIsDetailDialogOpen(true);
    } catch (error) {
      console.error('Failed to load worker details:', error);
      toast({ title: 'Error', description: 'Unable to load worker details', variant: 'destructive' });
    }
  };

  const handleDeleteWorker = async (id: string) => {
    if (!window.confirm('Delete this worker?')) return;
    try {
      await api.deleteWorker(id);
      toast({ title: 'Deleted', description: 'Worker removed successfully' });
      await loadWorkers();
      if (selectedWorker?._id === id || selectedWorker?.id === id) {
        setSelectedWorker(null);
        setIsDetailDialogOpen(false);
      }
    } catch (error) {
      console.error('Failed to delete worker:', error);
      toast({ title: 'Error', description: 'Unable to delete worker', variant: 'destructive' });
    }
  };

  return (
    <div>
      <PageHeader title="Workers" description="Rehabilitation workers and their assignments">
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Worker
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Worker</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    required
                  />
                  <PasswordStrengthBar password={formData.password} />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                  {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="shift">Shift</Label>
                <Select value={formData.shift} onValueChange={(value) => handleInputChange('shift', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select shift" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Morning</SelectItem>
                    <SelectItem value="afternoon">Afternoon</SelectItem>
                    <SelectItem value="night">Night</SelectItem>
                    <SelectItem value="flexible">Flexible</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateWorker} disabled={isLoading}>
                  {isLoading ? 'Creating...' : 'Create Worker'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <Dialog open={isDetailDialogOpen} onOpenChange={(open) => {
        if (!open) setSelectedWorker(null);
        setIsDetailDialogOpen(open);
      }}>
        <DialogContent className="max-w-lg sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedWorker?.name || 'Worker Details'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            <div className="grid gap-3">
              <div>
                <p className="text-muted-foreground">Email</p>
                <p className="font-medium">{selectedWorker?.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Phone</p>
                <p className="font-medium">{selectedWorker?.phone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Address</p>
                <p className="font-medium">{selectedWorker?.address || 'N/A'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Shift</p>
                <p className="font-medium">{selectedWorker?.shift || 'Flexible'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Assigned patients</p>
                <p className="font-medium">{selectedWorker?.assignedPatients?.length ?? 0}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <StatusBadge status={selectedWorker?.isActive ? 'active' : 'inactive'} />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="rounded-xl border bg-card shadow-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Shift</TableHead>
              <TableHead>Patients</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workers.filter((w) => {
              const term = search.toLowerCase();
              return (
                (w.name?.toLowerCase() || '').includes(term) ||
                (w.email?.toLowerCase() || '').includes(term)
              );
            }).map((w) => (
              <TableRow key={w._id ?? w.id}>
                <TableCell className="font-medium">{w.name || 'Unknown'}</TableCell>
                <TableCell>{w.email || 'No email'}</TableCell>
                <TableCell>{w.shift || 'Flexible'}</TableCell>
                <TableCell>{w.assignedPatients?.length || 0}</TableCell>
                <TableCell><StatusBadge status={w.isActive ? 'active' : 'inactive'} /></TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleViewWorker(w._id ?? w.id)} title="View worker">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteWorker(w._id ?? w.id)} title="Remove worker">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default WorkersPage;
