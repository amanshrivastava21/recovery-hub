import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Calendar, Download, ChevronLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { api } from '@/services/api';
import type { Attendance, StaffMember, Worker } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { exportAttendanceReport } from '@/utils/pdfExport';

export default function AttendancePage() {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [workerList, setWorkerList] = useState<Worker[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substring(0, 7));
  const [showCreate, setShowCreate] = useState(false);
  const [memberFilter, setMemberFilter] = useState<'all' | 'staff' | 'worker'>('all');
  const { toast } = useToast();

  const form = useForm<Partial<Attendance>>({
    defaultValues: {
      memberType: '',
      member: '',
      date: new Date().toISOString().split('T')[0],
      status: 'present',
      shift: 'morning',
      timeIn: '09:00',
      timeOut: '17:00',
      reason: '',
      notes: '',
    },
  });

  // Watch memberType field to update member list dynamically
  const selectedMemberType = form.watch('memberType');

  // Load data based on filters
  useEffect(() => {
    loadData();
  }, [selectedMonth, memberFilter]);

  const loadData = async () => {
    try {
      setLoading(true);

      const [attendanceData, staffData, workerData] = await Promise.all([
        api.getAttendance?.(memberFilter === 'all' ? undefined : memberFilter) || [],
        api.getStaff?.() || [],
        api.getWorkers?.() || [],
      ]);
      setAttendances(attendanceData);
      setStaffList(staffData);
      setWorkerList(workerData);

      // Load stats for selected month with member type filter
      const statsData = await api.getAttendanceStats?.(
        memberFilter === 'all' ? undefined : memberFilter,
        selectedMonth
      );
      setStats(statsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({ title: 'Error', description: 'Failed to load attendance data', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // Get filtered member list based on selected member type
  const getFilteredMembers = () => {
    if (selectedMemberType === 'staff') {
      return staffList.map((staff) => ({
        id: staff.id ?? staff._id,
        name: staff.user?.name || 'Unknown',
      }));
    } else if (selectedMemberType === 'worker') {
      return workerList.map((worker) => ({
        id: worker.id ?? worker._id,
        name: worker.name || 'Unknown',
      }));
    }
    return [];
  };

  const onSubmit = async (data: Partial<Attendance>) => {
    if (!data.memberType || !data.member) {
      toast({ title: 'Validation Error', description: 'Please select member type and member name', variant: 'destructive' });
      return;
    }

    try {
      const attendanceData = {
        member: data.member,
        memberType: data.memberType,
        date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
        status: data.status,
        shift: data.shift,
        timeIn: data.timeIn,
        timeOut: data.timeOut,
        reason: data.reason,
        notes: data.notes,
      };

      console.log('Sending attendance data:', attendanceData); // DEBUG
      const response = await api.markAttendance?.(attendanceData);
      const newAttendance = response?.attendance ?? response;

      if (newAttendance) {
        setAttendances((current) => [
          newAttendance,
          ...current.filter((attendance) => attendance.id !== newAttendance.id),
        ]);
        setShowCreate(false);
        form.reset();
        toast({ title: 'Success', description: 'Attendance marked successfully' });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to mark attendance';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      present: 'bg-health-green text-white',
      absent: 'bg-red-500 text-white',
      leave: 'bg-yellow-500 text-white',
      'half-day': 'bg-medical-teal text-white',
    };
    return colors[status] || 'bg-gray-500 text-white';
  };

  const getStatusBgColor = (status: string) => {
    const colors: Record<string, string> = {
      present: 'bg-health-green/20 text-health-green',
      absent: 'bg-red-100 text-red-700',
      leave: 'bg-yellow-100 text-yellow-700',
      'half-day': 'bg-medical-teal/20 text-medical-teal',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const handleExportPDF = async () => {
    try {
      await exportAttendanceReport(attendances, selectedMonth);
      toast({ title: 'Success', description: 'Attendance report exported as PDF' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to export PDF', variant: 'destructive' });
    }
  };

  const currentMonthAttendances = attendances.filter((a) => {
    const attendanceMonth = new Date(a.date).toISOString().substring(0, 7);
    return attendanceMonth === selectedMonth;
  });

  const getMemberName = (attendance: any) => {
    if (attendance.staffName) return attendance.staffName;
    if (attendance.workerName) return attendance.workerName;
    if (attendance.staff?.user?.name) return attendance.staff.user.name;
    if (attendance.worker?.name) return attendance.worker.name;
    if (attendance.member?.name) return attendance.member.name;
    if (attendance.member?.user?.name) return attendance.member.user.name;
    return 'Unknown';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Attendance</h1>
          <p className="text-slate-600 mt-2">Track and manage attendance records</p>
        </div>
        <div className="flex gap-2">
          {!showCreate && (
            <Button variant="outline" onClick={handleExportPDF}>
              <Download className="w-4 h-4 mr-2" /> Export PDF
            </Button>
          )}
          <Button
            className="bg-medical-teal hover:bg-medical-teal/90 text-white"
            onClick={() => {
              setShowCreate(!showCreate);
              if (!showCreate) {
                form.reset();
              }
            }}
          >
            {showCreate ? (
              <><ChevronLeft className="w-4 h-4 mr-2" /> Back</>
            ) : (
              <><Plus className="w-4 h-4 mr-2" /> Mark Attendance</>
            )}
          </Button>
        </div>
      </div>

      {showCreate ? (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Mark Attendance</CardTitle>
            <CardDescription>Select member type and name to mark attendance.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Step 1: Member Type Selection */}
                <FormField
                  control={form.control}
                  name="memberType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Member Type </FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value);
                            form.setValue('member', '');
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Staff or Worker" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="staff">Staff</SelectItem>
                            <SelectItem value="worker">Worker</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Step 2: Member Name Selection */}
                <FormField
                  control={form.control}
                  name="member"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Member Name 
                        {selectedMemberType && ` - ${selectedMemberType === 'staff' ? 'Select Staff' : 'Select Worker'}`}
                      </FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value} disabled={!selectedMemberType}>
                          <SelectTrigger>
                            <SelectValue placeholder={selectedMemberType ? `Select ${selectedMemberType}` : 'Select member type first'} />
                          </SelectTrigger>
                          <SelectContent>
                            {getFilteredMembers().map((member) => (
                              <SelectItem key={member.id} value={member.id}>
                                {member.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="shift"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Shift</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="morning">Morning</SelectItem>
                              <SelectItem value="evening">Evening</SelectItem>
                              <SelectItem value="night">Night</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="present">Present</SelectItem>
                              <SelectItem value="absent">Absent</SelectItem>
                              <SelectItem value="leave">Leave</SelectItem>
                              <SelectItem value="half-day">Half Day</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="timeIn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Time In</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="timeOut"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Time Out</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reason</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Optional reason for absence or leave" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Additional attendance notes" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full bg-medical-teal hover:bg-medical-teal/90 text-white">
                  Save Attendance
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      ) : null}

      {/* Month Selector */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Select Month
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="max-w-xs"
          />
        </CardContent>
      </Card>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Total Days</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Present</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-health-green">{stats.present || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Absent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.absent || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Leave</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.leave || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Attendance %</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-medical-teal">{stats.attendancePercentage}%</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Attendance Records with Filter */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Attendance Records</CardTitle>
              <CardDescription>
                {currentMonthAttendances.length} records for {selectedMonth}
              </CardDescription>
            </div>
            <div className="w-48">
              <Select value={memberFilter} onValueChange={(value: any) => setMemberFilter(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by member type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Members</SelectItem>
                  <SelectItem value="staff">Staff Only</SelectItem>
                  <SelectItem value="worker">Worker Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold">Member Name</th>
                  <th className="text-left py-3 px-4 font-semibold">Type</th>
                  <th className="text-left py-3 px-4 font-semibold">Date</th>
                  <th className="text-left py-3 px-4 font-semibold">Shift</th>
                  <th className="text-left py-3 px-4 font-semibold">Time In</th>
                  <th className="text-left py-3 px-4 font-semibold">Time Out</th>
                  <th className="text-left py-3 px-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {currentMonthAttendances.map((attendance) => (
                  <tr key={attendance.id} className="border-b hover:bg-slate-50">
                    <td className="py-3 px-4">{getMemberName(attendance)}</td>
                    <td className="py-3 px-4 capitalize">
                      <Badge variant="outline" className="capitalize">
                        {attendance.memberType || 'Unknown'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">{new Date(attendance.date).toLocaleDateString()}</td>
                    <td className="py-3 px-4 capitalize">{attendance.shift}</td>
                    <td className="py-3 px-4">{attendance.timeIn || '-'}</td>
                    <td className="py-3 px-4">{attendance.timeOut || '-'}</td>
                    <td className="py-3 px-4">
                      <Badge className={getStatusBgColor(attendance.status)}>
                        {attendance.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {currentMonthAttendances.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                No attendance records for {selectedMonth}. Mark attendance to get started.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
