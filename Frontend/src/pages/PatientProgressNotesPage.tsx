import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import type { Patient } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ClipboardList, Calendar, User
} from 'lucide-react';

const PatientProgressNotesPage = () => {
  const { user } = useAuth();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const myPatient = await api.getMyPatient();
        if (myPatient) {
          setPatient(myPatient);
        }
      } catch (err) {
        console.error('Failed to fetch patient data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading progress notes...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl gradient-primary p-6 md:p-8 shadow-elevated">
        <div className="flex items-center gap-3 mb-2">
          <ClipboardList className="h-6 w-6 text-primary-foreground" />
          <h1 className="font-display text-2xl md:text-3xl font-bold text-primary-foreground">
            My Progress Notes
          </h1>
        </div>
        <p className="text-primary-foreground/80">Track your recovery journey with detailed progress notes</p>
      </div>

      {patient && patient.progressNotes && patient.progressNotes.length > 0 ? (
        <div className="space-y-4">
          {[...patient.progressNotes].reverse().map((note, index) => (
            <Card key={index} className="shadow-card border-border/50">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="h-2 w-2 rounded-full bg-primary mt-1" />
                      <p className="text-sm font-medium text-muted-foreground">
                        {new Date(note.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(note.date).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed mb-3">
                      {note.note}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span>Added by {note.addedBy}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="shadow-card border-border/50">
          <CardContent className="p-8 text-center">
            <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No progress notes yet.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Your healthcare provider will add progress notes to track your recovery.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Stats Card */}
      {patient && patient.progressNotes && patient.progressNotes.length > 0 && (
        <Card className="shadow-card border-border/50 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="p-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Total Notes</p>
                <p className="text-2xl font-bold text-foreground">{patient.progressNotes.length}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Latest Update</p>
                <p className="text-sm font-semibold text-foreground">
                  {new Date(patient.progressNotes[patient.progressNotes.length - 1].date).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">First Note</p>
                <p className="text-sm font-semibold text-foreground">
                  {new Date(patient.progressNotes[0].date).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PatientProgressNotesPage;
