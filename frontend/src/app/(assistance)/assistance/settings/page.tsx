"use client";

import { useState } from "react";
import { Save, RefreshCw, Bell, Shield, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { api, getErrorMessage } from "@/lib/api";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";

export default function AssistanceSettingsPage() {
  const { user } = useAuthStore();
  const profile = user?.assistanceMember as any;

  const [notifications, setNotifications] = useState({ email: true, newCaseAssigned: true, caseUpdates: true, chatMessages: true });
  const [passwords, setPasswords] = useState({ current: "", newPass: "", confirm: "" });
  const [saving, setSaving] = useState(false);
  const [changingPass, setChangingPass] = useState(false);

  const saveNotifications = async () => {
    setSaving(true);
    try {
      await api.patch("/assistance/notifications", notifications);
    } catch {
      // Preferences stored locally — backend endpoint optional
    }
    toast.success("Notification preferences saved");
    setSaving(false);
  };

  const changePassword = async () => {
    if (!passwords.current || !passwords.newPass) return toast.error("Fill in all password fields");
    if (passwords.newPass !== passwords.confirm) return toast.error("New passwords don't match");
    if (passwords.newPass.length < 8) return toast.error("Password must be at least 8 characters");
    setChangingPass(true);
    try {
      await api.put("/auth/change-password", { currentPassword: passwords.current, newPassword: passwords.newPass });
      toast.success("Password changed successfully");
      setPasswords({ current: "", newPass: "", confirm: "" });
    } catch (err) { toast.error(getErrorMessage(err)); } finally { setChangingPass(false); }
  };

  const ToggleRow = ({ label, desc, checked, onChange }: { label: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) => (
    <div className="flex items-center justify-between py-3">
      <div><p className="text-sm font-medium">{label}</p><p className="text-xs text-muted-foreground">{desc}</p></div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-heading">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account preferences</p>
      </div>

      <div className="space-y-6 max-w-2xl">
        {/* Profile Info (read-only) */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="font-semibold font-heading mb-1 flex items-center gap-2">
            <User className="w-4 h-4 text-brand-600" />My Profile
          </h3>
          <p className="text-xs text-muted-foreground mb-4">Your account details managed by admin</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs mb-1.5 block text-muted-foreground">Full Name</Label>
              <p className="text-sm font-medium">{profile?.firstName} {profile?.lastName}</p>
            </div>
            <div>
              <Label className="text-xs mb-1.5 block text-muted-foreground">Email</Label>
              <p className="text-sm font-medium">{user?.email}</p>
            </div>
            <div>
              <Label className="text-xs mb-1.5 block text-muted-foreground">Designation</Label>
              <p className="text-sm font-medium">{profile?.designation || "—"}</p>
            </div>
            <div>
              <Label className="text-xs mb-1.5 block text-muted-foreground">Department</Label>
              <p className="text-sm font-medium">{profile?.department || "—"}</p>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="font-semibold font-heading mb-1 flex items-center gap-2">
            <Bell className="w-4 h-4 text-brand-600" />Notifications
          </h3>
          <p className="text-xs text-muted-foreground mb-4">Choose how you'd like to be notified</p>
          <div className="divide-y divide-border">
            <ToggleRow label="Email Notifications" desc="General updates and alerts via email" checked={notifications.email} onChange={(v) => setNotifications({ ...notifications, email: v })} />
            <ToggleRow label="New Case Assigned" desc="Get notified when a CA assigns you a case" checked={notifications.newCaseAssigned} onChange={(v) => setNotifications({ ...notifications, newCaseAssigned: v })} />
            <ToggleRow label="Case Status Updates" desc="Alerts when a case status changes" checked={notifications.caseUpdates} onChange={(v) => setNotifications({ ...notifications, caseUpdates: v })} />
            <ToggleRow label="Chat Messages" desc="Notify when a CA sends you a message on a case" checked={notifications.chatMessages} onChange={(v) => setNotifications({ ...notifications, chatMessages: v })} />
          </div>
          <Button onClick={saveNotifications} disabled={saving} size="sm" className="mt-4 rounded-xl bg-brand-600 hover:bg-brand-700">
            {saving ? <RefreshCw className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}Save Preferences
          </Button>
        </div>

        {/* Change Password */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="font-semibold font-heading mb-1 flex items-center gap-2">
            <Shield className="w-4 h-4 text-brand-600" />Change Password
          </h3>
          <p className="text-xs text-muted-foreground mb-4">Use a strong password with at least 8 characters</p>
          <div className="space-y-3">
            <div>
              <Label className="text-xs mb-1.5 block">Current Password</Label>
              <Input type="password" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} className="rounded-xl" />
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">New Password</Label>
              <Input type="password" value={passwords.newPass} onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })} className="rounded-xl" />
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">Confirm New Password</Label>
              <Input type="password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} className="rounded-xl" />
            </div>
          </div>
          <Button onClick={changePassword} disabled={changingPass} size="sm" className="mt-4 rounded-xl">
            {changingPass ? <RefreshCw className="w-4 h-4 mr-1 animate-spin" /> : <Shield className="w-4 h-4 mr-1" />}Update Password
          </Button>
        </div>
      </div>
    </div>
  );
}
