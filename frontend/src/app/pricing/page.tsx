"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CheckCircle, X, Zap, Star, Building2, ArrowRight,
  HelpCircle, ChevronDown, Shield, Users,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AnimatePresence } from "framer-motion";

// ─── Client-side pricing ──────────────────────────────────────────────────
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

// ─── CA subscription plans ────────────────────────────────────────────────
const caPlans = [
  {
    name: "Basic",
    icon: Zap,
    onboardingFee: "₹499",
    monthly: "Free",
    description: "Everything to get started and build your client base on CA Pro.",
    color: "border-border",
    badge: null,
    features: [
      { text: "Profile listing on platform", included: true },
      { text: "Up to 10 bookings / month", included: true },
      { text: "Calendar & slot management", included: true },
      { text: "Google Meet auto-integration", included: true },
      { text: "Basic earnings dashboard", included: true },
      { text: "Client messaging", included: true },
      { text: "Priority search placement", included: false },
      { text: "Advanced analytics", included: false },
      { text: "Featured badge", included: false },
      { text: "Dedicated account manager", included: false },
    ],
  },
  {
    name: "Professional",
    icon: Star,
    onboardingFee: "₹499",
    monthly: "₹999/mo",
    description: "For active CA professionals who want to grow their practice faster.",
    color: "border-brand-500 ring-2 ring-brand-500",
    badge: "Most Popular",
    features: [
      { text: "Profile listing on platform", included: true },
      { text: "Unlimited bookings", included: true },
      { text: "Calendar & slot management", included: true },
      { text: "Google Meet auto-integration", included: true },
      { text: "Advanced earnings dashboard", included: true },
      { text: "Client messaging", included: true },
      { text: "Priority search placement", included: true },
      { text: "Advanced analytics & reports", included: true },
      { text: "Featured badge on profile", included: true },
      { text: "Dedicated account manager", included: false },
    ],
  },
  {
    name: "Enterprise",
    icon: Building2,
    onboardingFee: "₹499",
    monthly: "₹2,499/mo",
    description: "For CA firms and high-volume practices with multiple team members.",
    color: "border-gold-500",
    badge: "Best Value",
    features: [
      { text: "Multi-user firm account", included: true },
      { text: "Unlimited bookings", included: true },
      { text: "Calendar & slot management", included: true },
      { text: "Google Meet auto-integration", included: true },
      { text: "Advanced earnings dashboard", included: true },
      { text: "Client messaging & CRM", included: true },
      { text: "Priority + promoted placement", included: true },
      { text: "Advanced analytics & exports", included: true },
      { text: "Featured badge on profile", included: true },
      { text: "Dedicated account manager", included: true },
    ],
  },
];

const platformFees = [
  { label: "Platform commission", value: "10%", note: "deducted per consultation" },
  { label: "Payment gateway", value: "~2%", note: "Razorpay processing fee (passed on)" },
  { label: "CA onboarding fee", value: "₹499", note: "one-time, non-refundable" },
];

