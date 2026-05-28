"use client";

import { motion, animate, useInView, useMotionValue } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight, Star, Users, CheckCircle, Award,
  CalendarCheck, Shield, Lock, TrendingUp,
  FileText, Building2, BarChart3,
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

const dashboardItems = [
  { icon: CalendarCheck, label: "GST Return Filed", sub: "Today · ARN Generated", color: "from-emerald-500 to-teal-500", val: "✓" },
  { icon: FileText, label: "ITR-3 Submitted", sub: "Refund ₹24,500 processed", color: "from-blue-500 to-indigo-500", val: "✓" },
  { icon: Building2, label: "Company Registered", sub: "CIN issued in 9 days", color: "from-violet-500 to-purple-600", val: "✓" },
  { icon: BarChart3, label: "Audit Completed", sub: "Form 3CD certified", color: "from-rose-500 to-pink-600", val: "✓" },
];

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
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-8rem)]">

          {/* ── Left Column ── */}
          <div>
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

          {/* ── Right Column — Dashboard Card ── */}
          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
            className="hidden lg:block">
            <div className="relative">
              {/* Glow behind card */}
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600/30 to-indigo-600/20 rounded-3xl blur-3xl scale-110" />

              {/* Main glass card */}
              <div className="relative bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
                {/* Card header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Your CA Dashboard</p>
                    <p className="text-lg font-bold text-white mt-0.5">Recent Activity</p>
                  </div>
                  <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-xl px-3 py-1.5 flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-xs text-emerald-400 font-semibold">Live</span>
                  </div>
                </div>

                {/* Activity items */}
                <div className="space-y-3 mb-6">
                  {dashboardItems.map((item, i) => (
                    <motion.div key={item.label}
                      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.12 }}
                      className="flex items-center gap-3 bg-white/[0.04] border border-white/8 rounded-2xl p-3.5 hover:bg-white/[0.07] transition-colors group">
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shrink-0 shadow-lg`}>
                        <item.icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{item.label}</p>
                        <p className="text-[11px] text-slate-400 truncate">{item.sub}</p>
                      </div>
                      <div className="w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center shrink-0">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Mini stats */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Tax Saved", val: "₹2.4L", color: "text-emerald-400" },
                    { label: "On-time Rate", val: "99.2%", color: "text-blue-400" },
                    { label: "CA Rating", val: "4.9★", color: "text-amber-400" },
                  ].map((s) => (
                    <div key={s.label} className="bg-white/[0.04] border border-white/8 rounded-xl p-3 text-center">
                      <p className={`text-base font-bold ${s.color}`}>{s.val}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Floating CA profile chip */}
                <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-5 -right-5 flex items-center gap-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl px-3 py-2 shadow-xl">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">PM</div>
                  <div>
                    <p className="text-xs font-semibold text-white">CA Priya Menon</p>
                    <p className="text-[10px] text-slate-300">⭐ 4.9 · Available Now</p>
                  </div>
                </motion.div>

                {/* Floating metric chip */}
                <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute -bottom-5 -left-5 flex items-center gap-2 bg-amber-500/20 backdrop-blur-lg border border-amber-500/30 rounded-2xl px-3 py-2 shadow-xl">
                  <TrendingUp className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-amber-300">₹85K Tax Saved</p>
                    <p className="text-[10px] text-amber-400/70">This financial year</p>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
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
