"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CheckCircle, ArrowRight, Star, Users, Clock,
  Loader2, PhoneCall, FileText,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CACard } from "@/components/landing/CACard";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

const STATIC_SERVICES: Record<string, any> = {
  "gst-filing": {
    name: "GST Filing", category: "GST", basePrice: 149900,
    description: "Our GST filing service covers everything from GST registration to monthly/quarterly returns (GSTR-1, GSTR-3B), annual return (GSTR-9), reconciliation and notice handling. Our certified CA professionals ensure 100% compliance with all GST regulations and help you maximise input tax credit.",
    benefits: { create: [{ benefit: "GST Registration (New & Amendment)" }, { benefit: "Monthly Returns: GSTR-1 & GSTR-3B" }, { benefit: "Quarterly Returns for small taxpayers" }, { benefit: "Annual Return GSTR-9 & GSTR-9C" }, { benefit: "Input Tax Credit (ITC) Reconciliation" }, { benefit: "GST Notice Handling & Reply" }, { benefit: "e-Way Bill Management" }, { benefit: "Export Refund Claims" }] },
    specializations: [],
  },
  "income-tax-filing": {
    name: "Income Tax Filing", category: "TAX", basePrice: 99900,
    description: "Professional ITR filing for individuals, HUFs, and businesses (ITR-1 through ITR-7). We ensure maximum deductions under Sections 80C, 80D, 80G and more, process refunds quickly, and handle income tax notices professionally.",
    benefits: { create: [{ benefit: "ITR-1 to ITR-7 (All forms)" }, { benefit: "Tax Planning & Optimization" }, { benefit: "Capital Gains Computation" }, { benefit: "Refund Processing & Tracking" }, { benefit: "Income Tax Notice Handling" }, { benefit: "Advance Tax Calculation" }, { benefit: "Form 26AS Reconciliation" }, { benefit: "Deductions Under 80C, 80D, HRA, etc." }] },
    specializations: [],
  },
  "company-registration": {
    name: "Company Registration", category: "REGISTRATION", basePrice: 499900,
    description: "End-to-end company incorporation services including Private Limited Company, LLP (Limited Liability Partnership), One Person Company (OPC), and Section 8 (NGO) registration. We handle everything from name approval to receiving the Certificate of Incorporation.",
    benefits: { create: [{ benefit: "Company Name Approval (RUN)" }, { benefit: "MOA & AOA Drafting" }, { benefit: "Digital Signature Certificates (DSC)" }, { benefit: "Director Identification Numbers (DIN)" }, { benefit: "Certificate of Incorporation" }, { benefit: "PAN & TAN Application" }, { benefit: "Bank Account Opening Assistance" }, { benefit: "Post-incorporation Compliance" }] },
    specializations: [],
  },
  "audit-services": {
    name: "Audit Services", category: "AUDIT", basePrice: 999900,
    description: "Comprehensive audit services for businesses of all sizes including statutory audit under Companies Act, tax audit under Section 44AB of Income Tax Act, internal audit for risk management, and concurrent audit for banks and financial institutions.",
    benefits: { create: [{ benefit: "Statutory Audit (Companies Act)" }, { benefit: "Tax Audit (Section 44AB, Form 3CD)" }, { benefit: "Internal Audit & Risk Assessment" }, { benefit: "Bank Audit & Concurrent Audit" }, { benefit: "Stock Audit & Verification" }, { benefit: "Forensic Audit" }, { benefit: "RERA Audit for Real Estate" }, { benefit: "Audit Report Certification" }] },
    specializations: [],
  },
  "trademark-registration": {
    name: "Trademark Registration", category: "REGISTRATION", basePrice: 299900,
    description: "Complete trademark registration and intellectual property protection services. We conduct a thorough trademark search, file the application, handle objections and oppositions, and ensure your brand identity is fully protected under the Trade Marks Act.",
    benefits: { create: [{ benefit: "Trademark Search & Availability" }, { benefit: "Application Filing (TM-A)" }, { benefit: "Class Selection & Strategy" }, { benefit: "Opposition & Objection Handling" }, { benefit: "Trademark Renewal" }, { benefit: "International Trademark (Madrid Protocol)" }, { benefit: "Logo & Brand Protection" }, { benefit: "TM Certificate Tracking" }] },
    specializations: [],
  },
  "business-compliance": {
    name: "Business Compliance", category: "COMPLIANCE", basePrice: 299900,
    description: "Annual statutory compliance services for private limited companies and LLPs including all ROC filings, board meeting minutes, statutory registers maintenance, and event-based compliance like increase in capital, director changes, and charge registration.",
    benefits: { create: [{ benefit: "Annual Returns (MGT-7, AOC-4)" }, { benefit: "Board & General Meeting Minutes" }, { benefit: "Statutory Registers Maintenance" }, { benefit: "Director KYC (DIR-3 KYC)" }, { benefit: "Charge Creation & Satisfaction" }, { benefit: "Share Transfer & Allotment" }, { benefit: "Compliance Calendar Management" }, { benefit: "MCA Filing & Tracking" }] },
    specializations: [],
  },
  "startup-consulting": {
    name: "Startup Consulting", category: "CONSULTING", basePrice: 199900,
    description: "Comprehensive startup advisory covering business structure selection, legal setup, funding compliance (DPIIT recognition, angel investment), financial modelling, and ongoing compliance support so founders can focus on building their product.",
    benefits: { create: [{ benefit: "Business Structure Advisory" }, { benefit: "DPIIT Startup Recognition" }, { benefit: "Funding & Angel Investment Compliance" }, { benefit: "Financial Modelling & Projections" }, { benefit: "Pitch Deck Financial Slides" }, { benefit: "ESOPs Structure & Implementation" }, { benefit: "FEMA / RBI Compliance" }, { benefit: "Startup India Benefits" }] },
    specializations: [],
  },
  "financial-planning": {
    name: "Financial Planning", category: "FINANCIAL_PLANNING", basePrice: 149900,
    description: "Holistic personal and business financial planning covering investment strategy, retirement planning, insurance advisory, tax-efficient wealth structuring, and estate planning. Our CA-certified financial planners help you achieve your long-term goals.",
    benefits: { create: [{ benefit: "Investment Portfolio Planning" }, { benefit: "Retirement Planning (NPS, EPF, PPF)" }, { benefit: "Insurance Needs Analysis" }, { benefit: "Tax-Efficient Wealth Management" }, { benefit: "Estate & Succession Planning" }, { benefit: "Goal-Based Financial Planning" }, { benefit: "Mutual Fund Advisory" }, { benefit: "HUF Creation for Tax Savings" }] },
    specializations: [],
  },
  "accounting-services": {
    name: "Accounting Services", category: "ACCOUNTING", basePrice: 199900,
    description: "Complete accounting and bookkeeping services for SMEs and growing businesses. We maintain your books in Tally, QuickBooks or Zoho Books, prepare monthly financial statements, and provide management reports for informed decision-making.",
    benefits: { create: [{ benefit: "Daily Bookkeeping & Ledger Maintenance" }, { benefit: "Accounts Payable & Receivable" }, { benefit: "Bank & Credit Card Reconciliation" }, { benefit: "Monthly P&L & Balance Sheet" }, { benefit: "Cash Flow Statements" }, { benefit: "MIS Reports & Dashboards" }, { benefit: "Tally / QuickBooks / Zoho Setup" }, { benefit: "Year-end Account Finalization" }] },
    specializations: [],
  },
  "payroll-services": {
    name: "Payroll Services", category: "PAYROLL", basePrice: 149900,
    description: "End-to-end payroll processing services including salary structuring, monthly payroll calculation, PF and ESI filings, TDS computation under Section 192, Form 16 generation, and full and final settlement for exiting employees.",
    benefits: { create: [{ benefit: "Monthly Salary Processing" }, { benefit: "Salary Structuring & CTC Design" }, { benefit: "PF Registration & Monthly Filing" }, { benefit: "ESI Registration & Challan" }, { benefit: "Professional Tax Compliance" }, { benefit: "TDS Deduction & Form 24Q Filing" }, { benefit: "Form 16 Generation" }, { benefit: "F&F Settlement Computation" }] },
    specializations: [],
  },
};

