import { useEffect, useState } from 'react';
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

const roleConfig = {
  admin: { icon: Shield, color: 'bg-destructive/10 text-destructive' },
  worker: { icon: UserCog, color: 'bg-info/10 text-info' },
  staff: { icon: Stethoscope, color: 'bg-success/10 text-success' },
};

const UsersPage = () => {
  const { toast } = useToast();
  const [usersList, setUsersList] = useState<User[]>([]);
  const [addOpen, setAddOpen] = useState(false);

  const load = () => api.getUsers().then(setUsersList);
  useEffect(() => { load(); }, []);

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const role = fd.get('role') as User['role'];
    await api.createUser({
      name: fd.get('name') as string,
      email: fd.get('email') as string,
      role,
      phone: fd.get('phone') as string,
      isActive: true,
      password: fd.get('password') as string,
      staffRole: role === 'staff' ? (fd.get('staffRole') as string) : undefined,
    });
    toast({ title: 'User created successfully' });
    setAddOpen(false);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this user?')) return;
    await api.deleteUser(id);
    toast({ title: 'User deleted' });
    load();
  };

  return (
    <div>
      <PageHeader title="User Management" description="Manage system users and roles">
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Add User</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create New User</DialogTitle></DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div><Label>Full Name</Label><Input name="name" required /></div>
              <div><Label>Email</Label><Input name="email" type="email" required /></div>
              <div><Label>Password</Label><Input name="password" type="password" minLength={6} required /></div>
              <div><Label>Phone</Label><Input name="phone" /></div>
              <div>
                <Label>Role</Label>
                <select name="role" className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm" required>
                  <option value="worker">Worker</option>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <Label>Staff Role (if Staff)</Label>
                <select name="staffRole" className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm">
                  <option value="doctor">Doctor</option>
                  <option value="nurse">Nurse</option>
                  <option value="counselor">Counselor</option>
                </select>
              </div>
              <Button type="submit" className="w-full">Create User</Button>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="rounded-xl border bg-card shadow-card overflow-x-auto">
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
            {usersList.map((u) => {
              const cfg = roleConfig[u.role];
              const Icon = cfg.icon;
              return (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${cfg.color}`}>
                      <Icon className="h-3 w-3" />{u.role}
                    </span>
                  </TableCell>
                  <TableCell>{u.phone || '—'}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${u.isActive ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(u.id)} title="Delete" disabled={u.role === 'admin'}>
                      <Trash2 className={`h-4 w-4 ${u.role === 'admin' ? 'text-muted-foreground' : 'text-destructive'}`} />
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
