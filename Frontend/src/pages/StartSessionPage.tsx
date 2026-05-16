import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, User, FileText, CheckCircle, MessageSquare, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/services/api';
import type { Visit } from '@/types';

interface SessionNotes {
  id: string;
  timestamp: string;
  note: string;
  addedBy: string;
}

export default function StartSessionPage() {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const { toast } = useToast();
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [visit, setVisit] = useState<Visit | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionNotes, setSessionNotes] = useState<SessionNotes[]>([]);
  const [currentNote, setCurrentNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchVisit = async () => {
      try {
        if (sessionId) {
          const visits = await api.getVisits();
          const foundVisit = visits.find(v => v.id === sessionId);
          if (foundVisit) {
            setVisit(foundVisit);
            // Initialize notes if they exist
            setSessionNotes([]);
          }
        }
      } catch (err) {
        console.error('Failed to fetch visit:', err);
        toast({
          title: 'Error',
          description: 'Failed to load session data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchVisit();
  }, [sessionId, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!visit) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <p className="text-muted-foreground">Session not found</p>
        <Button onClick={() => navigate('/sessions')} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Sessions
        </Button>
      </div>
    );
  }

  // Format session data from visit
  const sessionData = {
    id: visit.id,
    patientName: visit.patientName || 'Patient',
    patientId: visit.patient,
    patientAvatar: (visit.patientName || 'P').charAt(0),
    therapistName: visit.workerName || 'Staff',
    sessionType: visit.visitType === 'individual' ? 'Individual' : visit.visitType === 'group' ? 'Group' : 'Session',
    date: new Date(visit.visitDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
    time: new Date(visit.visitDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    duration: 45,
    status: 'in-progress',
    diagnosis: visit.patientCondition || 'Session',
    planTitle: 'Treatment Plan',
  };

  const handleStartSession = () => {
    setIsSessionActive(true);
    toast({
      title: 'Session Started',
      description: 'Session is now active',
    });
  };

  const handleAddNote = async () => {
    if (!currentNote.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a note',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      const newNote: SessionNotes = {
        id: Math.random().toString(),
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
        note: currentNote,
        addedBy: 'Current User',
      };

      setSessionNotes(prev => [newNote, ...prev]);
      setCurrentNote('');
      toast({
        title: 'Success',
        description: 'Note added successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add note',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEndSession = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast({
        title: 'Success',
        description: 'Session ended successfully',
      });
      navigate('/sessions/today');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to end session',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {isSessionActive ? 'Active Session' : 'Start Session'}
                </h1>
                <p className="text-sm text-slate-600 mt-1">{sessionData.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isSessionActive && (
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-blue-700">In Progress</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isSessionActive ? (
          /* Session Overview - Before Start */
          <div className="space-y-6">
            {/* Patient Info Card */}
            <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-l-4 border-l-emerald-600">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xl">
                    {sessionData.patientAvatar}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900">{sessionData.patientName}</h3>
                    <p className="text-sm text-slate-600">ID: {sessionData.patientId}</p>
                    <p className="text-sm text-slate-600 mt-1">Diagnosis: {sessionData.diagnosis}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-600 mb-2">Assigned Therapist</p>
                    <p className="font-semibold text-slate-900">{sessionData.therapistName}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Session Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-0 shadow-sm">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Clock className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                    <p className="text-sm text-slate-600 mb-2">Session Time</p>
                    <p className="font-semibold text-slate-900">{sessionData.time}</p>
                    <p className="text-xs text-slate-500 mt-1">{sessionData.duration} minutes</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <User className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm text-slate-600 mb-2">Session Type</p>
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                      {sessionData.sessionType}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <FileText className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-sm text-slate-600 mb-2">Treatment Plan</p>
                    <p className="font-semibold text-slate-900 text-sm">{sessionData.planTitle}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Start Button */}
            <div className="flex justify-center pt-6">
              <Button
                onClick={handleStartSession}
                size="lg"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8"
              >
                <Clock className="w-5 h-5 mr-2" />
                Start Session Now
              </Button>
            </div>
          </div>
        ) : (
          /* Active Session */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Notes Area */}
            <div className="lg:col-span-2 space-y-6">
              {/* Add Note Form */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-emerald-600" />
                    Add Session Notes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    value={currentNote}
                    onChange={(e) => setCurrentNote(e.target.value)}
                    placeholder="Document the session progress, observations, interventions used, patient response, and any recommendations..."
                    className="border-slate-200 resize-none min-h-[150px]"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleAddNote}
                      disabled={isSaving}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {isSaving ? 'Saving...' : 'Add Note'}
                    </Button>
                    <Button
                      variant="outline"
                      className="border-slate-300 ml-auto"
                      onClick={handleEndSession}
                    >
                      End Session
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Session Notes Timeline */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Session Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {sessionNotes.map((note) => (
                      <div key={note.id} className="flex gap-4 pb-4 border-b border-slate-200 last:border-0">
                        <div className="w-2 h-2 mt-2 rounded-full bg-emerald-600 flex-shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <p className="text-sm font-semibold text-slate-900">{note.addedBy}</p>
                            <p className="text-xs text-slate-500">{note.timestamp}</p>
                          </div>
                          <p className="text-sm text-slate-700">{note.note}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - Session Info */}
            <div className="space-y-6">
              <Card className="border-0 shadow-sm bg-emerald-50 border-l-4 border-l-emerald-600">
                <CardHeader>
                  <CardTitle className="text-base">Patient Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <p className="text-slate-600 mb-1">Name</p>
                    <p className="font-semibold text-slate-900">{sessionData.patientName}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 mb-1">ID</p>
                    <p className="font-semibold text-slate-900">{sessionData.patientId}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 mb-1">Diagnosis</p>
                    <p className="font-semibold text-slate-900">{sessionData.diagnosis}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 mb-1">Therapist</p>
                    <p className="font-semibold text-slate-900">{sessionData.therapistName}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">Session Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <p className="text-slate-600 mb-1">Date</p>
                    <p className="font-semibold text-slate-900">{sessionData.date}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 mb-1">Time</p>
                    <p className="font-semibold text-slate-900">{sessionData.time}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 mb-1">Duration</p>
                    <p className="font-semibold text-slate-900">{sessionData.duration} minutes</p>
                  </div>
                  <div>
                    <p className="text-slate-600 mb-1">Type</p>
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 text-xs">
                      {sessionData.sessionType}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
