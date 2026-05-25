"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  IndianRupee, Settings, Save, TrendingUp, Users, Award,
  Briefcase, RefreshCw, CheckCircle, AlertCircle, PieChart,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart as RechartsPie, Pie, Cell } from "recharts";
import toast from "react-hot-toast";

const COMMISSION_REVENUE_DATA = [
  { month: "Jan", platform: 45000, ca: 157500, assistance: 22500 },
  { month: "Feb", platform: 67000, ca: 234500, assistance: 33500 },
  { month: "Mar", platform: 89000, ca: 311500, assistance: 44500 },
  { month: "Apr", platform: 112000, ca: 392000, assistance: 56000 },
  { month: "May", platform: 145000, ca: 507500, assistance: 72500 },
  { month: "Jun", platform: 178000, ca: 623000, assistance: 89000 },
];

const PIE_COLORS = ["#3b82f6", "#22c55e", "#f59e0b"];

export default function AdminCommissionsPage() {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [commissions, setCommissions] = useState({
    platformPct: 20,
    caPct: 70,
    assistancePct: 10,
    consultationFee: 499,
  });

  const total = commissions.platformPct + commissions.caPct + commissions.assistancePct;
  const isValid = total === 100;

  const handleSave = async () => {
    if (!isValid) { toast.error("Percentages must add up to 100%"); return; }
    setSaving(true);
    try {
      // await api.put("/admin/commission-settings", commissions);
      await new Promise(r => setTimeout(r, 1000));
      setSaved(true);
      toast.success("Commission settings saved successfully!");
      setTimeout(() => setSaved(false), 3000);
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const pieData = [
    { name: "Platform", value: commissions.platformPct },
    { name: "CA", value: commissions.caPct },
    { name: "Assistance", value: commissions.assistancePct },
  ];

  const totalRevenue = COMMISSION_REVENUE_DATA.reduce((a, b) => a + b.platform, 0);
  const totalCA = COMMISSION_REVENUE_DATA.reduce((a, b) => a + b.ca, 0);
  const totalAssistance = COMMISSION_REVENUE_DATA.reduce((a, b) => a + b.assistance, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading text-gray-100">Commission Management</h1>
        <p className="text-gray-400 text-sm mt-1">Configure and track commission distribution across the platform</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Platform Revenue (6m)", value: `₹${(totalRevenue / 100000).toFixed(1)}L`, icon: IndianRupee, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
          { label: "CA Payouts (6m)", value: `₹${(totalCA / 100000).toFixed(1)}L`, icon: Award, color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
          { label: "Assistance Payouts (6m)", value: `₹${(totalAssistance / 100000).toFixed(1)}L`, icon: Users, color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
          { label: "Consultation Fee", value: `₹${commissions.consultationFee}`, icon: Briefcase, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
        ].map(({ label, value, icon: Icon, color, bg }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <div className={`p-5 rounded-2xl border ${bg}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 mb-1">{label}</p>
                  <p className="text-2xl font-bold font-heading text-gray-100">{value}</p>
                </div>
                <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Commission Settings Form */}
        <div className="lg:col-span-1">
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
            <div className="flex items-center gap-2 mb-5">
              <Settings className="w-5 h-5 text-blue-400" />
              <h2 className="font-bold font-heading text-gray-100">Commission Settings</h2>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-gray-300 text-xs mb-1.5 block">Consultation Fee (₹)</Label>
                <Input
                  type="number" min={99} max={9999}
                  value={commissions.consultationFee}
                  onChange={e => setCommissions(p => ({ ...p, consultationFee: Number(e.target.value) }))}
                  className="bg-gray-800 border-gray-700 text-gray-100 rounded-xl"
                />
                <p className="text-xs text-gray-500 mt-1">Fixed mandatory fee for all consultations</p>
              </div>

              <div className="border-t border-gray-800 pt-4">
                <p className="text-xs text-gray-400 mb-3 font-medium">Revenue Distribution</p>

                {[
                  { key: "platformPct", label: "Platform Commission", color: "text-blue-400", icon: Briefcase },
                  { key: "caPct", label: "CA Commission", color: "text-green-400", icon: Award },
                  { key: "assistancePct", label: "Assistance Team", color: "text-yellow-400", icon: Users },
                ].map(({ key, label, color, icon: Icon }) => (
                  <div key={key} className="mb-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-3.5 h-3.5 ${color}`} />
                        <Label className="text-gray-300 text-xs">{label}</Label>
                      </div>
                      <span className={`text-sm font-bold ${color}`}>{commissions[key as keyof typeof commissions]}%</span>
                    </div>
                    <Input
                      type="number" min={0} max={100}
                      value={commissions[key as keyof typeof commissions]}
                      onChange={e => setCommissions(p => ({ ...p, [key]: Number(e.target.value) }))}
                      className="bg-gray-800 border-gray-700 text-gray-100 rounded-xl h-9 text-sm"
                    />
                  </div>
                ))}

                {/* Total indicator */}
                <div className={`flex items-center justify-between p-3 rounded-xl mt-2 ${isValid ? "bg-green-500/10 border border-green-500/20" : "bg-red-500/10 border border-red-500/20"}`}>
                  <div className="flex items-center gap-2">
                    {isValid ? <CheckCircle className="w-4 h-4 text-green-400" /> : <AlertCircle className="w-4 h-4 text-red-400" />}
                    <span className="text-xs font-medium text-gray-300">Total</span>
                  </div>
                  <span className={`font-bold text-sm ${isValid ? "text-green-400" : "text-red-400"}`}>{total}%</span>
                </div>
              </div>

              <Button onClick={handleSave} disabled={saving || !isValid} className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white h-10">
                {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : saved ? <CheckCircle className="w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
              </Button>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5 mt-4">
            <div className="flex items-center gap-2 mb-3">
              <PieChart className="w-4 h-4 text-blue-400" />
              <h3 className="font-semibold text-gray-100 text-sm">Current Split</h3>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {pieData.map((_, index) => <Cell key={index} fill={PIE_COLORS[index]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => `${v}%`} contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: "8px", color: "#f9fafb" }} />
                </RechartsPie>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4">
              {pieData.map(({ name, value }, i) => (
                <div key={name} className="flex items-center gap-1.5 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i] }} />
                  <span className="text-gray-300">{name}: {value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                <h2 className="font-bold font-heading text-gray-100">Revenue Distribution (6 Months)</h2>
              </div>
              <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">Last 6 months</Badge>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={COMMISSION_REVENUE_DATA}>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#9ca3af" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#9ca3af" }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: "8px", color: "#f9fafb" }} formatter={(v: number) => [`₹${v.toLocaleString()}`, ""]} />
                <Bar dataKey="platform" name="Platform" fill="#3b82f6" radius={[4, 4, 0, 0]} stackId="a" />
                <Bar dataKey="ca" name="CA" fill="#22c55e" radius={[4, 4, 0, 0]} stackId="a" />
                <Bar dataKey="assistance" name="Assistance" fill="#f59e0b" radius={[4, 4, 0, 0]} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Payout Ledger */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800">
            <div className="flex items-center justify-between p-5 border-b border-gray-800">
              <h3 className="font-bold font-heading text-gray-100">Recent Commission Records</h3>
              <Button size="sm" variant="outline" className="text-xs border-gray-700 text-gray-300 hover:bg-gray-800 rounded-xl">Export</Button>
            </div>
            <div className="divide-y divide-gray-800">
              {[
                { booking: "BK-2024-0892", client: "Rahul Sharma", service: "GST Filing", total: 14900, platform: 2980, ca: 10430, assistance: 1490, settled: true },
                { booking: "BK-2024-0891", client: "TechStart Pvt Ltd", service: "Company Registration", total: 49900, platform: 9980, ca: 34930, assistance: 4990, settled: false },
                { booking: "BK-2024-0890", client: "Sunita Rao", service: "Income Tax Filing", total: 9900, platform: 1980, ca: 6930, assistance: 990, settled: true },
                { booking: "BK-2024-0889", client: "ABC Industries", service: "Audit Services", total: 99900, platform: 19980, ca: 69930, assistance: 9990, settled: false },
              ].map(row => (
                <div key={row.booking} className="grid grid-cols-6 gap-3 px-5 py-3.5 hover:bg-gray-800/50 transition-colors text-sm">
                  <div className="col-span-2">
                    <p className="text-gray-100 font-medium text-xs">{row.client}</p>
                    <p className="text-gray-500 text-xs">{row.booking} · {row.service}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-400">Total</p>
                    <p className="text-gray-100 font-medium text-xs">₹{(row.total / 100).toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-400">Platform</p>
                    <p className="text-blue-400 font-medium text-xs">₹{(row.platform / 100).toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-400">CA</p>
                    <p className="text-green-400 font-medium text-xs">₹{(row.ca / 100).toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <Badge variant={row.settled ? "success" : "warning"} className="text-[10px]">
                      {row.settled ? "Settled" : "Pending"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
