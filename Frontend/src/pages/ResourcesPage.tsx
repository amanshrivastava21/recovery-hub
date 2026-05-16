import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '@/services/api';
import type { Resource } from '@/types';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Link } from 'lucide-react';

const ResourcesPage = () => {
  const [searchParams] = useSearchParams();
  const [resources, setResources] = useState<Resource[]>([]);
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchResources = async () => {
    try {
      console.log('[resources] fetchResources start');
      setLoading(true);
      const data = await api.getResources();
      console.log('[resources] fetched resources', data);
      setResources(data);
    } catch (error) {
      console.error('[resources] fetchResources error', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);
  useEffect(() => {
    setSearch(searchParams.get('q') || '');
  }, [searchParams]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newResource = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      category: formData.get('category') as Resource['category'],
      link: (formData.get('link') as string) || undefined,
      phone: (formData.get('phone') as string) || undefined,
      address: (formData.get('address') as string) || undefined,
    };

    try {
      console.log('[resources] submit resource', newResource);
      await api.createResource(newResource);
      console.log('[resources] resource created successfully');
      setAddOpen(false);
      await fetchResources();
    } catch (error) {
      console.error('[resources] createResource error', error);
    }
  };

  return (
    <div>
      <PageHeader title="Resources" description="Manage rehabilitation resources and links">
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Add Resource</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader><DialogTitle>Add Resource</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><Label>Title</Label><Input name="title" required /></div>
              <div><Label>Description</Label><Textarea name="description" rows={4} required /></div>
              <div><Label>Category</Label><Input name="category" placeholder="mental-health | physical-health | support-group | emergency | education | other" required /></div>
              <div><Label>Link</Label><Input name="link" /></div>
              <div><Label>Phone</Label><Input name="phone" /></div>
              <div><Label>Address</Label><Input name="address" /></div>
              <Button type="submit" className="w-full">Save Resource</Button>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="rounded-xl border bg-card shadow-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Link</TableHead>
              <TableHead>Contact</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {resources.filter((resource) => {
              const term = search.toLowerCase();
              return (
                resource.title.toLowerCase().includes(term) ||
                resource.category.toLowerCase().includes(term) ||
                resource.description.toLowerCase().includes(term) ||
                (resource.phone || '').toLowerCase().includes(term) ||
                (resource.address || '').toLowerCase().includes(term)
              );
            }).length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  {loading ? 'Loading resources...' : 'No resources available.'}
                </TableCell>
              </TableRow>
            ) : resources.filter((resource) => {
              const term = search.toLowerCase();
              return (
                resource.title.toLowerCase().includes(term) ||
                resource.category.toLowerCase().includes(term) ||
                resource.description.toLowerCase().includes(term) ||
                (resource.phone || '').toLowerCase().includes(term) ||
                (resource.address || '').toLowerCase().includes(term)
              );
            }).map((resource) => (
              <TableRow key={resource.id}>
                <TableCell className="font-medium">{resource.title}</TableCell>
                <TableCell>{resource.category}</TableCell>
                <TableCell>{resource.description}</TableCell>
                <TableCell>
                  {resource.link ? (
                    <a href={resource.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary">
                      <Link className="h-4 w-4" />Visit
                    </a>
                  ) : '—'}
                </TableCell>
                <TableCell>{resource.phone || resource.address || '—'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ResourcesPage;
