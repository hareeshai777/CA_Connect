"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, TrendingUp, Search, Users, Award, Star, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const floatingStats = [
  { icon: Users, value: "10,000+", label: "Clients", delay: 0, x: "-60%", y: "-40%" },
  { icon: Award, value: "500+", label: "Verified CAs", delay: 0.3, x: "55%", y: "-50%" },
  { icon: Star, value: "4.9★", label: "Rating", delay: 0.6, x: "-65%", y: "40%" },
  { icon: CheckCircle, value: "25K+", label: "Registrations", delay: 0.9, x: "60%", y: "45%" },
];

export function CTASection() {
  return (
    <section className="py-28 relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-700 via-brand-800 to-indigo-900" />

      {/* Animated orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 40, 0], y: [0, -30, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -30, 0], y: [0, 40, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.05, 0.12, 0.05] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-300/10 rounded-full blur-2xl"
        />
      </div>

      {/* Floating stat badges */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {floatingStats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: stat.delay + 0.4, duration: 0.5, type: "spring" }}
            animate={{ y: [0, -8, 0] }}
            style={{ x: stat.x, y: stat.y, animationDelay: `${i * 0.5}s` }}
            className="absolute hidden xl:flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-2.5 text-white"
          >
            <stat.icon className="w-4 h-4 text-yellow-300 shrink-0" />
            <div>
              <div className="text-sm font-bold leading-none">{stat.value}</div>
              <div className="text-[10px] text-white/70">{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="container mx-auto px-4 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 bg-white/15 border border-white/30 rounded-full px-4 py-2 text-sm font-medium text-white mb-6"
        >
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          500+ CA Professionals Online Now
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-6xl font-bold font-heading text-white mb-5 leading-tight"
        >
          Ready to Get Your<br />
          <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
            Finances in Order?
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-xl text-brand-100 mb-10 max-w-2xl mx-auto"
        >
          Join 10,000+ clients and 500+ CA professionals on India&apos;s fastest-growing CA marketplace.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} className="relative">
            {/* Pulsing ring */}
            <span className="absolute inset-0 rounded-xl bg-white/20 animate-ping opacity-30" />
            <Button size="xl" className="relative bg-white text-brand-800 hover:bg-yellow-50 rounded-xl font-bold shadow-2xl shadow-black/20" asChild>
              <Link href="/services">
                <Search className="mr-2 h-5 w-5" />
                Find Your CA Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
            <Button size="xl" variant="outline" className="border-white/40 text-white hover:bg-white/15 rounded-xl font-semibold" asChild>
              <Link href="/ca/register">
                <TrendingUp className="mr-2 h-5 w-5" />
                Join as CA Professional
              </Link>
            </Button>
          </motion.div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-brand-200 text-sm mt-6"
        >
          No subscription. No hidden fees. Just ₹499 per consultation.
        </motion.p>
      </div>
    </section>
  );
}
