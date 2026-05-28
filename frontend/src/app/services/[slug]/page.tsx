"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle, ArrowRight, Star, Users, Clock,
  Loader2, FileText, ChevronDown, Shield, Zap,
  Calendar, IndianRupee, Award,
  AlertCircle, Building, BarChart3,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

// ─── Static service data ────────────────────────────────────────────────────

const STATIC_SERVICES: Record<string, any> = {
  "gst-filing": {
    name: "GST Filing",
    category: "GST",
    basePrice: 149900,
    shortDescription: "Complete GST registration, monthly/quarterly returns, and compliance management.",
    description: "Our GST filing service covers everything from GST registration to monthly/quarterly returns (GSTR-1, GSTR-3B), annual return (GSTR-9), reconciliation and notice handling. Our certified CA professionals ensure 100% compliance with all GST regulations and help you maximise input tax credit.",
    timeline: "2–5 business days",
    benefits: { create: [{ benefit: "GST Registration (New & Amendment)" }, { benefit: "Monthly Returns: GSTR-1 & GSTR-3B" }, { benefit: "Quarterly Returns for small taxpayers" }, { benefit: "Annual Return GSTR-9 & GSTR-9C" }, { benefit: "Input Tax Credit (ITC) Reconciliation" }, { benefit: "GST Notice Handling & Reply" }, { benefit: "e-Way Bill Management" }, { benefit: "Export Refund Claims" }] },
    requiredDocuments: ["PAN Card", "Aadhaar Card", "Passport-size Photograph", "Business Registration Proof", "Bank Account Statement (3 months)", "Address Proof of Business", "Digital Signature Certificate (if applicable)", "Previous GST Returns (for amendments)"],
    process: [
      { step: 1, title: "Book Consultation (₹499)", desc: "Pay ₹499 to book your initial consultation. A Google Meet link is auto-generated and sent to your WhatsApp & email." },
      { step: 2, title: "Document Verification", desc: "Our Assistance Team verifies all documents and prepares the filing package." },
      { step: 3, title: "CA Review & Filing", desc: "Your assigned CA reviews all data, prepares returns, and files them on the GST portal." },
      { step: 4, title: "Confirmation & Compliance", desc: "You receive the filed returns with ARN numbers and compliance confirmation." },
    ],
    faqs: [
      { q: "Who needs GST registration?", a: "Businesses with annual turnover exceeding ₹20 lakhs (₹10 lakhs for special category states) must register for GST." },
      { q: "What are the due dates for GST filing?", a: "GSTR-1 is due on the 11th, GSTR-3B by the 20th of each month. Quarterly filers have different deadlines." },
      { q: "What happens if I miss the GST filing deadline?", a: "You'll be liable for interest at 18% p.a. and a late fee of ₹50 per day (₹20 for nil returns)." },
      { q: "Can I file GST returns for previous months?", a: "Yes, you can file returns for previous periods though late fees and interest will apply." },
    ],
    relatedServices: ["income-tax-filing", "accounting-services", "business-compliance"],
    specializations: [],
  },
  "income-tax-filing": {
    name: "Income Tax Filing",
    category: "TAX",
    basePrice: 99900,
    shortDescription: "Professional ITR filing for individuals, HUFs, and businesses with maximum deductions.",
    description: "Professional ITR filing for individuals, HUFs, and businesses (ITR-1 through ITR-7). We ensure maximum deductions under Sections 80C, 80D, 80G and more, process refunds quickly, and handle income tax notices professionally.",
    timeline: "1–3 business days",
    benefits: { create: [{ benefit: "ITR-1 to ITR-7 (All forms)" }, { benefit: "Tax Planning & Optimization" }, { benefit: "Capital Gains Computation" }, { benefit: "Refund Processing & Tracking" }, { benefit: "Income Tax Notice Handling" }, { benefit: "Advance Tax Calculation" }, { benefit: "Form 26AS Reconciliation" }, { benefit: "Deductions Under 80C, 80D, HRA, etc." }] },
    requiredDocuments: ["PAN Card", "Aadhaar Card", "Form 16 / Form 16A", "Bank Account Statements", "Investment Proofs (80C, 80D, etc.)", "Rent Receipts (if claiming HRA)", "Capital Gains Statements", "Foreign Income Details (if applicable)"],
    process: [
      { step: 1, title: "Book Consultation (₹499)", desc: "Pay ₹499 and book your slot with a CA. Automatic meeting link sent via WhatsApp & email." },
      { step: 2, title: "Document Collection", desc: "Upload all required documents. Our team verifies completeness and accuracy." },
      { step: 3, title: "Computation & Review", desc: "CA computes total income, deductions, and tax liability. You review and approve." },
      { step: 4, title: "Filing & Verification", desc: "ITR filed on the portal and verified via Aadhaar OTP / Net Banking." },
    ],
    faqs: [
      { q: "What is the last date to file ITR?", a: "For most individuals, the due date is July 31st. For audit cases, it's October 31st." },
      { q: "What if I have multiple Form 16s?", a: "We handle all Form 16s from different employers and compute the correct tax." },
      { q: "Can I file a revised return?", a: "Yes, you can file a revised return up to 3 months before the end of the relevant assessment year." },
      { q: "How long does it take to get a tax refund?", a: "Usually 15–45 days after filing, depending on income tax department processing." },
    ],
    relatedServices: ["gst-filing", "financial-planning", "accounting-services"],
    specializations: [],
  },
  "company-registration": {
    name: "Company Registration",
    category: "REGISTRATION",
    basePrice: 499900,
    shortDescription: "End-to-end company incorporation — Pvt Ltd, LLP, OPC, and Section 8.",
    description: "End-to-end company incorporation services including Private Limited Company, LLP (Limited Liability Partnership), One Person Company (OPC), and Section 8 (NGO) registration. We handle everything from name approval to receiving the Certificate of Incorporation.",
    timeline: "7–15 business days",
    benefits: { create: [{ benefit: "Company Name Approval (RUN)" }, { benefit: "MOA & AOA Drafting" }, { benefit: "Digital Signature Certificates (DSC)" }, { benefit: "Director Identification Numbers (DIN)" }, { benefit: "Certificate of Incorporation" }, { benefit: "PAN & TAN Application" }, { benefit: "Bank Account Opening Assistance" }, { benefit: "Post-incorporation Compliance" }] },
    requiredDocuments: ["PAN Card (All Directors)", "Aadhaar Card (All Directors)", "Passport-size Photograph (All Directors)", "Address Proof of Directors", "Proof of Registered Office Address", "NOC from Property Owner", "Latest Utility Bill (not older than 2 months)", "Digital Signature (if available)"],
    process: [
      { step: 1, title: "Consultation & Name Reservation (₹499)", desc: "Book your ₹499 consultation. CA advises on structure (Pvt Ltd / LLP / OPC) and files for name approval." },
      { step: 2, title: "Document Preparation", desc: "Assistance team collects and verifies all KYC documents. MOA & AOA drafted." },
      { step: 3, title: "MCA Filing", desc: "CA files SPICe+ form on MCA portal with all attachments." },
      { step: 4, title: "Incorporation Certificate", desc: "Certificate of Incorporation issued by RoC with CIN, PAN & TAN." },
    ],
    faqs: [
      { q: "What is the minimum capital required to register a company?", a: "There is no minimum capital requirement for a Private Limited Company in India." },
      { q: "How many directors are required?", a: "A Private Limited Company needs minimum 2 and maximum 15 directors." },
      { q: "Can a foreigner be a director?", a: "Yes, a foreign national can be a director but at least one director must be an Indian resident." },
      { q: "What is the difference between Pvt Ltd and LLP?", a: "Pvt Ltd has a corporate structure with shareholders; LLP combines features of partnership and company with less compliance burden." },
    ],
    relatedServices: ["business-compliance", "gst-filing", "startup-consulting"],
    specializations: [],
  },
  "audit-services": {
    name: "Audit Services",
    category: "AUDIT",
    basePrice: 999900,
    shortDescription: "Statutory, tax, internal and concurrent audit by certified CA professionals.",
    description: "Comprehensive audit services for businesses of all sizes including statutory audit under Companies Act, tax audit under Section 44AB of Income Tax Act, internal audit for risk management, and concurrent audit for banks and financial institutions.",
    timeline: "5–21 business days",
    benefits: { create: [{ benefit: "Statutory Audit (Companies Act)" }, { benefit: "Tax Audit (Section 44AB, Form 3CD)" }, { benefit: "Internal Audit & Risk Assessment" }, { benefit: "Bank Audit & Concurrent Audit" }, { benefit: "Stock Audit & Verification" }, { benefit: "Forensic Audit" }, { benefit: "RERA Audit for Real Estate" }, { benefit: "Audit Report Certification" }] },
    requiredDocuments: ["Financial Statements (P&L, Balance Sheet)", "Trial Balance", "Bank Statements (All accounts)", "Sales & Purchase Registers", "Fixed Assets Register", "Investment Documents", "Loan Agreements", "Previous Year Audit Reports"],
    process: [
      { step: 1, title: "Scope Assessment (₹499)", desc: "Initial consultation to understand audit scope, identify key risk areas, and assign audit team." },
      { step: 2, title: "Document Collection & Planning", desc: "Comprehensive document checklist shared. Assistance team coordinates document collection." },
      { step: 3, title: "Fieldwork & Testing", desc: "CA conducts audit procedures, tests controls, and verifies transactions." },
      { step: 4, title: "Report & Certification", desc: "Audit report with findings, recommendations, and statutory certifications issued." },
    ],
    faqs: [
      { q: "Who is required to get a tax audit done?", a: "Businesses with turnover exceeding ₹1 crore (₹10 crore for digital transactions) and professionals with gross receipts over ₹50 lakhs." },
      { q: "What is the due date for tax audit?", a: "September 30th of the assessment year for businesses requiring audit." },
      { q: "What is the penalty for not getting a statutory audit?", a: "Penalty of 0.5% of turnover or ₹1.5 lakhs, whichever is lower." },
      { q: "Can the same CA do both accounts and audit?", a: "No. An auditor cannot audit books of accounts prepared by the same CA firm to maintain independence." },
    ],
    relatedServices: ["accounting-services", "business-compliance", "income-tax-filing"],
    specializations: [],
  },
  "trademark-registration": {
    name: "Trademark Registration",
    category: "REGISTRATION",
    basePrice: 299900,
    shortDescription: "Complete brand protection through trademark filing, monitoring, and renewal.",
    description: "Complete trademark registration and intellectual property protection services. We conduct a thorough trademark search, file the application, handle objections and oppositions, and ensure your brand identity is fully protected under the Trade Marks Act.",
    timeline: "18–24 months (full registration)",
    benefits: { create: [{ benefit: "Trademark Search & Availability" }, { benefit: "Application Filing (TM-A)" }, { benefit: "Class Selection & Strategy" }, { benefit: "Opposition & Objection Handling" }, { benefit: "Trademark Renewal" }, { benefit: "International Trademark (Madrid Protocol)" }, { benefit: "Logo & Brand Protection" }, { benefit: "TM Certificate Tracking" }] },
    requiredDocuments: ["PAN Card / Company PAN", "Aadhaar Card / Company Registration", "Logo / Brand Image (JPEG/PNG)", "Signed TM Form-48 (POA)", "Business Description", "Date of First Use (if applicable)", "Priority Document (for international filing)", "Class of Goods/Services"],
    process: [
      { step: 1, title: "Consultation & Search (₹499)", desc: "Comprehensive trademark search conducted to check availability. Strategy session with CA." },
      { step: 2, title: "Application Filing", desc: "TM-A application filed on IP India portal with all required documents." },
      { step: 3, title: "Examination & Response", desc: "Handle examination reports and objections within stipulated timelines." },
      { step: 4, title: "Registration Certificate", desc: "Trademark registration certificate issued after advertisement and opposition period." },
    ],
    faqs: [
      { q: "How long does trademark registration take?", a: "The entire process takes 18–24 months. However, you get TM™ symbol rights from filing date." },
      { q: "How long is a trademark valid?", a: "A registered trademark is valid for 10 years from the date of filing, renewable indefinitely." },
      { q: "Can I file a trademark for a logo and name separately?", a: "Yes, it's recommended to file separately for the name (word mark) and logo (device mark)." },
      { q: "What happens if someone objects to my trademark?", a: "We represent you in opposition proceedings and prepare counter-statements." },
    ],
    relatedServices: ["company-registration", "startup-consulting", "business-compliance"],
    specializations: [],
  },
  "business-compliance": {
    name: "Business Compliance",
    category: "COMPLIANCE",
    basePrice: 299900,
    shortDescription: "Complete annual ROC filings, board meetings, and statutory compliance management.",
    description: "Annual statutory compliance services for private limited companies and LLPs including all ROC filings, board meeting minutes, statutory registers maintenance, and event-based compliance like increase in capital, director changes, and charge registration.",
    timeline: "Ongoing / Annual",
    benefits: { create: [{ benefit: "Annual Returns (MGT-7, AOC-4)" }, { benefit: "Board & General Meeting Minutes" }, { benefit: "Statutory Registers Maintenance" }, { benefit: "Director KYC (DIR-3 KYC)" }, { benefit: "Charge Creation & Satisfaction" }, { benefit: "Share Transfer & Allotment" }, { benefit: "Compliance Calendar Management" }, { benefit: "MCA Filing & Tracking" }] },
    requiredDocuments: ["Certificate of Incorporation", "MOA & AOA", "Financial Statements", "Board Meeting Details", "Director Details & KYC", "Share Allotment Details", "Bank Statements", "Previous Year Annual Return"],
    process: [
      { step: 1, title: "Compliance Audit (₹499)", desc: "Review current compliance status, identify gaps, and create compliance calendar." },
      { step: 2, title: "Document Preparation", desc: "Prepare all resolutions, minutes, and statutory forms." },
      { step: 3, title: "MCA Filing", desc: "File all forms on MCA portal within statutory timelines." },
      { step: 4, title: "Compliance Report", desc: "Annual compliance report shared with management. Ongoing monitoring." },
    ],
    faqs: [
      { q: "What is the annual compliance requirement for a Pvt Ltd company?", a: "Annual filing of financial statements (AOC-4), annual return (MGT-7), and holding of statutory meetings." },
      { q: "What are the penalties for non-compliance?", a: "Penalties range from ₹100 to ₹10 lakhs per violation plus potential strike-off of company." },
      { q: "Is DIR-3 KYC mandatory every year?", a: "Yes, all directors with DIN must file DIR-3 KYC annually by September 30th." },
      { q: "What is the penalty for late ROC filing?", a: "Additional fee of ₹100 per day for each day of delay in filing." },
    ],
    relatedServices: ["company-registration", "gst-filing", "audit-services"],
    specializations: [],
  },
  "startup-consulting": {
    name: "Startup Consulting",
    category: "CONSULTING",
    basePrice: 199900,
    shortDescription: "End-to-end startup advisory, DPIIT recognition, funding compliance & financial modelling.",
    description: "Comprehensive startup advisory covering business structure selection, legal setup, funding compliance (DPIIT recognition, angel investment), financial modelling, and ongoing compliance support so founders can focus on building their product.",
    timeline: "1–7 days (phase-wise)",
    benefits: { create: [{ benefit: "Business Structure Advisory" }, { benefit: "DPIIT Startup Recognition" }, { benefit: "Funding & Angel Investment Compliance" }, { benefit: "Financial Modelling & Projections" }, { benefit: "Pitch Deck Financial Slides" }, { benefit: "ESOPs Structure & Implementation" }, { benefit: "FEMA / RBI Compliance" }, { benefit: "Startup India Benefits" }] },
    requiredDocuments: ["Company Registration Documents", "PAN Card (Founders)", "Aadhaar Card (Founders)", "Business Plan / Pitch Deck", "Cap Table (if existing)", "Funding Term Sheet (if any)", "Bank Statements", "Employee Agreement (for ESOPs)"],
    process: [
      { step: 1, title: "Discovery Session (₹499)", desc: "Understand your startup stage, funding status, and compliance needs." },
      { step: 2, title: "Structure & Documentation", desc: "Advisory on entity structure, shareholder agreements, and DPIIT recognition filing." },
      { step: 3, title: "Financial Modelling", desc: "CA prepares financial projections, unit economics, and investor-ready reports." },
      { step: 4, title: "Ongoing Advisory", desc: "Monthly compliance, ESOP management, and investor reporting." },
    ],
    faqs: [
      { q: "What is DPIIT recognition and why is it important?", a: "DPIIT (Department for Promotion of Industry) recognition provides tax exemptions under Section 80-IAC and other startup benefits." },
      { q: "When should a startup hire a CA?", a: "From day one — for correct entity structure, tax optimization, and investor-ready financials." },
      { q: "What funding documentation does a CA help with?", a: "Term sheets, valuation reports, FEMA compliance for foreign investment, and Form FC-GPR/FC-TRS." },
      { q: "Can a CA help with ESOP structuring?", a: "Yes, CAs draft ESOP schemes, calculate FBT/TDS implications, and manage valuations." },
    ],
    relatedServices: ["company-registration", "financial-planning", "business-compliance"],
    specializations: [],
  },
  "financial-planning": {
    name: "Financial Planning",
    category: "FINANCIAL_PLANNING",
    basePrice: 149900,
    shortDescription: "Holistic personal and business financial planning for long-term wealth creation.",
    description: "Holistic personal and business financial planning covering investment strategy, retirement planning, insurance advisory, tax-efficient wealth structuring, and estate planning. Our CA-certified financial planners help you achieve your long-term goals.",
    timeline: "3–7 days",
    benefits: { create: [{ benefit: "Investment Portfolio Planning" }, { benefit: "Retirement Planning (NPS, EPF, PPF)" }, { benefit: "Insurance Needs Analysis" }, { benefit: "Tax-Efficient Wealth Management" }, { benefit: "Estate & Succession Planning" }, { benefit: "Goal-Based Financial Planning" }, { benefit: "Mutual Fund Advisory" }, { benefit: "HUF Creation for Tax Savings" }] },
    requiredDocuments: ["PAN Card", "Aadhaar Card", "Income Proof (Salary Slips / ITR)", "Bank Statements (6 months)", "Existing Investment Details", "Insurance Policy Documents", "Property Documents (if any)", "Loan Statements"],
    process: [
      { step: 1, title: "Financial Health Check (₹499)", desc: "Comprehensive review of income, expenses, assets, liabilities, and financial goals." },
      { step: 2, title: "Goal Setting", desc: "Define short, medium, and long-term financial goals with timelines." },
      { step: 3, title: "Plan Creation", desc: "CA creates a customized financial plan with asset allocation and investment roadmap." },
      { step: 4, title: "Implementation & Review", desc: "Execute the plan and quarterly review sessions to track progress." },
    ],
    faqs: [
      { q: "What is the difference between a CA and a financial advisor?", a: "A CA is a certified accountant who can provide tax-efficient financial planning integrated with tax filing." },
      { q: "How much should I save for retirement?", a: "General rule: save 15–20% of income. A CA helps calculate the exact amount based on your goals." },
      { q: "What is an HUF and how does it save taxes?", a: "Hindu Undivided Family is a separate tax entity that can have its own PAN and claim ₹2.5 lakhs basic exemption." },
      { q: "Can a CA help with NRI financial planning?", a: "Yes, including FEMA compliance, NRE/NRO account management, and repatriation planning." },
    ],
    relatedServices: ["income-tax-filing", "accounting-services", "startup-consulting"],
    specializations: [],
  },
  "accounting-services": {
    name: "Accounting Services",
    category: "ACCOUNTING",
    basePrice: 199900,
    shortDescription: "Complete bookkeeping, financial statements, MIS reports, and account management.",
    description: "Complete accounting and bookkeeping services for SMEs and growing businesses. We maintain your books in Tally, QuickBooks or Zoho Books, prepare monthly financial statements, and provide management reports for informed decision-making.",
    timeline: "Ongoing (Monthly)",
    benefits: { create: [{ benefit: "Daily Bookkeeping & Ledger Maintenance" }, { benefit: "Accounts Payable & Receivable" }, { benefit: "Bank & Credit Card Reconciliation" }, { benefit: "Monthly P&L & Balance Sheet" }, { benefit: "Cash Flow Statements" }, { benefit: "MIS Reports & Dashboards" }, { benefit: "Tally / QuickBooks / Zoho Setup" }, { benefit: "Year-end Account Finalization" }] },
    requiredDocuments: ["Bank Statements (All accounts)", "Sales Invoices", "Purchase Invoices", "Expense Vouchers", "Salary Details", "Previous Financial Statements", "Loan Statements", "Fixed Asset Details"],
    process: [
      { step: 1, title: "Onboarding Consultation (₹499)", desc: "Review existing books, understand business processes, and set up accounting software." },
      { step: 2, title: "Data Entry & Classification", desc: "All transactions entered, categorized, and reconciled with bank statements." },
      { step: 3, title: "Monthly Reporting", desc: "P&L, Balance Sheet, Cash Flow, and MIS reports delivered by the 7th of each month." },
      { step: 4, title: "Year-end Finalization", desc: "Annual accounts finalized, audit-ready financial statements prepared." },
    ],
    faqs: [
      { q: "What accounting software do you use?", a: "We work with Tally ERP 9, Tally Prime, QuickBooks, Zoho Books, and MS Excel." },
      { q: "How often do I get financial reports?", a: "Monthly MIS reports by the 7th, quarterly analysis, and annual finalization." },
      { q: "Do you handle GST and TDS along with accounting?", a: "Yes, GST returns, TDS filings, and reconciliations are part of our package." },
      { q: "Can you take over from our existing accountant?", a: "Yes, we do a clean-up of existing books and transition smoothly." },
    ],
    relatedServices: ["gst-filing", "income-tax-filing", "audit-services"],
    specializations: [],
  },
  "payroll-services": {
    name: "Payroll Services",
    category: "PAYROLL",
    basePrice: 149900,
    shortDescription: "End-to-end payroll processing, PF/ESI, TDS, and Form 16 generation.",
    description: "End-to-end payroll processing services including salary structuring, monthly payroll calculation, PF and ESI filings, TDS computation under Section 192, Form 16 generation, and full and final settlement for exiting employees.",
    timeline: "Ongoing (Monthly)",
    benefits: { create: [{ benefit: "Monthly Salary Processing" }, { benefit: "Salary Structuring & CTC Design" }, { benefit: "PF Registration & Monthly Filing" }, { benefit: "ESI Registration & Challan" }, { benefit: "Professional Tax Compliance" }, { benefit: "TDS Deduction & Form 24Q Filing" }, { benefit: "Form 16 Generation" }, { benefit: "F&F Settlement Computation" }] },
    requiredDocuments: ["Employee Details (Name, DOB, Aadhaar, PAN)", "Bank Account Details", "CTC / Offer Letters", "Previous Salary Slips", "PF & ESI Registration Numbers", "Investment Declarations (Form 12BB)", "Joining & Resignation Letters", "Previous Form 16 (for joiners)"],
    process: [
      { step: 1, title: "Setup Consultation (₹499)", desc: "Salary structure design, CTC optimization, and payroll software setup." },
      { step: 2, title: "Monthly Processing", desc: "Payroll calculated by 25th of each month. Salary slips and registers prepared." },
      { step: 3, title: "Statutory Filings", desc: "PF/ESI challan paid by due date. TDS deducted and Form 24Q filed quarterly." },
      { step: 4, title: "Annual Compliance", desc: "Form 16 issued by June 15th. Annual returns and audit support." },
    ],
    faqs: [
      { q: "What is the PF contribution rate?", a: "Both employer and employee contribute 12% of basic salary to PF." },
      { q: "When is ESI applicable?", a: "ESI applies when gross salary is ₹21,000 or below. Employer: 3.25%, Employee: 0.75%." },
      { q: "What are TDS slab rates for salary?", a: "TDS on salary follows the income tax slab rates applicable to the employee." },
      { q: "What is the due date for Form 16 issuance?", a: "Form 16 must be issued by June 15th of the assessment year." },
    ],
    relatedServices: ["accounting-services", "income-tax-filing", "business-compliance"],
    specializations: [],
  },
};

