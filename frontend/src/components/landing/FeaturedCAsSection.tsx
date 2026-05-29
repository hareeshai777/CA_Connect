"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CACard } from "./CACard";
import { api } from "@/lib/api";

export function FeaturedCAsSection() {
  const [cas, setCas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/ca?limit=6&sortBy=averageRating")
      .then((res) => {
        const real = (res.data?.data || []).filter((ca: any) => ca.status === "ACTIVE");
        setCas(real.slice(0, 6).map((ca: any) => ({ ...ca, _real: true })));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="section-padding bg-gradient-to-b from-slate-50 to-white relative overflow-hidden">
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

        {/* Loading skeletons */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-64 bg-gray-100 animate-pulse rounded-2xl" />
            ))}
          </div>
        )}

        {/* Real CA cards */}
        {!loading && cas.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {cas.map((ca, index) => (
              <CACard key={ca.id} ca={ca as any} index={index} />
            ))}
          </div>
        )}

        {/* Empty state — no CAs yet */}
        {!loading && cas.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-20 bg-gradient-to-br from-brand-50 to-indigo-50 rounded-3xl border border-brand-100">
            <div className="w-16 h-16 bg-brand-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Users className="w-8 h-8 text-brand-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">CAs Coming Soon</h3>
            <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">
              We are onboarding verified CA professionals. Be the first to connect when they go live.
            </p>
            <Button className="rounded-xl bg-brand-600 hover:bg-brand-700 font-semibold" asChild>
              <Link href="/auth/register?tab=ca">Join as CA Professional</Link>
            </Button>
          </motion.div>
        )}

        {/* Bottom CTA */}
        {!loading && cas.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="mt-12 bg-gradient-to-r from-brand-600 to-indigo-600 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-brand-600/20">
            <div>
              <p className="text-white font-bold text-xl mb-1">Can&apos;t find the right CA?</p>
              <p className="text-brand-100 text-sm">Browse all verified CA professionals on the platform.</p>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Button className="bg-white text-brand-700 hover:bg-brand-50 rounded-xl font-bold shadow-lg h-11 px-6 shrink-0" asChild>
                <Link href="/find-ca">Find My CA <ArrowRight className="ml-2 w-4 h-4" /></Link>
              </Button>
            </motion.div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
