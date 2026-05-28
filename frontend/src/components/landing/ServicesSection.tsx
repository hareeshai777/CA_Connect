"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, FileText, Building, BarChart3, Shield, CheckSquare, Lightbulb, TrendingUp, BookOpen, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

const STATIC_SERVICES = [
  {
    slug: "gst-filing", name: "GST Filing",
    desc: "Complete GST registration, monthly returns, reconciliation & compliance management.",
    icon: FileText, gradient: "from-blue-600 to-cyan-500", tag: "Most Popular",
    bg: "bg-gradient-to-br from-blue-50 to-cyan-50", border: "border-blue-100",
    iconBg: "bg-gradient-to-br from-blue-600 to-cyan-500",
  },
  {
    slug: "income-tax-filing", name: "Income Tax Filing",
    desc: "ITR-1 to ITR-7 filing with maximum deductions, refund processing & notice handling.",
    icon: BarChart3, gradient: "from-emerald-600 to-teal-500", tag: "High Demand",
    bg: "bg-gradient-to-br from-emerald-50 to-teal-50", border: "border-emerald-100",
    iconBg: "bg-gradient-to-br from-emerald-600 to-teal-500",
  },
  {
    slug: "company-registration", name: "Company Registration",
    desc: "Pvt Ltd, LLP, OPC & Section 8 incorporation with PAN, TAN & bank account assistance.",
    icon: Building, gradient: "from-violet-600 to-purple-500", tag: "Complete Package",
    bg: "bg-gradient-to-br from-violet-50 to-purple-50", border: "border-violet-100",
    iconBg: "bg-gradient-to-br from-violet-600 to-purple-500",
  },
  {
    slug: "audit-services", name: "Audit Services",
    desc: "Statutory, tax, internal & concurrent audit with full certification and reporting.",
    icon: Shield, gradient: "from-rose-600 to-pink-500", tag: "Enterprise",
    bg: "bg-gradient-to-br from-rose-50 to-pink-50", border: "border-rose-100",
    iconBg: "bg-gradient-to-br from-rose-600 to-pink-500",
  },
  {
    slug: "trademark-registration", name: "Trademark Registration",
    desc: "Brand protection through filing, objection handling, monitoring and renewal.",
    icon: CheckSquare, gradient: "from-amber-600 to-orange-500", tag: "IP Protection",
    bg: "bg-gradient-to-br from-amber-50 to-orange-50", border: "border-amber-100",
    iconBg: "bg-gradient-to-br from-amber-600 to-orange-500",
  },
  {
    slug: "business-compliance", name: "Business Compliance",
    desc: "ROC filings, board meeting minutes, statutory registers & annual compliance.",
    icon: Shield, gradient: "from-teal-600 to-cyan-600", tag: "Recurring",
    bg: "bg-gradient-to-br from-teal-50 to-cyan-50", border: "border-teal-100",
    iconBg: "bg-gradient-to-br from-teal-600 to-cyan-600",
  },
  {
    slug: "startup-consulting", name: "Startup Consulting",
    desc: "DPIIT recognition, funding compliance, ESOP structuring & financial modelling.",
    icon: Lightbulb, gradient: "from-yellow-600 to-amber-500", tag: "Startup Special",
    bg: "bg-gradient-to-br from-yellow-50 to-amber-50", border: "border-yellow-100",
    iconBg: "bg-gradient-to-br from-yellow-600 to-amber-500",
  },
  {
    slug: "financial-planning", name: "Financial Planning",
    desc: "Investment, retirement planning & tax-efficient wealth management for your goals.",
    icon: TrendingUp, gradient: "from-indigo-600 to-blue-500", tag: "Advisory",
    bg: "bg-gradient-to-br from-indigo-50 to-blue-50", border: "border-indigo-100",
    iconBg: "bg-gradient-to-br from-indigo-600 to-blue-500",
  },
  {
    slug: "accounting-services", name: "Accounting Services",
    desc: "Bookkeeping, P&L, balance sheet, cash flow & MIS reports delivered monthly.",
    icon: BookOpen, gradient: "from-pink-600 to-rose-500", tag: "Monthly Plan",
    bg: "bg-gradient-to-br from-pink-50 to-rose-50", border: "border-pink-100",
    iconBg: "bg-gradient-to-br from-pink-600 to-rose-500",
  },
  {
    slug: "payroll-services", name: "Payroll Services",
    desc: "Salary processing, PF/ESI compliance, TDS deduction & Form 16 generation.",
    icon: Users, gradient: "from-cyan-600 to-sky-500", tag: "HR Friendly",
    bg: "bg-gradient-to-br from-cyan-50 to-sky-50", border: "border-cyan-100",
    iconBg: "bg-gradient-to-br from-cyan-600 to-sky-500",
  },
];

