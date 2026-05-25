"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CheckCircle, ArrowRight,
  HelpCircle, ChevronDown, Shield, Users,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { AnimatePresence } from "framer-motion";

const clientServices = [
  { name: "GST Registration", price: "₹999", note: "One-time" },
  { name: "GST Monthly Filing (GSTR-1 + 3B)", price: "₹799", note: "per month" },
  { name: "Income Tax Return (Salaried)", price: "₹499", note: "per year" },
  { name: "Income Tax Return (Business)", price: "₹1,999", note: "per year" },
  { name: "Company Registration (Pvt Ltd)", price: "₹4,999", note: "one-time" },
  { name: "Audit Services", price: "₹9,999", note: "onwards" },
  { name: "Trademark Registration", price: "₹2,999", note: "one-time" },
  { name: "Accounting (Monthly)", price: "₹1,999", note: "per month" },
  { name: "Payroll Processing", price: "₹1,499", note: "per month" },
  { name: "Startup Consulting (1hr)", price: "₹1,999", note: "per session" },
];

const highlights = [
  { label: "Verified CA Professionals", desc: "ICAI-registered experts reviewed by our team" },
  { label: "Secure Razorpay Payments", desc: "100% safe checkout, no payment data stored" },
  { label: "Google Meet Included", desc: "Auto-generated meeting link on every booking" },
  { label: "18% GST Applicable", desc: "All prices shown are exclusive of GST" },
];

const faqs = [
  { q: "What is the consultation fee?", a: "The platform consultation fee is ₹499 per session. Clients pay this at the time of booking via Razorpay." },
  { q: "Is the consultation fee refundable?", a: "If a CA cancels or does not show up for the session, your full amount is refunded within 5–7 business days to your original payment method." },
  { q: "How do I get the meeting link?", a: "Once your booking is confirmed and payment is processed, a Google Meet link is automatically generated and sent to your registered email address." },
  { q: "Are there any hidden charges?", a: "No hidden charges. You pay ₹499 per consultation. GST at 18% is applicable as per Indian tax law and shown at checkout." },
  { q: "Can I book multiple services?", a: "Yes, you can book separate consultations for different services. Each booking is priced at ₹499 per session." },
  { q: "Is GST charged on services?", a: "Yes, GST at 18% is applicable on all service fees as per Indian tax law. The final amount including GST will be shown at checkout." },
];

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">

        {/* Hero */}
        <section className="bg-gradient-to-br from-brand-700 via-brand-800 to-brand-900 py-20 px-4 relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-1/4 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-yellow-400/10 rounded-full blur-3xl" />
          </div>
          <div className="container mx-auto max-w-2xl text-center relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 bg-white/10 text-white rounded-full px-4 py-2 text-sm font-medium mb-6 border border-white/20">
              <Shield className="w-4 h-4" />
              Transparent Pricing · No Hidden Fees
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="text-4xl md:text-5xl font-bold font-heading text-white mb-4">
              Simple, Honest Pricing
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-brand-200 text-lg mb-8">
              One flat fee of <span className="text-white font-bold text-2xl">₹499</span> per consultation. Connect with verified CA experts instantly.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <Button className="rounded-xl bg-white text-brand-700 hover:bg-white/90 font-semibold text-base h-12 px-8" asChild>
                <Link href="/services">Book Consultation — ₹499 <ArrowRight className="ml-2 w-4 h-4" /></Link>
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Highlights */}
        <section className="bg-white border-b border-border py-10 px-4">
          <div className="container mx-auto max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-6">
            {highlights.map(({ label, desc }, i) => (
              <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="text-center">
                <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
                <p className="text-sm font-semibold">{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Service Pricing Table */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold font-heading mb-3">Service Pricing</h2>
              <p className="text-muted-foreground text-lg">Pay ₹499 per consultation. Rates below reflect the starting service cost handled by your CA.</p>
            </div>

            <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm mb-10">
              <div className="grid grid-cols-3 bg-muted/50 border-b border-border px-6 py-3 text-sm font-semibold text-muted-foreground">
                <span>Service</span>
                <span className="text-center">Starting Price</span>
                <span className="text-right">Frequency</span>
              </div>
              {clientServices.map((svc, i) => (
                <motion.div
                  key={svc.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="grid grid-cols-3 items-center px-6 py-4 border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
                >
                  <span className="font-medium">{svc.name}</span>
                  <span className="text-center text-brand-600 font-bold text-lg">{svc.price}</span>
                  <span className="text-right text-sm text-muted-foreground">{svc.note}</span>
                </motion.div>
              ))}
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 text-center">
              <p className="text-sm text-blue-700 mb-3">
                <strong>Note:</strong> The ₹499 consultation fee is charged per booking. Service implementation costs (listed above) are discussed directly with your CA during the session. All prices are exclusive of 18% GST.
              </p>
              <Button className="rounded-xl bg-brand-600 hover:bg-brand-700" asChild>
                <Link href="/services">Book Consultation — ₹499 <ArrowRight className="ml-2 w-4 h-4" /></Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <div className="bg-muted/30 border-t border-border py-10 px-4">
          <div className="container mx-auto max-w-3xl text-center">
            <Users className="w-8 h-8 text-brand-600 mx-auto mb-3" />
            <h3 className="text-xl font-bold font-heading mb-2">10,000+ clients trust CAConnect</h3>
            <p className="text-muted-foreground mb-6">India's fastest-growing CA marketplace. Register free as a client and connect with verified CA experts.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button className="rounded-xl bg-brand-600 hover:bg-brand-700" asChild>
                <Link href="/auth/register">Register as Client — Free</Link>
              </Button>
              <Button variant="outline" className="rounded-xl border-2" asChild>
                <Link href="/services">Browse Services</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <section className="container mx-auto px-4 py-16 max-w-2xl">
          <h2 className="text-3xl font-bold font-heading text-center mb-10">Pricing FAQs</h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-xl border border-border overflow-hidden">
                <button className="w-full flex items-center justify-between p-5 text-left hover:bg-muted/30 transition-colors" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span className="font-medium pr-4 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-brand-600 shrink-0" />
                    {faq.q}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
                      <div className="px-5 pb-5 pt-0 text-sm text-muted-foreground leading-relaxed border-t border-border">
                        <div className="pt-4">{faq.a}</div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
