"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, FileText, Building, BarChart3, Shield, CheckSquare, Lightbulb, TrendingUp, BookOpen, Users, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const services = [
  {
    icon: FileText,
    name: "GST Filing",
    slug: "gst-filing",
    desc: "Complete GST registration, returns, and compliance management.",
    tag: "Most Popular",
    gradient: "from-blue-500 to-cyan-500",
    bgGradient: "from-blue-50 to-cyan-50",
    borderColor: "border-blue-200",
    price: "₹1,499",
  },
  {
    icon: BarChart3,
    name: "Income Tax Filing",
    slug: "income-tax-filing",
    desc: "Individual and corporate ITR filing with maximum deductions.",
    tag: "High Demand",
    gradient: "from-green-500 to-emerald-500",
    bgGradient: "from-green-50 to-emerald-50",
    borderColor: "border-green-200",
    price: "₹999",
  },
  {
    icon: Building,
    name: "Company Registration",
    slug: "company-registration",
    desc: "Pvt Ltd, LLP, OPC, and Section 8 company incorporation.",
    tag: "Complete Package",
    gradient: "from-purple-500 to-violet-500",
    bgGradient: "from-purple-50 to-violet-50",
    borderColor: "border-purple-200",
    price: "₹4,999",
  },
  {
    icon: Shield,
    name: "Audit Services",
    slug: "audit-services",
    desc: "Statutory, tax, internal and concurrent audit services.",
    tag: "Enterprise",
    gradient: "from-red-500 to-rose-500",
    bgGradient: "from-red-50 to-rose-50",
    borderColor: "border-red-200",
    price: "₹9,999",
  },
  {
    icon: CheckSquare,
    name: "Trademark Registration",
    slug: "trademark-registration",
    desc: "Brand protection through trademark filing and monitoring.",
    tag: "IP Protection",
    gradient: "from-orange-500 to-amber-500",
    bgGradient: "from-orange-50 to-amber-50",
    borderColor: "border-orange-200",
    price: "₹2,999",
  },
  {
    icon: Shield,
    name: "Business Compliance",
    slug: "business-compliance",
    desc: "ROC filings, annual returns, and regulatory compliance.",
    tag: "Recurring",
    gradient: "from-teal-500 to-cyan-600",
    bgGradient: "from-teal-50 to-cyan-50",
    borderColor: "border-teal-200",
    price: "₹2,999",
  },
  {
    icon: Lightbulb,
    name: "Startup Consulting",
    slug: "startup-consulting",
    desc: "End-to-end startup advisory, funding & compliance planning.",
    tag: "Startup Special",
    gradient: "from-yellow-500 to-orange-400",
    bgGradient: "from-yellow-50 to-orange-50",
    borderColor: "border-yellow-200",
    price: "₹1,999",
  },
  {
    icon: TrendingUp,
    name: "Financial Planning",
    slug: "financial-planning",
    desc: "Investment, retirement & tax-efficient wealth management.",
    tag: "Advisory",
    gradient: "from-indigo-500 to-blue-600",
    bgGradient: "from-indigo-50 to-blue-50",
    borderColor: "border-indigo-200",
    price: "₹1,499",
  },
  {
    icon: BookOpen,
    name: "Accounting Services",
    slug: "accounting-services",
    desc: "Daily bookkeeping, P&L, balance sheet, and MIS reports.",
    tag: "Monthly Plan",
    gradient: "from-pink-500 to-rose-500",
    bgGradient: "from-pink-50 to-rose-50",
    borderColor: "border-pink-200",
    price: "₹1,999",
  },
  {
    icon: Users,
    name: "Payroll Services",
    slug: "payroll-services",
    desc: "Salary processing, PF/ESI, TDS, and Form 16 generation.",
    tag: "HR Friendly",
    gradient: "from-cyan-500 to-sky-500",
    bgGradient: "from-cyan-50 to-sky-50",
    borderColor: "border-cyan-200",
    price: "₹1,499",
  },
];

export function ServicesSection() {
  return (
    <section className="section-padding relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-slate-50/50 to-background" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-brand-50 text-brand-600 border border-brand-200 rounded-full px-4 py-2 text-sm font-medium mb-4"
          >
            <Sparkles className="w-4 h-4" />
            Comprehensive CA Services
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold font-heading mb-4"
          >
            Everything Your Business Needs
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            From tax filing to company registration — comprehensive financial and legal services under one roof. Book a ₹499 consultation to get started.
          </motion.p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          {services.map((service, index) => (
            <motion.div
              key={service.slug}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
            >
              <Link href={`/services/${service.slug}`} className="group block h-full">
                <div className={`h-full bg-gradient-to-br ${service.bgGradient} rounded-2xl p-5 border ${service.borderColor} hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden`}>
                  {/* Tag */}
                  <div className={`absolute top-3 right-3 text-[10px] font-semibold bg-gradient-to-r ${service.gradient} text-white px-2 py-0.5 rounded-full`}>
                    {service.tag}
                  </div>

                  {/* Icon */}
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${service.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                    <service.icon className="w-5 h-5 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="font-bold font-heading text-sm mb-2 pr-12">{service.name}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3">{service.desc}</p>

                  {/* Price + CTA */}
                  <div className="flex items-center justify-between mt-auto">
                    <span className={`text-sm font-bold bg-gradient-to-r ${service.gradient} bg-clip-text text-transparent`}>
                      From {service.price}
                    </span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 group-hover:text-brand-600 transition-all" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-14">
          <p className="text-muted-foreground mb-5 text-sm">Not sure which service you need? Start with a ₹499 consultation.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" className="rounded-xl bg-brand-600 hover:bg-brand-700 font-semibold" asChild>
              <Link href="/services">
                View All Services <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="rounded-xl border-2" asChild>
              <Link href="/services">Book ₹499 Consultation</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