export default function ServiceDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [service, setService] = useState<any>(STATIC_SERVICES[slug] || null);
  const [caList, setCAList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    api.get(`/services/${slug}`)
      .then((r) => {
        if (r.data?.data) setService(r.data.data);
      })
      .catch(() => {});

    api.get(`/ca?service=${slug}&limit=3`)
      .then((r) => setCAList(r.data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (!service) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-16 flex items-center justify-center">
          {loading ? (
            <Loader2 className="w-10 h-10 animate-spin text-brand-600" />
          ) : (
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-3">Service not found</h2>
              <Button asChild><Link href="/services">Browse all services</Link></Button>
            </div>
          )}
        </main>
        <Footer />
      </div>
    );
  }

  const benefits: string[] = service.benefits?.create?.map((b: any) => b.benefit)
    || service.benefits?.map((b: any) => b.benefit)
    || [];

  const relatedCAs = service.specializations
    ?.map((s: any) => s.caProfessional)
    .filter(Boolean)
    .slice(0, 3) || caList;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">

        {/* Hero */}
        <section className="bg-gradient-to-r from-brand-50 to-blue-50 dark:from-brand-950 dark:to-gray-900 border-b border-border py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Link href="/services" className="text-sm text-muted-foreground hover:text-brand-600 transition-colors">
                All Services
              </Link>
              <span className="text-muted-foreground">/</span>
              <Badge variant="brand">{service.category?.replace("_", " ")}</Badge>
            </div>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-bold font-heading mb-4">
              {service.name}
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-xl text-muted-foreground mb-8 max-w-2xl leading-relaxed">
              {service.description}
            </motion.p>
            <div className="flex flex-wrap items-center gap-6 mb-8 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Star className="w-4 h-4 text-gold-500 fill-gold-500" />
                <span><strong className="text-foreground">4.9</strong> average rating</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="w-4 h-4 text-brand-600" />
                <span><strong className="text-foreground">500+</strong> expert CAs</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4 text-green-600" />
                <span><strong className="text-foreground">Same-day</strong> booking available</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" className="rounded-xl bg-brand-600 hover:bg-brand-700 font-semibold" asChild>
                <Link href={`/find-ca?service=${slug}`}>
                  Find a {service.name} Expert <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-xl border-2" asChild>
                <Link href="/client/ai-chat">
                  <PhoneCall className="mr-2 w-4 h-4" /> Ask AI Assistant
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

            {/* Left Content */}
            <div className="lg:col-span-2 space-y-10">

              {/* What's Included */}
              {benefits.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold font-heading mb-6">What's Included</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {benefits.map((b, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="flex items-start gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-border"
                      >
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                        <span className="text-sm font-medium">{b}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Why Choose */}
              <div className="bg-gradient-to-br from-brand-50 to-blue-50 dark:from-brand-950 dark:to-gray-900 rounded-2xl p-8 border border-brand-100 dark:border-brand-900">
                <h2 className="text-2xl font-bold font-heading mb-4">Why Choose CA Pro?</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { icon: CheckCircle, title: "ICAI Verified", desc: "All CAs verified with valid ICAI memberships" },
                    { icon: Clock, title: "Fast Turnaround", desc: "Most services completed within 2–5 business days" },
                    { icon: Star, title: "Guaranteed Quality", desc: "Money-back guarantee if not satisfied" },
                  ].map(({ icon: Icon, title, desc }) => (
                    <div key={title} className="flex flex-col items-center text-center p-4">
                      <div className="w-10 h-10 bg-brand-100 dark:bg-brand-900 rounded-xl flex items-center justify-center mb-3">
                        <Icon className="w-5 h-5 text-brand-600" />
                      </div>
                      <p className="font-semibold text-sm mb-1">{title}</p>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Related CAs */}
              {relatedCAs.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold font-heading">{service.name} Experts</h2>
                    <Link href={`/find-ca?service=${slug}`} className="text-sm text-brand-600 flex items-center gap-1 hover:underline">
                      View all <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {relatedCAs.map((ca: any, i: number) => (
                      <CACard key={ca.id} ca={ca} index={i} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sticky Sidebar */}
            <div>
              <div className="sticky top-24 space-y-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-border p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="w-5 h-5 text-brand-600" />
                    <span className="text-sm font-medium text-muted-foreground">Starting from</span>
                  </div>
                  <p className="text-4xl font-bold font-heading text-brand-600 mb-1">
                    {formatCurrency(service.basePrice)}
                  </p>
                  <p className="text-xs text-muted-foreground mb-6">Price varies by complexity & CA expert</p>

                  <Button className="w-full h-12 rounded-xl bg-brand-600 hover:bg-brand-700 font-semibold mb-3" asChild>
                    <Link href={`/find-ca?service=${slug}`}>
                      Book Consultation <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full h-11 rounded-xl" asChild>
                    <Link href="/client/ai-chat">Chat with AI First</Link>
                  </Button>

                  <div className="mt-6 pt-5 border-t border-border space-y-3">
                    {[
                      "Free initial consultation",
                      "ICAI-certified professionals",
                      "Transparent pricing",
                      "Secure document handling",
                      "Money-back guarantee",
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-brand-600 rounded-2xl p-6 text-white">
                  <p className="font-semibold mb-1">Not sure where to start?</p>
                  <p className="text-sm text-brand-200 mb-4">Our AI assistant can guide you to the right service and CA.</p>
                  <Button className="w-full bg-white text-brand-700 hover:bg-brand-50 rounded-xl font-semibold" asChild>
                    <Link href="/client/ai-chat">Ask AI Assistant</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
