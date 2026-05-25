"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FileText, BarChart3, Building, Shield, CheckSquare,
  Lightbulb, TrendingUp, BookOpen, Users, ArrowRight,
  Search, Star, Clock,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

const iconMap: Record<string, any> = {
  "gst-filing": FileText,
  "income-tax-filing": BarChart3,
  "company-registration": Building,
  "audit-services": Shield,
  "trademark-registration": CheckSquare,
  "business-compliance": Shield,
  "startup-consulting": Lightbulb,
  "financial-planning": TrendingUp,
  "accounting-services": BookOpen,
  "payroll-services": Users,
};

const colorMap: Record<string, string> = {
  "gst-filing": "bg-blue-50 text-blue-600",
  "income-tax-filing": "bg-green-50 text-green-600",
  "company-registration": "bg-purple-50 text-purple-600",
  "audit-services": "bg-red-50 text-red-600",
  "trademark-registration": "bg-orange-50 text-orange-600",
  "business-compliance": "bg-teal-50 text-teal-600",
  "startup-consulting": "bg-yellow-50 text-yellow-600",
  "financial-planning": "bg-indigo-50 text-indigo-600",
  "accounting-services": "bg-pink-50 text-pink-600",
  "payroll-services": "bg-cyan-50 text-cyan-600",
};

// Static fallback so the page works even before the backend is connected
const STATIC_SERVICES = [
  { id: "s1", name: "GST Filing", slug: "gst-filing", shortDescription: "Complete GST registration, monthly returns, annual filing & compliance management.", basePrice: 149900, category: "GST", isFeatured: true, _count: { specializations: 42 } },
  { id: "s2", name: "Income Tax Filing", slug: "income-tax-filing", shortDescription: "Individual and corporate ITR filing with maximum deductions and refund processing.", basePrice: 99900, category: "TAX", isFeatured: true, _count: { specializations: 78 } },
  { id: "s3", name: "Company Registration", slug: "company-registration", shortDescription: "Pvt Ltd, LLP, OPC & Section 8 company incorporation end-to-end.", basePrice: 499900, category: "REGISTRATION", isFeatured: true, _count: { specializations: 35 } },
  { id: "s4", name: "Audit Services", slug: "audit-services", shortDescription: "Statutory, tax, internal and concurrent audit with detailed reporting.", basePrice: 999900, category: "AUDIT", isFeatured: false, _count: { specializations: 28 } },
  { id: "s5", name: "Trademark Registration", slug: "trademark-registration", shortDescription: "Brand protection through trademark filing, search and monitoring.", basePrice: 299900, category: "REGISTRATION", isFeatured: false, _count: { specializations: 19 } },
  { id: "s6", name: "Business Compliance", slug: "business-compliance", shortDescription: "ROC filings, board minutes, statutory registers & annual compliance calendar.", basePrice: 299900, category: "COMPLIANCE", isFeatured: false, _count: { specializations: 31 } },
  { id: "s7", name: "Startup Consulting", slug: "startup-consulting", shortDescription: "End-to-end startup advisory, funding guidance, compliance planning & financial modelling.", basePrice: 199900, category: "CONSULTING", isFeatured: true, _count: { specializations: 22 } },
  { id: "s8", name: "Financial Planning", slug: "financial-planning", shortDescription: "Investment, retirement & tax-efficient wealth management for individuals and families.", basePrice: 149900, category: "FINANCIAL_PLANNING", isFeatured: false, _count: { specializations: 17 } },
  { id: "s9", name: "Accounting Services", slug: "accounting-services", shortDescription: "Daily bookkeeping, P&L statements, balance sheet and MIS reporting.", basePrice: 199900, category: "ACCOUNTING", isFeatured: false, _count: { specializations: 25 } },
  { id: "s10", name: "Payroll Services", slug: "payroll-services", shortDescription: "Salary processing, PF/ESI compliance, TDS deduction & Form 16 generation.", basePrice: 149900, category: "PAYROLL", isFeatured: false, _count: { specializations: 20 } },
];

const CATEGORIES = ["All", "TAX", "GST", "AUDIT", "REGISTRATION", "COMPLIANCE", "CONSULTING", "ACCOUNTING", "PAYROLL", "FINANCIAL_PLANNING"];

