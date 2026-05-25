"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckSquare, Plus, Clock, User, CheckCircle2,
  RefreshCw, ChevronDown, X, Loader2, Send, Filter,
  Users, Briefcase, LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { api } from "@/lib/api";
import { getInitials } from "@/lib/utils";
import { toast } from "sonner";

type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
type TaskStatus = "PENDING" | "IN_PROGRESS" | "WAITING_FOR_CLIENT" | "WAITING_FOR_CA" | "COMPLETED" | "CANCELLED";

interface AssistanceMember {
  id: string;
  firstName: string;
  lastName: string;
  designation?: string;
  department?: string;
  avatarUrl?: string;
  _count?: { assignedTasks: number; assignedCases: number };
}

interface Task {
  id: string;
  taskNumber: string;
  title: string;
  description?: string;
  priority: Priority;
  status: TaskStatus;
  dueDate?: string;
  createdAt: string;
  assignedTo?: { firstName: string; lastName: string; designation?: string };
  booking?: { service?: { name: string }; clientProfile?: { firstName: string; lastName: string } };
  clientProfile?: { firstName: string; lastName: string };
}

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bg: string }> = {
  URGENT: { label: "Urgent", color: "text-red-700",    bg: "bg-red-100"    },
  HIGH:   { label: "High",   color: "text-orange-700", bg: "bg-orange-100" },
  MEDIUM: { label: "Medium", color: "text-yellow-700", bg: "bg-yellow-100" },
  LOW:    { label: "Low",    color: "text-green-700",  bg: "bg-green-100"  },
};

const STATUS_CONFIG: Record<TaskStatus, { label: string; icon: any; color: string }> = {
  PENDING:            { label: "Pending",          icon: Clock,        color: "text-yellow-600" },
  IN_PROGRESS:        { label: "In Progress",      icon: RefreshCw,    color: "text-blue-600"   },
  WAITING_FOR_CLIENT: { label: "Waiting / Client", icon: User,         color: "text-purple-600" },
  WAITING_FOR_CA:     { label: "Waiting / CA",     icon: User,         color: "text-indigo-600" },
  COMPLETED:          { label: "Completed",         icon: CheckCircle2, color: "text-green-600"  },
  CANCELLED:          { label: "Cancelled",         icon: X,            color: "text-gray-400"   },
};

const defaultForm = {
  title: "",
  description: "",
  priority: "MEDIUM" as Priority,
  dueDate: "",
};

