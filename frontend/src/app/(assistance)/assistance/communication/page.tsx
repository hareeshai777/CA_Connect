"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Search, MessageSquare, Briefcase, Loader2, RefreshCw, Check, CheckCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface CaseContact {
  id: string;
  caseNumber: string;
  caName: string;
  serviceName?: string;
  status: string;
  unread: number;
  lastMsg?: string;
  time?: string;
}

interface Message {
  id: string;
  content: string;
  senderRole: "CA" | "ASSISTANCE";
  createdAt: string;
  isRead: boolean;
  sender: { id: string; email: string; role: string };
}

const DEMO_CONTACTS: CaseContact[] = [
  { id: "c1", caseNumber: "CASE-0001", caName: "CA Priya Menon",  serviceName: "GST Filing",           status: "IN_PROGRESS", unread: 2, lastMsg: "Please check the documents I shared", time: "2m" },
  { id: "c2", caseNumber: "CASE-0002", caName: "CA Arjun Patel",  serviceName: "Company Registration", status: "ASSIGNED",    unread: 1, lastMsg: "When can you verify the docs?",     time: "1h" },
  { id: "c3", caseNumber: "CASE-0003", caName: "CA Vikram Singh", serviceName: "Income Tax Filing",    status: "IN_PROGRESS", unread: 0, lastMsg: "Thanks, reviewing by EOD",           time: "3h" },
];

const DEMO_MESSAGES: Record<string, Message[]> = {
  c1: [
    { id: "1", content: "Hi, I've received the GST documents from Rahul Sharma.",                             senderRole: "ASSISTANCE", createdAt: new Date(Date.now() - 3600000).toISOString(),  isRead: true, sender: { id: "me", email: "", role: "ASSISTANCE_TEAM" } },
    { id: "2", content: "Great! Are they all complete? We need PAN, Aadhaar and bank statement.",              senderRole: "CA",         createdAt: new Date(Date.now() - 3000000).toISOString(),  isRead: true, sender: { id: "ca", email: "", role: "CA_PROFESSIONAL" } },
    { id: "3", content: "PAN and Aadhaar are clear. Bank statement needs a better scan — last 2 pages blurry.", senderRole: "ASSISTANCE", createdAt: new Date(Date.now() - 2400000).toISOString(), isRead: true, sender: { id: "me", email: "", role: "ASSISTANCE_TEAM" } },
    { id: "4", content: "Please check the documents I shared",                                                senderRole: "CA",         createdAt: new Date(Date.now() - 120000).toISOString(),   isRead: false, sender: { id: "ca", email: "", role: "CA_PROFESSIONAL" } },
  ],
  c2: [
    { id: "1", content: "The director PAN cards for TechStart are all verified.",    senderRole: "ASSISTANCE", createdAt: new Date(Date.now() - 7200000).toISOString(), isRead: true, sender: { id: "me", email: "", role: "ASSISTANCE_TEAM" } },
    { id: "2", content: "Good. What about the MOA draft — any issues?",              senderRole: "CA",         createdAt: new Date(Date.now() - 7000000).toISOString(), isRead: true, sender: { id: "ca", email: "", role: "CA_PROFESSIONAL" } },
    { id: "3", content: "When can you verify the docs?",                             senderRole: "CA",         createdAt: new Date(Date.now() - 3600000).toISOString(), isRead: false, sender: { id: "ca", email: "", role: "CA_PROFESSIONAL" } },
  ],
  c3: [
    { id: "1", content: "Form 16 for Sunita Rao has been collected and verified.", senderRole: "ASSISTANCE", createdAt: new Date(Date.now() - 86400000).toISOString(), isRead: true, sender: { id: "me", email: "", role: "ASSISTANCE_TEAM" } },
    { id: "2", content: "Thanks, reviewing by EOD",                                senderRole: "CA",         createdAt: new Date(Date.now() - 82000000).toISOString(), isRead: true, sender: { id: "ca", email: "", role: "CA_PROFESSIONAL" } },
  ],
};

function initials(name: string) {
  return name.split(" ").filter(Boolean).map(n => n[0]).join("").slice(0, 2).toUpperCase();
}

