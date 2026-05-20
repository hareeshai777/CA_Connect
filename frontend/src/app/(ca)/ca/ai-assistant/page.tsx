"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api, getErrorMessage } from "@/lib/api";
import { toast } from "sonner";

interface Message { role: "user" | "assistant"; content: string; }

const QUICK = [
  "What are the latest GST amendments?",
  "How to handle TDS deductions for freelancers?",
  "Section 80C deduction limits for FY 2024-25",
  "What documents are needed for company registration?",
];

export default function CAAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! I'm your CA AI Assistant powered by Gemini. Ask me anything about tax laws, GST, compliance, or accounting standards." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: msg }]);
    setLoading(true);
    try {
      const res = await api.post("/ai/chat", {
        message: msg,
        history: messages.map((m) => ({ role: m.role, content: m.content })),
      });
      setMessages((prev) => [...prev, { role: "assistant", content: res.data.data?.reply || res.data.data }]);
    } catch (err) {
      toast.error(getErrorMessage(err));
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I couldn't process that. Please try again." }]);
    } finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-130px)]">
      <div className="mb-4">
        <h1 className="text-2xl font-bold font-heading flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-brand-600" />AI Assistant
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Powered by Google Gemini · Ask about tax, GST, compliance, accounting</p>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4">
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === "assistant" ? "bg-brand-600" : "bg-gray-200 dark:bg-gray-700"}`}>
                {m.role === "assistant" ? <Bot className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />}
              </div>
              <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                m.role === "assistant"
                  ? "bg-card border border-border text-foreground"
                  : "bg-brand-600 text-white"
              }`}>
                {m.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center"><Bot className="w-4 h-4 text-white" /></div>
            <div className="bg-card border border-border rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => <div key={i} className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
              </div>
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick questions */}
      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {QUICK.map((q) => (
            <button key={q} onClick={() => send(q)}
              className="text-xs px-3 py-1.5 rounded-xl border border-border text-muted-foreground hover:border-brand-400 hover:text-brand-600 transition-colors">
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
          placeholder="Ask about GST, income tax, compliance..."
          className="flex-1 rounded-xl h-11"
          disabled={loading}
        />
        <Button onClick={() => send()} disabled={!input.trim() || loading} className="rounded-xl bg-brand-600 hover:bg-brand-700 h-11 px-4">
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
}
