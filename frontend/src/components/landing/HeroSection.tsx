"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Shield, Star, Users, CheckCircle, Search, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const stats = [
  { value: "10,000+", label: "Trusted Clients" },
  { value: "500+", label: "Verified CAs" },
  { value: "₹50Cr+", label: "Tax Saved" },
  { value: "4.9★", label: "Average Rating" },
];

const trustBadges = [
  "ICAI Verified",
  "Secure Payments",
  "Money-back Guarantee",
  "100% Confidential",
];

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-background">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -right-64 w-[600px] h-[600px] bg-brand-100/50 dark:bg-brand-900/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-64 w-[600px] h-[600px] bg-gold-400/10 dark:bg-gold-900/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-gradient-to-r from-brand-50/30 to-transparent dark:from-brand-900/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-24 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 rounded-full px-4 py-2 text-sm font-medium mb-8"
          >
            <Shield className="w-4 h-4" />
            India's #1 Trusted CA Platform
            <ArrowRight className="w-3 h-3" />
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold font-heading text-foreground mb-6 leading-tight tracking-tight"
          >
            Connect With{" "}
            <span className="text-gradient">Trusted CA</span>
            <br />
            Professionals
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed"
          >
            Find expert Chartered Accountants for <span className="text-foreground font-medium">taxation, GST, audits, company registration, compliance</span>, business consulting, and more.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-10"
          >
            <Button size="xl" className="bg-brand-600 hover:bg-brand-700 shadow-lg shadow-brand-200 dark:shadow-brand-900 rounded-xl font-semibold" asChild>
              <Link href="/find-ca">
                <Search className="mr-2 h-5 w-5" />
                Find a CA
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="xl" variant="outline" className="rounded-xl border-2 font-semibold" asChild>
              <Link href="/ca/register">
                <TrendingUp className="mr-2 h-5 w-5" />
                Become a CA Partner
              </Link>
            </Button>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-3 mb-16"
          >
            {trustBadges.map((badge) => (
              <div key={badge} className="flex items-center gap-1.5 bg-white dark:bg-gray-800 border border-border shadow-sm rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground">
                <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                {badge}
              </div>
            ))}
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.5 + i * 0.1 }}
                className="text-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-border"
              >
                <div className="text-3xl font-bold font-heading text-brand-600 dark:text-brand-400 mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 40L60 36.7C120 33.3 240 26.7 360 30C480 33.3 600 46.7 720 46.7C840 46.7 960 33.3 1080 30C1200 26.7 1320 33.3 1380 36.7L1440 40V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0V40Z" fill="white" className="dark:fill-background" />
        </svg>
      </div>
    </section>
  );
}
