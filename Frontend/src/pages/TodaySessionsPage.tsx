import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MessageSquare, MoreVertical, Play, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api } from '@/services/api';
import type { Visit } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SessionCard {
  id: string;
  time: string;
  patientName: string;
  patientId: string;
  patientAvatar: string;
  sessionType: 'Individual' | 'Group' | 'Evaluation';
  duration: number;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  therapistName: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-amber-100 text-amber-800 border-amber-300';
    case 'in-progress':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'completed':
      return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    case 'cancelled':
      return 'bg-red-100 text-red-800 border-red-300';
    default:
      return 'bg-slate-100 text-slate-800 border-slate-300';
  }
};

const getStatusDot = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-amber-500';
    case 'in-progress':
      return 'bg-blue-500';
    case 'completed':
      return 'bg-emerald-500';
    case 'cancelled':
      return 'bg-red-500';
    default:
      return 'bg-slate-500';
  }
};

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  'in-progress': 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

// Mock data - replace with API call
const mockSessions: SessionCard[] = [];

type FilterTab = 'all' | 'pending' | 'in-progress' | 'completed' | 'cancelled';

export default function TodaySessionsPage() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVisits = async () => {
      try {
        const data = await api.getVisits();
        setVisits(data);
      } catch (err) {
        console.error('Failed to fetch visits:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchVisits();
  }, []);

  // Get today's date
  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Convert visits to session cards
  const sessionCards: SessionCard[] = visits.map(v => ({
    id: v.id,
    time: new Date(v.visitDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    patientName: v.patientName,
    patientId: v.patient,
    patientAvatar: v.patientName?.charAt(0) || 'P',
    sessionType: (v.visitType === 'individual' ? 'Individual' : v.visitType === 'group' ? 'Group' : 'Evaluation') as 'Individual' | 'Group' | 'Evaluation',
    duration: 45,
    status: (v.patientCondition || 'pending') as 'pending' | 'in-progress' | 'completed' | 'cancelled',
    therapistName: v.workerName,
  }));

  // Filter sessions
  const filteredSessions =
    activeFilter === 'all'
      ? sessionCards
      : sessionCards.filter(s => s.status === activeFilter);

  // Calculate stats
  const stats = {
    total: sessionCards.length,
    completed: sessionCards.filter(s => s.status === 'completed').length,
    pending: sessionCards.filter(s => s.status === 'pending').length,
    cancelled: sessionCards.filter(s => s.status === 'cancelled').length,
  };

  const handleStartSession = (session: SessionCard) => {
    // Navigate to session detail page
    navigate(`/sessions/${session.id}/start`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Today's Sessions</h1>
              <p className="text-sm text-slate-600 mt-1">{dateString}</p>
            </div>
            <Button
              onClick={() => navigate('/sessions/new')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Session
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-slate-600 mb-2">Total Sessions</p>
                <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-slate-600 mb-2">Completed</p>
                <p className="text-3xl font-bold text-emerald-600">{stats.completed}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-slate-600 mb-2">Pending</p>
                <p className="text-3xl font-bold text-amber-600">{stats.pending}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-slate-600 mb-2">Cancelled</p>
                <p className="text-3xl font-bold text-red-600">{stats.cancelled}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 border-b border-slate-200 pb-4">
          {(['all', 'pending', 'in-progress', 'completed', 'cancelled'] as FilterTab[]).map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  activeFilter === tab
                    ? 'bg-emerald-100 text-emerald-700 border-b-2 border-emerald-600'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}
              </button>
            )
          )}
        </div>

        {/* Sessions List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-emerald-600" />
          </div>
        ) : filteredSessions.length > 0 ? (
          <div className="space-y-4">
            {filteredSessions.map((session) => (
              <Card key={session.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* Time */}
                    <div className="flex-shrink-0 w-20">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-500" />
                        <span className="font-semibold text-slate-900 text-sm">{session.time}</span>
                      </div>
                    </div>

                    {/* Patient Info */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                        {session.patientAvatar}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-900 truncate">{session.patientName}</p>
                        <p className="text-xs text-slate-500">ID: {session.patientId}</p>
                      </div>
                    </div>

                    {/* Session Type & Duration */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <Badge variant="outline" className="border-slate-300 text-slate-700">
                        {session.sessionType}
                      </Badge>
                      <Badge variant="outline" className="border-slate-300 text-slate-700">
                        {session.duration} mins
                      </Badge>
                    </div>

                    {/* Status Badge */}
                    <div className="flex-shrink-0">
                      <Badge className={`${getStatusColor(session.status)} border`}>
                        {statusLabels[session.status]}
                      </Badge>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 flex-shrink-0 pt-4 md:pt-0 md:pl-4 border-t md:border-t-0 md:border-l border-slate-200">
                      {session.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => handleStartSession(session)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          <Play className="w-3 h-3 mr-1" />
                          Start
                        </Button>
                      )}

                      {session.status === 'in-progress' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-slate-300"
                          onClick={() => handleStartSession(session)}
                        >
                          <Play className="w-3 h-3 mr-1" />
                          Resume
                        </Button>
                      )}

                      <button
                        aria-label="Add note"
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <MessageSquare className="w-4 h-4 text-slate-600" />
                      </button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            aria-label="More options"
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <MoreVertical className="w-4 h-4 text-slate-600" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Edit Session</DropdownMenuItem>
                          <DropdownMenuItem>Reschedule</DropdownMenuItem>
                          {session.status !== 'cancelled' && (
                            <DropdownMenuItem className="text-red-600">Cancel Session</DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <Clock className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No sessions scheduled for today
            </h3>
            <p className="text-sm text-slate-600 mb-6">
              Click '+ New Session' to schedule one
            </p>
            <Button
              onClick={() => navigate('/sessions/new')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create First Session
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
