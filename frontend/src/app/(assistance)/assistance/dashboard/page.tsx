"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CheckSquare, FileText, Clock, ArrowRight,
  TrendingUp, CheckCircle2, RefreshCw, Zap,
  MessageSquare, Calendar, AlertTriangle, User,
  UserCheck, Inbox,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { api } from "@/lib/api";
import { getInitials } from "@/lib/utils";

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
  assignedTo?: { firstName: string; lastName: string };
  assignedByCa?: { firstName: string; lastName: string; membershipNumber?: string };
  booking?: { service?: { name: string }; clientProfile?: { firstName: string; lastName: string } };
  clientProfile?: { firstName: string; lastName: string };
}

const PRIORITY_COLORS: Record<Priority, string> = {
  URGENT: "bg-red-100 text-red-700",
  HIGH:   "bg-orange-100 text-orange-700",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  LOW:    "bg-green-100 text-green-700",
};

const STATUS_ICONS: Record<TaskStatus, any> = {
  PENDING:            Clock,
  IN_PROGRESS:        RefreshCw,
  WAITING_FOR_CLIENT: User,
  WAITING_FOR_CA:     User,
  COMPLETED:          CheckCircle2,
  CANCELLED:          AlertTriangle,
};

// Fallback demo data shown when API is not yet connected
const DEMO_TASKS: Task[] = [
  { id: "1", taskNumber: "TASK-0001", title: "Collect GST documents from Rahul Sharma", priority: "URGENT", status: "PENDING",  createdAt: new Date().toISOString(), dueDate: new Date(Date.now() + 3600000 * 3).toISOString(), assignedByCa: { firstName: "Priya", lastName: "Menon" }, booking: { service: { name: "GST Filing" }, clientProfile: { firstName: "Rahul", lastName: "Sharma" } } },
  { id: "2", taskNumber: "TASK-0002", title: "Verify PAN & Aadhaar for company registration", priority: "HIGH",   status: "IN_PROGRESS", createdAt: new Date().toISOString(), dueDate: new Date(Date.now() + 3600000 * 6).toISOString(), assignedByCa: { firstName: "Arjun", lastName: "Patel" },  booking: { service: { name: "Company Registration" }, clientProfile: { firstName: "TechStart", lastName: "Pvt Ltd" } } },
  { id: "3", taskNumber: "TASK-0003", title: "Follow up on Form 16 for income tax filing",  priority: "MEDIUM", status: "WAITING_FOR_CLIENT", createdAt: new Date().toISOString(), assignedByCa: { firstName: "Vikram", lastName: "Singh" }, booking: { service: { name: "Income Tax Filing" }, clientProfile: { firstName: "Sunita", lastName: "Rao" } } },
  { id: "4", taskNumber: "TASK-0004", title: "Prepare audit document checklist for ABC Industries", priority: "LOW", status: "PENDING", createdAt: new Date().toISOString(), dueDate: new Date(Date.now() + 86400000 * 3).toISOString(), assignedByCa: { firstName: "Deepa", lastName: "Nair" }, booking: { service: { name: "Audit Services" }, clientProfile: { firstName: "ABC", lastName: "Industries" } } },
];