const faqs = [
  { q: "Is the ₹499 onboarding fee refundable?", a: "The onboarding fee is non-refundable as it covers the cost of profile verification, ICAI membership validation, and account setup." },
  { q: "When is my consultation fee paid out?", a: "Earnings are settled to your registered bank account every 7 days (weekly), after deducting the 10% platform commission." },
  { q: "Can I upgrade my plan anytime?", a: "Yes, you can upgrade or downgrade your subscription at any time from your CA dashboard settings. Changes take effect on the next billing cycle." },
  { q: "Are there any hidden charges?", a: "No hidden charges. You pay the ₹499 one-time fee, the monthly subscription (if on a paid plan), and the 10% commission per consultation. The Razorpay processing fee is shown transparently." },
  { q: "What is the client consultation fee?", a: "Each CA sets their own consultation fee. Clients pay this directly at the time of booking. Prices vary from ₹299 to ₹5,000+ per session depending on the CA's expertise and service type." },
  { q: "Is GST charged on services?", a: "Yes, GST at 18% is applicable on all service fees and subscriptions as per Indian tax law." },
];

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">("monthly");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeTab, setActiveTab] = useState<"clients" | "cas">("clients");

  const annualDiscount = 0.2;

  const getPrice = (plan: typeof caPlans[0]) => {
    if (plan.monthly === "Free") return "Free";
    const base = parseInt(plan.monthly.replace(/[^\d]/g, ""));
    if (billingPeriod === "annual") {
      const discounted = Math.round(base * (1 - annualDiscount));
      return `₹${discounted.toLocaleString()}/mo`;
    }
    return plan.monthly;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">

        {/* Hero */}
        <section className="bg-gradient-to-br from-brand-700 via-brand-800 to-brand-900 py-20 px-4 relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-1/4 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-gold-400/10 rounded-full blur-3xl" />
          </div>
          <div className="container mx-auto max-w-2xl text-center relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 bg-white/10 text-white rounded-full px-4 py-2 text-sm font-medium mb-6 border border-white/20">
              <Shield className="w-4 h-4" />
              Transparent Pricing · No Hidden Fees
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="text-4xl md:text-5xl font-bold font-heading text-white mb-4">
              Simple, Honest Pricing
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-brand-200 text-lg">
              Whether you're a client looking for CA services or a CA professional growing your practice — we have a plan for you.
            </motion.p>
          </div>
        </section>

        {/* Tab toggle */}
        <div className="bg-white dark:bg-gray-900 border-b border-border sticky top-16 z-30">
          <div className="container mx-auto px-4 flex gap-1 py-3 justify-center">
            <button onClick={() => setActiveTab("clients")} className={`px-6 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab === "clients" ? "bg-brand-600 text-white" : "text-muted-foreground hover:bg-muted"}`}>
              For Clients
            </button>
            <button onClick={() => setActiveTab("cas")} className={`px-6 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab === "cas" ? "bg-brand-600 text-white" : "text-muted-foreground hover:bg-muted"}`}>
              For CA Professionals
            </button>
          </div>
        </div>

        {/* ── CLIENT PRICING ── */}
        {activeTab === "clients" && (
          <section className="container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold font-heading mb-3">Service Pricing for Clients</h2>
                <p className="text-muted-foreground text-lg">Pay only for the consultation. Individual CA rates may vary.</p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-border overflow-hidden shadow-sm mb-10">
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

              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-100 dark:border-blue-900 rounded-2xl p-6 text-center">
                <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                  <strong>Note:</strong> Final pricing is set by each CA professional. Browse profiles to compare rates. All prices are exclusive of 18% GST.
                </p>
                <Button className="rounded-xl bg-brand-600 hover:bg-brand-700" asChild>
                  <Link href="/find-ca">Browse CA Professionals <ArrowRight className="ml-2 w-4 h-4" /></Link>
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* ── CA PLANS ── */}
        {activeTab === "cas" && (
          <section className="container mx-auto px-4 py-16">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold font-heading mb-3">CA Professional Plans</h2>
              <p className="text-muted-foreground text-lg mb-6">All plans start with a one-time ₹499 onboarding fee</p>

              {/* Billing toggle */}
              <div className="inline-flex items-center gap-3 bg-muted rounded-xl p-1">
                <button onClick={() => setBillingPeriod("monthly")} className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${billingPeriod === "monthly" ? "bg-white dark:bg-gray-800 shadow-sm" : "text-muted-foreground"}`}>
                  Monthly
                </button>
                <button onClick={() => setBillingPeriod("annual")} className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${billingPeriod === "annual" ? "bg-white dark:bg-gray-800 shadow-sm" : "text-muted-foreground"}`}>
                  Annual
                  <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-semibold">-20%</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
              {caPlans.map((plan, i) => (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`relative bg-white dark:bg-gray-800 rounded-2xl border-2 p-6 ${plan.color} ${plan.badge === "Most Popular" ? "shadow-xl shadow-brand-100 dark:shadow-brand-900" : "shadow-sm"}`}
                >
                  {plan.badge && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <Badge className={`text-xs font-bold px-3 py-1 ${plan.badge === "Most Popular" ? "bg-brand-600" : "bg-gold-500"} text-white border-0`}>
                        {plan.badge}
                      </Badge>
                    </div>
                  )}

                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${plan.badge === "Most Popular" ? "bg-brand-100 dark:bg-brand-950" : "bg-muted"}`}>
                    <plan.icon className={`w-6 h-6 ${plan.badge === "Most Popular" ? "text-brand-600" : "text-muted-foreground"}`} />
                  </div>

                  <h3 className="text-xl font-bold font-heading mb-1">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{plan.description}</p>

                  <div className="mb-1">
                    <span className="text-3xl font-bold font-heading">{getPrice(plan)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-6">+ ₹499 one-time onboarding fee</p>

                  <Button
                    className={`w-full h-11 rounded-xl font-semibold mb-6 ${plan.badge === "Most Popular" ? "bg-brand-600 hover:bg-brand-700 text-white" : "bg-muted hover:bg-muted/80 text-foreground"}`}
                    asChild
                  >
                    <Link href="/ca/register">Get Started</Link>
                  </Button>

                  <div className="space-y-2.5">
                    {plan.features.map((f) => (
                      <div key={f.text} className="flex items-center gap-2.5 text-sm">
                        {f.included
                          ? <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                          : <X className="w-4 h-4 text-muted-foreground/40 shrink-0" />}
                        <span className={f.included ? "text-foreground" : "text-muted-foreground/60"}>{f.text}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Platform fees */}
            <div className="max-w-2xl mx-auto">
              <h3 className="text-lg font-bold font-heading text-center mb-4">Platform Fees</h3>
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-border overflow-hidden">
                {platformFees.map((fee, i) => (
                  <div key={fee.label} className={`flex items-center justify-between px-6 py-4 ${i < platformFees.length - 1 ? "border-b border-border" : ""}`}>
                    <span className="font-medium">{fee.label}</span>
                    <div className="text-right">
                      <span className="font-bold text-brand-600 text-lg">{fee.value}</span>
                      <p className="text-xs text-muted-foreground">{fee.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Compare plans note */}
        <div className="bg-muted/30 border-t border-border py-10 px-4">
          <div className="container mx-auto max-w-3xl text-center">
            <Users className="w-8 h-8 text-brand-600 mx-auto mb-3" />
            <h3 className="text-xl font-bold font-heading mb-2">10,000+ clients trust CA Pro</h3>
            <p className="text-muted-foreground mb-6">Join India's fastest-growing CA marketplace. Free to register as a client. CAs start at just ₹499.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button className="rounded-xl bg-brand-600 hover:bg-brand-700" asChild>
                <Link href="/auth/register">Register as Client — Free</Link>
              </Button>
              <Button variant="outline" className="rounded-xl border-2" asChild>
                <Link href="/ca/register">Register as CA — ₹499</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <section className="container mx-auto px-4 py-16 max-w-2xl">
          <h2 className="text-3xl font-bold font-heading text-center mb-10">Pricing FAQs</h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-border overflow-hidden">
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
