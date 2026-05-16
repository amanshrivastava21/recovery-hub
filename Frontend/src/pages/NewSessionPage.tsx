import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/services/api';
import type { Patient, StaffMember } from '@/types';

export default function NewSessionPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [therapists, setTherapists] = useState<StaffMember[]>([]);
  const [formData, setFormData] = useState({
    patientId: '',
    sessionType: 'individual',
    date: new Date().toISOString().split('T')[0],
    startTime: '10:00',
    duration: 45,
    therapistId: '',
    notes: '',
  });

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [patientsData, staffData] = await Promise.all([
          api.getPatients(),
          api.getStaff(),
        ]);

        setPatients(patientsData);
        setTherapists(
          staffData.filter((member) =>
            ['therapist', 'counselor'].includes(member.staffRole),
          ),
        );
      } catch (error) {
        console.error('Failed to load session form options:', error);
        toast({
          title: 'Error',
          description: 'Failed to load patients and therapists',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingOptions(false);
      }
    };

    loadOptions();
  }, [toast]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Success',
        description: 'Session scheduled successfully',
      });
      navigate('/sessions/today');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create session',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Schedule New Session</h1>
              <p className="text-sm text-slate-600 mt-1">Create a new therapy session</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Session Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Patient Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="patientId" className="text-sm font-semibold text-slate-700 mb-2 block">
                    Patient *
                  </Label>
                  <Select value={formData.patientId} onValueChange={(val) => handleInputChange('patientId', val)}>
                    <SelectTrigger id="patientId" className="border-slate-200">
                      <SelectValue placeholder="Select patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.length > 0 ? (
                        patients.map((patient) => {
                          const patientId = (patient as any)._id ?? patient.id;
                          return (
                            <SelectItem key={patientId} value={patientId}>
                              {patient.fullName}
                            </SelectItem>
                          );
                        })
                      ) : (
                        <SelectItem value="no-patients" disabled>
                          {isLoadingOptions ? 'Loading patients...' : 'No patients found'}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="therapistId" className="text-sm font-semibold text-slate-700 mb-2 block">
                    Therapist / Counselor
                  </Label>
                  <Select value={formData.therapistId} onValueChange={(val) => handleInputChange('therapistId', val)}>
                    <SelectTrigger id="therapistId" className="border-slate-200">
                      <SelectValue placeholder="Select therapist" />
                    </SelectTrigger>
                    <SelectContent>
                      {therapists.length > 0 ? (
                        therapists.map((member) => {
                          const staffId = member._id ?? member.id;
                          const roleLabel = member.staffRole === 'counselor' ? 'Counselor' : 'Therapist';
                          return (
                            <SelectItem key={staffId} value={staffId}>
                              {member.user?.name || roleLabel}
                            </SelectItem>
                          );
                        })
                      ) : (
                        <SelectItem value="no-therapists" disabled>
                          {isLoadingOptions ? 'Loading therapists...' : 'No therapists found'}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Session Type & Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="sessionType" className="text-sm font-semibold text-slate-700 mb-2 block">
                    Session Type
                  </Label>
                  <Select value={formData.sessionType} onValueChange={(val) => handleInputChange('sessionType', val)}>
                    <SelectTrigger id="sessionType" className="border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">Individual</SelectItem>
                      <SelectItem value="group">Group</SelectItem>
                      <SelectItem value="evaluation">Evaluation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="date" className="text-sm font-semibold text-slate-700 mb-2 block">
                    Date
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className="border-slate-200"
                  />
                </div>
              </div>

              {/* Time & Duration */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="startTime" className="text-sm font-semibold text-slate-700 mb-2 block">
                    Start Time
                  </Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => handleInputChange('startTime', e.target.value)}
                    className="border-slate-200"
                  />
                </div>

                <div>
                  <Label htmlFor="duration" className="text-sm font-semibold text-slate-700 mb-2 block">
                    Duration (minutes)
                  </Label>
                  <Input
                    id="duration"
                    type="number"
                    min="15"
                    max="180"
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 0)}
                    className="border-slate-200"
                  />
                </div>

                <div>
                  <Label className="text-sm font-semibold text-slate-700 mb-2 block">
                    End Time (Calculated)
                  </Label>
                  <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <p className="text-sm font-medium text-slate-900">
                      {new Date(`2000-01-01T${formData.startTime}:00`).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })} 
                      {' - '}
                      {new Date(new Date(`2000-01-01T${formData.startTime}:00`).getTime() + formData.duration * 60000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="notes" className="text-sm font-semibold text-slate-700 mb-2 block">
                  Session Notes
                </Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Add any notes for this session..."
                  className="border-slate-200 resize-none min-h-[120px]"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6 border-t border-slate-200">
                <Button
                  type="button"
                  variant="outline"
                  className="border-slate-300"
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white ml-auto"
                >
                  {isSubmitting ? 'Scheduling...' : 'Schedule Session'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