const SERVICE_ICONS: Record<string, React.ElementType> = {
  "gst-filing": FileText,
  "income-tax-filing": BarChart3,
  "company-registration": Building,
  "audit-services": Shield,
  "trademark-registration": Award,
  "business-compliance": Shield,
  "startup-consulting": Zap,
  "financial-planning": IndianRupee,
  "accounting-services": FileText,
  "payroll-services": Users,
};

// ─── FAQ Accordion ───────────────────────────────────────────────────────────

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="border border-border rounded-xl overflow-hidden"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 p-5 text-left bg-white hover:bg-muted/50 transition-colors"
      >
        <span className="font-semibold text-sm leading-snug">{q}</span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <p className="p-5 pt-0 text-sm text-muted-foreground leading-relaxed bg-white">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

const TABS = ["Overview", "Documents", "Process", "FAQs", "Related Services"] as const;
type Tab = (typeof TABS)[number];

export default function ServiceDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [service, setService] = useState<any>(STATIC_SERVICES[slug] || null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("Overview");

  const handleBook = () => {
    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=/find-ca?service=${slug}`);
    } else if (user?.role === "CA_PROFESSIONAL" || user?.role === "SUPER_ADMIN") {
      return;
    } else {
      router.push(`/find-ca?service=${slug}`);
    }
  };

  useEffect(() => {
    if (!slug) return;
    // Merge API data ON TOP of static data so process/FAQs/docs are never lost
    const staticData = STATIC_SERVICES[slug] || {};
    api.get(`/services/${slug}`)
      .then((r) => { if (r.data?.data) setService({ ...staticData, ...r.data.data }); })
      .catch(() => {});
    api.get(`/ca?service=${slug}&limit=4`).catch(() => {}).finally(() => setLoading(false));
  }, [slug]);

  if (!service) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-16 flex items-center justify-center">
          {loading ? <Loader2 className="w-10 h-10 animate-spin text-brand-600" /> : (
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

  const benefits: string[] = service.benefits?.create?.map((b: any) => b.benefit) || service.benefits?.map((b: any) => b.benefit) || [];
  const ServiceIcon = SERVICE_ICONS[slug] || FileText;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">

        {/* Hero */}
        <section className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 py-16 px-4 overflow-hidden">
          <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: `linear-gradient(rgba(99,102,241,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,.8) 1px, transparent 1px)`, backgroundSize: "50px 50px" }} />
          <div className="container mx-auto max-w-5xl relative z-10">
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <Link href="/services" className="text-sm text-blue-300/70 hover:text-blue-300 transition-colors">All Services</Link>
              <span className="text-white/30">/</span>
              <span className="text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full px-3 py-1">
                {service.category?.replace(/_/g, " ")}
              </span>
            </div>
            <div className="flex items-start gap-5">
              <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20 shrink-0">
                <ServiceIcon className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-bold font-heading text-white mb-3">
                  {service.name}
                </motion.h1>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-lg text-blue-100/70 mb-6 max-w-2xl">
                  {service.shortDescription || service.description}
                </motion.p>
                <div className="flex flex-wrap items-center gap-4 mb-6 text-sm">
                  <div className="flex items-center gap-2 text-white/70"><Star className="w-4 h-4 text-yellow-400 fill-yellow-400" /><span>4.9 average rating</span></div>
                  <div className="flex items-center gap-2 text-white/70"><Users className="w-4 h-4 text-blue-400" /><span>500+ expert CAs</span></div>
                  <div className="flex items-center gap-2 text-white/70"><Clock className="w-4 h-4 text-green-400" /><span>{service.timeline || "Same-day booking"}</span></div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  {(!isAuthenticated || user?.role === "CLIENT") && (
                    <Button size="lg" className="rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white border-0 font-semibold shadow-lg" onClick={handleBook}>
                      <Calendar className="mr-2 w-4 h-4" /> Book Consultation — ₹499
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sticky Service Nav */}
        <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-border shadow-sm">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-2">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab
                      ? "bg-brand-50 text-brand-700 border border-brand-200"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* ── Left Content ── */}
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Overview */}
                  {activeTab === "Overview" && (
                    <section>
                      <h2 className="text-2xl font-bold font-heading mb-4">Service Overview</h2>
                      <p className="text-muted-foreground leading-relaxed mb-6">{service.description}</p>
                      {benefits.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {benefits.map((b, i) => (
                            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                              className="flex items-start gap-3 p-4 bg-green-50 rounded-xl border border-green-100">
                              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                              <span className="text-sm font-medium">{b}</span>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </section>
                  )}

                  {/* Documents */}
                  {activeTab === "Documents" && (
                    <section>
                      <h2 className="text-2xl font-bold font-heading mb-4">Required Documents</h2>
                      <p className="text-muted-foreground mb-5 text-sm">Upload these documents after booking your consultation.</p>
                      {service.requiredDocuments?.length > 0 ? (
                        <>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                            {service.requiredDocuments.map((doc: string, i: number) => (
                              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                                className="flex items-center gap-3 p-4 bg-white rounded-xl border border-border hover:border-brand-300 transition-colors">
                                <div className="w-8 h-8 bg-brand-50 rounded-lg flex items-center justify-center shrink-0">
                                  <FileText className="w-4 h-4 text-brand-600" />
                                </div>
                                <span className="text-sm font-medium">{doc}</span>
                              </motion.div>
                            ))}
                          </div>
                          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex gap-3">
                            <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                            <p className="text-sm text-yellow-800">
                              Our Assistance Team will verify all documents before processing. Additional documents may be requested based on your specific case.
                            </p>
                          </div>
                        </>
                      ) : (
                        <p className="text-muted-foreground">Documents list will be shared after booking your consultation.</p>
                      )}
                    </section>
                  )}

                  {/* Process */}
                  {activeTab === "Process" && (
                    <section>
                      <h2 className="text-2xl font-bold font-heading mb-6">How It Works</h2>
                      {service.process?.length > 0 ? (
                        <div className="space-y-0">
                          {service.process.map((step: any, i: number) => (
                            <motion.div key={step.step} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                              className="flex gap-5">
                              <div className="flex flex-col items-center">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold text-sm shadow-lg shrink-0">
                                  {step.step}
                                </div>
                                {i < service.process.length - 1 && <div className="w-0.5 h-full bg-gradient-to-b from-brand-300 to-transparent min-h-[40px] mt-1" />}
                              </div>
                              <div className="pb-8 flex-1">
                                <h3 className="font-bold text-base mb-1">{step.title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">Process details will be discussed during your consultation.</p>
                      )}
                    </section>
                  )}

                  {/* FAQs */}
                  {activeTab === "FAQs" && (
                    <section>
                      <h2 className="text-2xl font-bold font-heading mb-5">Frequently Asked Questions</h2>
                      {service.faqs?.length > 0 ? (
                        <div className="space-y-3">
                          {service.faqs.map((faq: any, i: number) => (
                            <FAQItem key={i} q={faq.q} a={faq.a} index={i} />
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">FAQs will be added soon.</p>
                      )}
                    </section>
                  )}

                  {/* Related Services */}
                  {activeTab === "Related Services" && (
                    <section>
                      <h2 className="text-2xl font-bold font-heading mb-5">Related Services</h2>
                      {service.relatedServices?.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {service.relatedServices.map((relSlug: string) => {
                            const rel = STATIC_SERVICES[relSlug];
                            if (!rel) return null;
                            return (
                              <Link key={relSlug} href={`/services/${relSlug}`} className="group block p-5 bg-white rounded-xl border border-border hover:border-brand-300 hover:shadow-md transition-all">
                                <p className="font-semibold text-sm mb-1 group-hover:text-brand-600 transition-colors">{rel.name}</p>
                                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{rel.shortDescription}</p>
                                <div className="flex items-center text-xs font-medium text-brand-600">
                                  Learn more <ArrowRight className="ml-1 w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">No related services found.</p>
                      )}
                    </section>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* ── Sticky Sidebar ── */}
            <div>
              <div className="sticky top-32 space-y-4">
                {/* Booking Card */}
                <div className="bg-white rounded-2xl border border-border p-6 shadow-md">
                  <div className="flex items-center gap-2 mb-1">
                    <IndianRupee className="w-4 h-4 text-brand-600" />
                    <span className="text-xs font-medium text-muted-foreground">Consultation Fee</span>
                  </div>
                  <p className="text-4xl font-bold font-heading text-brand-600 mb-0.5">₹499</p>
                  <p className="text-xs text-muted-foreground mb-1">Initial consultation (Razorpay secured)</p>
                  <p className="text-xs text-muted-foreground mb-5">
                    Service starting from <span className="font-semibold text-foreground">{formatCurrency(service.basePrice)}</span>
                  </p>

                  <Button className="w-full h-12 rounded-xl bg-gradient-to-r from-brand-600 to-blue-600 hover:from-brand-700 hover:to-blue-700 text-white font-semibold mb-3 border-0" onClick={handleBook}>
                    <Calendar className="mr-2 w-4 h-4" />
                    {isAuthenticated ? "Book Consultation — ₹499" : "Sign In to Book — ₹499"}
                  </Button>
                  {/* Trust signals */}
                  <div className="mt-5 pt-5 border-t border-border space-y-2.5">
                    {[
                      { icon: Shield, label: "ICAI-certified professionals" },
                      { icon: Zap, label: "Auto Google Meet link generated" },
                      { icon: CheckCircle, label: "Document verification included" },
                      { icon: Star, label: "4.9★ average rating" },
                      { icon: Award, label: "Money-back guarantee" },
                    ].map(({ icon: Icon, label }) => (
                      <div key={label} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                        <Icon className="w-4 h-4 text-green-500 shrink-0" />
                        {label}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Timeline Card */}
                {service.timeline && (
                  <div className="bg-gradient-to-br from-brand-50 to-blue-50 rounded-2xl border border-brand-100 p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-brand-600" />
                      <span className="font-semibold text-sm">Estimated Timeline</span>
                    </div>
                    <p className="text-2xl font-bold font-heading text-brand-700">{service.timeline}</p>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
