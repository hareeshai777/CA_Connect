"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Save, Send, UserCheck, User,
  MessageSquare, CheckCircle2, Clock, AlertTriangle,
  Loader2, Edit3, UserCircle, Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { api } from "@/lib/api";
import { getInitials } from "@/lib/utils";
import { toast } from "sonner";

type CaseStatus = "OPEN" | "ASSIGNED" | "IN_PROGRESS" | "UNDER_REVIEW" | "PENDING_CLIENT_INFO" | "COMPLETED" | "CLOSED";

interface CaseMessage {
  id: string;
  content: string;
  senderRole: "CA" | "ASSISTANCE";
  createdAt: string;
  isRead: boolean;
  sender: { id: string; email: string; role: string };
}

interface CaseDetail {
  id: string;
  caseNumber: string;
  title: string;
  status: CaseStatus;
  caNotes?: string;
  assignmentInstructions?: string;
  clientUpdateNotes?: string;
  assistanceEarning?: number;
  createdAt: string;
  assignedAt?: string;
  completedAt?: string;
  booking?: { id: string; bookingNumber: string; scheduledAt: string; meetingLink?: string; googleMeetLink?: string; service?: { name: string; category: string } };
  clientProfile?: { id: string; firstName: string; lastName: string; companyName?: string; user?: { email: string; phone?: string } };
  caProfessional?: { firstName: string; lastName: string; membershipNumber?: string };
  assignedTo?: { id: string; firstName: string; lastName: string; designation?: string; department?: string };
  messages?: CaseMessage[];
}

interface AssistanceMember {
  id: string;
  firstName: string;
  lastName: string;
  designation?: string;
  department?: string;
  _count?: { assignedCases: number; assignedTasks: number };
}

const STATUS_CONFIG: Record<CaseStatus, { label: string; color: string; bg: string }> = {
  OPEN:               { label: "Open",                color: "text-blue-600",   bg: "bg-blue-50" },
  ASSIGNED:           { label: "Assigned to Team",    color: "text-purple-600", bg: "bg-purple-50" },
  IN_PROGRESS:        { label: "In Progress",         color: "text-yellow-600", bg: "bg-yellow-50" },
  UNDER_REVIEW:       { label: "Under CA Review",     color: "text-orange-600", bg: "bg-orange-50" },
  PENDING_CLIENT_INFO:{ label: "Pending Client Info", color: "text-red-600",    bg: "bg-red-50" },
  COMPLETED:          { label: "Completed",            color: "text-green-600",  bg: "bg-green-50" },
  CLOSED:             { label: "Closed",               color: "text-gray-500",   bg: "bg-gray-50" },
};

type Tab = "notes" | "assign" | "chat" | "client";

// Demo data for when API is not yet connected
const DEMO_CASE: CaseDetail = {
  id: "demo-1", caseNumber: "CASE-0001", title: "GST Registration & Filing — Sharma Enterprises",
  status: "ASSIGNED", createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  assignedAt: new Date(Date.now() - 86400000).toISOString(),
  caNotes: "Client runs a textile business in Mumbai. Currently unregistered for GST. Turnover exceeds ₹40L threshold. Needs registration + initial 3 months filing setup.\n\nKey issues:\n- Vendor payments not tracked properly\n- No separation of personal/business accounts\n- Multiple business locations may need separate GSTINs",
  assignmentInstructions: "Please collect the following from Rahul Sharma:\n1. PAN card (self + business)\n2. Aadhaar card\n3. Bank statements (last 6 months)\n4. Business registration / trade license\n5. Address proof for all business locations\n6. Latest electricity bill for principal place of business\n\nExpected TAT: 3 working days. Call client on 9876543210 if documents are unclear.",
  clientUpdateNotes: "Dear Rahul, your GST registration is in progress. Our team is reviewing your documents. We'll update you within 3 working days.",
  assistanceEarning: 2000,
  booking: { id: "b1", bookingNumber: "BK-001", scheduledAt: new Date(Date.now() - 86400000 * 2).toISOString(), service: { name: "GST Filing", category: "GST" } },
  clientProfile: { id: "c1", firstName: "Rahul", lastName: "Sharma", companyName: "Sharma Enterprises", user: { email: "rahul@example.com", phone: "+919876543210" } },
  caProfessional: { firstName: "Priya", lastName: "Menon", membershipNumber: "ICAI-MH-2012-45678" },
  assignedTo: { id: "a1", firstName: "Anjali", lastName: "Sharma", designation: "Senior Document Verifier", department: "Operations" },
  messages: [
    { id: "m1", content: "I've assigned this case to you. Please collect all documents listed in instructions.", senderRole: "CA", createdAt: new Date(Date.now() - 86400000).toISOString(), isRead: true, sender: { id: "s1", email: "ca@demo.com", role: "CA_PROFESSIONAL" } },
    { id: "m2", content: "Understood. I'll contact the client today. Should I verify the bank statements go back 6 months or 12 months?", senderRole: "ASSISTANCE", createdAt: new Date(Date.now() - 3600000 * 20).toISOString(), isRead: true, sender: { id: "s2", email: "assistance@demo.com", role: "ASSISTANCE_TEAM" } },
    { id: "m3", content: "6 months is sufficient for now. If we need more we'll ask later.", senderRole: "CA", createdAt: new Date(Date.now() - 3600000 * 18).toISOString(), isRead: true, sender: { id: "s1", email: "ca@demo.com", role: "CA_PROFESSIONAL" } },
    { id: "m4", content: "Client has submitted PAN, Aadhaar and bank statements. Still waiting on trade license. Called 3 times, he says by tomorrow.", senderRole: "ASSISTANCE", createdAt: new Date(Date.now() - 3600000 * 2).toISOString(), isRead: false, sender: { id: "s2", email: "assistance@demo.com", role: "ASSISTANCE_TEAM" } },
  ],
};

