import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import type { StaffMember } from '@/types';
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

const StaffPage = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
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
    staffRole: '',
    department: '',
    phone: '',
    shift: 'morning'
  });

  useEffect(() => { loadStaff(); }, []);
  useEffect(() => {
    setSearch(searchParams.get('q') || '');
  }, [searchParams]);

  const loadStaff = async () => {
    try {
      const data = await api.getStaff();
      setStaff(data);
    } catch (error) {
      console.error('Failed to load staff:', error);
    }
  };

  const handleCreateStaff = async () => {
    const email = formData.email.trim().toLowerCase();
    const emailPattern = /^\S+@\S+\.\S+$/;

    if (!formData.name.trim()) {
      toast({ title: 'Validation Error', description: 'Name is required', variant: 'destructive' });
      return;
    }

    if (!email) {
      toast({ title: 'Validation Error', description: 'Email is required', variant: 'destructive' });
      return;
    }

    if (!emailPattern.test(email)) {
      toast({ title: 'Validation Error', description: 'Please enter a valid email address', variant: 'destructive' });
      return;
    }

    if (!formData.password.trim()) {
      toast({ title: 'Validation Error', description: 'Password is required', variant: 'destructive' });
      return;
    }

    if (!formData.staffRole) {
      toast({ title: 'Validation Error', description: 'Staff role is required', variant: 'destructive' });
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
      await api.createStaff({ ...formData, email });
      toast({ title: 'Success', description: 'Staff member created successfully' });
      setIsCreateDialogOpen(false);
      setFormData({
        name: '',
        email: '',
        password: '',
        staffRole: '',
        department: '',
        phone: '',
        shift: 'morning'
      });
      await loadStaff(); // Refresh the list
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create staff';
      console.error('Failed to create staff:', error);
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleViewStaff = async (id: string) => {
    try {
      const staffMember = await api.getStaffMember(id);
      setSelectedStaff(staffMember);
      setIsDetailDialogOpen(true);
    } catch (error) {
      console.error('Failed to load staff details:', error);
      toast({ title: 'Error', description: 'Unable to load staff details', variant: 'destructive' });
    }
  };

  const handleDeleteStaff = async (id: string) => {
    if (!window.confirm('Delete this staff member?')) return;
    try {
      await api.deleteStaff(id);
      toast({ title: 'Deleted', description: 'Staff member removed successfully' });
      await loadStaff();
      if (selectedStaff?._id === id || selectedStaff?.id === id) {
        setSelectedStaff(null);
        setIsDetailDialogOpen(false);
      }
    } catch (error) {
      console.error('Failed to delete staff:', error);
      toast({ title: 'Error', description: 'Unable to delete staff member', variant: 'destructive' });
    }
  };

  return (
    <div>
      <PageHeader title="Staff" description="Doctors, nurses, and counselors">
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Staff
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Staff Member</DialogTitle>
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="staffRole">Role *</Label>
                  <Select value={formData.staffRole} onValueChange={(value) => handleInputChange('staffRole', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="doctor">Doctor</SelectItem>
                      <SelectItem value="nurse">Nurse</SelectItem>
                      <SelectItem value="counselor">Counselor</SelectItem>
                      <SelectItem value="therapist">Therapist</SelectItem>
                      <SelectItem value="receptionist">Receptionist</SelectItem>
                      <SelectItem value="compounder">Compounder</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                  />
                </div>
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
                <Button onClick={handleCreateStaff} disabled={isLoading}>
                  {isLoading ? 'Creating...' : 'Create Staff'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <Dialog open={isDetailDialogOpen} onOpenChange={(open) => {
        if (!open) setSelectedStaff(null);
        setIsDetailDialogOpen(open);
      }}>
        <DialogContent className="max-w-lg sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedStaff?.user?.name || 'Staff Details'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            <div className="grid gap-3">
              <div>
                <p className="text-muted-foreground">Email</p>
                <p className="font-medium">{selectedStaff?.user?.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Password</p>
                <p className="font-medium">{selectedStaff?.loginPassword || 'Not available'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Role</p>
                <p className="font-medium capitalize">{selectedStaff?.staffRole || 'N/A'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Department</p>
                <p className="font-medium">{selectedStaff?.department || 'N/A'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Shift</p>
                <p className="font-medium capitalize">{selectedStaff?.shift || 'N/A'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <StatusBadge status={selectedStaff?.user?.isActive ? 'active' : 'inactive'} />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="rounded-xl border bg-card shadow-card overflow-x-auto mb-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Shift</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staff.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No staff members found
                </TableCell>
              </TableRow>
            ) : staff.filter((s) => {
              const term = search.toLowerCase();
              return (
                (s.user?.name || '').toLowerCase().includes(term) ||
                s.staffRole.toLowerCase().includes(term) ||
                (s.department || '').toLowerCase().includes(term)
              );
            }).map((s) => (
              <TableRow key={s._id ?? s.id}>
                <TableCell className="font-medium">{s.user?.name || 'Unknown Staff'}</TableCell>
                <TableCell>{s.user?.email || 'No email'}</TableCell>
                <TableCell className="capitalize">{s.staffRole}</TableCell>
                <TableCell>{s.department || '—'}</TableCell>
                <TableCell className="capitalize">{s.shift || 'N/A'}</TableCell>
                <TableCell><StatusBadge status={s.user?.isActive ? 'active' : 'inactive'} /></TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleViewStaff(s._id ?? s.id)} title="View staff">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteStaff(s._id ?? s.id)} title="Remove staff">
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

export default StaffPage;
