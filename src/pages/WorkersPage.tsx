import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import type { Worker } from '@/types';
import PageHeader from '@/components/PageHeader';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UserCog, Star } from 'lucide-react';

const WorkersPage = () => {
  const [workers, setWorkers] = useState<Worker[]>([]);

  useEffect(() => { api.getWorkers().then(setWorkers); }, []);

  return (
    <div>
      <PageHeader title="Workers" description="Rehabilitation workers and their assignments" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        {workers.map((w) => (
          <div key={w.id} className="rounded-xl border bg-card p-5 shadow-card">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-info/10 text-info">
                <UserCog className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{w.user.name}</h3>
                <p className="text-sm text-muted-foreground">{w.user.email}</p>
                {w.specialization && <p className="text-xs text-muted-foreground mt-1">{w.specialization}</p>}
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between border-t pt-3">
              <span className="text-sm text-muted-foreground">{w.assignedPatients.length} patients assigned</span>
              <div className="flex items-center gap-1 text-sm">
                <Star className="h-3.5 w-3.5 text-warning" />
                <span className="font-medium">{w.performanceScore}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border bg-card shadow-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Specialization</TableHead>
              <TableHead>Patients</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workers.map((w) => (
              <TableRow key={w.id}>
                <TableCell className="font-medium">{w.user.name}</TableCell>
                <TableCell>{w.user.email}</TableCell>
                <TableCell>{w.specialization || '—'}</TableCell>
                <TableCell>{w.assignedPatients.length}</TableCell>
                <TableCell>{w.performanceScore}/100</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${w.user.isActive ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                    {w.user.isActive ? 'Active' : 'Inactive'}
                  </span>
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