export default function CACaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [caseData, setCaseData] = useState<CaseDetail | null>(null);
  const [messages, setMessages] = useState<CaseMessage[]>([]);
  const [members, setMembers] = useState<AssistanceMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("notes");

  // Form state
  const [caNotes, setCaNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [assignedToId, setAssignedToId] = useState("");
  const [instructions, setInstructions] = useState("");
  const [assistanceEarning, setAssistanceEarning] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [chatMsg, setChatMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [clientUpdate, setClientUpdate] = useState("");
  const [savingClientUpdate, setSavingClientUpdate] = useState(false);
  const [newStatus, setNewStatus] = useState<CaseStatus | "">("");

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([
      api.get(`/cases/${id}`),
      api.get(`/cases/${id}/messages`),
      api.get("/ca/assistance-members"),
    ])
      .then(([caseRes, msgRes, membersRes]) => {
        const c = caseRes.data.data;
        setCaseData(c);
        setCaNotes(c.caNotes || "");
        setInstructions(c.assignmentInstructions || "");
        setAssignedToId(c.assignedTo?.id || "");
        setAssistanceEarning(c.assistanceEarning ? String(c.assistanceEarning / 100) : "");
        setClientUpdate(c.clientUpdateNotes || "");
        setMessages(msgRes.data.data);
        setMembers(membersRes.data.data);
      })
      .catch(() => {
        setCaseData(DEMO_CASE);
        setCaNotes(DEMO_CASE.caNotes || "");
        setInstructions(DEMO_CASE.assignmentInstructions || "");
        setAssignedToId(DEMO_CASE.assignedTo?.id || "");
        setAssistanceEarning(String((DEMO_CASE.assistanceEarning || 0) / 100));
        setClientUpdate(DEMO_CASE.clientUpdateNotes || "");
        setMessages(DEMO_CASE.messages || []);
        setMembers([{ id: "a1", firstName: "Anjali", lastName: "Sharma", designation: "Senior Document Verifier" }]);
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, tab]);

  const saveNotes = async () => {
    setSavingNotes(true);
    try {
      await api.patch(`/cases/${id}/notes`, { caNotes });
      toast.success("Case notes saved");
    } catch { toast.error("Failed to save notes"); }
    setSavingNotes(false);
  };

  const assignCase = async () => {
    if (!assignedToId) return;
    setAssigning(true);
    try {
      const res = await api.patch(`/cases/${id}/assign`, {
        assignedToId,
        assignmentInstructions: instructions,
        assistanceEarning: assistanceEarning ? Math.round(parseFloat(assistanceEarning) * 100) : 0,
      });
      setCaseData(res.data.data);
      toast.success("Case assigned to assistance team");
    } catch { toast.error("Failed to assign case"); }
    setAssigning(false);
  };

  const sendMessage = async () => {
    if (!chatMsg.trim()) return;
    setSending(true);
    const content = chatMsg.trim();
    const optimistic: CaseMessage = {
      id: "temp-" + Date.now(), content, senderRole: "CA",
      createdAt: new Date().toISOString(), isRead: false,
      sender: { id: "me", email: "", role: "CA_PROFESSIONAL" },
    };
    setMessages(prev => [...prev, optimistic]);
    setChatMsg("");
    try {
      const res = await api.post(`/cases/${id}/messages`, { content });
      setMessages(prev => prev.map(m => m.id === optimistic.id ? res.data.data : m));
    } catch {
      setMessages(prev => prev.filter(m => m.id !== optimistic.id));
      setChatMsg(content);
      toast.error("Failed to send message");
    }
    setSending(false);
  };

  const saveClientUpdate = async () => {
    setSavingClientUpdate(true);
    try {
      await api.patch(`/cases/${id}/status`, {
        status: newStatus || caseData?.status,
        clientUpdateNotes: clientUpdate,
      });
      if (newStatus) setCaseData(prev => prev ? { ...prev, status: newStatus as CaseStatus, clientUpdateNotes: clientUpdate } : prev);
      else setCaseData(prev => prev ? { ...prev, clientUpdateNotes: clientUpdate } : prev);
      setNewStatus("");
      toast.success("Client update saved");
    } catch { toast.error("Failed to save update"); }
    setSavingClientUpdate(false);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
    </div>
  );
  if (!caseData) return <div className="p-8 text-center text-muted-foreground">Case not found.</div>;

  const sts = STATUS_CONFIG[caseData.status];
  const unreadCount = messages.filter(m => m.senderRole === "ASSISTANCE" && !m.isRead).length;

  const tabs: { key: Tab; label: string; icon: any; badge?: number }[] = [
    { key: "notes",  label: "Case Notes",      icon: Edit3 },
    { key: "assign", label: "Assign to Team",  icon: UserCheck },
    { key: "chat",   label: "Team Chat",        icon: MessageSquare, badge: unreadCount },
    { key: "client", label: "Client Update",    icon: UserCircle },
  ];

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Back + Header */}
      <div>
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-3 transition-colors">
          <ArrowLeft className="w-4 h-4" />Back to Cases
        </button>
        <div className="flex flex-col sm:flex-row sm:items-start gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs font-mono text-muted-foreground">{caseData.caseNumber}</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${sts.bg} ${sts.color}`}>{sts.label}</span>
              {caseData.booking?.service && (
                <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded-md">{caseData.booking.service.name}</span>
              )}
            </div>
            <h1 className="text-xl font-bold font-heading">{caseData.title}</h1>
          </div>
        </div>
      </div>

      {/* Client + Consultation info bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Client */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider">Client</p>
              <p className="font-semibold text-sm">{caseData.clientProfile?.firstName} {caseData.clientProfile?.lastName}</p>
              {caseData.clientProfile?.companyName && <p className="text-xs text-muted-foreground">{caseData.clientProfile.companyName}</p>}
              {caseData.clientProfile?.user?.email && <p className="text-xs text-muted-foreground">{caseData.clientProfile.user.email}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Consultation */}
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
              <Clock className="w-5 h-5 text-brand-600" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Consultation</p>
              <p className="font-semibold text-sm">
                {caseData.booking?.scheduledAt
                  ? new Date(caseData.booking.scheduledAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                  : "—"}
              </p>
              <p className="text-xs text-muted-foreground">₹499 consultation fee paid</p>
            </div>
          </CardContent>
        </Card>

        {/* Assigned team */}
        <Card className={caseData.assignedTo ? "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200" : ""}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${caseData.assignedTo ? "bg-emerald-100" : "bg-muted"}`}>
              <UserCheck className={`w-5 h-5 ${caseData.assignedTo ? "text-emerald-600" : "text-muted-foreground"}`} />
            </div>
            <div>
              <p className={`text-[10px] font-semibold uppercase tracking-wider ${caseData.assignedTo ? "text-emerald-600" : "text-muted-foreground"}`}>
                Assistance Team
              </p>
              {caseData.assignedTo ? (
                <>
                  <p className="font-semibold text-sm">{caseData.assignedTo.firstName} {caseData.assignedTo.lastName}</p>
                  <p className="text-xs text-muted-foreground">{caseData.assignedTo.designation}</p>
                </>
              ) : (
                <p className="text-sm text-orange-500 font-medium">Not assigned yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Nav */}
      <div className="flex gap-1 border-b border-border">
        {tabs.map(({ key, label, icon: Icon, badge }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 relative ${tab === key ? "border-brand-600 text-brand-600" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            <Icon className="w-4 h-4" />
            {label}
            {badge ? (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {badge}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>

          {/* ── CASE NOTES ─────────────────────────────── */}
          {tab === "notes" && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-brand-600" />
                    CA Case Notes
                    <span className="text-xs text-muted-foreground font-normal">(Internal — not visible to client or assistance team)</span>
                  </CardTitle>
                  <Button onClick={saveNotes} disabled={savingNotes} size="sm" className="rounded-xl bg-brand-600 hover:bg-brand-700 gap-2">
                    {savingNotes ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    Save Notes
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-3 p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800">
                    These are your private consultation notes. Document the client's problem, context, documents discussed, and your work plan. This helps you give clear instructions to the assistance team.
                  </p>
                </div>
                <textarea
                  rows={14}
                  value={caNotes}
                  onChange={e => setCaNotes(e.target.value)}
                  placeholder={"Write your case notes here...\n\nSuggested format:\n- Client background & business type\n- Core problem / service required\n- Documents available & missing\n- Timeline & urgency\n- Work plan & next steps"}
                  className="w-full px-4 py-3 text-sm border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none font-mono leading-relaxed"
                />
              </CardContent>
            </Card>
          )}

          {/* ── ASSIGN TO TEAM ─────────────────────────── */}
          {tab === "assign" && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  Assign to Assistance Team
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2">
                  <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-emerald-800">
                    The assistance team will work on document collection and backend tasks. They communicate only with you — not with the client directly. You will update the client.
                  </p>
                </div>

                {/* Select member */}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Assign To</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {members.length === 0 ? (
                      <p className="text-sm text-muted-foreground col-span-2 py-4 text-center">
                        No assistance team members available. Contact admin.
                      </p>
                    ) : members.map(m => {
                      const activeCases = m._count?.assignedCases ?? 0;
                      const activeTasks = m._count?.assignedTasks ?? 0;
                      const workload = activeCases + activeTasks;
                      const workloadColor = workload === 0 ? "text-green-600" : workload <= 3 ? "text-yellow-600" : "text-red-500";
                      const workloadLabel = workload === 0 ? "Available" : `${workload} active`;
                      return (
                        <button key={m.id} onClick={() => setAssignedToId(m.id)}
                          className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${assignedToId === m.id ? "border-emerald-500 bg-emerald-50 shadow-sm" : "border-border hover:border-emerald-300 hover:bg-muted/30"}`}>
                          <Avatar className="h-10 w-10 shrink-0">
                            <AvatarFallback className={`text-xs font-bold ${assignedToId === m.id ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"}`}>
                              {getInitials(m.firstName, m.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm">{m.firstName} {m.lastName}</p>
                            {m.designation && <p className="text-xs text-muted-foreground truncate">{m.designation}</p>}
                            {m.department && <p className="text-xs text-muted-foreground truncate">{m.department}</p>}
                            <p className={`text-xs font-medium mt-1 ${workloadColor}`}>
                              {workloadLabel} · {activeCases} case{activeCases !== 1 ? "s" : ""}, {activeTasks} task{activeTasks !== 1 ? "s" : ""}
                            </p>
                          </div>
                          {assignedToId === m.id && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-1" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Instructions */}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Instructions for Team</label>
                  <textarea
                    rows={8}
                    value={instructions}
                    onChange={e => setInstructions(e.target.value)}
                    placeholder={"What should the team collect or do?\n\nExample:\n1. Collect PAN card from client\n2. Verify Aadhaar address matches\n3. Get last 6 months bank statements\n4. Ask for trade license copy\n\nTimeline: 3 working days"}
                    className="w-full px-4 py-3 text-sm border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  />
                </div>

                {/* Earnings allocation */}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                    Your Allocation to Team (₹)
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1 max-w-xs">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">₹</span>
                      <input
                        type="number"
                        min="0"
                        step="100"
                        value={assistanceEarning}
                        onChange={e => setAssistanceEarning(e.target.value)}
                        placeholder="0"
                        className="w-full pl-8 pr-3 py-2 text-sm border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground max-w-xs">
                      This is paid from your earnings — dynamically decided by you per case. The platform commission is separate.
                    </p>
                  </div>
                </div>

                <Button onClick={assignCase} disabled={!assignedToId || assigning}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 gap-2">
                  {assigning ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
                  {caseData.assignedTo ? "Update Assignment" : "Assign Case to Team"}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* ── INTERNAL TEAM CHAT ─────────────────────── */}
          {tab === "chat" && (
            <Card className="flex flex-col" style={{ height: "560px" }}>
              <CardHeader className="pb-3 border-b border-border shrink-0">
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-brand-600" />
                  Internal Chat — CA ↔ Assistance Team Only
                  {caseData.assignedTo && (
                    <span className="text-xs font-normal text-muted-foreground ml-1">
                      · {caseData.assignedTo.firstName} {caseData.assignedTo.lastName}
                    </span>
                  )}
                </CardTitle>
                <div className="flex items-center gap-2 mt-1 text-xs text-amber-700">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  This conversation is never visible to the client. Internal use only.
                </div>
              </CardHeader>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {!caseData.assignedTo ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <UserCheck className="w-10 h-10 text-muted-foreground/30 mb-3" />
                    <p className="text-sm text-muted-foreground">Assign this case to a team member first to start the internal chat</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <MessageSquare className="w-10 h-10 text-muted-foreground/30 mb-3" />
                    <p className="text-sm text-muted-foreground">No messages yet. Start the conversation.</p>
                  </div>
                ) : (
                  messages.map(msg => {
                    const isCA = msg.senderRole === "CA";
                    return (
                      <div key={msg.id} className={`flex items-end gap-2 ${isCA ? "flex-row-reverse" : "flex-row"}`}>
                        <Avatar className="h-7 w-7 shrink-0">
                          <AvatarFallback className={`text-[10px] font-bold ${isCA ? "bg-brand-100 text-brand-700" : "bg-emerald-100 text-emerald-700"}`}>
                            {isCA ? "CA" : "AT"}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`max-w-[70%] ${isCA ? "items-end" : "items-start"} flex flex-col gap-0.5`}>
                          <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${isCA ? "bg-brand-600 text-white rounded-br-md" : "bg-muted text-foreground rounded-bl-md"}`}>
                            {msg.content}
                          </div>
                          <span className="text-[10px] text-muted-foreground px-1">
                            {new Date(msg.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                            {isCA && !msg.isRead && " · Unread"}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <div className="p-3 border-t border-border shrink-0">
                <div className="flex gap-2">
                  <input
                    value={chatMsg}
                    onChange={e => setChatMsg(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                    placeholder={caseData.assignedTo ? "Message the assistance team..." : "Assign case first to chat"}
                    disabled={!caseData.assignedTo || sending}
                    className="flex-1 px-4 py-2 text-sm border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50"
                  />
                  <Button onClick={sendMessage} disabled={!chatMsg.trim() || sending || !caseData.assignedTo}
                    size="icon" className="h-9 w-9 rounded-xl bg-brand-600 hover:bg-brand-700 shrink-0">
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* ── CLIENT UPDATE ─────────────────────────── */}
          {tab === "client" && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <UserCircle className="w-4 h-4 text-brand-600" />
                  Update Client
                  <span className="text-xs text-muted-foreground font-normal">(CA communicates with client directly)</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-800">
                    Only the CA communicates with the client. The assistance team never contacts the client. Use this section to note what you've told the client and update the case status.
                  </p>
                </div>

                {/* Current case status */}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Update Case Status</label>
                  <div className="flex flex-wrap gap-2">
                    {(["OPEN","ASSIGNED","IN_PROGRESS","UNDER_REVIEW","PENDING_CLIENT_INFO","COMPLETED","CLOSED"] as CaseStatus[]).map(s => {
                      const cfg = STATUS_CONFIG[s];
                      return (
                        <button key={s} onClick={() => setNewStatus(s === newStatus ? "" : s)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${newStatus === s ? `${cfg.bg} ${cfg.color} border-current` : "border-border text-muted-foreground hover:text-foreground"}`}>
                          {cfg.label}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Current: <strong>{STATUS_CONFIG[caseData.status].label}</strong>
                    {newStatus && newStatus !== caseData.status && (
                      <span className="ml-2 text-brand-600">→ Will change to: <strong>{STATUS_CONFIG[newStatus as CaseStatus].label}</strong></span>
                    )}
                  </p>
                </div>

                {/* Client notes */}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                    Notes / Message to Client
                  </label>
                  <textarea
                    rows={8}
                    value={clientUpdate}
                    onChange={e => setClientUpdate(e.target.value)}
                    placeholder={"What did you tell the client?\n\nExample:\nDear [Client], your GST registration application has been submitted. Please expect approval in 3-5 working days. We'll notify you once the GSTIN is issued. Let us know if you have any questions."}
                    className="w-full px-4 py-3 text-sm border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    This is recorded internally. You can use it to email/WhatsApp/call the client separately.
                  </p>
                </div>

                <Button onClick={saveClientUpdate} disabled={savingClientUpdate}
                  className="rounded-xl bg-brand-600 hover:bg-brand-700 gap-2">
                  {savingClientUpdate ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Client Update{newStatus ? ` & Change Status` : ""}
                </Button>
              </CardContent>
            </Card>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
}
