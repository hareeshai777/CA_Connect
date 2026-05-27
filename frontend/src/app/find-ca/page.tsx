"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CACard } from "@/components/landing/CACard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, SlidersHorizontal, Loader2, MapPin, Star, Filter } from "lucide-react";
import { api } from "@/lib/api";
import { motion } from "framer-motion";

const serviceFilters = [
  { label: "All", value: "" },
  { label: "GST Filing", value: "gst-filing" },
  { label: "Income Tax", value: "income-tax-filing" },
  { label: "Company Reg", value: "company-registration" },
  { label: "Audit", value: "audit-services" },
  { label: "Startup", value: "startup-consulting" },
  { label: "Payroll", value: "payroll-services" },
];

const sortOptions = [
  { label: "Best Rated", value: "averageRating" },
  { label: "Most Experienced", value: "experienceYears" },
  { label: "Fee: Low to High", value: "consultationFee_asc" },
  { label: "Most Reviewed", value: "totalReviews" },
];

export default function FindCAPage() {
  const [cas, setCAs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [service, setService] = useState("");
  const [sortBy, setSortBy] = useState("averageRating");
  const [page, setPage] = useState(1);

  const fetchCAs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page), limit: "12", sortBy,
        ...(search && { search }),
        ...(service && { service }),
      });
      const res = await api.get(`/ca?${params}`);
      setCAs(res.data.data || []);
      setTotal(res.data.meta?.total || 0);
    } catch {
      setCAs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCAs(); }, [page, service, sortBy]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCAs();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-800 to-brand-900 py-16 px-4">
          <div className="container mx-auto max-w-3xl text-center">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl font-bold font-heading text-white mb-4">
              Find Your Perfect CA
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-brand-200 mb-8">
              Browse {total || "500+"} verified Chartered Accountants across India
            </motion.p>
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search by name, specialization, or city..."
                  className="pl-11 h-12 rounded-xl bg-white text-gray-900 border-0 text-base"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button type="submit" size="lg" className="h-12 rounded-xl bg-gold-500 hover:bg-gold-600 text-white font-semibold px-6">
                Search
              </Button>
            </form>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="flex gap-2 flex-wrap flex-1">
              {serviceFilters.map((f) => (
                <button key={f.value} onClick={() => { setService(f.value); setPage(1); }}
                  className={`px-4 py-2 text-sm font-medium rounded-xl border transition-colors ${service === f.value ? "bg-brand-600 border-brand-600 text-white" : "border-border text-muted-foreground hover:border-brand-300 hover:text-brand-700 bg-white"}`}>
                  {f.label}
                </button>
              ))}
            </div>
            <select
              className="h-10 rounded-xl border border-border bg-white px-4 text-sm font-medium"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div className="flex items-center justify-between mb-6">
            <p className="text-muted-foreground text-sm">{total} CA professionals found</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-brand-600" />
            </div>
          ) : cas.length === 0 ? (
            <div className="text-center py-20">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No CAs found</h3>
              <p className="text-muted-foreground">Try a different search or filter</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cas.map((ca, i) => <CACard key={ca.id} ca={{ ...ca, _real: true }} index={i} />)}
              </div>

              {/* Pagination */}
              <div className="flex justify-center gap-3 mt-12">
                <Button variant="outline" className="rounded-xl" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
                <span className="flex items-center text-sm text-muted-foreground px-4">Page {page} of {Math.ceil(total / 12)}</span>
                <Button variant="outline" className="rounded-xl" disabled={cas.length < 12} onClick={() => setPage(p => p + 1)}>Next</Button>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
