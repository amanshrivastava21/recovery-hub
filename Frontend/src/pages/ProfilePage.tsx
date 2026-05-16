// import { useEffect, useState } from 'react';
// import { api } from '@/services/api';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';

// const ProfilePage = () => {
//   const [user, setUser] = useState<any>(null);
//   const [edit, setEdit] = useState(false);

//   useEffect(() => {
//     api.getMyProfile().then(setUser);
//   }, []);

//   const handleUpdate = async (e: any) => {
//     e.preventDefault();
//     const fd = new FormData(e.target);

//     const updated = await api.updateMyProfile({
//       name: fd.get('name'),
//       phone: fd.get('phone'),
//       department: fd.get('department'),
//       specialization: fd.get('specialization'),
//     });

//     setUser(updated);
//     setEdit(false);
//   };

//   if (!user) return <div>Loading...</div>;

//   return (
//     <div className="p-6 max-w-lg mx-auto">
//       <h2 className="text-xl font-bold mb-4">My Profile</h2>

//       {!edit ? (
//         <div className="space-y-2 border p-4 rounded">
//           <p><b>Name:</b> {user.name}</p>
//           <p><b>Email:</b> {user.email}</p>
//           <p><b>Role:</b> {user.role}</p>

//           {/* 🔥 STAFF ROLE */}
//           {user.staffRole && (
//             <p><b>Staff Role:</b> {user.staffRole}</p>
//           )}

//           <p><b>Phone:</b> {user.phone || '—'}</p>

//           <Button onClick={() => setEdit(true)}>Edit</Button>
//         </div>
//       ) : (
//         <form onSubmit={handleUpdate} className="space-y-2 border p-4 rounded">
//           <Input name="name" defaultValue={user.name} />
//           <Input name="phone" defaultValue={user.phone} />
//           <Input name="department" defaultValue={user.department} />
//           <Input name="specialization" defaultValue={user.specialization} />

//           <Button type="submit">Save</Button>
//         </form>
//       )}
//     </div>
//   );
// };

// export default ProfilePage;


import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import PageHeader from "@/components/PageHeader";
import { useToast } from "@/hooks/use-toast";
import type { Patient } from "@/types";
import {
  AlertCircle, FileText, Heart, Mail, MapPin,
  Phone, User,
} from "lucide-react";

const statusColorMap: Record<string, string> = {
  admitted: "bg-info/15 text-info border-info/30",
  "in-treatment": "bg-warning/15 text-warning border-warning/30",
  recovering: "bg-success/15 text-success border-success/30",
  discharged: "bg-muted text-muted-foreground border-border",
  relapsed: "bg-destructive/15 text-destructive border-destructive/30",
};

const InfoRow = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) => (
  <div className="flex items-start gap-3 py-2">
    <Icon className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  </div>
);