export default function AssistanceDashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState({ activeTasks: 0, pendingDocs: 0, completedToday: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "urgent" | "pending" | "in_progress">("all");

  const now = new Date();
  const greeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 18 ? "Good afternoon" : "Good evening";

  useEffect(() => {
    Promise.all([
      api.get("/assistance/tasks?myTasks=true&limit=10"),
      api.get("/assistance/dashboard"),
    ])
      .then(([tasksRes, dashRes]) => {
        const fetchedTasks = tasksRes.data.data.tasks as Task[];
        const dashData = dashRes.data.data;
        if (fetchedTasks.length === 0) {
          setTasks(DEMO_TASKS);
        } else {
          setTasks(fetchedTasks);
        }
        setStats(dashData);
      })
      .catch(() => {
        setTasks(DEMO_TASKS);
        setStats({ activeTasks: DEMO_TASKS.length, pendingDocs: 5, completedToday: 1 });
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredTasks = tasks.filter(t => {
    if (filter === "urgent")     return t.priority === "URGENT" || t.priority === "HIGH";
    if (filter === "pending")    return t.status === "PENDING";
    if (filter === "in_progress") return t.status === "IN_PROGRESS";
    return true;
  });

  const urgentCount  = tasks.filter(t => t.priority === "URGENT" || t.priority === "HIGH").length;
  const inProgCount  = tasks.filter(t => t.status === "IN_PROGRESS").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-2xl font-bold font-heading">
            {greeting}! 👋
          </motion.h1>
          <p className="text-muted-foreground text-sm">Here are tasks assigned to you by CA professionals</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="rounded-xl" asChild>
            <Link href="/assistance/tasks"><CheckSquare className="mr-2 h-4 w-4" />All Tasks</Link>
          </Button>
          <Button size="sm" className="rounded-xl bg-emerald-600 hover:bg-emerald-700" asChild>
            <Link href="/assistance/documents"><FileText className="mr-2 h-4 w-4" />Verify Docs</Link>
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Tasks Assigned to Me",   value: tasks.filter(t => t.status !== "COMPLETED" && t.status !== "CANCELLED").length, icon: Inbox,        color: "text-blue-600",   bg: "bg-blue-50",   trend: `${inProgCount} in progress` },
          { label: "Urgent / High Priority", value: urgentCount,                                                                          icon: AlertTriangle, color: "text-red-600",   bg: "bg-red-50",    trend: "needs attention" },
          { label: "Docs Pending Verify",    value: stats.pendingDocs,                                                                    icon: FileText,      color: "text-orange-600", bg: "bg-orange-50", trend: "review queue" },
          { label: "Completed Today",        value: stats.completedToday,                                                                  icon: CheckCircle2,  color: "text-green-600",  bg: "bg-green-50",  trend: "great work!" },
        ].map(({ label, value, icon: Icon, color, bg, trend }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{label}</p>
                    <p className="text-3xl font-bold font-heading">{loading ? "—" : value}</p>
                    <p className={`text-xs mt-1 ${color}`}>{trend}</p>
                  </div>
                  <div className={`w-11 h-11 ${bg} rounded-xl flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CA-Assigned Task Queue — main focus */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  Tasks Assigned by CA
                </CardTitle>
                <div className="flex items-center gap-1.5">
                  {(["all", "urgent", "pending", "in_progress"] as const).map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors capitalize ${filter === f ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
                      {f.replace(/_/g, " ")}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
                </div>
              ) : filteredTasks.length === 0 ? (
                <div className="text-center py-10">
                  <CheckCircle2 className="w-10 h-10 text-emerald-300 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No tasks match this filter</p>
                </div>
              ) : (
                filteredTasks.map(task => {
                  const StsIcon = STATUS_ICONS[task.status];
                  const clientName = task.booking?.clientProfile
                    ? `${task.booking.clientProfile.firstName} ${task.booking.clientProfile.lastName}`
                    : null;

                  return (
                    <motion.div key={task.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="flex items-start gap-3 p-4 rounded-xl border border-border hover:bg-muted/30 transition-colors group">

                      {/* Priority tag */}
                      <div className={`mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${PRIORITY_COLORS[task.priority]}`}>
                        {task.priority}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[10px] font-mono text-muted-foreground">{task.taskNumber}</span>
                          <StsIcon className="w-3 h-3 text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground">{task.status.replace(/_/g, " ")}</span>
                        </div>
                        <p className="font-medium text-sm line-clamp-1">{task.title}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
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
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0">
                        {task.dueDate && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {new Date(task.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                          </div>
                        )}
                        <Link href={`/assistance/tasks`}
                          className="text-xs text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                          Open →
                        </Link>
                      </div>
                    </motion.div>
                  );
                })
              )}
              <Link href="/assistance/tasks"
                className="flex items-center justify-center gap-2 p-3 text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                View all tasks <ArrowRight className="w-4 h-4" />
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* How it works callout */}
          <Card className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white border-0">
            <CardContent className="p-5">
              <UserCheck className="w-7 h-7 mb-3 opacity-80" />
              <h3 className="font-semibold font-heading text-base mb-1">Your Workflow</h3>
              <p className="text-emerald-100 text-xs mb-4 leading-relaxed">
                CA professionals assign tasks to you. Complete them to help clients get their CA services done smoothly.
              </p>
              <div className="space-y-2.5">
                {[
                  { num: "1", label: "CA assigns task" },
                  { num: "2", label: "You collect documents" },
                  { num: "3", label: "Verify & forward to CA" },
                  { num: "4", label: "CA completes service" },
                ].map(({ num, label }) => (
                  <div key={num} className="flex items-center gap-2.5 text-sm">
                    <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold shrink-0">
                      {num}
                    </div>
                    <span className="text-emerald-50">{label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-600" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {[
                { label: "View All My Tasks", href: "/assistance/tasks",         icon: CheckSquare },
                { label: "Verify Documents",  href: "/assistance/documents",     icon: FileText },
                { label: "Message CA / Client", href: "/assistance/communication", icon: MessageSquare },
                { label: "View Calendar",     href: "/assistance/tasks",         icon: Calendar },
              ].map(({ label, href, icon: Icon }) => (
                <Link key={href} href={href}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-muted transition-colors text-sm group">
                  <Icon className="w-4 h-4 text-muted-foreground group-hover:text-emerald-600 transition-colors" />
                  <span className="font-medium">{label}</span>
                  <ArrowRight className="ml-auto w-3.5 h-3.5 text-muted-foreground" />
                </Link>
              ))}
            </CardContent>
          </Card>

          {/* Progress Overview */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                Today&apos;s Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Tasks Completed", current: stats.completedToday, total: Math.max(tasks.length, 1) },
                { label: "Docs Verified",   current: 0, total: Math.max(stats.pendingDocs, 1) },
              ].map(({ label, current, total }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium">{current}/{total}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all"
                      style={{ width: `${Math.min((current / total) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Assigned-by-CA summary cards */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          CA Professionals Who Assigned You Tasks
        </h2>
        <div className="flex flex-wrap gap-3">
          {Array.from(new Map(
            tasks
              .filter(t => t.assignedByCa)
              .map(t => [
                `${t.assignedByCa!.firstName} ${t.assignedByCa!.lastName}`,
                { ...t.assignedByCa!, count: tasks.filter(x => x.assignedByCa?.firstName === t.assignedByCa?.firstName).length },
              ])
          ).values()).map(ca => (
            <Card key={`${ca.firstName} ${ca.lastName}`} className="flex-shrink-0">
              <CardContent className="flex items-center gap-3 p-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-brand-100 text-brand-700 text-xs font-bold">
                    {getInitials(ca.firstName, ca.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold">CA {ca.firstName} {ca.lastName}</p>
                  <p className="text-xs text-muted-foreground">{ca.count} task{ca.count !== 1 ? "s" : ""} assigned</p>
                </div>
              </CardContent>
            </Card>
          ))}
          {tasks.filter(t => t.assignedByCa).length === 0 && !loading && (
            <p className="text-sm text-muted-foreground py-2">No CA-assigned tasks yet. Tasks will appear here once a CA assigns work to you.</p>
          )}
        </div>
      </div>
    </div>
  );
}
