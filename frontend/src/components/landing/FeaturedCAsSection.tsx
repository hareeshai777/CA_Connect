"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CACard } from "./CACard";
import { api } from "@/lib/api";

const DEMO_CAS = [
  { id: "demo1", firstName: "Anil", lastName: "Kumar", bio: "Expert in corporate taxation, GST compliance, and international tax planning with 15+ years experience.", experienceYears: 15, consultationFee: 200000, averageRating: 4.9, totalReviews: 127, isAvailable: true, city: "Mumbai", state: "Maharashtra", languages: "English, Hindi, Marathi", specializations: [{ service: { name: "Income Tax Filing", slug: "income-tax-filing" } }, { service: { name: "GST Filing", slug: "gst-filing" } }, { service: { name: "Audit Services", slug: "audit-services" } }] },
  { id: "demo2", firstName: "Priyanka", lastName: "Mehta", bio: "Startup ecosystem expert specializing in company registration, funding compliance, and SEBI regulations.", experienceYears: 10, consultationFee: 150000, averageRating: 4.8, totalReviews: 89, isAvailable: true, city: "Bangalore", state: "Karnataka", languages: "English, Hindi, Kannada", specializations: [{ service: { name: "Company Registration", slug: "company-registration" } }, { service: { name: "Startup Consulting", slug: "startup-consulting" } }] },
  { id: "demo3", firstName: "Vikram", lastName: "Singhania", bio: "Audit and compliance specialist with deep expertise in statutory audit, internal audit, and risk management.", experienceYears: 12, consultationFee: 175000, averageRating: 4.7, totalReviews: 64, isAvailable: false, city: "Delhi", state: "Delhi", languages: "English, Hindi, Punjabi", specializations: [{ service: { name: "Audit Services", slug: "audit-services" } }, { service: { name: "Business Compliance", slug: "business-compliance" } }] },
  { id: "demo4", firstName: "Deepa", lastName: "Nair", bio: "Financial planning and wealth management expert helping individuals and families achieve their financial goals.", experienceYears: 8, consultationFee: 120000, averageRating: 4.9, totalReviews: 156, isAvailable: true, city: "Chennai", state: "Tamil Nadu", languages: "English, Tamil, Hindi", specializations: [{ service: { name: "Financial Planning", slug: "financial-planning" } }, { service: { name: "Income Tax Filing", slug: "income-tax-filing" } }] },
  { id: "demo5", firstName: "Sanjay", lastName: "Agarwal", bio: "GST specialist with expert knowledge of e-commerce taxation, supply chain compliance, and input tax credit optimization.", experienceYears: 7, consultationFee: 100000, averageRating: 4.8, totalReviews: 93, isAvailable: true, city: "Hyderabad", state: "Telangana", languages: "English, Hindi, Telugu", specializations: [{ service: { name: "GST Filing", slug: "gst-filing" } }, { service: { name: "Accounting Services", slug: "accounting-services" } }] },
  { id: "demo6", firstName: "Kavitha", lastName: "Reddy", bio: "Payroll and HR compliance expert managing end-to-end payroll for SMEs and large organizations.", experienceYears: 9, consultationFee: 90000, averageRating: 4.6, totalReviews: 48, isAvailable: true, city: "Pune", state: "Maharashtra", languages: "English, Telugu, Hindi", specializations: [{ service: { name: "Payroll Services", slug: "payroll-services" } }, { service: { name: "Business Compliance", slug: "business-compliance" } }] },
];

export function FeaturedCAsSection() {
  const [cas, setCas] = useState(DEMO_CAS);

  useEffect(() => {
    api.get("/ca?limit=6&sortBy=averageRating").then((res) => {
      if (res.data?.data?.length > 0) setCas(res.data.data);
    }).catch(() => {});
  }, []);

  return (
    <section className="section-padding">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-sm font-semibold text-brand-600 uppercase tracking-wider mb-3"
            >
              Featured Professionals
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold font-heading"
            >
              Top CA Professionals
            </motion.h2>
          </div>
          <Button variant="outline" className="rounded-xl border-2 shrink-0" asChild>
            <Link href="/find-ca">View All CAs <ArrowRight className="ml-2 w-4 h-4" /></Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cas.map((ca, index) => (
            <CACard key={ca.id} ca={ca as any} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
