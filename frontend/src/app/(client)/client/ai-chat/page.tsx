"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Bot, User, RefreshCw, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api, getErrorMessage } from "@/lib/api";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const suggestions = [
  "How do I file GST returns?",
  "What are the income tax slabs for FY 2024-25?",
  "Documents needed for company registration?",
  "How to save tax on investments?",
  "What is the GST rate for software services?",
  "When is the due date for TDS filing?",
];

export default function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your AI-powered CA assistant powered by Google Gemini. I can help you with tax questions, GST queries, compliance requirements, and financial planning. What would you like to know today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const message = text || input.trim();
    if (!message || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: message, timestamp: new Date() }]);
    setLoading(true);

    try {
      const { data } = await api.post("/ai/chat", { message });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.data.message, timestamp: new Date() },
      ]);
    } catch (err) {
      toast.error(getErrorMessage(err));
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I encountered an error. Please try again.", timestamp: new Date() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold font-heading">AI Tax Assistant</h1>
          <p className="text-sm text-muted-foreground">Powered by Google Gemini AI</p>
        </div>
      </div>

      <Card className="flex flex-col h-[calc(100vh-280px)] min-h-[500px]">
        <CardHeader className="border-b border-border pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-muted-foreground">AI Assistant Online</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setMessages([messages[0]])}>
              <RefreshCw className="w-4 h-4 mr-1" />New Chat
            </Button>
          </div>
        </CardHeader>

        {/* Messages */}
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${msg.role === "assistant" ? "bg-gradient-to-br from-purple-500 to-pink-500" : "bg-brand-600"}`}>
                  {msg.role === "assistant" ? <Bot className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-white" />}
                </div>
                <div className={`max-w-[75%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col gap-1`}>
                  <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${msg.role === "assistant" ? "bg-muted text-foreground rounded-tl-sm" : "bg-brand-600 text-white rounded-tr-sm"}`}>
                    {msg.content}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </CardContent>

        {/* Suggestions */}
        {messages.length <= 1 && (
          <div className="px-4 pb-2">
            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />Suggested questions
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button key={s} className="text-xs bg-muted hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-brand-950 border border-border rounded-xl px-3 py-1.5 transition-colors" onClick={() => sendMessage(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-border">
          <div className="flex gap-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about GST, income tax, compliance..."
              className="rounded-xl h-11"
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              disabled={loading}
            />
            <Button className="rounded-xl w-11 h-11 shrink-0 bg-brand-600 hover:bg-brand-700" onClick={() => sendMessage()} disabled={loading || !input.trim()}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            AI provides general information. For specific advice, consult a CA professional.
          </p>
        </div>
      </Card>
    </div>
  );
}
