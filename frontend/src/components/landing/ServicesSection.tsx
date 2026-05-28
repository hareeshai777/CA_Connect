"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, FileText, Building, BarChart3, Shield, CheckSquare, Lightbulb, TrendingUp, BookOpen, Users, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

const STATIC_SERVICES = [
  { slug: "gst-filing", name: "GST Filing", desc: "Registration, returns, ITC reconciliation & notice handling.", icon: FileText, gradient: "from-blue-500 to-cyan-400", glow: "group-hover:shadow-blue-500/25", tag: "Most Popular" },
  { slug: "income-tax-filing", name: "Income Tax Filing", desc: "ITR-1 to ITR-7 with maximum deductions & refund processing.", icon: BarChart3, gradient: "from-emerald-500 to-teal-400", glow: "group-hover:shadow-emerald-500/25", tag: "High Demand" },
  { slug: "company-registration", name: "Company Registration", desc: "Pvt Ltd, LLP, OPC & Section 8 incorporation end-to-end.", icon: Building, gradient: "from-violet-500 to-purple-400", glow: "group-hover:shadow-violet-500/25", tag: "Complete Package" },
  { slug: "audit-services", name: "Audit Services", desc: "Statutory, tax, internal & concurrent audit with certification.", icon: Shield, gradient: "from-rose-500 to-pink-400", glow: "group-hover:shadow-rose-500/25", tag: "Enterprise" },
  { slug: "trademark-registration", name: "Trademark Registration", desc: "Brand protection via filing, monitoring & renewal.", icon: CheckSquare, gradient: "from-amber-500 to-orange-400", glow: "group-hover:shadow-amber-500/25", tag: "IP Protection" },
  { slug: "business-compliance", name: "Business Compliance", desc: "ROC filings, annual returns & statutory compliance.", icon: Shield, gradient: "from-teal-500 to-cyan-500", glow: "group-hover:shadow-teal-500/25", tag: "Recurring" },
  { slug: "startup-consulting", name: "Startup Consulting", desc: "DPIIT recognition, funding compliance & financial modelling.", icon: Lightbulb, gradient: "from-yellow-500 to-amber-400", glow: "group-hover:shadow-yellow-500/25", tag: "Startup Special" },
  { slug: "financial-planning", name: "Financial Planning", desc: "Investment, retirement & tax-efficient wealth management.", icon: TrendingUp, gradient: "from-indigo-500 to-blue-400", glow: "group-hover:shadow-indigo-500/25", tag: "Advisory" },
  { slug: "accounting-services", name: "Accounting Services", desc: "Bookkeeping, P&L, balance sheet & MIS reports.", icon: BookOpen, gradient: "from-pink-500 to-rose-400", glow: "group-hover:shadow-pink-500/25", tag: "Monthly Plan" },
  { slug: "payroll-services", name: "Payroll Services", desc: "Salary processing, PF/ESI, TDS & Form 16 generation.", icon: Users, gradient: "from-cyan-500 to-sky-400", glow: "group-hover:shadow-cyan-500/25", tag: "HR Friendly" },
];

const styleMap: Record<string, typeof STATIC_SERVICES[0]> = Object.fromEntries(STATIC_SERVICES.map(s => [s.slug, s]));

export function ServicesSection() {
  const [services, setServices] = useState(STATIC_SERVICES);

  useEffect(() => {
    api.get("/services").then((r) => {
      if (r.data?.data?.length > 0) {
        setServices(r.data.data.map((s: any) => ({ ...s, ...(styleMap[s.slug] || styleMap["gst-filing"]), desc: s.shortDescription || s.name })));
      }
    }).catch(() => {});
  }, []);

  return (
    <section className="section-padding relative overflow-hidden bg-white">
      {/* Subtle top color wash */}
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-slate-50 to-transparent pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-14">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-brand-50 text-brand-600 border border-brand-100 rounded-full px-4 py-2 text-sm font-semibold mb-5">
            <Sparkles className="w-4 h-4" /> Comprehensive CA Services
          </motion.div>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
            Everything Your Business Needs
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From tax filing to company registration — all services under one roof.
          </motion.p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.div key={service.slug}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: index * 0.04, duration: 0.4 }}>
                <Link href={`/services/${service.slug}`} className="group block h-full">
                  <div className={`h-full relative bg-white rounded-2xl p-5 border border-gray-100 hover:border-transparent hover:shadow-2xl ${service.glow} transition-all duration-300 hover:-translate-y-2 overflow-hidden`}>
                    {/* Gradient background on hover via pseudo */}
                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-[0.06] transition-opacity duration-300`} />

                    {/* Tag */}
                    <div className={`absolute top-3 right-3 text-[9px] font-bold bg-gradient-to-r ${service.gradient} bg-clip-text text-transparent border border-gray-100 group-hover:border-transparent rounded-full px-2 py-0.5`}>
                      {service.tag}
                    </div>

                    {/* Icon */}
                    <motion.div whileHover={{ rotate: 5, scale: 1.1 }}
                      className={`relative w-12 h-12 rounded-2xl bg-gradient-to-br ${service.gradient} flex items-center justify-center mb-4 shadow-lg`}>
                      <Icon className="w-5 h-5 text-white" />
                    </motion.div>

                    <h3 className="font-bold text-sm text-gray-900 mb-2 pr-10 leading-snug">{service.name}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-4">{service.desc}</p>

                    <div className="flex items-center text-xs font-semibold mt-auto">
                      <span className={`bg-gradient-to-r ${service.gradient} bg-clip-text text-transparent`}>Learn more</span>
                      <ArrowRight className="w-3 h-3 ml-1 text-gray-400 group-hover:translate-x-1 group-hover:text-gray-700 transition-all" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mt-14">
          <p className="text-muted-foreground mb-5 text-sm">Not sure which service you need? Start with a ₹499 consultation.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Button size="lg" className="rounded-xl bg-brand-600 hover:bg-brand-700 font-semibold shadow-lg shadow-brand-600/25" asChild>
                <Link href="/services">View All Services <ArrowRight className="ml-2 w-4 h-4" /></Link>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Button size="lg" variant="outline" className="rounded-xl border-2" asChild>
                <Link href="/services">Book ₹499 Consultation</Link>
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
