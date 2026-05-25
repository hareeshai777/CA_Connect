"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckSquare, Clock, RefreshCw, CheckCircle2, AlertTriangle,
  User, ChevronDown, Filter, Loader2, UserCheck, X, MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { toast } from "sonner";

type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
type TaskStatus = "PENDING" | "IN_PROGRESS" | "WAITING_FOR_CLIENT" | "WAITING_FOR_CA" | "COMPLETED" | "CANCELLED";

interface Task {
  id: string;
  taskNumber: string;
  title: string;
  description?: string;
  priority: Priority;
  status: TaskStatus;
  dueDate?: string;
  createdAt: string;
  completedAt?: string;
  assignedTo?: { firstName: string; lastName: string; designation?: string };
  assignedByCa?: { firstName: string; lastName: string; membershipNumber?: string };
  booking?: { service?: { name: string }; clientProfile?: { firstName: string; lastName: string } };
  clientProfile?: { firstName: string; lastName: string };
}

const PRIORITY_CONFIG: Record<Priority, { label: string; cls: string }> = {
  URGENT: { label: "Urgent", cls: "bg-red-100 text-red-700" },
  HIGH:   { label: "High",   cls: "bg-orange-100 text-orange-700" },
  MEDIUM: { label: "Medium", cls: "bg-yellow-100 text-yellow-700" },
  LOW:    { label: "Low",    cls: "bg-green-100 text-green-700" },
};

const STATUS_CONFIG: Record<TaskStatus, { label: string; icon: any; color: string; bg: string }> = {
  PENDING:            { label: "Pending",          icon: Clock,         color: "text-yellow-600", bg: "bg-yellow-50" },
  IN_PROGRESS:        { label: "In Progress",      icon: RefreshCw,     color: "text-blue-600",   bg: "bg-blue-50" },
  WAITING_FOR_CLIENT: { label: "Waiting / Client", icon: User,          color: "text-purple-600", bg: "bg-purple-50" },
  WAITING_FOR_CA:     { label: "Waiting / CA",     icon: User,          color: "text-indigo-600", bg: "bg-indigo-50" },
  COMPLETED:          { label: "Completed",         icon: CheckCircle2,  color: "text-green-600",  bg: "bg-green-50" },
  CANCELLED:          { label: "Cancelled",         icon: AlertTriangle, color: "text-gray-400",   bg: "bg-gray-50" },
};

const NEXT_STATUS: Partial<Record<TaskStatus, TaskStatus>> = {
  PENDING:     "IN_PROGRESS",
  IN_PROGRESS: "COMPLETED",
};

const DEMO_TASKS: Task[] = [
  { id: "1", taskNumber: "TASK-0001", title: "Collect GST registration documents from Rahul Sharma", description: "Need PAN card, Aadhaar, address proof, bank statement, and business registration certificate. Client has been informed via WhatsApp.", priority: "URGENT", status: "PENDING",      createdAt: new Date(Date.now() - 3600000).toISOString(), dueDate: new Date(Date.now() + 3600000 * 3).toISOString(), assignedByCa: { firstName: "Priya", lastName: "Menon" }, booking: { service: { name: "GST Filing" }, clientProfile: { firstName: "Rahul", lastName: "Sharma" } } },
  { id: "2", taskNumber: "TASK-0002", title: "Verify PAN & Aadhaar for TechStart Pvt Ltd registration", description: "Cross-check all director documents. MOA draft pending CA review.", priority: "HIGH",   status: "IN_PROGRESS", createdAt: new Date(Date.now() - 7200000).toISOString(), dueDate: new Date(Date.now() + 3600000 * 6).toISOString(), assignedByCa: { firstName: "Arjun", lastName: "Patel" },  booking: { service: { name: "Company Registration" }, clientProfile: { firstName: "TechStart", lastName: "Pvt Ltd" } } },
  { id: "3", taskNumber: "TASK-0003", title: "Follow up on Form 16 for Sunita Rao's income tax return", priority: "MEDIUM", status: "WAITING_FOR_CLIENT", createdAt: new Date(Date.now() - 86400000).toISOString(), assignedByCa: { firstName: "Vikram", lastName: "Singh" }, booking: { service: { name: "Income Tax Filing" }, clientProfile: { firstName: "Sunita", lastName: "Rao" } } },
  { id: "4", taskNumber: "TASK-0004", title: "Prepare audit document checklist for ABC Industries", priority: "LOW",    status: "PENDING",      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), dueDate: new Date(Date.now() + 86400000 * 3).toISOString(), assignedByCa: { firstName: "Deepa", lastName: "Nair" }, booking: { service: { name: "Audit Services" }, clientProfile: { firstName: "ABC", lastName: "Industries" } } },
  { id: "5", taskNumber: "TASK-0005", title: "Collect trademark registration form and IP documents", priority: "MEDIUM", status: "COMPLETED", createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), completedAt: new Date(Date.now() - 3600000).toISOString(), assignedByCa: { firstName: "Priya", lastName: "Menon" }, booking: { service: { name: "Trademark Registration" }, clientProfile: { firstName: "BrandX", lastName: "Corp" } } },
];