const styleMap = Object.fromEntries(STATIC_SERVICES.map(s => [s.slug, s]));

export function ServicesSection() {
  const [services, setServices] = useState(STATIC_SERVICES);

  useEffect(() => {
    api.get("/services").then((r) => {
      if (r.data?.data?.length > 0) {
        setServices(r.data.data.map((s: any) => ({
          ...(styleMap[s.slug] || styleMap["gst-filing"]),
          ...s,
          desc: s.shortDescription || s.name,
        })));
      }
    }).catch(() => {});
  }, []);

  const featured = services.slice(0, 3);
  const rest = services.slice(3);

  return (
    <section className="section-padding bg-white relative overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-14">
          <motion.div initial={{ opacity: 0, scaleX: 0 }} whileInView={{ opacity: 1, scaleX: 1 }} viewport={{ once: true }}
            className="w-12 h-1 bg-blue-600 rounded-full mx-auto mb-5" />
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight text-gray-900">
            Investment & Financial Services
            <span className="block text-blue-600">for Long-Term Success</span>
          </motion.h2>
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="text-lg text-gray-500 max-w-2xl mx-auto">
            Expert CA professionals delivering comprehensive financial solutions tailored to your needs.
          </motion.p>
        </div>

        {/* Top 3 featured cards — larger with visual header */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {featured.map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.div key={service.slug}
                initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: index * 0.1 }}>
                <Link href={`/services/${service.slug}`} className="group block h-full">
                  <div className="h-full bg-white rounded-2xl border border-gray-100 hover:border-blue-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5">
                    {/* Visual header */}
                    <div className={`relative h-44 bg-gradient-to-br ${service.gradient} flex items-center justify-center overflow-hidden`}>
                      <motion.div animate={{ scale: [1, 1.08, 1], rotate: [0, 3, 0] }}
                        transition={{ duration: 6, repeat: Infinity, delay: index * 1.5 }}
                        className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                        <Icon className="w-10 h-10 text-white" />
                      </motion.div>
                      {/* Decorative circles */}
                      <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
                      <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/10 rounded-full" />
                      {/* Tag */}
                      <span className="absolute top-3 right-3 text-[10px] font-bold bg-white/20 text-white border border-white/20 rounded-full px-2.5 py-1 backdrop-blur-sm">
                        {service.tag}
                      </span>
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{service.name}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed mb-4">{service.desc}</p>
                      <div className={`inline-flex items-center gap-1.5 text-sm font-semibold bg-gradient-to-r ${service.gradient} bg-clip-text text-transparent`}>
                        Learn More <ArrowRight className="w-4 h-4 text-blue-500 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Remaining 7 services — compact grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 mb-12">
          {rest.map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.div key={service.slug}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: index * 0.05 }}>
                <Link href={`/services/${service.slug}`} className="group block h-full">
                  <div className={`h-full ${service.bg} border ${service.border} rounded-xl p-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden relative`}>
                    <div className={`w-9 h-9 rounded-xl ${service.iconBg} flex items-center justify-center mb-3 shadow-md group-hover:scale-110 transition-transform`}>
                      <Icon className="w-4.5 h-4.5 text-white w-[18px] h-[18px]" />
                    </div>
                    <h3 className="font-bold text-xs text-gray-800 leading-snug mb-1">{service.name}</h3>
                    <div className={`flex items-center gap-0.5 text-[10px] font-semibold bg-gradient-to-r ${service.gradient} bg-clip-text text-transparent mt-2`}>
                      Learn more <ArrowRight className="w-2.5 h-2.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Button size="lg" className="rounded-xl bg-blue-600 hover:bg-blue-700 font-bold shadow-lg shadow-blue-600/25 h-12 px-8" asChild>
                <Link href="/services">View All Services <ArrowRight className="ml-2 w-4 h-4" /></Link>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Button size="lg" variant="outline" className="rounded-xl border-2 border-blue-200 text-blue-700 hover:bg-blue-50 h-12 px-8" asChild>
                <Link href="/services">Book ₹499 Consultation</Link>
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