export default function CATasksPage() {
  const [tasks, setTasks]               = useState<Task[]>([]);
  const [members, setMembers]           = useState<AssistanceMember[]>([]);
  const [total, setTotal]               = useState(0);
  const [loading, setLoading]           = useState(true);
  const [submitting, setSubmitting]     = useState(false);
  const [showForm, setShowForm]         = useState(false);
  const [form, setForm]                 = useState(defaultForm);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [expandedTask, setExpandedTask] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus)   params.set("status",   filterStatus);
      if (filterPriority) params.set("priority", filterPriority);
      const [tasksRes, membersRes] = await Promise.all([
        api.get(`/ca/tasks?${params}`),
        api.get("/ca/assistance-members"),
      ]);
      setTasks(tasksRes.data.data.tasks ?? []);
      setTotal(tasksRes.data.data.total ?? 0);
      setMembers(membersRes.data.data ?? []);
    } catch {
      // leave empty on failure
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [filterStatus, filterPriority]);

  const toggleMember = (id: string) => {
    setSelectedMembers(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSubmitting(true);

    const targets = selectedMembers.length > 0 ? selectedMembers : [undefined];

    try {
      await Promise.all(
        targets.map(assignedToId =>
          api.post("/ca/tasks", {
            ...form,
            assignedToId: assignedToId || undefined,
            dueDate: form.dueDate || undefined,
          })
        )
      );

      const count = targets.length;
      toast.success(
        count > 1
          ? `Task assigned to ${count} team members`
          : "Task assigned to assistance team"
      );
      setForm(defaultForm);
      setSelectedMembers([]);
      setShowForm(false);
      fetchData();
    } catch {
      toast.error("Failed to assign task");
    } finally {
      setSubmitting(false);
    }
  };

  const statusCounts = tasks.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-2xl font-bold font-heading flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-brand-600" />
            Task Dashboard
          </motion.h1>
          <p className="text-muted-foreground text-sm mt-1">
            Assign and track tasks for your assistance team
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}
          className="rounded-xl bg-brand-600 hover:bg-brand-700 gap-2">
          <Plus className="w-4 h-4" />
          Assign New Task
        </Button>
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Assigned", value: total,                               color: "text-brand-600",  bg: "bg-brand-50"  },
          { label: "In Progress",    value: statusCounts["IN_PROGRESS"] || 0,    color: "text-blue-600",   bg: "bg-blue-50"   },
          { label: "Pending",        value: statusCounts["PENDING"] || 0,         color: "text-yellow-600", bg: "bg-yellow-50" },
          { label: "Completed",      value: statusCounts["COMPLETED"] || 0,       color: "text-green-600",  bg: "bg-green-50"  },
        ].map(({ label, value, color, bg }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                  <span className={`text-lg font-bold font-heading ${color}`}>{value}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-tight">{label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Task Assignment Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}>
            <Card className="border-brand-200 shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Send className="w-4 h-4 text-brand-600" />
                    New Task for Assistance Team
                  </CardTitle>
                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg"
                    onClick={() => { setShowForm(false); setSelectedMembers([]); }}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Title */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Task Title *</label>
                    <input
                      required
                      value={form.title}
                      onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                      placeholder="e.g. Collect GST registration documents from client"
                      className="w-full px-3 py-2 text-sm border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Instructions</label>
                    <textarea
                      rows={3}
                      value={form.description}
                      onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      placeholder="Detailed instructions for the assistance team..."
                      className="w-full px-3 py-2 text-sm border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                    />
                  </div>

                  {/* Priority + Due Date */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Priority</label>
                      <select
                        value={form.priority}
                        onChange={e => setForm(f => ({ ...f, priority: e.target.value as Priority }))}
                        className="w-full px-3 py-2 text-sm border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-brand-500">
                        {(["URGENT", "HIGH", "MEDIUM", "LOW"] as Priority[]).map(p => (
                          <option key={p} value={p}>{p.charAt(0) + p.slice(1).toLowerCase()}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Due Date</label>
                      <input
                        type="datetime-local"
                        value={form.dueDate}
                        onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                        className="w-full px-3 py-2 text-sm border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                  </div>

                  {/* Assign To — multi-select member cards */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" />
                        Assign To
                        {selectedMembers.length > 0 && (
                          <span className="ml-1 px-1.5 py-0.5 rounded-md bg-brand-100 text-brand-700 text-[10px] font-bold">
                            {selectedMembers.length} selected
                          </span>
                        )}
                      </label>
                      {selectedMembers.length > 0 && (
                        <button type="button" onClick={() => setSelectedMembers([])}
                          className="text-[11px] text-muted-foreground hover:text-foreground underline">
                          Clear selection
                        </button>
                      )}
                    </div>

                    {members.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic py-2">
                        No active assistance team members found. Task will be created unassigned.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-52 overflow-y-auto pr-1">
                        {members.map(m => {
                          const isSelected = selectedMembers.includes(m.id);
                          const activeTasks = m._count?.assignedTasks ?? 0;
                          return (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => toggleMember(m.id)}
                              className={`flex items-center gap-2.5 p-3 rounded-xl border-2 text-left transition-all ${
                                isSelected
                                  ? "border-brand-500 bg-brand-50"
                                  : "border-border hover:border-brand-300 bg-background"
                              }`}
                            >
                              <div className="relative shrink-0">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className={`text-[10px] font-bold ${isSelected ? "bg-brand-200 text-brand-800" : "bg-muted text-muted-foreground"}`}>
                                    {getInitials(m.firstName, m.lastName)}
                                  </AvatarFallback>
                                </Avatar>
                                {isSelected && (
                                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-600 text-white rounded-full flex items-center justify-center text-[9px] font-bold">✓</span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-xs font-semibold truncate ${isSelected ? "text-brand-800" : "text-foreground"}`}>
                                  {m.firstName} {m.lastName}
                                </p>
                                {m.designation && (
                                  <p className="text-[10px] text-muted-foreground truncate">{m.designation}</p>
                                )}
                                <div className="flex items-center gap-1 mt-0.5">
                                  <Briefcase className="w-2.5 h-2.5 text-muted-foreground" />
                                  <span className={`text-[10px] font-medium ${activeTasks >= 5 ? "text-red-500" : activeTasks >= 3 ? "text-orange-500" : "text-green-600"}`}>
                                    {activeTasks} active task{activeTasks !== 1 ? "s" : ""}
                                  </span>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {selectedMembers.length === 0 && members.length > 0 && (
                      <p className="text-[11px] text-muted-foreground mt-1.5 italic">
                        No member selected — task will be created as unassigned
                      </p>
                    )}
                    {selectedMembers.length > 1 && (
                      <p className="text-[11px] text-brand-600 mt-1.5 font-medium flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        One copy of this task will be created for each selected member ({selectedMembers.length} tasks total)
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 justify-end pt-1 border-t border-border">
                    <Button type="button" variant="outline" className="rounded-xl"
                      onClick={() => { setShowForm(false); setSelectedMembers([]); }}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={submitting} className="rounded-xl bg-brand-600 hover:bg-brand-700 gap-2">
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      {selectedMembers.length > 1 ? `Assign to ${selectedMembers.length} Members` : "Assign Task"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground font-medium">Filter:</span>
        {["", "PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${filterStatus === s ? "bg-brand-600 text-white" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
            {s === "" ? "All" : s.replace(/_/g, " ")}
          </button>
        ))}
        <div className="mx-1 h-4 w-px bg-border" />
        {["", "URGENT", "HIGH", "MEDIUM", "LOW"].map(p => (
          <button key={p} onClick={() => setFilterPriority(p)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${filterPriority === p ? "bg-brand-600 text-white" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
            {p === "" ? "All Priority" : p.charAt(0) + p.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
          </div>
        ) : tasks.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <CheckSquare className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <p className="font-medium text-muted-foreground">No tasks found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Click "Assign New Task" to create your first task for the assistance team
              </p>
            </CardContent>
          </Card>
        ) : (
          tasks.map((task, i) => {
            const pri = PRIORITY_CONFIG[task.priority];
            const sts = STATUS_CONFIG[task.status];
            const StsIcon = sts.icon;
            const expanded = expandedTask === task.id;
            const clientName = task.booking?.clientProfile
              ? `${task.booking.clientProfile.firstName} ${task.booking.clientProfile.lastName}`
              : task.clientProfile
              ? `${task.clientProfile.firstName} ${task.clientProfile.lastName}`
              : null;

            return (
              <motion.div key={task.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-0">
                    <button
                      onClick={() => setExpandedTask(expanded ? null : task.id)}
                      className="w-full flex items-start gap-4 p-4 text-left">
                      <div className={`mt-0.5 px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 ${pri.bg} ${pri.color}`}>
                        {pri.label}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-xs text-muted-foreground font-mono">{task.taskNumber}</span>
                          <span className={`flex items-center gap-1 text-xs font-medium ${sts.color}`}>
                            <StsIcon className="w-3 h-3" />
                            {sts.label}
                          </span>
                        </div>
                        <p className="font-medium text-sm leading-snug">{task.title}</p>
                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                          {task.assignedTo ? (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <User className="w-3 h-3" />
                              {task.assignedTo.firstName} {task.assignedTo.lastName}
                              {task.assignedTo.designation && ` · ${task.assignedTo.designation}`}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">Unassigned</span>
                          )}
                          {clientName && <span className="text-xs text-muted-foreground">Client: {clientName}</span>}
                          {task.booking?.service && <span className="text-xs text-muted-foreground">{task.booking.service.name}</span>}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        {task.dueDate && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {new Date(task.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </div>
                        )}
                        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`} />
                      </div>
                    </button>

                    <AnimatePresence>
                      {expanded && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                          className="overflow-hidden border-t border-border">
                          <div className="px-4 py-3 bg-muted/30 space-y-3">
                            {task.description ? (
                              <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Instructions</p>
                                <p className="text-sm text-foreground leading-relaxed">{task.description}</p>
                              </div>
                            ) : (
                              <p className="text-xs text-muted-foreground italic">No description provided</p>
                            )}
                            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground pt-1">
                              <span>Created: {new Date(task.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                              {task.assignedTo && (
                                <span className="flex items-center gap-1">
                                  <Avatar className="h-4 w-4">
                                    <AvatarFallback className="text-[8px] bg-emerald-100 text-emerald-700">
                                      {getInitials(task.assignedTo.firstName, task.assignedTo.lastName)}
                                    </AvatarFallback>
                                  </Avatar>
                                  Assigned to {task.assignedTo.firstName} {task.assignedTo.lastName}
                                </span>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
