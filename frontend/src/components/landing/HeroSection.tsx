"use client";

import { motion, animate, useInView, useMotionValue } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight, Star, Users, CheckCircle, Award,
  CalendarCheck, Shield, Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef, useEffect, useState } from "react";

const stats = [
  { to: 10000, suffix: "+", label: "Happy Clients", icon: Users },
  { to: 500, suffix: "+", label: "Verified CAs", icon: Award },
  { to: 25000, suffix: "+", label: "Cases Filed", icon: CheckCircle },
  { to: 4.9, suffix: "★", decimals: 1, label: "Avg Rating", icon: Star },
];

const rotatingWords = ["Tax Filing", "GST Compliance", "Registrations", "Audits", "Payroll"];

function Counter({ to, suffix = "", decimals = 0 }: { to: number; suffix?: string; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const count = useMotionValue(0);
  const [display, setDisplay] = useState(`0${suffix}`);

  useEffect(() => {
    if (!isInView) return;
    const controls = animate(count, to, { duration: 2, ease: "easeOut" });
    const unsub = count.on("change", (v) => {
      setDisplay(`${decimals > 0 ? v.toFixed(decimals) : Math.floor(v).toLocaleString("en-IN")}${suffix}`);
    });
    return () => { controls.stop(); unsub(); };
  }, [isInView]);

  return <span ref={ref}>{display}</span>;
}

function RotatingWord() {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const t = setInterval(() => {
      setVisible(false);
      setTimeout(() => { setIdx((i) => (i + 1) % rotatingWords.length); setVisible(true); }, 350);
    }, 2800);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-300 transition-all duration-350"
      style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(12px)", display: "block" }}>
      {rotatingWords[idx]}
    </span>
  );
}


export function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-[#06091a]">
      {/* Layered gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#06091a] via-[#0d1340] to-[#150b35]" />

      {/* Subtle dot grid */}
      <div className="absolute inset-0 opacity-[0.07]"
        style={{ backgroundImage: "radial-gradient(rgba(139,92,246,0.7) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

      {/* Animated glow blobs */}
      <motion.div animate={{ scale: [1, 1.25, 1], opacity: [0.25, 0.45, 0.25] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-violet-700/25 rounded-full blur-[130px] pointer-events-none" />
      <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.35, 0.15] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        className="absolute bottom-0 right-0 w-[700px] h-[500px] bg-indigo-600/20 rounded-full blur-[150px] pointer-events-none" />
      <motion.div animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-800/15 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 container mx-auto px-6 pt-32 pb-16">
        <div className="flex flex-col items-center min-h-[calc(100vh-8rem)] justify-center">

          {/* ── Content ── */}
          <div className="max-w-3xl text-center">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-white/5 border border-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-xs font-semibold text-violet-300 mb-8 tracking-wider uppercase">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              India&apos;s Most Trusted CA Platform
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-6xl xl:text-7xl font-extrabold text-white leading-[1.08] tracking-tight mb-6">
              Expert CAs for
              <RotatingWord />
              <span className="text-slate-300">& More</span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-slate-400 leading-relaxed mb-10 max-w-xl">
              Connect with ICAI-verified Chartered Accountants for all your business and personal finance needs.
              Book a consultation for just <span className="text-amber-400 font-bold">₹499</span>.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 mb-10">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Button size="xl" className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-gray-900 font-extrabold h-14 px-8 rounded-2xl text-base shadow-2xl shadow-amber-500/30 border-0" asChild>
                  <Link href="/services">
                    <CalendarCheck className="mr-2 w-5 h-5" />
                    Book Consultation — ₹499
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Button size="xl" className="bg-white/8 border border-white/20 text-white hover:bg-white/15 backdrop-blur-sm h-14 px-8 rounded-2xl text-base font-semibold" asChild>
                  <Link href="/services">Explore Services</Link>
                </Button>
              </motion.div>
            </motion.div>

            {/* Trust row */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
              className="flex flex-wrap gap-3">
              {[{ icon: Shield, label: "ICAI Verified" }, { icon: Lock, label: "100% Confidential" }].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 text-xs text-slate-300 font-medium">
                  <Icon className="w-3.5 h-3.5 text-emerald-400" /> {label}
                </div>
              ))}
            </motion.div>
          </div>

        </div>

        {/* ── Bottom Stats Bar ── */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 border-t border-white/8 pt-10">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + i * 0.08 }}
              whileHover={{ scale: 1.04 }}
              className="flex items-center gap-4 bg-white/[0.04] border border-white/8 rounded-2xl px-5 py-4 cursor-default group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/30 to-indigo-600/30 border border-white/10 flex items-center justify-center shrink-0 group-hover:from-violet-500/50 group-hover:to-indigo-600/50 transition-all">
                <s.icon className="w-5 h-5 text-violet-300" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-white leading-none">
                  <Counter to={s.to} suffix={s.suffix} decimals={s.decimals || 0} />
                </p>
                <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" className="block">
          <path d="M0 30L60 27C120 24 240 18 360 21C480 24 600 37 720 37C840 37 960 24 1080 21C1200 18 1320 24 1380 27L1440 30V60H0V30Z" fill="white" />
        </svg>
      </div>
    </section>
  );
}
