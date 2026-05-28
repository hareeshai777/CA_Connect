"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CACard } from "./CACard";
import { api } from "@/lib/api";

const DEMO_CAS = [
  { id: "demo1", firstName: "Anil", lastName: "Kumar", bio: "Expert in corporate taxation, GST compliance, and international tax planning with 15+ years experience.", experienceYears: 15, consultationFee: 49900, averageRating: 4.9, totalReviews: 127, isAvailable: true, city: "Mumbai", state: "Maharashtra", languages: "English, Hindi, Marathi", specializations: [{ service: { name: "Income Tax", slug: "income-tax-filing" } }, { service: { name: "GST Filing", slug: "gst-filing" } }] },
  { id: "demo2", firstName: "Priyanka", lastName: "Mehta", bio: "Startup ecosystem expert specializing in company registration, funding compliance, and SEBI regulations.", experienceYears: 10, consultationFee: 49900, averageRating: 4.8, totalReviews: 89, isAvailable: true, city: "Bangalore", state: "Karnataka", languages: "English, Hindi, Kannada", specializations: [{ service: { name: "Company Reg.", slug: "company-registration" } }, { service: { name: "Startup Consulting", slug: "startup-consulting" } }] },
  { id: "demo3", firstName: "Vikram", lastName: "Singhania", bio: "Audit and compliance specialist with deep expertise in statutory audit, internal audit, and risk management.", experienceYears: 12, consultationFee: 49900, averageRating: 4.7, totalReviews: 64, isAvailable: false, city: "Delhi", state: "Delhi", languages: "English, Hindi, Punjabi", specializations: [{ service: { name: "Audit Services", slug: "audit-services" } }, { service: { name: "Compliance", slug: "business-compliance" } }] },
  { id: "demo4", firstName: "Deepa", lastName: "Nair", bio: "Financial planning and wealth management expert helping individuals and families achieve their financial goals.", experienceYears: 8, consultationFee: 49900, averageRating: 4.9, totalReviews: 156, isAvailable: true, city: "Chennai", state: "Tamil Nadu", languages: "English, Tamil, Hindi", specializations: [{ service: { name: "Financial Planning", slug: "financial-planning" } }, { service: { name: "Income Tax", slug: "income-tax-filing" } }] },
  { id: "demo5", firstName: "Sanjay", lastName: "Agarwal", bio: "GST specialist with expert knowledge of e-commerce taxation, supply chain compliance, and ITC optimization.", experienceYears: 7, consultationFee: 49900, averageRating: 4.8, totalReviews: 93, isAvailable: true, city: "Hyderabad", state: "Telangana", languages: "English, Hindi, Telugu", specializations: [{ service: { name: "GST Filing", slug: "gst-filing" } }, { service: { name: "Accounting", slug: "accounting-services" } }] },
  { id: "demo6", firstName: "Kavitha", lastName: "Reddy", bio: "Payroll and HR compliance expert managing end-to-end payroll for SMEs and large organizations.", experienceYears: 9, consultationFee: 49900, averageRating: 4.6, totalReviews: 48, isAvailable: true, city: "Pune", state: "Maharashtra", languages: "English, Telugu, Hindi", specializations: [{ service: { name: "Payroll Services", slug: "payroll-services" } }, { service: { name: "Compliance", slug: "business-compliance" } }] },
];

export function FeaturedCAsSection() {
  const [cas, setCas] = useState(DEMO_CAS);

  useEffect(() => {
    api.get("/ca?limit=6&sortBy=averageRating").then((res) => {
      const realCAs: any[] = res.data?.data || [];
      if (realCAs.length === 0) return;
      const normalised = realCAs.map((ca: any) => ({ ...ca, consultationFee: 49900, _real: true }));
      const realNames = new Set(normalised.map((c: any) => `${c.firstName}${c.lastName}`));
      const fillers = DEMO_CAS.filter(d => !realNames.has(`${d.firstName}${d.lastName}`));
      setCas([...normalised, ...fillers].slice(0, 6));
    }).catch(() => {});
  }, []);

  return (
    <section className="section-padding bg-gradient-to-b from-slate-50 to-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="inline-flex items-center gap-2 bg-brand-50 text-brand-600 border border-brand-100 rounded-full px-4 py-1.5 text-sm font-semibold mb-4">
              <Sparkles className="w-3.5 h-3.5" /> Featured Professionals
            </motion.div>
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
              Meet Our Top
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-600">
                CA Professionals
              </span>
            </motion.h2>
          </div>

          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="shrink-0">
            <Button variant="outline" className="rounded-xl border-2 border-brand-200 text-brand-700 hover:bg-brand-50 font-semibold h-11 px-6" asChild>
              <Link href="/services">View All CAs <ArrowRight className="ml-2 w-4 h-4" /></Link>
            </Button>
          </motion.div>
        </div>

        {/* CA Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {cas.map((ca, index) => (
            <CACard key={ca.id} ca={ca as any} index={index} />
          ))}
        </div>

        {/* Bottom CTA bar */}
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="mt-12 bg-gradient-to-r from-brand-600 to-indigo-600 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-brand-600/20">
          <div>
            <p className="text-white font-bold text-xl mb-1">Can't find the right CA?</p>
            <p className="text-brand-100 text-sm">Let our AI recommend the perfect expert for your needs.</p>
          </div>
          <div className="flex gap-3 shrink-0">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Button className="bg-white text-brand-700 hover:bg-brand-50 rounded-xl font-bold shadow-lg h-11 px-6" asChild>
                <Link href="/find-ca">Find My CA <ArrowRight className="ml-2 w-4 h-4" /></Link>
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
