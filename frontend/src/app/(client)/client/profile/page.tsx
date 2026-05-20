"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Save, RefreshCw, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { api, getErrorMessage } from "@/lib/api";
import { toast } from "sonner";
import { getInitials } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";

export default function ClientProfilePage() {
  const { user, fetchMe } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [passwords, setPasswords] = useState({ current: "", newPass: "", confirm: "" });
  const [changingPass, setChangingPass] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user?.clientProfile) setProfile({ ...user.clientProfile });
    else api.get("/auth/me").then((r) => setProfile(r.data.data?.clientProfile)).catch(() => {});
  }, [user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append("avatar", file);
    try {
      await api.post("/client/avatar", form, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Avatar updated");
      fetchMe();
    } catch (err) { toast.error(getErrorMessage(err)); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put("/client/profile", {
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        city: profile.city,
        state: profile.state,
        dateOfBirth: profile.dateOfBirth,
        panNumber: profile.panNumber,
      });
      toast.success("Profile updated");
      fetchMe();
    } catch (err) { toast.error(getErrorMessage(err)); } finally { setSaving(false); }
  };

  const changePassword = async () => {
    if (passwords.newPass !== passwords.confirm) return toast.error("Passwords don't match");
    setChangingPass(true);
    try {
      await api.put("/auth/change-password", { currentPassword: passwords.current, newPassword: passwords.newPass });
      toast.success("Password changed");
      setPasswords({ current: "", newPass: "", confirm: "" });
    } catch (err) { toast.error(getErrorMessage(err)); } finally { setChangingPass(false); }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div><h1 className="text-2xl font-bold font-heading">My Profile</h1><p className="text-muted-foreground mt-1">Manage your personal information</p></div>
        <Button onClick={handleSave} disabled={saving} className="rounded-xl bg-brand-600 hover:bg-brand-700">
          {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}Save
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avatar */}
        <div className="bg-card rounded-2xl border border-border p-6 text-center">
          <div className="relative inline-block mb-4">
            <Avatar className="h-24 w-24 mx-auto">
              <AvatarFallback className="bg-brand-100 text-brand-700 text-2xl font-bold">
                {getInitials(profile?.firstName || "U", profile?.lastName)}
              </AvatarFallback>
            </Avatar>
            <button onClick={() => fileRef.current?.click()}
              className="absolute bottom-0 right-0 w-8 h-8 bg-brand-600 rounded-full flex items-center justify-center hover:bg-brand-700">
              <Camera className="w-4 h-4 text-white" />
            </button>
            <input ref={fileRef} type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
          </div>
          <p className="font-semibold">{profile?.firstName} {profile?.lastName}</p>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>

        {/* Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card rounded-2xl border border-border p-6">
            <h3 className="font-semibold font-heading mb-4 flex items-center gap-2"><User className="w-4 h-4 text-brand-600" />Personal Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><Label className="text-xs mb-1.5 block">First Name</Label><Input value={profile?.firstName || ""} onChange={(e) => setProfile({ ...profile, firstName: e.target.value })} className="rounded-xl" /></div>
              <div><Label className="text-xs mb-1.5 block">Last Name</Label><Input value={profile?.lastName || ""} onChange={(e) => setProfile({ ...profile, lastName: e.target.value })} className="rounded-xl" /></div>
              <div><Label className="text-xs mb-1.5 block">Phone</Label><Input value={profile?.phone || ""} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className="rounded-xl" /></div>
              <div><Label className="text-xs mb-1.5 block">Date of Birth</Label><Input type="date" value={profile?.dateOfBirth?.split("T")[0] || ""} onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })} className="rounded-xl" /></div>
              <div><Label className="text-xs mb-1.5 block">City</Label><Input value={profile?.city || ""} onChange={(e) => setProfile({ ...profile, city: e.target.value })} className="rounded-xl" /></div>
              <div><Label className="text-xs mb-1.5 block">State</Label><Input value={profile?.state || ""} onChange={(e) => setProfile({ ...profile, state: e.target.value })} className="rounded-xl" /></div>
              <div className="col-span-2"><Label className="text-xs mb-1.5 block">PAN Number</Label><Input value={profile?.panNumber || ""} onChange={(e) => setProfile({ ...profile, panNumber: e.target.value.toUpperCase() })} className="rounded-xl font-mono" maxLength={10} placeholder="ABCDE1234F" /></div>
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border p-6">
            <h3 className="font-semibold font-heading mb-4">Change Password</h3>
            <div className="space-y-3">
              <div><Label className="text-xs mb-1.5 block">Current Password</Label><Input type="password" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} className="rounded-xl" /></div>
              <div><Label className="text-xs mb-1.5 block">New Password</Label><Input type="password" value={passwords.newPass} onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })} className="rounded-xl" /></div>
              <div><Label className="text-xs mb-1.5 block">Confirm New Password</Label><Input type="password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} className="rounded-xl" /></div>
            </div>
            <Button onClick={changePassword} disabled={changingPass} size="sm" className="mt-4 rounded-xl">
              {changingPass ? <RefreshCw className="w-4 h-4 mr-1 animate-spin" /> : null}Update Password
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
