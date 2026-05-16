import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '@/services/api';
import type { User } from '@/types';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Shield, UserCog, Stethoscope } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import PasswordStrengthBar from '@/components/ui/PasswordStrengthBar';
import { validatePhone, validatePassword } from '@/utils/validators';

const roleConfig: Record<string, { icon: any; color: string }> = {
  admin: { icon: Shield, color: 'bg-destructive/10 text-destructive' },
  worker: { icon: UserCog, color: 'bg-info/10 text-info' },
  staff: { icon: Stethoscope, color: 'bg-success/10 text-success' },
  doctor: { icon: Stethoscope, color: 'bg-success/10 text-success' },
  nurse: { icon: Stethoscope, color: 'bg-success/10 text-success' },
  counselor: { icon: UserCog, color: 'bg-warning/10 text-warning' },
  receptionist: { icon: UserCog, color: 'bg-info/10 text-info' },
  compounder: { icon: Stethoscope, color: 'bg-success/10 text-success' }, // ✅ FIX added
};

const UsersPage = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [usersList, setUsersList] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('worker');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'worker',
    staffRole: '',
    department: '',
    specialization: ''
  });
  const [errors, setErrors] = useState({
    phone: '',
    password: ''
  });

  const load = async () => {
    try {
      const data = await api.getUsers();
      setUsersList(Array.isArray(data) ? data : []);
    } catch {
      setUsersList([]);
    }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => {
    setSearch(searchParams.get('q') || '');
  }, [searchParams]);

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({ phone: '', password: '' });

    // Validate phone if provided
    if (formData.phone) {
      const phoneValidation = validatePhone(formData.phone);
      if (!phoneValidation.valid) {
        setErrors(prev => ({ ...prev, phone: phoneValidation.message }));
        return;
      }
    }

    // Validate password
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.valid) {
      setErrors(prev => ({ ...prev, password: passwordValidation.message }));
      return;
    }

    setIsLoading(true);
    try {
      await api.createUser({
        name: formData.name,
        email: formData.email,
        role: formData.role as User['role'],
        phone: formData.phone,
        isActive: true,
        password: formData.password,
        staffRole: formData.staffRole || undefined,
        department: formData.department || undefined,
        specialization: formData.specialization || undefined,
      });

      toast({ title: 'User created successfully' });
      setFormData({
        name: '',
        email: '',
        password: '',
        phone: '',
        role: 'worker',
        staffRole: '',
        department: '',
        specialization: ''
      });
      setSelectedRole('worker');
      setAddOpen(false);
      load();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create user'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this user?')) return;
    setIsLoading(true);
    try {
      await api.deleteUser(id);
      toast({ title: 'User deleted' });
      load();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete user'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title="User Management" description="Manage system users and roles">
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Add User</Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <Label>Full Name</Label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
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
              <div>
                <Label>Phone</Label>
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData({ ...formData, phone: e.target.value });
                    if (e.target.value) setErrors(prev => ({ ...prev, phone: '' }));
                  }}
                  placeholder="10-digit phone number"
                />
                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
              </div>

              <div>
                <Label>Role</Label>
                <select
                  name="role"
                  required
                  value={selectedRole}
                  onChange={(e) => {
                    setSelectedRole(e.target.value);
                    setFormData({ ...formData, role: e.target.value });
                  }}
                  className="flex h-10 w-full rounded-md border px-3 py-2 text-sm"
                >
                  <option value="">Select Role</option>
                  <option value="admin">Admin</option>
                  <option value="worker">Worker</option>
                  <option value="staff">Staff</option>
                </select>
              </div>

              {selectedRole === 'worker' && (
                <>
                  <Input
                    name="specialization"
                    placeholder="Specialization"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  />
                  <Input
                    name="department"
                    placeholder="Department"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  />
                </>
              )}

              {selectedRole === 'staff' && (
                <>
                  <select
                    name="staffRole"
                    value={formData.staffRole}
                    onChange={(e) => setFormData({ ...formData, staffRole: e.target.value })}
                    className="flex h-10 w-full border px-3 py-2 text-sm"
                  >
                    <option value="">Select Staff Role</option>
                    <option value="doctor">Doctor</option>
                    <option value="nurse">Nurse</option>
                    <option value="counselor">Counselor</option>
                    <option value="compounder">Compounder</option>
                  </select>
                  <Input
                    name="department"
                    placeholder="Department"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  />
                  <Input
                    name="specialization"
                    placeholder="Specialization"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  />
                </>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create User'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="rounded-xl border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {usersList
              ?.filter((u) => u && u.name)
              .filter((u) => {
                const term = search.toLowerCase();
                return (
                  u.name?.toLowerCase().includes(term) ||
                  u.email?.toLowerCase().includes(term) ||
                  u.role?.toLowerCase().includes(term) ||
                  (u.phone || '').toLowerCase().includes(term)
                );
              })
              .map((u) => {
                const cfg = roleConfig[u.role] ?? {
                  icon: UserCog,
                  color: 'bg-muted text-muted-foreground'
                };

                const Icon = cfg.icon;
                const userId = u.id || (u as any)._id;

                return (
                  <TableRow key={userId}>
                    <TableCell>{u.name}</TableCell>
                    <TableCell>{u.email}</TableCell>

                    <TableCell>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded ${cfg.color}`}>
                        <Icon className="h-3 w-3" />
                        {u.role || 'unknown'}
                      </span>
                    </TableCell>

                    <TableCell>{u.phone || '—'}</TableCell>

                    <TableCell>
                      <span className={`px-2 py-1 text-xs rounded ${u.isActive ? 'bg-green-100' : 'bg-red-100'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>

                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={u.role === 'admin'}
                        onClick={() => handleDelete(userId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default UsersPage;