export default function ServicesPage() {
  const [services, setServices] = useState(STATIC_SERVICES);
  const [filtered, setFiltered] = useState(STATIC_SERVICES);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    api.get("/services")
      .then((r) => {
        if (r.data?.data?.length > 0) {
          setServices(r.data.data);
          setFiltered(r.data.data);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    let list = services;
    if (activeCategory !== "All") list = list.filter((s) => s.category === activeCategory);
    if (search) list = list.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()) || s.shortDescription?.toLowerCase().includes(search.toLowerCase()));
    setFiltered(list);
  }, [search, activeCategory, services]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">

        {/* Hero */}
        <section className="bg-gradient-to-br from-brand-700 via-brand-800 to-brand-900 py-20 px-4 relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-gold-400/10 rounded-full blur-3xl" />
          </div>
          <div className="container mx-auto max-w-3xl text-center relative z-10">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-bold font-heading text-white mb-4">
              All CA Services
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-brand-200 text-lg mb-8">
              Expert financial and compliance services for individuals, startups & enterprises
            </motion.p>
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search services..."
                className="pl-12 h-12 rounded-xl bg-white text-gray-900 border-0 text-base"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Stats bar */}
        <div className="bg-white border-b border-border">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
              {[
                { icon: CheckSquare, label: "10 Service Categories" },
                { icon: Users, label: "500+ Verified CA Experts" },
                { icon: Star, label: "4.9 Average Rating" },
                { icon: Clock, label: "Same-day Booking" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-brand-600" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-10">

          {/* Category tabs */}
          <div className="flex flex-wrap gap-2 mb-8">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 text-sm font-medium rounded-xl border transition-colors ${
                  activeCategory === cat
                    ? "bg-brand-600 border-brand-600 text-white shadow-sm"
                    : "border-border text-muted-foreground hover:border-brand-300 hover:text-brand-700 bg-white"
                }`}
              >
                {cat.replace("_", " ")}
              </button>
            ))}
          </div>

          {/* Results count */}
          <p className="text-sm text-muted-foreground mb-6">{filtered.length} service{filtered.length !== 1 ? "s" : ""} found</p>

          {/* Services Grid */}
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No services match your search</p>
              <Button variant="ghost" onClick={() => { setSearch(""); setActiveCategory("All"); }} className="mt-3">Clear filters</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((service, index) => {
                const Icon = iconMap[service.slug] || FileText;
                const color = colorMap[service.slug] || "bg-gray-50 text-gray-600";
                return (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link href={`/services/${service.slug}`} className="group block h-full">
                      <div className="h-full bg-white rounded-2xl border border-border p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        {/* Top */}
                        <div className="flex items-start justify-between mb-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}>
                            <Icon className="w-6 h-6" />
                          </div>
                          <div className="flex gap-2">
                            {service.isFeatured && <Badge variant="brand" className="text-xs">Featured</Badge>}
                            <Badge variant="secondary" className="text-xs">{service.category.replace("_", " ")}</Badge>
                          </div>
                        </div>

                        {/* Content */}
                        <h3 className="text-lg font-semibold font-heading mb-2 group-hover:text-brand-600 transition-colors">
                          {service.name}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-2">
                          {service.shortDescription}
                        </p>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-4 border-t border-border">
                          <div>
                            <span className="text-xs text-muted-foreground">Starting from</span>
                            <p className="text-lg font-bold text-brand-600">{formatCurrency(service.basePrice)}</p>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Users className="w-3.5 h-3.5" />
                            {service._count?.specializations || 0}+ CAs
                          </div>
                        </div>

                        <div className="mt-4 flex items-center text-sm font-medium text-brand-600 opacity-0 group-hover:opacity-100 transition-opacity">
                          View details <ArrowRight className="ml-1.5 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom CTA */}
        <section className="bg-brand-50 border-t border-brand-100 py-16 px-4">
          <div className="container mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold font-heading mb-3">Can't find what you need?</h2>
            <p className="text-muted-foreground mb-6">
              Talk to our AI assistant or browse all verified CA professionals to find the right expert for your specific requirement.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button className="rounded-xl bg-brand-600 hover:bg-brand-700" asChild>
                <Link href="/services">Book Consultation — ₹499 <ArrowRight className="ml-2 w-4 h-4" /></Link>
              </Button>
              <Button variant="outline" className="rounded-xl" asChild>
                <Link href="/client/ai-chat">Ask AI Assistant</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
