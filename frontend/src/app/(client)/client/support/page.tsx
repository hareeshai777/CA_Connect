"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Phone, Mail, HelpCircle, ChevronDown, Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { toast } from "sonner";

const faqs = [
  { q: "How do I book a consultation?", a: "Go to the Services page, select the service you need, and click 'Book Consultation'. You'll be guided through selecting a CA and completing payment via Razorpay." },
  { q: "How do I join my scheduled meeting?", a: "Once your booking is confirmed, a Google Meet link is sent to your email. You can also find the Join button on your My Bookings page when the meeting is confirmed." },
  { q: "What if my CA cancels the consultation?", a: "If a CA cancels, you will receive a full refund within 5–7 business days to your original payment method. You can then rebook with another CA." },
  { q: "How do I upload documents for my CA?", a: "Go to the Documents section in your dashboard. Click 'Upload Document', select the file, choose the document type, and submit. Your CA will be notified." },
  { q: "Can I request a refund?", a: "Refunds are available if the CA cancels or fails to appear for the session. For other cases, contact our support team who will review your request within 2 business days." },
  { q: "How long is a consultation session?", a: "Each consultation session is approximately 30–60 minutes. The CA may extend the session at their discretion if the matter requires more time." },
  { q: "Can I change my booking time?", a: "You can request a reschedule by contacting support or the CA directly via the case chat. Reschedules must be requested at least 6 hours before the session." },
];

export default function ClientSupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [form, setForm] = useState({ subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const sendMessage = async () => {
    if (!form.subject.trim() || !form.message.trim()) {
      toast.error("Please fill in both subject and message");
      return;
    }
    setSending(true);
    try {
      await api.post("/contact", { ...form, type: "SUPPORT" });
      setSent(true);
      toast.success("Message sent! We'll respond within 24 hours.");
    } catch {
      toast.error("Failed to send. Please try emailing us directly.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold font-heading">Help & Support</h1>
        <p className="text-muted-foreground mt-1 text-sm">Get help with bookings, payments, and using the platform</p>
      </div>

      {/* Contact cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: Phone, label: "Call Us", value: "+91 98765 43210", sub: "Mon–Sat, 9AM–6PM", color: "text-green-600", bg: "bg-green-50" },
          { icon: Mail, label: "Email Us", value: "support@casaas.com", sub: "Reply within 24 hours", color: "text-blue-600", bg: "bg-blue-50" },
          { icon: MessageSquare, label: "Live Chat", value: "Chat with us", sub: "Available on weekdays", color: "text-brand-600", bg: "bg-brand-50" },
        ].map(({ icon: Icon, label, value, sub, color, bg }) => (
          <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl border border-border p-5 flex items-start gap-3">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center shrink-0`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className="font-semibold text-sm">{label}</p>
              <p className={`text-sm font-medium ${color}`}>{value}</p>
              <p className="text-xs text-muted-foreground">{sub}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Contact form */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <h2 className="font-semibold font-heading text-lg mb-4 flex items-center gap-2">
          <Send className="w-4 h-4 text-brand-600" /> Send us a Message
        </h2>
        {sent ? (
          <div className="flex flex-col items-center py-8 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mb-3" />
            <p className="font-semibold">Message sent successfully!</p>
            <p className="text-sm text-muted-foreground mt-1">We'll get back to you at your registered email within 24 hours.</p>
            <Button variant="outline" className="rounded-xl mt-4" onClick={() => { setSent(false); setForm({ subject: "", message: "" }); }}>
              Send another message
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label className="text-xs mb-1.5 block">Subject</Label>
              <Input placeholder="e.g. Issue with my booking" value={form.subject}
                onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} className="rounded-xl" />
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">Message</Label>
              <textarea
                placeholder="Describe your issue in detail..."
                value={form.message}
                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                className="w-full min-h-[120px] rounded-xl border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <Button className="rounded-xl bg-brand-600 hover:bg-brand-700" onClick={sendMessage} disabled={sending}>
              {sending ? "Sending…" : <><Send className="w-4 h-4 mr-2" />Send Message</>}
            </Button>
          </div>
        )}
      </div>

      {/* FAQ */}
      <div>
        <h2 className="font-semibold font-heading text-lg mb-4 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-brand-600" /> Frequently Asked Questions
        </h2>
        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-card rounded-xl border border-border overflow-hidden">
              <button className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <span className="font-medium text-sm pr-4">{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
              </button>
              {openFaq === i && (
                <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-border pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
