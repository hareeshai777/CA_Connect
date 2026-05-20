"use client";

import { useEffect, useState } from "react";
import { Save, RefreshCw, Settings2, IndianRupee, Bell, Shield, Globe, Mail, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { api, getErrorMessage } from "@/lib/api";
import { toast } from "sonner";

interface PlatformSettings {
  platformName: string;
  platformEmail: string;
  supportPhone: string;
  caOnboardingFee: number;
  platformCommission: number;
  maintenanceMode: boolean;
  allowNewRegistrations: boolean;
  allowCARegistrations: boolean;
  emailNotificationsEnabled: boolean;
  whatsappNotificationsEnabled: boolean;
  maxBookingsPerDay: number;
  minConsultationFee: number;
  maxConsultationFee: number;
  announcementBanner: string;
  announcementEnabled: boolean;
}

const DEFAULTS: PlatformSettings = {
  platformName: "CA Pro",
  platformEmail: "support@capro.in",
  supportPhone: "+91 1800-000-0000",
  caOnboardingFee: 499,
  platformCommission: 10,
  maintenanceMode: false,
  allowNewRegistrations: true,
  allowCARegistrations: true,
  emailNotificationsEnabled: true,
  whatsappNotificationsEnabled: true,
  maxBookingsPerDay: 10,
  minConsultationFee: 100,
  maxConsultationFee: 10000,
  announcementBanner: "",
  announcementEnabled: false,
};

function SectionCard({ icon: Icon, title, description, children }: { icon: any; title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
      <div className="p-5 border-b border-gray-800 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-brand-600/10 border border-brand-600/20 flex items-center justify-center">
          <Icon className="w-4 h-4 text-brand-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-100">{title}</h3>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

function ToggleRow({ label, description, checked, onCheckedChange, variant = "default" }: {
  label: string; description: string; checked: boolean; onCheckedChange: (v: boolean) => void; variant?: "default" | "danger";
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className={`text-sm font-medium ${variant === "danger" ? "text-red-300" : "text-gray-200"}`}>{label}</p>
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings>(DEFAULTS);
  const [original, setOriginal] = useState<PlatformSettings>(DEFAULTS);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const isDirty = JSON.stringify(settings) !== JSON.stringify(original);

  useEffect(() => {
    setLoading(true);
    api.get("/admin/settings").then((r) => {
      if (r.data?.data) {
        const d = r.data.data;
        const merged = {
          ...DEFAULTS,
          caOnboardingFee: d.caOnboardingFee ? d.caOnboardingFee / 100 : DEFAULTS.caOnboardingFee,
          platformCommission: d.platformCommissionPercent ?? DEFAULTS.platformCommission,
          maintenanceMode: d.maintenanceMode ?? DEFAULTS.maintenanceMode,
        };
        setSettings(merged);
        setOriginal(merged);
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const update = (key: keyof PlatformSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put("/admin/settings", {
        caOnboardingFee: settings.caOnboardingFee * 100,
        platformCommissionPercent: settings.platformCommission,
        maintenanceMode: settings.maintenanceMode,
      });
      setOriginal(settings);
      toast.success("Settings saved successfully");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSettings(original);
    toast.info("Changes reverted");
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-gray-100">Platform Settings</h1>
          <p className="text-gray-400 mt-1">Configure fees, permissions, and notifications</p>
        </div>
        <div className="flex items-center gap-3">
          {isDirty && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <Badge variant="warning" className="text-xs">Unsaved changes</Badge>
            </motion.div>
          )}
          <Button variant="outline" size="sm" className="border-gray-700 text-gray-300 hover:bg-gray-800" onClick={handleReset} disabled={!isDirty}>
            <RefreshCw className="w-4 h-4 mr-1" />Reset
          </Button>
          <Button size="sm" className="bg-brand-600 hover:bg-brand-700" onClick={handleSave} disabled={saving || !isDirty}>
            {saving ? <RefreshCw className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* General */}
        <SectionCard icon={Globe} title="General" description="Basic platform information">
          <div>
            <Label className="text-gray-300 text-xs mb-1.5 block">Platform Name</Label>
            <Input value={settings.platformName} onChange={(e) => update("platformName", e.target.value)}
              className="bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-500 rounded-xl" />
          </div>
          <div>
            <Label className="text-gray-300 text-xs mb-1.5 block">Support Email</Label>
            <Input type="email" value={settings.platformEmail} onChange={(e) => update("platformEmail", e.target.value)}
              className="bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-500 rounded-xl" />
          </div>
          <div>
            <Label className="text-gray-300 text-xs mb-1.5 block">Support Phone</Label>
            <Input value={settings.supportPhone} onChange={(e) => update("supportPhone", e.target.value)}
              className="bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-500 rounded-xl" />
          </div>
        </SectionCard>

        {/* Financial */}
        <SectionCard icon={IndianRupee} title="Financial" description="Fees and commission settings">
          <div>
            <Label className="text-gray-300 text-xs mb-1.5 block">CA Onboarding Fee (₹)</Label>
            <Input type="number" value={settings.caOnboardingFee} onChange={(e) => update("caOnboardingFee", Number(e.target.value))}
              className="bg-gray-800 border-gray-700 text-gray-100 rounded-xl" min={0} />
            <p className="text-xs text-gray-500 mt-1">One-time fee paid by CA professionals to join the platform</p>
          </div>
          <div>
            <Label className="text-gray-300 text-xs mb-1.5 block">Platform Commission (%)</Label>
            <Input type="number" value={settings.platformCommission} onChange={(e) => update("platformCommission", Number(e.target.value))}
              className="bg-gray-800 border-gray-700 text-gray-100 rounded-xl" min={0} max={50} />
            <p className="text-xs text-gray-500 mt-1">Percentage deducted from each consultation fee</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-gray-300 text-xs mb-1.5 block">Min Consultation Fee (₹)</Label>
              <Input type="number" value={settings.minConsultationFee} onChange={(e) => update("minConsultationFee", Number(e.target.value))}
                className="bg-gray-800 border-gray-700 text-gray-100 rounded-xl" min={0} />
            </div>
            <div>
              <Label className="text-gray-300 text-xs mb-1.5 block">Max Consultation Fee (₹)</Label>
              <Input type="number" value={settings.maxConsultationFee} onChange={(e) => update("maxConsultationFee", Number(e.target.value))}
                className="bg-gray-800 border-gray-700 text-gray-100 rounded-xl" min={0} />
            </div>
          </div>
          <div className="p-3 rounded-xl bg-brand-900/20 border border-brand-800/40">
            <p className="text-xs text-brand-300">
              Current: <span className="font-semibold">₹{settings.caOnboardingFee}</span> onboarding fee • <span className="font-semibold">{settings.platformCommission}%</span> commission
            </p>
          </div>
        </SectionCard>

        {/* Access Control */}
        <SectionCard icon={Shield} title="Access Control" description="User registration and access settings">
          <ToggleRow
            label="Allow New Client Registrations"
            description="Let new clients sign up on the platform"
            checked={settings.allowNewRegistrations}
            onCheckedChange={(v) => update("allowNewRegistrations", v)}
          />
          <div className="border-t border-gray-800" />
          <ToggleRow
            label="Allow CA Registrations"
            description="Let new CA professionals apply to join"
            checked={settings.allowCARegistrations}
            onCheckedChange={(v) => update("allowCARegistrations", v)}
          />
          <div className="border-t border-gray-800" />
          <div>
            <Label className="text-gray-300 text-xs mb-1.5 block">Max Bookings per CA per Day</Label>
            <Input type="number" value={settings.maxBookingsPerDay} onChange={(e) => update("maxBookingsPerDay", Number(e.target.value))}
              className="bg-gray-800 border-gray-700 text-gray-100 rounded-xl" min={1} max={50} />
          </div>
        </SectionCard>

        {/* Notifications */}
        <SectionCard icon={Bell} title="Notifications" description="Email and WhatsApp notification settings">
          <ToggleRow
            label="Email Notifications"
            description="Send booking confirmations, reminders and OTPs via email"
            checked={settings.emailNotificationsEnabled}
            onCheckedChange={(v) => update("emailNotificationsEnabled", v)}
          />
          <div className="border-t border-gray-800" />
          <ToggleRow
            label="WhatsApp Notifications"
            description="Send booking updates and reminders via WhatsApp Business API"
            checked={settings.whatsappNotificationsEnabled}
            onCheckedChange={(v) => update("whatsappNotificationsEnabled", v)}
          />
          <div className="border-t border-gray-800" />
          <div>
            <Label className="text-gray-300 text-xs mb-1.5 block">Notification Email Address</Label>
            <Input type="email" value={settings.platformEmail} onChange={(e) => update("platformEmail", e.target.value)}
              className="bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-500 rounded-xl"
              placeholder="noreply@capro.in" />
          </div>
        </SectionCard>

        {/* Announcement Banner */}
        <SectionCard icon={Settings2} title="Announcement Banner" description="Show a banner message to all users">
          <ToggleRow
            label="Enable Banner"
            description="Display the announcement on all public pages"
            checked={settings.announcementEnabled}
            onCheckedChange={(v) => update("announcementEnabled", v)}
          />
          <div>
            <Label className="text-gray-300 text-xs mb-1.5 block">Banner Message</Label>
            <Textarea value={settings.announcementBanner} onChange={(e) => update("announcementBanner", e.target.value)}
              className="bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-500 rounded-xl resize-none"
              placeholder="e.g. Tax filing deadline: 31 July 2025. File your returns now!" rows={3} />
          </div>
        </SectionCard>

        {/* Maintenance Mode */}
        <SectionCard icon={AlertTriangle} title="Maintenance Mode" description="Take the platform offline temporarily">
          <div className={`p-4 rounded-xl border ${settings.maintenanceMode ? "bg-red-900/20 border-red-800/40" : "bg-gray-800/50 border-gray-700"}`}>
            <ToggleRow
              label="Enable Maintenance Mode"
              description="All users will see a maintenance page. Admins can still log in."
              checked={settings.maintenanceMode}
              onCheckedChange={(v) => update("maintenanceMode", v)}
              variant="danger"
            />
          </div>
          {settings.maintenanceMode && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2 p-3 rounded-xl bg-red-900/20 border border-red-800/40">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <p className="text-xs text-red-300">
                Maintenance mode is <strong>ON</strong>. All client and CA sessions will be blocked until this is disabled. Only Super Admins can access the platform.
              </p>
            </motion.div>
          )}
        </SectionCard>

      </div>

      {/* Sticky save bar */}
      {isDirty && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <div className="flex items-center gap-3 bg-gray-800 border border-gray-700 rounded-2xl px-5 py-3 shadow-2xl">
            <p className="text-sm text-gray-300">You have unsaved changes</p>
            <Button size="sm" variant="ghost" className="text-gray-400 hover:text-gray-200" onClick={handleReset}>Discard</Button>
            <Button size="sm" className="bg-brand-600 hover:bg-brand-700" onClick={handleSave} disabled={saving}>
              {saving ? <RefreshCw className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
              Save
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