const ProfilePage = () => {
  const { user: authUser, token, updateUser } = useAuth();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(authUser);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [edit, setEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileError, setProfileError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setProfileError("");
      try {
        const data = await api.getMyProfile();
        setUser(data);
        if (data.role === "patient") {
          try {
            const patientData = await api.getMyPatient();
            setPatient(patientData);
          } catch (patientErr) {
            console.error("Patient profile fetch error:", patientErr);
          }
        }
      } catch (err) {
        console.error("Profile fetch error:", err);
        setUser(authUser);
        setProfileError(err instanceof Error ? err.message : "Unable to load profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [authUser]);

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const profileUpdate = {
      name: String(fd.get("name") || "").trim(),
      phone: String(fd.get("phone") || "").trim(),
      department: String(fd.get("department") || "").trim(),
      specialization: String(fd.get("specialization") || "").trim(),
    };
    setSaving(true);
    setProfileError("");
    try {
      const updated = await api.updateMyProfile(profileUpdate);
      setUser(updated);
      updateUser(updated);
      setEdit(false);
      toast({ title: "Saved", description: "Profile updated successfully" });
    } catch (err) {
      console.error("Update error:", err);
      const message = err instanceof Error ? err.message : "Unable to update profile.";
      const canSaveLocally = Boolean(user || authUser);
      const isRuntimeProfile = token?.startsWith("runtime_token_") || token?.startsWith("demo_token_");

      if (canSaveLocally && isRuntimeProfile) {
        const fallbackUser = {
          ...(authUser || {}),
          ...(user || {}),
          ...profileUpdate,
        };
        setUser(fallbackUser);
        updateUser(fallbackUser);
        setEdit(false);
        setProfileError("");
        toast({ title: "Saved", description: "Profile updated successfully" });
      } else {
        setProfileError(message);
        toast({ title: "Error", description: message, variant: "destructive" });
      }
    } finally {
      setSaving(false);
    }
  };

  const handlePatientUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setSaving(true);
    setProfileError("");

    try {
      const updatedPatient = await api.updateMyPatient({
        phone: String(fd.get("phone") || "").trim(),
        email: String(fd.get("email") || "").trim(),
        address: String(fd.get("address") || "").trim(),
        emergencyContact: {
          name: String(fd.get("emergencyName") || "").trim(),
          phone: String(fd.get("emergencyPhone") || "").trim(),
          relationship: String(fd.get("emergencyRelationship") || "").trim(),
        },
      });

      setPatient(updatedPatient);
      setUser((current: any) => {
        const updatedUser = current ? { ...current, email: updatedPatient.contact?.email || current.email } : current;
        if (updatedUser) updateUser(updatedUser);
        return updatedUser;
      });
      setEdit(false);
      toast({ title: "Saved", description: "Profile updated successfully" });
    } catch (err) {
      console.error("Patient profile update error:", err);
      const message = err instanceof Error ? err.message : "Unable to update profile.";
      setProfileError(message);
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading && !user) return <div className="p-6">Loading...</div>;
  if (!user) {
    return (
      <div className="p-6">
        <PageHeader title="My Profile" description="Manage your account details" />
        <div className="mt-6 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {profileError || "Unable to load profile."}
        </div>
      </div>
    );
  }

  const renderPatientProfile = () => {
    if (!patient) {
      return (
        <div className="bg-white shadow-lg rounded-xl p-6 text-sm text-gray-500">
          Patient profile not found.
        </div>
      );
    }

    if (edit) {
      return (
        <form onSubmit={handlePatientUpdate} className="bg-white shadow-lg rounded-xl p-6 max-w-2xl border border-gray-100 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Edit My Profile</h2>
            </div>
            <Badge variant="outline" className={`text-xs ${statusColorMap[patient.recoveryStatus]}`}>
              {patient.recoveryStatus.replace("-", " ")}
            </Badge>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Phone</label>
              <Input name="phone" defaultValue={patient.contact?.phone || ""} placeholder="Phone number" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Email</label>
              <Input name="email" type="email" defaultValue={patient.contact?.email || user.email || ""} placeholder="Email" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-medium text-muted-foreground">Address</label>
              <Input name="address" defaultValue={patient.contact?.address || ""} placeholder="Address" />
            </div>
          </div>

          <div className="rounded-lg border bg-muted/20 p-4 space-y-3">
            <p className="text-sm font-semibold text-foreground flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-primary" />
              Emergency Contact
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Name</label>
                <Input name="emergencyName" defaultValue={patient.emergencyContact?.name || ""} placeholder="Contact name" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Phone</label>
                <Input name="emergencyPhone" defaultValue={patient.emergencyContact?.phone || ""} placeholder="Contact phone" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Relationship</label>
                <Input name="emergencyRelationship" defaultValue={patient.emergencyContact?.relationship || ""} placeholder="Relationship" />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
            <Button type="button" variant="outline" onClick={() => setEdit(false)}>Cancel</Button>
          </div>
        </form>
      );
    }

    return (
      <div className="bg-white shadow-lg rounded-xl p-6 max-w-xl border border-gray-100">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">My Profile</h2>
          </div>
          <Button size="sm" onClick={() => setEdit(true)}>Edit Profile</Button>
        </div>

        <div className="flex items-center gap-4 mb-4 pb-4 border-b border-border">
          <div className="h-16 w-16 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-xl shrink-0">
            {patient.fullName.split(" ").map((n: string) => n[0]).join("")}
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{patient.fullName}</h3>
            <p className="text-sm text-muted-foreground">{patient.age} yrs • {patient.gender}</p>
            <Badge variant="outline" className={`mt-1 text-xs ${statusColorMap[patient.recoveryStatus]}`}>
              {patient.recoveryStatus.replace("-", " ")}
            </Badge>
          </div>
        </div>

        <InfoRow icon={Phone} label="Phone" value={patient.contact?.phone || "-"} />
        <InfoRow icon={Mail} label="Email" value={patient.contact?.email || user.email || "-"} />
        <InfoRow icon={MapPin} label="Address" value={patient.contact?.address || "-"} />
        <InfoRow
          icon={Heart}
          label="Condition"
          value={Array.isArray(patient.addictionType) ? patient.addictionType.join(", ") : patient.addictionType || "-"}
        />
        <InfoRow icon={FileText} label="Medical History" value={patient.medicalHistory || "-"} />

        <div className="pt-3 mt-3 border-t border-border">
          <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
            <AlertCircle className="h-3.5 w-3.5" /> Emergency Contact
          </p>
          <p className="text-sm font-medium text-foreground">{patient.emergencyContact?.name || "-"}</p>
          <p className="text-xs text-muted-foreground">
            {patient.emergencyContact?.relationship || "-"} • {patient.emergencyContact?.phone || "-"}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <PageHeader
        title="My Profile"
        description={profileError ? "Showing saved login details. Please try refreshing once the server is available." : "Manage your account details"}
      />

      {/* DASHBOARD SHORTCUT */}
      <div
        className="hidden"
      >
        <div className="bg-blue-50 p-3 rounded-lg">
          <span />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Dashboard</h3>
          <p className="text-sm text-gray-500">Go to your main dashboard</p>
        </div>
        <span className="ml-auto text-gray-400 text-lg">→</span>
      </div>

      {/* PROFILE CARD */}
      {user.role === "patient" ? renderPatientProfile() : (
      <div className="bg-white shadow-lg rounded-xl p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold">{user.name}</h2>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
          <div className="flex gap-2">
            <span className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full capitalize">
              {user.role}
            </span>
            {user.staffRole && (
              <span className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full capitalize">
                {user.staffRole}
              </span>
            )}
          </div>
        </div>

        {!edit ? (
          <>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Phone</p>
                <p className="font-medium">{user.phone || "-"}</p>
              </div>
              <div>
                <p className="text-gray-500">Department</p>
                <p className="font-medium">{user.department || "-"}</p>
              </div>
              <div>
                <p className="text-gray-500">Specialization</p>
                <p className="font-medium">{user.specialization || "-"}</p>
              </div>
            </div>
            <Button onClick={() => setEdit(true)} className="mt-4">
              Edit Profile
            </Button>
          </>
        ) : (
          <form onSubmit={handleUpdate} className="space-y-3">
            <Input name="name" defaultValue={user.name} placeholder="Name" />
            <Input name="phone" defaultValue={user.phone} placeholder="Phone" />
            <Input name="department" defaultValue={user.department} placeholder="Department" />
            <Input name="specialization" defaultValue={user.specialization} placeholder="Specialization" />
            <div className="flex gap-2">
              <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
              <Button type="button" variant="outline" onClick={() => setEdit(false)}>
                Cancel
              </Button>
            </div>
          </form>
        )}
      </div>
      )}
    </div>
  );
};

export default ProfilePage;
