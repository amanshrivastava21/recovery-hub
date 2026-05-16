import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import type { Patient, TreatmentPlan } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Stethoscope, CheckCircle2, Calendar, User, ArrowRight
} from 'lucide-react';

const PatientTreatmentPlanPage = () => {
  const { user } = useAuth();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [treatmentPlan, setTreatmentPlan] = useState<TreatmentPlan | null>(null);
  const [medicines, setMedicines] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const myPatient = await api.getMyPatient();
        if (myPatient) {
          setPatient(myPatient);
          if (myPatient.treatmentPlan && typeof myPatient.treatmentPlan === 'string') {
            try {
              const plan = await api.getTreatmentPlan(myPatient.treatmentPlan);
              setTreatmentPlan(plan);
              
              // Fetch medicine details
              if (plan.medicines && plan.medicines.length > 0) {
                const medicinesToFetch = plan.medicines.filter(m => typeof m.medicineId === 'string');
                if (medicinesToFetch.length > 0) {
                  const medicineMap: Record<string, any> = {};
                  for (const med of medicinesToFetch) {
                    try {
                      const medicineDetail = await api.getMedicine(med.medicineId);
                      medicineMap[med.medicineId] = medicineDetail;
                    } catch (err) {
                      console.error(`Failed to fetch medicine ${med.medicineId}:`, err);
                    }
                  }
                  setMedicines(medicineMap);
                }
              }
            } catch (err) {
              console.error('Failed to fetch treatment plan:', err);
            }
          } else if (myPatient.treatmentPlan) {
            setTreatmentPlan(myPatient.treatmentPlan as unknown as TreatmentPlan);
          }
        }
      } catch (err) {
        console.error('Failed to fetch patient data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading treatment plan...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl gradient-primary p-6 md:p-8 shadow-elevated">
        <div className="flex items-center gap-3 mb-2">
          <Stethoscope className="h-6 w-6 text-primary-foreground" />
          <h1 className="font-display text-2xl md:text-3xl font-bold text-primary-foreground">
            My Treatment Plan
          </h1>
        </div>
        <p className="text-primary-foreground/80">View and track your personalized treatment plan</p>
      </div>

      {treatmentPlan ? (
        <div className="space-y-6">
          {/* Plan Overview */}
          <Card className="shadow-card border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Plan Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-4">
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-xs text-muted-foreground mb-1">Plan Type</p>
                  <p className="text-sm font-semibold text-foreground capitalize">{treatmentPlan.planType}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  <Badge variant="outline" className="capitalize mt-1">{treatmentPlan.status}</Badge>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-xs text-muted-foreground mb-1">Start Date</p>
                  <p className="text-sm font-semibold text-foreground">
                    {treatmentPlan.startDate ? new Date(treatmentPlan.startDate).toLocaleDateString() : '-'}
                  </p>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-xs text-muted-foreground mb-1">Version</p>
                  <p className="text-sm font-semibold text-foreground">{treatmentPlan.version || 1}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Plan Notes */}
          <Card className="shadow-card border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Plan Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground leading-relaxed">
                {treatmentPlan.notes || 'No notes available.'}
              </p>
            </CardContent>
          </Card>

          {/* Goals */}
          {treatmentPlan.goals && treatmentPlan.goals.length > 0 && (
            <Card className="shadow-card border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Treatment Goals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {treatmentPlan.goals.map((goal, index) => (
                    <div key={index} className="flex gap-3 rounded-lg border p-3 border-border">
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-success mt-0.5" />
                      <p className="text-sm text-foreground">{goal}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Therapy */}
          {treatmentPlan.therapy && treatmentPlan.therapy.length > 0 && (
            <Card className="shadow-card border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Therapy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {treatmentPlan.therapy.map((therapy, index) => (
                    <Badge key={index} variant="outline" className="capitalize">
                      {therapy}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Activities */}
          {treatmentPlan.activities && treatmentPlan.activities.length > 0 && (
            <Card className="shadow-card border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Activities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {treatmentPlan.activities.map((activity, index) => (
                    <div key={index} className="rounded-lg border p-4 border-border">
                      <p className="font-medium text-foreground">{activity.activity}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {activity.frequency}{activity.duration ? ` - ${activity.duration} min` : ''}
                      </p>
                      {activity.notes && (
                        <p className="text-sm text-muted-foreground mt-2">{activity.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Medicines */}
          {treatmentPlan.medicines && treatmentPlan.medicines.length > 0 && (
            <Card className="shadow-card border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Medications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {treatmentPlan.medicines.map((medicine: any, index) => {
                    let medName = 'Medicine';
                    if (typeof medicine.medicineId === 'object' && medicine.medicineId?.name) {
                      medName = medicine.medicineId.name;
                    } else if (typeof medicine.medicineId === 'string') {
                      medName = medicines[medicine.medicineId]?.name || 'Medicine';
                    }
                    
                    return (
                      <div key={index} className="rounded-lg border p-4 border-border">
                        <p className="font-medium text-foreground">{medName}</p>
                        <div className="grid gap-2 sm:grid-cols-2 mt-2">
                          <p className="text-sm text-muted-foreground">Dosage: {medicine.dosage || '-'}</p>
                          <p className="text-sm text-muted-foreground">Frequency: {medicine.frequency || '-'}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Progress Reviews */}
          {treatmentPlan.progressReviews && treatmentPlan.progressReviews.length > 0 && (
            <Card className="shadow-card border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Progress Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {treatmentPlan.progressReviews.map((review, index) => (
                    <div key={index} className="rounded-lg border p-4 border-border">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <p className="text-sm font-medium text-muted-foreground">
                          {new Date(review.date).toLocaleDateString()}
                        </p>
                        {review.status && (
                          <Badge variant="outline" className="capitalize text-xs">
                            {review.status}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-foreground">{review.notes}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Previous Plans */}
          {treatmentPlan.history && treatmentPlan.history.length > 0 && (
            <Card className="shadow-card border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Previous Treatment Plans</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[...treatmentPlan.history].reverse().map((item) => (
                    <div key={`${item.version}-${item.archivedAt}`} className="rounded-lg border p-4 border-border">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <p className="font-medium text-foreground">Version {item.version}</p>
                        {item.status && <Badge variant="outline" className="capitalize text-xs">{item.status}</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        Saved: {item.archivedAt ? new Date(item.archivedAt).toLocaleString() : '-'}
                      </p>
                      {item.changeNote && (
                        <p className="text-sm text-foreground mb-2">{item.changeNote}</p>
                      )}
                      <div className="grid gap-2 sm:grid-cols-2">
                        <div className="rounded-md bg-muted/40 p-2">
                          <p className="text-xs text-muted-foreground">Plan Type</p>
                          <p className="text-sm capitalize text-foreground">{item.planType || '-'}</p>
                        </div>
                        <div className="rounded-md bg-muted/40 p-2">
                          <p className="text-xs text-muted-foreground">Therapy</p>
                          <p className="text-sm text-foreground">{item.therapy?.join(', ') || '-'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <Card className="shadow-card border-border/50">
          <CardContent className="p-8 text-center">
            <Stethoscope className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No treatment plan assigned yet.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Your healthcare provider will create a treatment plan for you.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PatientTreatmentPlanPage;
