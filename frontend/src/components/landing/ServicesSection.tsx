"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, FileText, Building, BarChart3, Shield, CheckSquare, Lightbulb, TrendingUp, BookOpen, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const services = [
  { icon: FileText, name: "GST Filing", slug: "gst-filing", desc: "Complete GST registration, returns, and compliance management.", color: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400" },
  { icon: BarChart3, name: "Income Tax Filing", slug: "income-tax-filing", desc: "Individual and corporate ITR filing with maximum deductions.", color: "bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400" },
  { icon: Building, name: "Company Registration", slug: "company-registration", desc: "Pvt Ltd, LLP, OPC, and Section 8 company incorporation.", color: "bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400" },
  { icon: Shield, name: "Audit Services", slug: "audit-services", desc: "Statutory, tax, internal and concurrent audit services.", color: "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400" },
  { icon: CheckSquare, name: "Trademark Registration", slug: "trademark-registration", desc: "Brand protection through trademark filing and monitoring.", color: "bg-orange-50 text-orange-600 dark:bg-orange-950 dark:text-orange-400" },
  { icon: Shield, name: "Business Compliance", slug: "business-compliance", desc: "ROC filings, annual returns, and regulatory compliance.", color: "bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-400" },
  { icon: Lightbulb, name: "Startup Consulting", slug: "startup-consulting", desc: "End-to-end startup advisory, funding & compliance planning.", color: "bg-yellow-50 text-yellow-600 dark:bg-yellow-950 dark:text-yellow-400" },
  { icon: TrendingUp, name: "Financial Planning", slug: "financial-planning", desc: "Investment, retirement & tax-efficient wealth management.", color: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400" },
  { icon: BookOpen, name: "Accounting Services", slug: "accounting-services", desc: "Daily bookkeeping, P&L, balance sheet, and MIS reports.", color: "bg-pink-50 text-pink-600 dark:bg-pink-950 dark:text-pink-400" },
  { icon: Users, name: "Payroll Services", slug: "payroll-services", desc: "Salary processing, PF/ESI, TDS, and Form 16 generation.", color: "bg-cyan-50 text-cyan-600 dark:bg-cyan-950 dark:text-cyan-400" },
];

export function ServicesSection() {
  return (
    <section className="section-padding bg-gray-50 dark:bg-gray-900/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-sm font-semibold text-brand-600 uppercase tracking-wider mb-3"
          >
            Our Services
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold font-heading mb-4"
          >
            Everything Your Business Needs
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            From tax filing to company registration — comprehensive financial and legal services under one roof.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          {services.map((service, index) => (
            <motion.div
              key={service.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <Link href={`/services/${service.slug}`} className="group block h-full">
                <div className="h-full bg-white dark:bg-gray-800 rounded-2xl p-6 border border-border hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${service.color} group-hover:scale-110 transition-transform`}>
                    <service.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold font-heading text-base mb-2">{service.name}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{service.desc}</p>
                  <div className="mt-4 flex items-center text-sm font-medium text-brand-600 group-hover:gap-2 transition-all">
                    Learn more <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button variant="outline" size="lg" className="rounded-xl border-2" asChild>
            <Link href="/services">View All Services <ArrowRight className="ml-2 w-4 h-4" /></Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
