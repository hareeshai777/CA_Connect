"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase, Clock, CheckCircle2, RefreshCw, AlertTriangle,
  ArrowRight, Loader2, User, UserCheck, ChevronRight, Filter,
  ChevronDown, Check, Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { getInitials } from "@/lib/utils";

type CaseStatus = "OPEN" | "ASSIGNED" | "IN_PROGRESS" | "UNDER_REVIEW" | "PENDING_CLIENT_INFO" | "COMPLETED" | "CLOSED";

interface AssistanceMember {
  id: string;
  firstName: string;
  lastName: string;
  designation?: string;
  department?: string;
  _count?: { assignedCases: number; assignedTasks: number };
}

interface CaseItem {
  id: string;
  caseNumber: string;
  title: string;
  status: CaseStatus;
  createdAt: string;
  assignedAt?: string;
  completedAt?: string;
  booking?: { bookingNumber: string; scheduledAt: string; service?: { name: string } };
  clientProfile?: { firstName: string; lastName: string; companyName?: string };
  assignedTo?: { id: string; firstName: string; lastName: string; designation?: string };
}

const STATUS_CONFIG: Record<CaseStatus, { label: string; icon: any; color: string; bg: string; border: string }> = {
  OPEN:               { label: "Open",                icon: Briefcase,    color: "text-blue-600",   bg: "bg-blue-50",   border: "border-blue-300" },
  ASSIGNED:           { label: "Assigned to Team",    icon: UserCheck,    color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-300" },
  IN_PROGRESS:        { label: "In Progress",         icon: RefreshCw,    color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-300" },
  UNDER_REVIEW:       { label: "Under CA Review",     icon: Clock,        color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-300" },
  PENDING_CLIENT_INFO:{ label: "Pending Client Info", icon: AlertTriangle, color: "text-red-600",   bg: "bg-red-50",    border: "border-red-300" },
  COMPLETED:          { label: "Completed",            icon: CheckCircle2, color: "text-green-600",  bg: "bg-green-50",  border: "border-green-300" },
  CLOSED:             { label: "Closed",               icon: CheckCircle2, color: "text-gray-500",   bg: "bg-gray-50",   border: "border-gray-300" },
};

const DEMO_CASES: CaseItem[] = [
  { id: "demo-1", caseNumber: "CASE-0001", title: "GST Registration & Filing — Sharma Enterprises", status: "ASSIGNED",    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), booking: { bookingNumber: "BK-001", scheduledAt: new Date(Date.now() - 86400000 * 2).toISOString(), service: { name: "GST Filing" } }, clientProfile: { firstName: "Rahul", lastName: "Sharma", companyName: "Sharma Enterprises" }, assignedTo: { id: "a1", firstName: "Anjali", lastName: "Sharma", designation: "Senior Document Verifier" } },
  { id: "demo-2", caseNumber: "CASE-0002", title: "Income Tax Return — Sunita Rao (FY 2023-24)",    status: "IN_PROGRESS", createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), booking: { bookingNumber: "BK-002", scheduledAt: new Date(Date.now() - 86400000 * 5).toISOString(), service: { name: "Income Tax Filing" } }, clientProfile: { firstName: "Sunita", lastName: "Rao" } },
  { id: "demo-3", caseNumber: "CASE-0003", title: "Company Incorporation — TechStart Pvt Ltd",      status: "OPEN",        createdAt: new Date(Date.now() - 3600000 * 5).toISOString(), booking: { bookingNumber: "BK-003", scheduledAt: new Date(Date.now() - 3600000 * 5).toISOString(), service: { name: "Company Registration" } }, clientProfile: { firstName: "Amit", lastName: "Kumar", companyName: "TechStart Pvt Ltd" } },
  { id: "demo-4", caseNumber: "CASE-0004", title: "Trademark Filing — BrandX Corp",                 status: "OPEN",        createdAt: new Date(Date.now() - 86400000 * 10).toISOString(), booking: { bookingNumber: "BK-004", scheduledAt: new Date(Date.now() - 86400000 * 10).toISOString(), service: { name: "Trademark Registration" } }, clientProfile: { firstName: "Pradeep", lastName: "Singh", companyName: "BrandX Corp" } },
];

const DEMO_MEMBERS: AssistanceMember[] = [
  { id: "m1", firstName: "Anjali",    lastName: "Sharma", designation: "Senior Document Verifier", department: "Operations",   _count: { assignedCases: 2, assignedTasks: 3 } },
  { id: "m2", firstName: "Rohan",     lastName: "Mehta",  designation: "CA Liaison Officer",       department: "CA Relations", _count: { assignedCases: 1, assignedTasks: 1 } },
  { id: "m3", firstName: "Kavitha",   lastName: "Reddy",  designation: "Compliance Coordinator",   department: "Compliance",   _count: { assignedCases: 0, assignedTasks: 0 } },
  { id: "m4", firstName: "Siddharth", lastName: "Nair",   designation: "Document Analyst",         department: "Operations",   _count: { assignedCases: 4, assignedTasks: 2 } },
];

// Assign dropdown — uses fixed positioning so it escapes motion/transform stacking contexts
function AssignDropdown({
  caseId, currentAssignee, members, isDemo, onAssigned,
}: {
  caseId: string;
  currentAssignee?: { id: string; firstName: string; lastName: string };
  members: AssistanceMember[];
  isDemo: boolean;
  onAssigned: (caseId: string, member: AssistanceMember) => void;
}) {
  const [open, setOpen] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [pos, setPos] = useState({ top: 0, right: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (btnRef.current && !btnRef.current.closest("[data-assign-dropdown]")?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const toggleOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 6, right: window.innerWidth - rect.right });
    }
    setOpen(o => !o);
  };

  const handleSelect = async (member: AssistanceMember) => {
    setAssigning(true);
    setOpen(false);
    if (!isDemo) {
      try {
        await api.patch(`/cases/${caseId}/assign`, {
          assignedToId: member.id,
          assignmentInstructions: "",
          assistanceEarning: 0,
        });
      } catch {
        toast.error("Failed to assign case");
        setAssigning(false);
        return;
      }
    }
    onAssigned(caseId, member);
    toast.success(`Case assigned to ${member.firstName} ${member.lastName}`);
    setAssigning(false);
  };

  return (
    <div data-assign-dropdown="">
      <Button
        ref={btnRef}
        size="sm"
        onClick={toggleOpen}
        disabled={assigning}
        className={`h-8 text-xs rounded-xl gap-1.5 ${currentAssignee ? "bg-emerald-600 hover:bg-emerald-700" : "bg-brand-600 hover:bg-brand-700"}`}
      >
        {assigning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Users className="w-3.5 h-3.5" />}
        {currentAssignee ? `${currentAssignee.firstName} ${currentAssignee.lastName}` : "Assign to Team"}
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.12 }}
            style={{ position: "fixed", top: pos.top, right: pos.right, zIndex: 9999 }}
            className="w-72 bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="p-3 border-b border-gray-100 bg-gray-50">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Select Assistance Team Member</p>
            </div>
            <div className="p-1.5 max-h-72 overflow-y-auto">
              {members.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No assistance team members found.</p>
              ) : members.map(m => {
                const activeCases = m._count?.assignedCases ?? 0;
                const activeTasks = m._count?.assignedTasks ?? 0;
                const workload = activeCases + activeTasks;
                const isCurrent = currentAssignee?.id === m.id;
                const workloadColor = workload === 0 ? "text-green-600" : workload <= 3 ? "text-yellow-600" : "text-red-500";
                return (
                  <button key={m.id} onClick={() => handleSelect(m)}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-colors ${isCurrent ? "bg-emerald-50 border border-emerald-200" : "hover:bg-gray-50"}`}>
                    <Avatar className="h-9 w-9 shrink-0">
                      <AvatarFallback className={`text-xs font-bold ${isCurrent ? "bg-emerald-100 text-emerald-700" : "bg-brand-100 text-brand-700"}`}>
                        {getInitials(m.firstName, m.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 truncate">{m.firstName} {m.lastName}</p>
                      {m.designation && <p className="text-xs text-gray-500 truncate">{m.designation}</p>}
                      <p className={`text-xs font-medium ${workloadColor}`}>
                        {workload === 0 ? "✓ Available" : `${workload} active`} · {activeCases} case{activeCases !== 1 ? "s" : ""}, {activeTasks} task{activeTasks !== 1 ? "s" : ""}
                      </p>
                    </div>
                    {isCurrent && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function CACasesPage() {
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [members, setMembers] = useState<AssistanceMember[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filterStatus) params.set("status", filterStatus);
    Promise.all([
      api.get(`/cases/my?${params}`),
      api.get("/ca/assistance-members"),
    ])
      .then(([caseRes, memberRes]) => {
        const fetchedCases: CaseItem[] = caseRes.data.data.cases;
        if (fetchedCases.length === 0 && !filterStatus) {
          setCases(DEMO_CASES);
          setTotal(DEMO_CASES.length);
          setIsDemo(true);
        } else {
          setCases(fetchedCases);
          setTotal(caseRes.data.data.total);
          setIsDemo(false);
        }
        setMembers(memberRes.data.data.length > 0 ? memberRes.data.data : DEMO_MEMBERS);
      })
      .catch(() => {
        setCases(DEMO_CASES);
        setTotal(DEMO_CASES.length);
        setMembers(DEMO_MEMBERS);
        setIsDemo(true);
      })
      .finally(() => setLoading(false));
  }, [filterStatus]);

  const handleAssigned = (caseId: string, member: AssistanceMember) => {
    setCases(prev => prev.map(c =>
      c.id === caseId
        ? { ...c, status: "ASSIGNED" as CaseStatus, assignedTo: { id: member.id, firstName: member.firstName, lastName: member.lastName, designation: member.designation } }
        : c
    ));
  };

  const statusCounts = cases.reduce((a, c) => { a[c.status] = (a[c.status] || 0) + 1; return a; }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-2xl font-bold font-heading flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-brand-600" />
            My Cases
          </motion.h1>
          <p className="text-muted-foreground text-sm mt-1">
            Open a case after each consultation · Assign to assistance team · Update client
          </p>
        </div>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Cases",      value: total },
          { label: "Active",           value: (statusCounts["ASSIGNED"] || 0) + (statusCounts["IN_PROGRESS"] || 0) + (statusCounts["UNDER_REVIEW"] || 0) },
          { label: "Needs Assignment", value: statusCounts["OPEN"] || 0 },
          { label: "Completed",        value: (statusCounts["COMPLETED"] || 0) + (statusCounts["CLOSED"] || 0) },
        ].map(({ label, value }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <span className="text-2xl font-bold font-heading text-brand-600">{loading ? "—" : value}</span>
                <p className="text-xs text-muted-foreground">{label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Workflow banner */}
      <Card className="bg-gradient-to-r from-brand-50 to-blue-50 border-brand-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 flex-wrap">
            {[
              "1. Client pays ₹499 & books",
              "2. You consult",
              "3. Open Case + notes",
              "4. Assign to Assistance Team ←",
              "5. Team works, you update client",
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className={`text-xs font-medium ${s.includes("←") ? "text-brand-700 font-bold" : "text-brand-700"}`}>{s}</span>
                {i < 4 && <ChevronRight className="w-3 h-3 text-brand-400" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Status filter */}
      <div className="flex flex-wrap items-center gap-2">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <button onClick={() => setFilterStatus("")}
          className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${filterStatus === "" ? "bg-brand-600 text-white" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
          All
        </button>
        {(Object.keys(STATUS_CONFIG) as CaseStatus[]).filter(s => statusCounts[s] > 0).map(s => {
          const cfg = STATUS_CONFIG[s];
          const Icon = cfg.icon;
          return (
            <button key={s} onClick={() => setFilterStatus(filterStatus === s ? "" : s)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${filterStatus === s ? "bg-brand-600 text-white" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
              <Icon className="w-3 h-3" />{cfg.label}
              <span className="ml-0.5 font-bold">({statusCounts[s]})</span>
            </button>
          );
        })}
      </div>

      {/* Cases List */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
          </div>
        ) : cases.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Briefcase className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <p className="font-medium text-muted-foreground">No cases yet</p>
              <p className="text-sm text-muted-foreground mt-1">After a consultation, open a case from your bookings</p>
            </CardContent>
          </Card>
        ) : (
          cases.map((c, i) => {
            const cfg = STATUS_CONFIG[c.status];
            const StatusIcon = cfg.icon;
            const needsAssignment = c.status === "OPEN";
            return (
              <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className={`hover:shadow-md transition-all border-l-4 ${cfg.border} ${needsAssignment ? "ring-1 ring-orange-200" : ""}`}>
                  <CardContent className="p-4 flex items-start gap-4">
                    {/* Status icon */}
                    <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                      <StatusIcon className={`w-5 h-5 ${cfg.color}`} />
                    </div>

                    {/* Case info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-[11px] font-mono text-muted-foreground">{c.caseNumber}</span>
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${cfg.bg} ${cfg.color}`}>
                          {cfg.label}
                        </span>
                        {needsAssignment && (
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-orange-100 text-orange-700">
                            ⚠ Needs Assignment
                          </span>
                        )}
                      </div>
                      <p className="font-semibold text-sm leading-snug">{c.title}</p>
                      <div className="flex items-center gap-4 mt-1.5 flex-wrap text-xs text-muted-foreground">
                        {c.clientProfile && (
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {c.clientProfile.firstName} {c.clientProfile.lastName}
                            {c.clientProfile.companyName && ` · ${c.clientProfile.companyName}`}
                          </span>
                        )}
                        {c.booking?.service && <span>{c.booking.service.name}</span>}
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Assign dropdown — always visible for non-completed cases */}
                      {c.status !== "COMPLETED" && c.status !== "CLOSED" && (
                        <AssignDropdown
                          caseId={c.id}
                          currentAssignee={c.assignedTo}
                          members={members}
                          isDemo={isDemo}
                          onAssigned={handleAssigned}
                        />
                      )}

                      {/* View case detail */}
                      <Link href={`/ca/cases/${c.id}`} onClick={e => e.stopPropagation()}>
                        <Button size="sm" variant="outline" className="h-8 rounded-xl gap-1 text-xs">
                          Details <ArrowRight className="w-3 h-3" />
                        </Button>
                      </Link>
                    </div>
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