export default function AssistanceCommunicationPage() {
  const [contacts, setContacts] = useState<CaseContact[]>([]);
  const [selected, setSelected] = useState<CaseContact | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get("/cases/assistance/my")
      .then(r => {
        const cases: any[] = r.data.data.cases ?? [];
        if (cases.length === 0) {
          setContacts(DEMO_CONTACTS);
          setMessages(DEMO_MESSAGES);
          setSelected(DEMO_CONTACTS[0]);
          setIsDemo(true);
        } else {
          const mapped: CaseContact[] = cases.map(c => ({
            id: c.id,
            caseNumber: c.caseNumber,
            caName: c.caProfessional
              ? `CA ${c.caProfessional.firstName} ${c.caProfessional.lastName}`
              : "CA",
            serviceName: c.booking?.service?.name,
            status: c.status,
            unread: (c.messages ?? []).filter((m: any) => m.senderRole === "CA" && !m.isRead).length,
            lastMsg: c.messages?.[0]?.content,
            time: c.messages?.[0]?.createdAt
              ? new Date(c.messages[0].createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
              : undefined,
          }));
          setContacts(mapped);
          setSelected(mapped[0] ?? null);
          setIsDemo(false);
        }
      })
      .catch(() => {
        setContacts(DEMO_CONTACTS);
        setMessages(DEMO_MESSAGES);
        setSelected(DEMO_CONTACTS[0]);
        setIsDemo(true);
      })
      .finally(() => setLoadingContacts(false));
  }, []);

  useEffect(() => {
    if (!selected || isDemo || messages[selected.id] !== undefined) return;
    setLoadingMsgs(true);
    api.get(`/cases/${selected.id}/messages`)
      .then(r => setMessages(prev => ({ ...prev, [selected.id]: r.data.data ?? [] })))
      .catch(() => setMessages(prev => ({ ...prev, [selected.id]: [] })))
      .finally(() => setLoadingMsgs(false));
  }, [selected?.id, isDemo]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selected?.id, messages]);

  const selectContact = (c: CaseContact) => {
    setSelected(c);
    setContacts(prev => prev.map(x => x.id === c.id ? { ...x, unread: 0 } : x));
  };

  const sendMessage = async () => {
    if (!selected || !input.trim()) return;
    const content = input.trim();
    setInput("");
    setSending(true);

    const tempMsg: Message = {
      id: "temp-" + Date.now(), content, senderRole: "ASSISTANCE",
      createdAt: new Date().toISOString(), isRead: false,
      sender: { id: "me", email: "", role: "ASSISTANCE_TEAM" },
    };
    setMessages(prev => ({ ...prev, [selected.id]: [...(prev[selected.id] ?? []), tempMsg] }));
    setContacts(prev => prev.map(c => c.id === selected.id ? { ...c, lastMsg: content, time: "Just now" } : c));

    if (!isDemo) {
      try {
        const res = await api.post(`/cases/${selected.id}/messages`, { content });
        setMessages(prev => ({
          ...prev,
          [selected.id]: (prev[selected.id] ?? []).map(m => m.id === tempMsg.id ? res.data.data : m),
        }));
      } catch {
        toast.error("Failed to send message");
        setMessages(prev => ({
          ...prev,
          [selected.id]: (prev[selected.id] ?? []).filter(m => m.id !== tempMsg.id),
        }));
        setInput(content);
      }
    }
    setSending(false);
  };

  const filtered = contacts.filter(c =>
    c.caName.toLowerCase().includes(search.toLowerCase()) ||
    c.caseNumber.toLowerCase().includes(search.toLowerCase())
  );
  const currentMsgs = selected ? (messages[selected.id] ?? []) : [];
  const totalUnread = contacts.reduce((s, c) => s + c.unread, 0);

  return (
    <div className="flex h-[calc(100vh-7rem)] bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      {/* Sidebar */}
      <div className="w-72 flex flex-col border-r border-gray-200 shrink-0">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold font-heading text-base flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              Team Chat
              {totalUnread > 0 && (
                <span className="w-5 h-5 bg-emerald-600 text-white text-[10px] rounded-full flex items-center justify-center">{totalUnread}</span>
              )}
            </h2>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search cases or CA..."
              className="pl-9 h-9 rounded-xl text-sm border-gray-200"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingContacts ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">No cases found</p>
            </div>
          ) : (
            filtered.map(c => (
              <button key={c.id} onClick={() => selectContact(c)}
                className={cn(
                  "w-full flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 text-left",
                  selected?.id === c.id && "bg-emerald-50 border-l-2 border-l-emerald-500"
                )}>
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-bold">{initials(c.caName)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="font-semibold text-sm text-gray-900 truncate">{c.caName}</p>
                    {c.time && <span className="text-[10px] text-gray-400 shrink-0">{c.time}</span>}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-mono text-gray-400 shrink-0">{c.caseNumber}</span>
                    {c.serviceName && <span className="text-xs text-gray-500 truncate">{c.serviceName}</span>}
                  </div>
                  {c.lastMsg && <p className="text-xs text-gray-400 truncate mt-0.5">{c.lastMsg}</p>}
                </div>
                {c.unread > 0 && (
                  <span className="w-5 h-5 bg-emerald-600 text-white text-[10px] rounded-full flex items-center justify-center shrink-0">{c.unread}</span>
                )}
              </button>
            ))
          )}
        </div>

        <div className="p-3 border-t border-gray-200 bg-gray-50">
          <p className="text-[11px] text-gray-400 text-center flex items-center justify-center gap-1">
            <Briefcase className="w-3 h-3" />
            Internal CA — Assistance chat only
          </p>
        </div>
      </div>

      {/* Chat area */}
      {selected ? (
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-200 bg-white">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-bold">{initials(selected.caName)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm text-gray-900">{selected.caName}</p>
              <p className="text-xs text-gray-500">
                Case: <span className="font-medium">{selected.caseNumber}</span>
                {selected.serviceName && <> · {selected.serviceName}</>}
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-gray-50">
            {loadingMsgs ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
              </div>
            ) : currentMsgs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <MessageSquare className="w-10 h-10 text-muted-foreground/20 mb-2" />
                <p className="text-sm font-medium text-muted-foreground">No messages yet</p>
                <p className="text-xs text-muted-foreground mt-1">Ask the CA a question about this case</p>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {currentMsgs.map(msg => {
                  const isMe = msg.senderRole === "ASSISTANCE";
                  return (
                    <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                      {!isMe && (
                        <Avatar className="h-7 w-7 mr-2 mt-1 shrink-0">
                          <AvatarFallback className="text-[10px] bg-blue-100 text-blue-700">{initials(selected.caName)}</AvatarFallback>
                        </Avatar>
                      )}
                      <div className="max-w-[72%]">
                        <div className={cn(
                          "px-4 py-2.5 rounded-2xl text-sm shadow-sm",
                          isMe
                            ? "bg-emerald-600 text-white rounded-tr-sm"
                            : "bg-white text-gray-800 rounded-tl-sm border border-gray-200"
                        )}>
                          {msg.content}
                        </div>
                        <div className={cn("flex items-center gap-1 mt-1 px-1", isMe ? "justify-end" : "justify-start")}>
                          <span className="text-[10px] text-gray-400">
                            {new Date(msg.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          {isMe && (msg.isRead
                            ? <CheckCheck className="w-3 h-3 text-emerald-500" />
                            : <Check className="w-3 h-3 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
            <div ref={endRef} />
          </div>

          <div className="px-5 py-4 border-t border-gray-200 bg-white">
            <div className="flex items-center gap-2">
              <Input
                placeholder={`Message ${selected.caName}…`}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
                disabled={sending}
                className="flex-1 rounded-xl h-10 border-gray-200"
              />
              <Button onClick={sendMessage} disabled={!input.trim() || sending}
                className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 shrink-0">
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-[10px] text-gray-400 mt-2 text-center">
              Messages are internal between you and the CA — clients cannot see this chat
            </p>
          </div>
        </div>
      ) : !loadingContacts ? (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <MessageSquare className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm font-medium">Select a case to start chatting</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
