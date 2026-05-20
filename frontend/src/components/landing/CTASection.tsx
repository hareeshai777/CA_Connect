"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, TrendingUp, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="py-24 bg-gradient-to-br from-brand-700 via-brand-800 to-brand-900 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gold-400/10 rounded-full blur-3xl" />
      </div>
      <div className="container mx-auto px-4 text-center relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-bold font-heading text-white mb-4"
        >
          Ready to Get Your Finances in Order?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-xl text-brand-100 mb-10 max-w-2xl mx-auto"
        >
          Join 10,000+ clients and 500+ CA professionals on India's fastest-growing CA marketplace.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button size="xl" className="bg-white text-brand-800 hover:bg-brand-50 rounded-xl font-semibold" asChild>
            <Link href="/find-ca">
              <Search className="mr-2 h-5 w-5" />
              Find Your CA Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button size="xl" variant="outline" className="border-white/40 text-white hover:bg-white/10 rounded-xl font-semibold" asChild>
            <Link href="/ca/register">
              <TrendingUp className="mr-2 h-5 w-5" />
              Join as CA Professional
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
