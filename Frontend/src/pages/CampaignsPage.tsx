import { useEffect, useMemo, useState } from 'react';
import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import type { Campaign, Worker } from '@/types';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, Eye, Megaphone, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const splitNames = (value: string) => value
  .split(/[\n,]+/)
  .map((name) => name.trim())
  .filter(Boolean);

const getDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getCampaignDateKey = (dateValue: string) => {
  if (!dateValue) return '';
  return dateValue.includes('T') ? dateValue.split('T')[0] : getDateKey(new Date(dateValue));
};

const getRuntimeWorkers = (): Worker[] => {
  try {
    const cachedWorkers = JSON.parse(localStorage.getItem('rcms_workers_cache') || '[]');
    if (Array.isArray(cachedWorkers) && cachedWorkers.length > 0) return cachedWorkers;

    const savedUsers = JSON.parse(localStorage.getItem('rcms_runtime_users') || '{}');
    return Object.values(savedUsers)
      .map((entry: any) => entry.user)
      .filter((savedUser: any) => savedUser?.role === 'worker')
      .map((savedUser: any) => ({
        id: savedUser.id || savedUser._id || savedUser.email,
        _id: savedUser._id || savedUser.id || savedUser.email,
        name: savedUser.name,
        email: savedUser.email,
        role: 'worker' as const,
        phone: savedUser.phone,
        isActive: savedUser.isActive,
      }));
  } catch {
    return [];
  }
};

const CampaignsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [completionCampaign, setCompletionCampaign] = useState<Campaign | null>(null);
  const [completionDescription, setCompletionDescription] = useState('');
  const [completionTeamMembers, setCompletionTeamMembers] = useState('');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const canAssign = user?.role === 'admin';
  const canComplete = user?.role === 'worker';
  const todayKey = getDateKey(new Date());

  const loadCampaigns = () => api.getCampaigns().then(setCampaigns);

  useEffect(() => {
    loadCampaigns();
    if (canAssign) {
      api.getWorkers()
        .then((data) => setWorkers(data.length ? data : getRuntimeWorkers()))
        .catch(() => setWorkers(getRuntimeWorkers()));
    }
  }, [canAssign]);

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    const visibleCampaigns = user?.role === 'worker'
      ? campaigns.filter((campaign) => {
          const workerIds = [user.id, user._id, user.email].filter(Boolean);
          return (
            workerIds.includes(campaign.assignedWorker) ||
            workerIds.includes((campaign as any).assignedWorkerKey) ||
            (campaign.assignedWorkerName || '').toLowerCase() === (user.name || '').toLowerCase()
          );
        })
      : campaigns;

    return visibleCampaigns.filter((campaign) => (
      campaign.placeName.toLowerCase().includes(term) ||
      (campaign.assignedWorkerName || '').toLowerCase().includes(term) ||
      campaign.sentByName.toLowerCase().includes(term) ||
      campaign.status.toLowerCase().includes(term)
    ));
  }, [campaigns, search, user]);

  const handleAdd = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    setIsLoading(true);
    try {
      const fd = new FormData(form);
      const assignedWorker = fd.get('assignedWorker') as string;
      const worker = workers.find((item) => (item.id || item._id || item.email) === assignedWorker);
      const newCampaign = await api.createCampaign({
        placeName: fd.get('placeName') as string,
        assignedWorker,
        assignedWorkerName: worker?.name || '',
        sentByName: user?.name || 'Admin',
        campaignDate: fd.get('campaignDate') as string,
        description: '',
        status: 'pending',
        teamMembers: [],
      });
      toast({ title: 'Campaign assigned successfully' });
      form.reset();
      setCampaigns((current) => [newCampaign, ...current.filter((campaign) => campaign.id !== newCampaign.id)]);
      setAddOpen(false);
      loadCampaigns();
    } catch (error) {
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Unable to save campaign', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const markCompleted = async () => {
    if (!completionCampaign) return;
    try {
      await api.updateCampaign(completionCampaign.id, {
        status: 'completed',
        description: completionDescription,
        teamMembers: splitNames(completionTeamMembers),
      });
      toast({ title: 'Campaign marked completed' });
      setCompletionCampaign(null);
      setCompletionDescription('');
      setCompletionTeamMembers('');
      loadCampaigns();
    } catch (error) {
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Unable to update campaign', variant: 'destructive' });
    }
  };

  const deleteCampaign = async (campaign: Campaign) => {
    if (!window.confirm('Delete this campaign?')) return;
    await api.deleteCampaign(campaign.id);
    toast({ title: 'Campaign deleted' });
    loadCampaigns();
  };

  return (
    <div>
      <PageHeader title="Campaigns" description={`${campaigns.length} campaign records`}>
        {canAssign && (
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" />Assign Campaign</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
              <DialogHeader><DialogTitle>Assign New Campaign</DialogTitle></DialogHeader>
              <form onSubmit={handleAdd} className="space-y-4">
                <div>
                  <Label>Place / Area Name</Label>
                  <Input name="placeName" placeholder="Example: City health camp, Sector 12" required />
                </div>
                <div>
                  <Label>Worker</Label>
                  <select
                    name="assignedWorker"
                    className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
                    required
                    defaultValue=""
                  >
                    <option value="" disabled>
                      {workers.length ? 'Select worker' : 'No workers found'}
                    </option>
                    {workers.map((worker) => (
                      <option key={worker.id || worker._id} value={worker.id || worker._id || ''}>
                        {worker.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label>Campaign Date</Label>
                    <Input name="campaignDate" type="date" defaultValue={new Date().toISOString().split('T')[0]} required />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save Campaign'}</Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </PageHeader>

      <div className="mb-4">
        <Input placeholder="Search campaigns..." value={search} onChange={(event) => setSearch(event.target.value)} />
      </div>

      <div className="rounded-xl border bg-card shadow-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Place</TableHead>
              <TableHead>Worker</TableHead>
              <TableHead>Sent By</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Team</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="py-8 text-center text-muted-foreground">No campaigns found</TableCell></TableRow>
            ) : filtered.map((campaign) => {
              const canCompleteToday = (
                canComplete &&
                campaign.status === 'pending' &&
                getCampaignDateKey(campaign.campaignDate) === todayKey
              );

              return (
                <TableRow key={campaign.id}>
                  <TableCell className="font-medium">{campaign.placeName}</TableCell>
                  <TableCell>{campaign.assignedWorkerName || 'N/A'}</TableCell>
                  <TableCell>{campaign.sentByName}</TableCell>
                  <TableCell>{new Date(campaign.campaignDate).toLocaleDateString()}</TableCell>
                  <TableCell>{campaign.teamMembers.length}</TableCell>
                  <TableCell><StatusBadge status={campaign.status} /></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" title="View campaign" onClick={() => setSelectedCampaign(campaign)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      {canCompleteToday && (
                        <Button variant="ghost" size="icon" title="Add report and complete" onClick={() => setCompletionCampaign(campaign)}>
                          <CheckCircle className="h-4 w-4 text-success" />
                        </Button>
                      )}
                      {canAssign && (
                        <Button variant="ghost" size="icon" title="Delete campaign" onClick={() => deleteCampaign(campaign)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedCampaign} onOpenChange={() => setSelectedCampaign(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Megaphone className="h-5 w-5" />Campaign Details</DialogTitle></DialogHeader>
          {selectedCampaign && (
            <div className="space-y-4 text-sm">
              <div className="grid gap-3 sm:grid-cols-2">
                <div><p className="text-muted-foreground">Place</p><p className="font-medium">{selectedCampaign.placeName}</p></div>
                <div><p className="text-muted-foreground">Date</p><p className="font-medium">{new Date(selectedCampaign.campaignDate).toLocaleDateString()}</p></div>
                <div><p className="text-muted-foreground">Campaign Done By</p><p className="font-medium">{selectedCampaign.assignedWorkerName || 'N/A'}</p></div>
                <div><p className="text-muted-foreground">Worker Sent By</p><p className="font-medium">{selectedCampaign.sentByName}</p></div>
                <div><p className="text-muted-foreground">Status</p><StatusBadge status={selectedCampaign.status} /></div>
                <div><p className="text-muted-foreground">Team Count</p><p className="font-medium">{selectedCampaign.teamMembers.length}</p></div>
              </div>
              <div>
                <p className="text-muted-foreground">Team Members</p>
                <p className="font-medium">{selectedCampaign.teamMembers.length ? selectedCampaign.teamMembers.join(', ') : 'No team members added'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Description</p>
                <p className="whitespace-pre-wrap rounded-lg bg-muted p-3">{selectedCampaign.description || 'Worker has not added the campaign description yet.'}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!completionCampaign} onOpenChange={() => {
        setCompletionCampaign(null);
        setCompletionDescription('');
        setCompletionTeamMembers('');
      }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Complete Campaign</DialogTitle></DialogHeader>
          {completionCampaign && (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted p-3 text-sm">
                <p className="font-medium">{completionCampaign.placeName}</p>
                <p className="text-muted-foreground">{new Date(completionCampaign.campaignDate).toLocaleDateString()}</p>
              </div>
              <div>
                <Label>People Who Went With Worker</Label>
                <Textarea
                  rows={3}
                  value={completionTeamMembers}
                  onChange={(event) => setCompletionTeamMembers(event.target.value)}
                  placeholder="Write names separated by comma or new line"
                />
              </div>
              <div>
                <Label>Campaign Description</Label>
                <Textarea
                  rows={5}
                  value={completionDescription}
                  onChange={(event) => setCompletionDescription(event.target.value)}
                  placeholder="Who came there, what happened, full campaign description..."
                  required
                />
              </div>
              <Button className="w-full" onClick={markCompleted} disabled={!completionDescription.trim()}>
                Save Description & Complete
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CampaignsPage;
