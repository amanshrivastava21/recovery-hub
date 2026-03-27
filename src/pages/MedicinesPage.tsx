import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import type { Medicine } from '@/types';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Trash2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const MedicinesPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);

  const load = () => api.getMedicines().then(setMedicines);
  useEffect(() => { load(); }, []);

  const filtered = medicines.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) || (m.category || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await api.createMedicine({
      name: fd.get('name') as string,
      description: fd.get('description') as string,
      category: fd.get('category') as string,
      stockQuantity: Number(fd.get('stockQuantity')),
      unit: fd.get('unit') as Medicine['unit'],
      manufacturer: fd.get('manufacturer') as string,
      expiryDate: fd.get('expiryDate') as string,
      isActive: true,
    });
    toast({ title: 'Medicine added' });
    setAddOpen(false);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this medicine?')) return;
    await api.deleteMedicine(id);
    toast({ title: 'Medicine deleted' });
    load();
  };

  const isLowStock = (qty: number) => qty < 100;
  const canEdit = user?.role === 'admin' || user?.role === 'staff';

  return (
    <div>
      <PageHeader title="Medicine Inventory" description={`${medicines.length} medicines in stock`}>
        {canEdit && (
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" />Add Medicine</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add New Medicine</DialogTitle></DialogHeader>
              <form onSubmit={handleAdd} className="space-y-4">
                <div><Label>Name</Label><Input name="name" required /></div>
                <div><Label>Description</Label><Input name="description" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Category</Label><Input name="category" /></div>
                  <div><Label>Manufacturer</Label><Input name="manufacturer" /></div>
                  <div><Label>Stock Qty</Label><Input name="stockQuantity" type="number" min="0" required /></div>
                  <div>
                    <Label>Unit</Label>
                    <select name="unit" className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm">
                      <option value="tablets">Tablets</option>
                      <option value="capsules">Capsules</option>
                      <option value="ml">ML</option>
                      <option value="mg">MG</option>
                      <option value="units">Units</option>
                    </select>
                  </div>
                  <div className="col-span-2"><Label>Expiry Date</Label><Input name="expiryDate" type="date" /></div>
                </div>
                <Button type="submit" className="w-full">Add Medicine</Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </PageHeader>

      <div className="mb-4 relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search medicines..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="rounded-xl border bg-card shadow-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Manufacturer</TableHead>
              <TableHead>Expiry</TableHead>
              {canEdit && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="py-8 text-center text-muted-foreground">No medicines found</TableCell></TableRow>
            ) : filtered.map((m) => (
              <TableRow key={m.id}>
                <TableCell className="font-medium">{m.name}</TableCell>
                <TableCell>{m.category || '—'}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {isLowStock(m.stockQuantity) && <AlertTriangle className="h-3.5 w-3.5 text-warning" />}
                    <span className={isLowStock(m.stockQuantity) ? 'text-warning font-medium' : ''}>{m.stockQuantity}</span>
                  </div>
                </TableCell>
                <TableCell className="capitalize">{m.unit}</TableCell>
                <TableCell>{m.manufacturer || '—'}</TableCell>
                <TableCell>{m.expiryDate ? new Date(m.expiryDate).toLocaleDateString() : '—'}</TableCell>
                {canEdit && (
                  <TableCell>
                    {user?.role === 'admin' && (
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(m.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default MedicinesPage;
