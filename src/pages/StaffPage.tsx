import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import type { StaffMember } from '@/types';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Stethoscope } from 'lucide-react';

const StaffPage = () => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  useEffect(() => { api.getStaff().then(setStaff); }, []);

  const roleIcons: Record<string, string> = {
    doctor: 'bg-primary/10 text-primary',
    nurse: 'bg-success/10 text-success',
    counselor: 'bg-info/10 text-info',
  };

  return (
    <div>
      <PageHeader title="Staff" description="Doctors, nurses, and counselors" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        {staff.map((s) => (
          <div key={s.id} className="rounded-xl border bg-card p-5 shadow-card">
            <div className="flex items-start gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${roleIcons[s.staffRole] || 'bg-muted'}`}>
                <Stethoscope className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{s.user.name}</h3>
                <p className="text-sm capitalize text-muted-foreground">{s.staffRole}</p>
                {s.department && <p className="text-xs text-muted-foreground">{s.department}</p>}
              </div>
            </div>
            <div className="mt-4 border-t pt-3 text-sm text-muted-foreground">
              {s.schedule || 'No schedule set'}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border bg-card shadow-card overflow-x-auto">
        <h3 className="px-4 pt-4 font-display font-semibold">Recent Attendance</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Staff</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staff.flatMap(s =>
              s.attendance.map((a, i) => (
                <TableRow key={`${s.id}-${i}`}>
                  <TableCell className="font-medium">{s.user.name}</TableCell>
                  <TableCell className="capitalize">{s.staffRole}</TableCell>
                  <TableCell>{new Date(a.date).toLocaleDateString()}</TableCell>
                  <TableCell><StatusBadge status={a.status} /></TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default StaffPage;
