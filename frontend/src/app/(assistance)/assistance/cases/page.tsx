"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase, MessageSquare, CheckCircle2, RefreshCw, Clock, AlertTriangle,
  Send, Loader2, UserCheck, Filter, Info, Save, Edit3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { api } from "@/lib/api";
import { toast } from "sonner";

type CaseStatus = "OPEN" | "ASSIGNED" | "IN_PROGRESS" | "UNDER_REVIEW" | "PENDING_CLIENT_INFO" | "COMPLETED" | "CLOSED";

interface CaseMessage {
  id: string; content: string; senderRole: "CA" | "ASSISTANCE";
  createdAt: string; isRead: boolean;
  sender: { id: string; email: string; role: string };
}

interface AssignedCase {
  id: string; caseNumber: string; title: string; status: CaseStatus;
  assignmentInstructions?: string; assistanceWorkNotes?: string; assistanceEarning?: number;
  createdAt: string; assignedAt?: string;
  caProfessional?: { firstName: string; lastName: string; membershipNumber?: string };
  booking?: { bookingNumber: string; scheduledAt: string; service?: { name: string; category: string } };
  clientProfile?: { firstName: string; lastName: string; companyName?: string };
  assignedTo?: { firstName: string; lastName: string };
}

const STATUS_CONFIG: Record<CaseStatus, { label: string; icon: any; color: string; bg: string; border: string }> = {
  OPEN:               { label: "Open",                icon: Briefcase,    color: "text-blue-600",   bg: "bg-blue-50",    border: "border-blue-200" },
  ASSIGNED:           { label: "Assigned to Me",      icon: UserCheck,    color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200" },
  IN_PROGRESS:        { label: "In Progress",         icon: RefreshCw,    color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200" },
  UNDER_REVIEW:       { label: "Under CA Review",     icon: Clock,        color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" },
  PENDING_CLIENT_INFO:{ label: "Pending Client Info", icon: AlertTriangle, color: "text-red-600",   bg: "bg-red-50",      border: "border-red-200" },
  COMPLETED:          { label: "Completed",            icon: CheckCircle2, color: "text-green-600",  bg: "bg-green-50",  border: "border-green-200" },
  CLOSED:             { label: "Closed",               icon: CheckCircle2, color: "text-gray-500",   bg: "bg-gray-50",    border: "border-gray-200" },
};

type RightTab = "instructions" | "notes" | "chat";

export default function AssistanceCasesPage() {
  const [cases, setCases] = useState<AssignedCase[]>([]);
  const [messages, setMessages] = useState<Record<string, CaseMessage[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState<AssignedCase | null>(null);
  const [filterStatus, setFilterStatus] = useState("");
  const [chatMsg, setChatMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [rightTab, setRightTab] = useState<RightTab>("instructions");
  const [workNotes, setWorkNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesModified, setNotesModified] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const fetchCases = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterStatus) params.set("status", filterStatus);
    api.get(`/cases/assistance/my?${params}`)
      .then(r => {
        const fetchedCases: AssignedCase[] = r.data.data.cases;
        setCases(fetchedCases);
        if (fetchedCases.length > 0) {
          const first = fetchedCases[0];
          setSelectedCase(first);
          setWorkNotes(first.assistanceWorkNotes || "");
        }
      })
      .catch((err) => {
        setCases([]);
        const status = err?.response?.status;
        if (status === 401 || status === 403) {
          toast.error("Session expired. Please log in again.");
        } else if (status === 404) {
          toast.error("Your assistance member profile is not set up. Contact the admin.");
        } else {
          toast.error("Failed to load cases. Check your connection.");
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCases(); }, [filterStatus]);

  // Load messages when case is selected
  useEffect(() => {
    if (!selectedCase) return;
    setWorkNotes(selectedCase.assistanceWorkNotes || "");
    setNotesModified(false);
    if (messages[selectedCase.id]) return;
    api.get(`/cases/${selectedCase.id}/messages`)
      .then(r => setMessages(prev => ({ ...prev, [selectedCase.id]: r.data.data })))
      .catch(() => setMessages(prev => ({ ...prev, [selectedCase.id]: [] })));
  }, [selectedCase?.id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedCase, rightTab]);

  const selectCase = (c: AssignedCase) => {
    setSelectedCase(c);
    setRightTab("instructions");
  };

  const saveWorkNotes = async () => {
    if (!selectedCase) return;
    setSavingNotes(true);
    try {
      await api.patch(`/cases/${selectedCase.id}/assistance-status`, {
        assistanceWorkNotes: workNotes,
      });
      setCases(prev => prev.map(c => c.id === selectedCase.id ? { ...c, assistanceWorkNotes: workNotes } : c));
      setSelectedCase(prev => prev ? { ...prev, assistanceWorkNotes: workNotes } : prev);
      setNotesModified(false);
      toast.success("Work notes saved");
    } catch {
      toast.error("Failed to save notes. Please try again.");
    } finally {
      setSavingNotes(false);
    }
  };

  const updateStatus = async (caseId: string, status: CaseStatus) => {
    if (updatingId) return;
    // Optimistic update first
    setCases(prev => prev.map(c => c.id === caseId ? { ...c, status } : c));
    setSelectedCase(prev => prev?.id === caseId ? { ...prev, status } : prev);
    setUpdatingId(caseId);
    try {
      await api.patch(`/cases/${caseId}/assistance-status`, { status });
      toast.success(`Status updated to: ${STATUS_CONFIG[status].label}`);
    } catch {
      // Revert optimistic update
      toast.error("Failed to update status. Please try again.");
      fetchCases();
    } finally {
      setUpdatingId(null);
    }
  };

  const sendMessage = async () => {
    if (!selectedCase || !chatMsg.trim()) return;
    setSending(true);
    const tempMsg: CaseMessage = {
      id: "temp-" + Date.now(), content: chatMsg.trim(), senderRole: "ASSISTANCE",
      createdAt: new Date().toISOString(), isRead: false, sender: { id: "me", email: "", role: "ASSISTANCE_TEAM" },
    };
    setMessages(prev => ({ ...prev, [selectedCase.id]: [...(prev[selectedCase.id] || []), tempMsg] }));
    const msgContent = chatMsg.trim();
    setChatMsg("");
    try {
      const res = await api.post(`/cases/${selectedCase.id}/messages`, { content: msgContent });
      setMessages(prev => ({
        ...prev,
        [selectedCase.id]: (prev[selectedCase.id] || []).map(m => m.id === tempMsg.id ? res.data.data : m),
      }));
    } catch {
      toast.error("Failed to send message.");
      setMessages(prev => ({
        ...prev,
        [selectedCase.id]: (prev[selectedCase.id] || []).filter(m => m.id !== tempMsg.id),
      }));
      setChatMsg(msgContent);
    } finally {
      setSending(false);
    }
  };

  const currentMsgs = selectedCase ? (messages[selectedCase.id] || []) : [];
  const unreadByCa = (id: string) => (messages[id] || []).filter(m => m.senderRole === "CA" && !m.isRead).length;
  const statusCounts = cases.reduce((a, c) => { a[c.status] = (a[c.status] || 0) + 1; return a; }, {} as Record<string, number>);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-2xl font-bold font-heading flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-emerald-600" />
            My Assigned Cases
          </motion.h1>
          <p className="text-sm text-muted-foreground mt-1">
            Work on cases assigned by CA · Write progress notes · Chat internally with CA only
          </p>
        </div>
        <div className="flex gap-2 text-xs text-muted-foreground">
          {(Object.entries(statusCounts) as [CaseStatus, number][]).map(([s, n]) => (
            <span key={s} className={`px-2 py-1 rounded-lg font-medium ${STATUS_CONFIG[s].bg} ${STATUS_CONFIG[s].color}`}>
              {n} {STATUS_CONFIG[s].label}
            </span>
          ))}
        </div>
      </div>

      {/* Role clarity banner */}
      <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
        <CardContent className="p-3 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <p className="text-xs text-emerald-800 leading-relaxed">
            <strong>Your role:</strong> Backend support for the CA. Write your work progress in "Work Notes", update the case status, and communicate only via the internal Team Chat with the CA. You never contact the client directly.
          </p>
        </CardContent>
      </Card>

      {/* Status filter chips */}
      <div className="flex flex-wrap gap-2 items-center">
        <Filter className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        <button onClick={() => setFilterStatus("")}
          className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${filterStatus === "" ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
          All
        </button>
        {(["ASSIGNED", "IN_PROGRESS", "UNDER_REVIEW", "COMPLETED"] as CaseStatus[]).map(s => (
          <button key={s} onClick={() => setFilterStatus(filterStatus === s ? "" : s)}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${filterStatus === s ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
            {STATUS_CONFIG[s].label}
            {statusCounts[s] ? <span className="font-bold">({statusCounts[s]})</span> : null}
          </button>
        ))}
      </div>

      {/* Main: case list + detail */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* ── Case List ── */}
        <div className="lg:col-span-2 space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
            </div>
          ) : cases.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-14 text-center">
                <Briefcase className="w-10 h-10 text-muted-foreground/20 mb-3" />
                <p className="font-medium text-muted-foreground">No cases assigned yet</p>
                <p className="text-xs text-muted-foreground mt-1">Cases appear here once a CA assigns work to you</p>
              </CardContent>
            </Card>
          ) : (
            cases.map((c, i) => {
              const cfg = STATUS_CONFIG[c.status];
              const Icon = cfg.icon;
              const isSelected = selectedCase?.id === c.id;
              const unread = unreadByCa(c.id);
              return (
                <motion.button key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => selectCase(c)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${isSelected ? "border-emerald-500 bg-emerald-50/60 shadow-sm" : "border-border hover:border-emerald-300 bg-white"}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                        <span className="text-[10px] font-mono text-muted-foreground">{c.caseNumber}</span>
                        <span className={`flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded ${cfg.bg} ${cfg.color}`}>
                          <Icon className="w-2.5 h-2.5" />{cfg.label}
                        </span>
                        {unread > 0 && (
                          <span className="w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{unread}</span>
                        )}
                        {c.assistanceWorkNotes && (
                          <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">📝 Notes</span>
                        )}
                      </div>
                      <p className="font-semibold text-sm leading-snug line-clamp-2">{c.title}</p>
                      {c.caProfessional && (
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <UserCheck className="w-3 h-3 text-emerald-600" />
                          CA {c.caProfessional.firstName} {c.caProfessional.lastName}
                        </p>
                      )}
                      {c.booking?.service && (
                        <p className="text-xs text-muted-foreground">{c.booking.service.name}</p>
                      )}
                    </div>
                    {isSelected && <div className="w-1.5 h-6 rounded-full bg-emerald-500 shrink-0" />}
                  </div>
                </motion.button>
              );
            })
          )}
        </div>

        {/* ── Case Detail ── */}
        {selectedCase ? (
          <div className="lg:col-span-3 space-y-3">

            {/* Case header */}
            <Card className={`border-l-4 ${STATUS_CONFIG[selectedCase.status].border}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs font-mono text-muted-foreground">{selectedCase.caseNumber}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${STATUS_CONFIG[selectedCase.status].bg} ${STATUS_CONFIG[selectedCase.status].color}`}>
                        {STATUS_CONFIG[selectedCase.status].label}
                      </span>
                    </div>
                    <p className="font-bold text-base leading-snug">{selectedCase.title}</p>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap text-xs text-muted-foreground">
                      {selectedCase.caProfessional && (
                        <span className="flex items-center gap-1 text-emerald-700 font-medium">
                          <UserCheck className="w-3 h-3" />CA {selectedCase.caProfessional.firstName} {selectedCase.caProfessional.lastName}
                        </span>
                      )}
                      {selectedCase.booking?.service && <span>{selectedCase.booking.service.name}</span>}
                      {selectedCase.assistanceEarning ? (
                        <span className="text-emerald-700 font-medium">
                          💰 ₹{(selectedCase.assistanceEarning / 100).toFixed(0)} allocated
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>

                {/* Status action buttons */}
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Update Status</p>
                  <div className="flex flex-wrap gap-2">
                    {(["IN_PROGRESS", "UNDER_REVIEW", "PENDING_CLIENT_INFO", "COMPLETED"] as CaseStatus[]).map(s => {
                      const cfg = STATUS_CONFIG[s];
                      const Icon = cfg.icon;
                      const isCurrent = selectedCase.status === s;
                      return (
                        <button key={s} disabled={isCurrent || !!updatingId}
                          onClick={() => updateStatus(selectedCase.id, s)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all disabled:opacity-60 ${isCurrent ? `${cfg.bg} ${cfg.color} border-current/30 font-bold` : "border-border text-muted-foreground hover:text-foreground hover:bg-muted"}`}>
                          {updatingId === selectedCase.id && !isCurrent ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Icon className="w-3 h-3" />
                          )}
                          {isCurrent ? "✓ " : ""}{cfg.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs: Instructions / Work Notes / Chat */}
            <div className="flex gap-0.5 border-b border-border">
              {([
                { key: "instructions", label: "CA Instructions", icon: Info },
                { key: "notes",        label: "My Work Notes",   icon: Edit3,        badge: notesModified },
                { key: "chat",         label: "Team Chat",       icon: MessageSquare, badge: unreadByCa(selectedCase.id) > 0 },
              ] as { key: RightTab; label: string; icon: any; badge?: boolean | number }[]).map(({ key, label, icon: Icon, badge }) => (
                <button key={key} onClick={() => setRightTab(key)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 relative ${rightTab === key ? "border-emerald-600 text-emerald-600" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                  {badge ? <span className="w-2 h-2 rounded-full bg-red-500 absolute top-1.5 right-1" /> : null}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={rightTab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}>

                {/* ── CA Instructions ── */}
                {rightTab === "instructions" && (
                  <Card className="border-amber-200">
                    <CardContent className="p-4">
                      <p className="text-xs font-semibold text-amber-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5 text-amber-600" />
                        Instructions from CA {selectedCase.caProfessional?.firstName} {selectedCase.caProfessional?.lastName}
                      </p>
                      {selectedCase.assignmentInstructions ? (
                        <pre className="text-sm text-foreground whitespace-pre-wrap font-sans bg-amber-50 rounded-xl p-4 leading-relaxed border border-amber-100">
                          {selectedCase.assignmentInstructions}
                        </pre>
                      ) : (
                        <p className="text-sm text-muted-foreground italic py-4 text-center">
                          No specific instructions. Follow standard procedure and ask in Team Chat if unsure.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* ── Work Notes ── */}
                {rightTab === "notes" && (
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Edit3 className="w-4 h-4 text-emerald-600" />
                          My Work Progress Notes
                        </CardTitle>
                        <Button onClick={saveWorkNotes} disabled={savingNotes || !notesModified} size="sm"
                          className="rounded-xl bg-emerald-600 hover:bg-emerald-700 h-8 text-xs gap-1.5">
                          {savingNotes ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                          {savingNotes ? "Saving…" : "Save Notes"}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2">
                        <Info className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-emerald-800">
                          These are your internal work notes — visible to the CA. Record documents collected, status of tasks, issues encountered, and next steps.
                        </p>
                      </div>
                      <textarea
                        rows={12}
                        value={workNotes}
                        onChange={e => { setWorkNotes(e.target.value); setNotesModified(true); }}
                        placeholder={"Write your work progress notes here...\n\nSuggested format:\n✅ Documents collected:\n- PAN card received (2025-01-15)\n- Aadhaar received (2025-01-15)\n\n⏳ Pending:\n- Trade license — client said will provide by tomorrow\n- Bank statements — only 3 months given, need 6\n\n⚠️ Issues:\n- Client address on Aadhaar doesn't match trade address\n  → Flagged to CA via Team Chat\n\n📞 Client contacts:\n- Called 3 times, reached on 3rd call"}
                        className="w-full px-4 py-3 text-sm border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none font-mono leading-relaxed"
                      />
                      {notesModified && (
                        <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Unsaved changes — click Save Notes
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* ── Internal Team Chat ── */}
                {rightTab === "chat" && (
                  <Card className="flex flex-col" style={{ height: "420px" }}>
                    <CardHeader className="pb-2 border-b border-border shrink-0">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-emerald-600" />
                        Team Chat — Internal Only
                        {selectedCase.caProfessional && (
                          <span className="text-xs font-normal text-muted-foreground ml-1">
                            · CA {selectedCase.caProfessional.firstName} {selectedCase.caProfessional.lastName}
                          </span>
                        )}
                      </CardTitle>
                      <p className="text-xs text-amber-700 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Internal use only — never visible to the client
                      </p>
                    </CardHeader>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {currentMsgs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                          <MessageSquare className="w-9 h-9 text-muted-foreground/20 mb-2" />
                          <p className="text-sm font-medium text-muted-foreground">No messages yet</p>
                          <p className="text-xs text-muted-foreground mt-1">Ask the CA any questions about this case</p>
                        </div>
                      ) : (
                        currentMsgs.map(msg => {
                          const isMe = msg.senderRole === "ASSISTANCE";
                          return (
                            <div key={msg.id} className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                              <Avatar className="h-6 w-6 shrink-0">
                                <AvatarFallback className={`text-[9px] font-bold ${isMe ? "bg-emerald-100 text-emerald-700" : "bg-brand-100 text-brand-700"}`}>
                                  {isMe ? "AT" : "CA"}
                                </AvatarFallback>
                              </Avatar>
                              <div className={`max-w-[70%] flex flex-col gap-0.5 ${isMe ? "items-end" : "items-start"}`}>
                                <div className={`px-3.5 py-2 rounded-2xl text-sm leading-relaxed ${isMe ? "bg-emerald-600 text-white rounded-br-md" : "bg-muted text-foreground rounded-bl-md"}`}>
                                  {msg.content}
                                </div>
                                <span className="text-[10px] text-muted-foreground px-1">
                                  {new Date(msg.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      )}
                      <div ref={chatEndRef} />
                    </div>

                    {/* Chat input */}
                    <div className="p-3 border-t border-border shrink-0">
                      <div className="flex gap-2">
                        <input
                          value={chatMsg}
                          onChange={e => setChatMsg(e.target.value)}
                          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                          placeholder="Ask the CA a question about this case…"
                          disabled={sending}
                          className="flex-1 px-3 py-2 text-sm border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                        />
                        <Button onClick={sendMessage} disabled={!chatMsg.trim() || sending}
                          size="icon" className="h-9 w-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 shrink-0">
                          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  </Card>
                )}

              </motion.div>
            </AnimatePresence>
          </div>
        ) : !loading ? (
          <div className="lg:col-span-3 flex items-center justify-center py-20">
            <div className="text-center">
              <Briefcase className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm font-medium">Select a case to view details</p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
