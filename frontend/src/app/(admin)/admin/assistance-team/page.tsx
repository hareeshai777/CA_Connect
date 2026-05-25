"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users, UserPlus, CheckCircle, Clock, AlertCircle, Search, Filter,
  Mail, Phone, Loader2, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface AssistanceMember {
  id: string;
  firstName: string;
  lastName: string;
  designation?: string;
  department?: string;
  isActive: boolean;
  createdAt: string;
  user: { id: string; email: string; phone?: string; isActive: boolean };
  assignedCases: { id: string; status: string }[];
  assignedTasks: { id: string; status: string }[];
}

const BLANK_FORM = { email: "", password: "", phone: "", firstName: "", lastName: "", designation: "", department: "" };

export default function AdminAssistanceTeamPage() {
  const [members, setMembers] = useState<AssistanceMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(BLANK_FORM);
  const [saving, setSaving] = useState(false);

  const fetchMembers = () => {
    setLoading(true);
    api.get("/admin/assistance-team")
      .then(r => setMembers(r.data.data))
      .catch(() => toast.error("Failed to load assistance team"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchMembers(); }, []);

  const filtered = members.filter(m => {
    const q = search.toLowerCase();
    const matchSearch = `${m.firstName} ${m.lastName}`.toLowerCase().includes(q)
      || (m.department || "").toLowerCase().includes(q)
      || m.user.email.toLowerCase().includes(q);
    const matchStatus = filterActive === "all" || (filterActive === "active" ? m.isActive : !m.isActive);
    return matchSearch && matchStatus;
  });

  const totalActive = members.filter(m => m.isActive).length;
  const totalCases = members.reduce((a, m) => a + m.assignedCases.filter(c => !["COMPLETED","CLOSED"].includes(c.status)).length, 0);
  const totalTasks = members.reduce((a, m) => a + m.assignedTasks.filter(t => t.status !== "COMPLETED").length, 0);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.email || !form.password || !form.firstName || !form.lastName) {
      toast.error("Email, password, first name and last name are required"); return;
    }
    setSaving(true);
    try {
      await api.post("/admin/assistance-team", form);
      toast.success("Assistance team member created");
      setShowAdd(false);
      setForm(BLANK_FORM);
      fetchMembers();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create member");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (member: AssistanceMember) => {
    try {
      await api.patch(`/admin/assistance-team/${member.id}`, { isActive: !member.isActive });
      setMembers(prev => prev.map(m => m.id === member.id ? { ...m, isActive: !m.isActive } : m));
      toast.success(`Member ${member.isActive ? "deactivated" : "activated"}`);
    } catch {
      toast.error("Failed to update member");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-gray-100">Assistance Team</h1>
          <p className="text-gray-400 text-sm mt-1">Manage and monitor your assistance team members</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="rounded-xl bg-brand-600 hover:bg-brand-700 text-white">
          <UserPlus className="mr-2 w-4 h-4" /> Add Member
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Members", value: members.length, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
          { label: "Active Members", value: totalActive, icon: CheckCircle, color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
          { label: "Active Cases", value: totalCases, icon: Clock, color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
          { label: "Active Tasks", value: totalTasks, icon: AlertCircle, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
        ].map(({ label, value, icon: Icon, color, bg }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <div className={`p-5 rounded-2xl border ${bg}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 mb-1">{label}</p>
                  <p className="text-2xl font-bold font-heading text-gray-100">{value}</p>
                </div>
                <Icon className={`w-8 h-8 ${color} opacity-60`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input placeholder="Search by name, email or department…" className="pl-9 bg-gray-800 border-gray-700 text-gray-100 rounded-xl"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            {(["all", "active", "inactive"] as const).map(f => (
              <button key={f} onClick={() => setFilterActive(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterActive === f ? "bg-brand-600 text-white" : "bg-gray-800 text-gray-400 hover:text-gray-100"}`}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Add Member Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <Card className="w-full max-w-md bg-gray-900 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-100">Add Assistance Member</h2>
                <button onClick={() => { setShowAdd(false); setForm(BLANK_FORM); }}
                  className="p-1.5 hover:bg-gray-800 rounded-lg"><X className="w-4 h-4 text-gray-400" /></button>
              </div>
              <form onSubmit={handleCreate} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">First Name *</label>
                    <Input value={form.firstName} onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))}
                      className="bg-gray-800 border-gray-700 text-gray-100 rounded-xl" placeholder="First name" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Last Name *</label>
                    <Input value={form.lastName} onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))}
                      className="bg-gray-800 border-gray-700 text-gray-100 rounded-xl" placeholder="Last name" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Email *</label>
                  <Input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    className="bg-gray-800 border-gray-700 text-gray-100 rounded-xl" placeholder="email@example.com" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Password *</label>
                  <Input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    className="bg-gray-800 border-gray-700 text-gray-100 rounded-xl" placeholder="Temporary password" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Phone</label>
                  <Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                    className="bg-gray-800 border-gray-700 text-gray-100 rounded-xl" placeholder="+91 98765 43210" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Designation</label>
                    <Input value={form.designation} onChange={e => setForm(p => ({ ...p, designation: e.target.value }))}
                      className="bg-gray-800 border-gray-700 text-gray-100 rounded-xl" placeholder="e.g. Verifier" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Department</label>
                    <Input value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))}
                      className="bg-gray-800 border-gray-700 text-gray-100 rounded-xl" placeholder="e.g. Operations" />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => { setShowAdd(false); setForm(BLANK_FORM); }}
                    className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800 rounded-xl">Cancel</Button>
                  <Button type="submit" disabled={saving} className="flex-1 bg-brand-600 hover:bg-brand-700 text-white rounded-xl">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                    {saving ? "Creating…" : "Create Member"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Team Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-brand-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-12 text-center">
          <Users className="w-10 h-10 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">No members found</p>
          <p className="text-gray-500 text-sm mt-1">Add your first assistance team member using the button above</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((member, i) => {
            const activeCases = member.assignedCases.filter(c => !["COMPLETED","CLOSED"].includes(c.status)).length;
            const activeTasks = member.assignedTasks.filter(t => t.status !== "COMPLETED").length;
            const completedCases = member.assignedCases.filter(c => c.status === "COMPLETED").length;
            return (
              <motion.div key={member.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5 hover:border-gray-700 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-11 w-11">
                          <AvatarFallback className="bg-brand-600/20 text-brand-400 font-bold text-sm">
                            {member.firstName[0]}{member.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-900 ${member.isActive ? "bg-green-500" : "bg-gray-600"}`} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-100 text-sm">{member.firstName} {member.lastName}</p>
                        <p className="text-xs text-gray-400">{member.designation || "—"}</p>
                      </div>
                    </div>
                    <button onClick={() => toggleActive(member)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-colors border ${member.isActive ? "border-red-800 text-red-400 hover:bg-red-900/30" : "border-green-800 text-green-400 hover:bg-green-900/30"}`}>
                      {member.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-xs text-gray-400 flex-wrap">
                      {member.department && <Badge className="bg-gray-800 text-gray-300 border-gray-700 text-[10px]">{member.department}</Badge>}
                      <Badge variant={member.isActive ? "success" : "secondary"} className="text-[10px]">
                        {member.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <Mail className="w-3.5 h-3.5 shrink-0" />{member.user.email}
                    </div>
                    {member.user.phone && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <Phone className="w-3.5 h-3.5 shrink-0" />{member.user.phone}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-800">
                    <div className="text-center p-2 bg-gray-800 rounded-xl">
                      <p className="text-base font-bold text-yellow-400">{activeCases}</p>
                      <p className="text-[10px] text-gray-400">Active Cases</p>
                    </div>
                    <div className="text-center p-2 bg-gray-800 rounded-xl">
                      <p className="text-base font-bold text-blue-400">{activeTasks}</p>
                      <p className="text-[10px] text-gray-400">Active Tasks</p>
                    </div>
                    <div className="text-center p-2 bg-gray-800 rounded-xl">
                      <p className="text-base font-bold text-green-400">{completedCases}</p>
                      <p className="text-[10px] text-gray-400">Done Cases</p>
                    </div>
                  </div>

                  <p className="text-[10px] text-gray-500 mt-2 text-center">
                    Joined {new Date(member.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
