"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Save, RefreshCw, User, MapPin, Briefcase, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { api, getErrorMessage } from "@/lib/api";
import { toast } from "sonner";
import { getInitials } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";

const SPECIALIZATIONS = ["GST", "Income Tax", "Audit", "Company Registration", "Trademark", "Payroll", "Accounting", "Compliance", "Financial Planning", "Startup Consulting"];

export default function CAProfilePage() {
  const { fetchMe } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.get("/ca/my/profile").then((r) => {
      const d = r.data.data;
      setProfile(d);
      setAvatarUrl(d?.avatarUrl || "");
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append("avatar", file);
    try {
      const res = await api.post("/ca/avatar", form, { headers: { "Content-Type": "multipart/form-data" } });
      setAvatarUrl(res.data.data?.avatarUrl || avatarUrl);
      toast.success("Avatar updated");
      fetchMe();
    } catch (err) { toast.error(getErrorMessage(err)); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put("/ca/my/profile", {
        firstName: profile.firstName,
        lastName: profile.lastName,
        bio: profile.bio,
        city: profile.city,
        state: profile.state,
        consultationFee: profile.consultationFee,
        experienceYears: profile.experienceYears,
        linkedinUrl: profile.linkedinUrl,
        websiteUrl: profile.websiteUrl,
      });
      toast.success("Profile updated successfully");
      fetchMe();
    } catch (err) { toast.error(getErrorMessage(err)); } finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading">My Profile</h1>
          <p className="text-muted-foreground mt-1">This is shown to clients when they search for CAs</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="rounded-xl bg-brand-600 hover:bg-brand-700">
          {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}Save
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avatar + Status */}
        <div className="bg-card rounded-2xl border border-border p-6 text-center">
          <div className="relative inline-block mb-4">
            <Avatar className="h-24 w-24 mx-auto">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback className="bg-brand-100 text-brand-700 text-2xl font-bold">
                {getInitials(profile?.firstName || "C", profile?.lastName)}
              </AvatarFallback>
            </Avatar>
            <button onClick={() => fileRef.current?.click()}
              className="absolute bottom-0 right-0 w-8 h-8 bg-brand-600 rounded-full flex items-center justify-center hover:bg-brand-700 transition-colors">
              <Camera className="w-4 h-4 text-white" />
            </button>
            <input ref={fileRef} type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
          </div>
          <p className="font-semibold text-lg">{profile?.firstName} {profile?.lastName}</p>
          <p className="text-sm text-muted-foreground mb-3">CA Professional</p>
          <Badge variant={profile?.status === "ACTIVE" ? "success" : "warning"} className="mb-4">{profile?.status || "PENDING"}</Badge>

          <div className="grid grid-cols-2 gap-3 text-center mt-4">
            <div className="p-3 bg-muted/50 rounded-xl">
              <p className="text-xl font-bold text-brand-600">{profile?.averageRating?.toFixed(1) || "—"}</p>
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1"><Star className="w-3 h-3" />Rating</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-xl">
              <p className="text-xl font-bold text-brand-600">{profile?.totalConsultations || 0}</p>
              <p className="text-xs text-muted-foreground">Consultations</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card rounded-2xl border border-border p-6">
            <h3 className="font-semibold font-heading mb-4 flex items-center gap-2"><User className="w-4 h-4 text-brand-600" />Personal Info</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs mb-1.5 block">First Name</Label>
                <Input value={profile?.firstName || ""} onChange={(e) => setProfile({ ...profile, firstName: e.target.value })} className="rounded-xl" />
              </div>
              <div>
                <Label className="text-xs mb-1.5 block">Last Name</Label>
                <Input value={profile?.lastName || ""} onChange={(e) => setProfile({ ...profile, lastName: e.target.value })} className="rounded-xl" />
              </div>
              <div>
                <Label className="text-xs mb-1.5 block">LinkedIn URL</Label>
                <Input value={profile?.linkedinUrl || ""} onChange={(e) => setProfile({ ...profile, linkedinUrl: e.target.value })} className="rounded-xl" placeholder="https://linkedin.com/in/..." />
              </div>
              <div>
                <Label className="text-xs mb-1.5 block">Website URL</Label>
                <Input value={profile?.websiteUrl || ""} onChange={(e) => setProfile({ ...profile, websiteUrl: e.target.value })} className="rounded-xl" placeholder="https://..." />
              </div>
            </div>
            <div className="mt-4">
              <Label className="text-xs mb-1.5 block">Bio / About</Label>
              <Textarea value={profile?.bio || ""} onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                className="rounded-xl resize-none" rows={4} placeholder="Describe your expertise and experience..." />
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border p-6">
            <h3 className="font-semibold font-heading mb-4 flex items-center gap-2"><MapPin className="w-4 h-4 text-brand-600" />Practice Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs mb-1.5 block">City</Label>
                <Input value={profile?.city || ""} onChange={(e) => setProfile({ ...profile, city: e.target.value })} className="rounded-xl" />
              </div>
              <div>
                <Label className="text-xs mb-1.5 block">State</Label>
                <Input value={profile?.state || ""} onChange={(e) => setProfile({ ...profile, state: e.target.value })} className="rounded-xl" />
              </div>
              <div>
                <Label className="text-xs mb-1.5 block">Experience (years)</Label>
                <Input type="number" value={profile?.experienceYears || ""} onChange={(e) => setProfile({ ...profile, experienceYears: Number(e.target.value) })} className="rounded-xl" min={0} />
              </div>
              <div>
                <Label className="text-xs mb-1.5 block">Consultation Fee (₹)</Label>
                <Input type="number" value={profile?.consultationFee ? profile.consultationFee / 100 : ""} onChange={(e) => setProfile({ ...profile, consultationFee: Number(e.target.value) * 100 })} className="rounded-xl" min={100} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