export default function AssistanceTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ myTasks: "true" });
      if (filterStatus) params.set("status", filterStatus);
      if (filterPriority) params.set("priority", filterPriority);
      const res = await api.get(`/assistance/tasks?${params}`);
      const fetched = res.data.data.tasks as Task[];
      if (fetched.length === 0 && !filterStatus && !filterPriority) {
        setTasks(DEMO_TASKS);
        setIsDemo(true);
      } else {
        setTasks(fetched);
        setIsDemo(false);
      }
    } catch {
      setTasks(DEMO_TASKS);
      setIsDemo(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, [filterStatus, filterPriority]);

  const updateStatus = async (taskId: string, newStatus: TaskStatus) => {
    const prev = tasks;
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus, ...(newStatus === "COMPLETED" ? { completedAt: new Date().toISOString() } : {}) } : t));
    if (isDemo) return;
    setUpdatingId(taskId);
    try {
      await api.patch(`/assistance/tasks/${taskId}/status`, { status: newStatus });
    } catch {
      setTasks(prev);
      toast.error("Failed to update task status");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-2xl font-bold font-heading flex items-center gap-2">
          <CheckSquare className="w-6 h-6 text-emerald-600" />
          My Tasks
        </motion.h1>
        <p className="text-sm text-muted-foreground mt-1">Tasks assigned to you by CA professionals — process them to complete client services</p>
      </div>

      {/* Status summary chips */}
      <div className="flex flex-wrap gap-2">
        {(Object.entries(STATUS_CONFIG) as [TaskStatus, typeof STATUS_CONFIG[TaskStatus]][]).map(([status, cfg]) => {
          const count = tasks.filter(t => t.status === status).length;
          if (count === 0) return null;
          const Icon = cfg.icon;
          return (
            <button key={status} onClick={() => setFilterStatus(filterStatus === status ? "" : status)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${filterStatus === status ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-border bg-muted/50 text-muted-foreground hover:text-foreground"}`}>
              <Icon className={`w-3 h-3 ${filterStatus === status ? "text-emerald-600" : cfg.color}`} />
              {cfg.label}
              <span className={`ml-0.5 px-1.5 py-0 rounded-md text-[10px] font-bold ${cfg.bg} ${cfg.color}`}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Priority filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">Priority:</span>
        {["", "URGENT", "HIGH", "MEDIUM", "LOW"].map(p => (
          <button key={p} onClick={() => setFilterPriority(p)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${filterPriority === p ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
            {p === "" ? "All" : p.charAt(0) + p.slice(1).toLowerCase()}
          </button>
        ))}
        {(filterStatus || filterPriority) && (
          <button onClick={() => { setFilterStatus(""); setFilterPriority(""); }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium text-red-600 hover:bg-red-50 transition-colors ml-1">
            <X className="w-3 h-3" /> Clear filters
          </button>
        )}
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
          </div>
        ) : tasks.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-300 mb-4" />
              <p className="font-medium text-muted-foreground">No tasks match your filters</p>
              <p className="text-sm text-muted-foreground mt-1">Try clearing the filters or check back later</p>
            </CardContent>
          </Card>
        ) : (
          tasks.map((task, i) => {
            const pri = PRIORITY_CONFIG[task.priority];
            const sts = STATUS_CONFIG[task.status];
            const StsIcon = sts.icon;
            const expanded = expandedId === task.id;
            const nextStatus = NEXT_STATUS[task.status];
            const clientName = task.booking?.clientProfile
              ? `${task.booking.clientProfile.firstName} ${task.booking.clientProfile.lastName}`
              : task.clientProfile
              ? `${task.clientProfile.firstName} ${task.clientProfile.lastName}`
              : null;

            return (
              <motion.div key={task.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}>
                <Card className={`transition-shadow hover:shadow-md ${task.status === "COMPLETED" ? "opacity-70" : ""}`}>
                  <CardContent className="p-0">
                    {/* Main Row */}
                    <div className="flex items-start gap-3 p-4">
                      {/* Priority badge */}
                      <div className={`mt-0.5 px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 ${pri.cls}`}>
                        {pri.label}
                      </div>

                      {/* Task info — clickable to expand */}
                      <button className="flex-1 min-w-0 text-left" onClick={() => setExpandedId(expanded ? null : task.id)}>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[10px] font-mono text-muted-foreground">{task.taskNumber}</span>
                          <span className={`flex items-center gap-1 text-[11px] font-medium ${sts.color}`}>
                            <StsIcon className="w-3 h-3" />{sts.label}
                          </span>
                        </div>
                        <p className="font-semibold text-sm leading-snug">{task.title}</p>
                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                          {task.assignedByCa && (
                            <span className="flex items-center gap-1 text-xs text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-md">
                              <UserCheck className="w-3 h-3" />
                              CA {task.assignedByCa.firstName} {task.assignedByCa.lastName}
                            </span>
                          )}
                          {task.booking?.service && (
                            <span className="text-xs text-muted-foreground">{task.booking.service.name}</span>
                          )}
                          {clientName && (
                            <span className="text-xs text-muted-foreground">· {clientName}</span>
                          )}
                          {task.dueDate && (
                            <span className={`flex items-center gap-1 text-xs ${new Date(task.dueDate) < new Date() && task.status !== "COMPLETED" ? "text-red-500 font-medium" : "text-muted-foreground"}`}>
                              <Clock className="w-3 h-3" />
                              Due {new Date(task.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                            </span>
                          )}
                        </div>
                      </button>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        {nextStatus && task.status !== "COMPLETED" && (
                          <Button size="sm" variant={nextStatus === "COMPLETED" ? "default" : "outline"}
                            disabled={updatingId === task.id}
                            onClick={() => updateStatus(task.id, nextStatus)}
                            className={`h-8 text-xs rounded-lg ${nextStatus === "COMPLETED" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : nextStatus === "IN_PROGRESS" ? "border-blue-300 text-blue-700 hover:bg-blue-50" : ""}`}>
                            {updatingId === task.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : nextStatus === "IN_PROGRESS" ? (
                              "Start"
                            ) : (
                              "Complete"
                            )}
                          </Button>
                        )}
                        <button onClick={() => setExpandedId(expanded ? null : task.id)}
                          className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`} />
                        </button>
                      </div>
                    </div>

                    {/* Expanded Detail */}
                    <AnimatePresence>
                      {expanded && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                          className="overflow-hidden border-t border-border">
                          <div className="p-4 bg-muted/20 space-y-4">
                            {/* Description */}
                            <div>
                              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Instructions from CA</p>
                              {task.description ? (
                                <p className="text-sm leading-relaxed text-foreground bg-white border border-border rounded-xl px-3 py-2.5">
                                  {task.description}
                                </p>
                              ) : (
                                <p className="text-sm text-muted-foreground italic">No specific instructions provided.</p>
                              )}
                            </div>

                            {/* Meta grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              {task.assignedByCa && (
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-8 w-8 shrink-0">
                                    <AvatarFallback className="bg-brand-100 text-brand-700 text-xs font-bold">
                                      {getInitials(task.assignedByCa.firstName, task.assignedByCa.lastName)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="text-[10px] text-muted-foreground">Assigned by</p>
                                    <p className="text-xs font-semibold">CA {task.assignedByCa.firstName} {task.assignedByCa.lastName}</p>
                                  </div>
                                </div>
                              )}
                              {clientName && (
                                <div>
                                  <p className="text-[10px] text-muted-foreground mb-0.5">Client</p>
                                  <p className="text-xs font-semibold">{clientName}</p>
                                </div>
                              )}
                              <div>
                                <p className="text-[10px] text-muted-foreground mb-0.5">Created</p>
                                <p className="text-xs font-semibold">
                                  {new Date(task.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                </p>
                              </div>
                              {task.completedAt && (
                                <div>
                                  <p className="text-[10px] text-muted-foreground mb-0.5">Completed</p>
                                  <p className="text-xs font-semibold text-green-600">
                                    {new Date(task.completedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Status flow — all valid next statuses */}
                            {task.status !== "COMPLETED" && task.status !== "CANCELLED" && (
                              <div>
                                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Update Status</p>
                                <div className="flex flex-wrap gap-2">
                                  {(["PENDING", "IN_PROGRESS", "WAITING_FOR_CLIENT", "WAITING_FOR_CA", "COMPLETED"] as TaskStatus[])
                                    .filter(s => s !== task.status)
                                    .map(s => {
                                      const sc = STATUS_CONFIG[s];
                                      const SIcon = sc.icon;
                                      return (
                                        <button key={s}
                                          disabled={updatingId === task.id}
                                          onClick={() => updateStatus(task.id, s)}
                                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors hover:opacity-90 ${sc.bg} ${sc.color} border-current/20`}>
                                          <SIcon className="w-3 h-3" />
                                          Mark as {sc.label}
                                        </button>
                                      );
                                    })}
                                </div>
                              </div>
                            )}

                            {/* Message link */}
                            <a href="/assistance/communication"
                              className="inline-flex items-center gap-2 text-xs text-emerald-600 hover:text-emerald-700 font-medium mt-1">
                              <MessageSquare className="w-3.5 h-3.5" />
                              Message CA about this task
                            </a>
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
