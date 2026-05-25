"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, MessageSquare, Clock, CheckCircle, Send } from "lucide-react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/contact", form);
      setSent(true);
      toast.success("Message sent! We'll get back to you within 24 hours.");
    } catch {
      toast.error("Failed to send. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">

        {/* Hero */}
        <section className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 py-20 px-4 text-center overflow-hidden">
          <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: `linear-gradient(rgba(99,102,241,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,.8) 1px, transparent 1px)`, backgroundSize: "50px 50px" }} />
          <div className="container mx-auto max-w-2xl relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-full px-4 py-2 text-sm font-medium mb-6">
              <MessageSquare className="w-4 h-4 text-blue-300" />
              Get In Touch
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold font-heading text-white mb-4">
              We&apos;d Love to{" "}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Hear From You</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
              className="text-blue-100/70 text-lg">
              Have questions about our services, pricing, or anything else? Our team responds within 24 hours.
            </motion.p>
          </div>
        </section>

        <section className="py-16 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

              {/* Contact Info */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold font-heading mb-5">Contact Information</h2>
                  <div className="space-y-4">
                    {[
                      { icon: Mail, label: "Email", value: "support@capro.in", sub: "Replies within 24 hours" },
                      { icon: Phone, label: "Phone", value: "+91 98765 43210", sub: "Mon–Sat, 9AM–7PM IST" },
                      { icon: MapPin, label: "Office", value: "Bengaluru, Karnataka", sub: "Pan-India presence" },
                      { icon: Clock, label: "Support Hours", value: "Mon–Sat 9AM–7PM", sub: "Emergency support 24/7" },
                    ].map(({ icon: Icon, label, value, sub }) => (
                      <div key={label} className="flex items-start gap-4 p-4 bg-white rounded-xl border border-border">
                        <div className="w-9 h-9 bg-brand-50 rounded-xl flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4 text-brand-600" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">{label}</p>
                          <p className="font-semibold text-sm">{value}</p>
                          <p className="text-xs text-muted-foreground">{sub}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-brand-600 to-blue-700 rounded-2xl p-6 text-white">
                  <h3 className="font-bold mb-2">Need urgent help?</h3>
                  <p className="text-brand-100 text-sm mb-4">Book a ₹499 consultation for immediate CA assistance.</p>
                  <Button className="w-full bg-white text-brand-700 hover:bg-brand-50 rounded-xl font-semibold text-sm">
                    Book Now — ₹499
                  </Button>
                </div>
              </div>

              {/* Contact Form */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl border border-border p-8 shadow-sm">
                  {sent ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="text-xl font-bold font-heading mb-2">Message Sent!</h3>
                      <p className="text-muted-foreground mb-6">We&apos;ll get back to you within 24 hours.</p>
                      <Button onClick={() => setSent(false)} variant="outline" className="rounded-xl">Send Another Message</Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <h2 className="text-xl font-bold font-heading mb-6">Send us a message</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                          <Label>Full Name *</Label>
                          <Input placeholder="Rajesh Kumar" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required className="rounded-xl" />
                        </div>
                        <div className="space-y-1.5">
                          <Label>Email *</Label>
                          <Input type="email" placeholder="rajesh@company.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required className="rounded-xl" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                          <Label>Phone</Label>
                          <Input placeholder="+91 98765 43210" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="rounded-xl" />
                        </div>
                        <div className="space-y-1.5">
                          <Label>Subject</Label>
                          <Input placeholder="GST Filing Query" value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} className="rounded-xl" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label>Message *</Label>
                        <Textarea placeholder="Tell us how we can help you..." value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} required rows={5} className="rounded-xl resize-none" />
                      </div>
                      <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl bg-brand-600 hover:bg-brand-700 font-semibold">
                        {loading ? "Sending..." : <><Send className="mr-2 w-4 h-4" /> Send Message</>}
                      </Button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
