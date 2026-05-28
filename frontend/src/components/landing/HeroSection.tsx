"use client";

import { motion, animate, useInView, useMotionValue, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight, Star, Users, CheckCircle, Award,
  CalendarCheck, Shield, Lock, Quote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef, useEffect, useState } from "react";

const stats = [
  { to: 10000, suffix: "+", label: "Happy Clients", icon: Users },
  { to: 500, suffix: "+", label: "Verified CAs", icon: Award },
  { to: 25000, suffix: "+", label: "Cases Filed", icon: CheckCircle },
  { to: 4.9, suffix: "★", decimals: 1, label: "Avg Rating", icon: Star },
];

const rotatingWords = ["Tax Filing", "GST Compliance", "Registrations", "Audits", "Payroll", "Planning"];

const quotes = [
  {
    tag: "Tax Filing",
    text: "Saved ₹1.2 lakhs in taxes this financial year. Our CA found deductions we never knew existed — under 80C, HRA, and medical.",
    author: "Rahul Sharma",
    role: "Senior Manager, Infosys",
    initials: "RS",
    color: "from-amber-400 to-orange-500",
  },
  {
    tag: "GST Compliance",
    text: "GST returns filed on time for 18 months straight. Zero penalties, zero notices, zero stress. This platform changed how we do compliance.",
    author: "Meera Iyer",
    role: "Founder, QuickBite Foods",
    initials: "MI",
    color: "from-blue-400 to-cyan-400",
  },
  {
    tag: "Registrations",
    text: "Private Limited Company registered in just 9 days — CIN, PAN, TAN, bank account. Completely hands-free. Worth every rupee.",
    author: "Arjun Kapoor",
    role: "Co-Founder, TechNest Pvt Ltd",
    initials: "AK",
    color: "from-violet-400 to-purple-500",
  },
  {
    tag: "Audits",
    text: "Statutory audit cleared in one shot with zero observations. The CA reviewed 3 years of books in a week. Absolutely professional.",
    author: "Deepa Nair",
    role: "CFO, Horizon Retail",
    initials: "DN",
    color: "from-rose-400 to-pink-500",
  },
  {
    tag: "Payroll",
    text: "60-employee payroll processed error-free every month. PF, ESI, TDS and Form 16 — all handled without a single query from the team.",
    author: "Suresh Kumar",
    role: "HR Director, Apex Tech",
    initials: "SK",
    color: "from-teal-400 to-emerald-400",
  },
  {
    tag: "Planning",
    text: "Restructured my investment portfolio for tax efficiency. Saving ₹3 lakhs more annually. The best financial decision I ever made.",
    author: "Priya Menon",
    role: "Angel Investor, Bangalore",
    initials: "PM",
    color: "from-indigo-400 to-blue-500",
  },
];

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

function RotatingWord({ idx }: { idx: number }) {
  const [visible, setVisible] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(idx);

  useEffect(() => {
    setVisible(false);
    const t = setTimeout(() => {
      setCurrentIdx(idx);
      setVisible(true);
    }, 300);
    return () => clearTimeout(t);
  }, [idx]);

  return (
    <span
      className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-300 transition-all duration-300"
      style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(10px)", display: "block" }}
    >
      {rotatingWords[currentIdx]}
    </span>
  );
}

function QuoteCarousel({ activeIdx }: { activeIdx: number }) {
  const q = quotes[activeIdx];

  return (
    <div className="w-full max-w-2xl mx-auto mt-10">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeIdx}
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.97 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="relative bg-white/[0.05] backdrop-blur-xl border border-white/10 rounded-2xl px-7 py-6"
        >
          {/* Accent top line */}
          <div className={`absolute top-0 left-6 right-6 h-0.5 bg-gradient-to-r ${q.color} rounded-full opacity-70`} />

          {/* Quote icon */}
          <Quote className="w-6 h-6 text-white/20 mb-3" />

          {/* Quote text */}
          <p className="text-white/90 text-base md:text-lg font-semibold leading-relaxed mb-5">
            &ldquo;{q.text}&rdquo;
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${q.color} flex items-center justify-center text-white text-xs font-extrabold shrink-0`}>
                {q.initials}
              </div>
              <div>
                <p className="text-white text-sm font-bold leading-tight">{q.author}</p>
                <p className="text-slate-400 text-xs">{q.role}</p>
              </div>
            </div>
            <span className={`text-xs font-bold bg-gradient-to-r ${q.color} bg-clip-text text-transparent border border-white/10 rounded-full px-3 py-1 shrink-0`}>
              {q.tag}
            </span>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-4">
        {quotes.map((_, i) => (
          <div
            key={i}
            className={`rounded-full transition-all duration-300 ${
              i === activeIdx ? "w-6 h-2 bg-amber-400" : "w-2 h-2 bg-white/20"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export function HeroSection() {
  const [activeIdx, setActiveIdx] = useState(0);

  // Auto-rotate every 2.8s (synced with rotating word)
  useEffect(() => {
    const t = setInterval(() => {
      setActiveIdx((i) => (i + 1) % rotatingWords.length);
    }, 2800);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative min-h-screen overflow-hidden" style={{ background: "#07091f" }}>

      {/* Rich multi-layer aurora gradient */}
      <div className="absolute inset-0" style={{
        background: `
          radial-gradient(ellipse 80% 60% at 10% 0%, rgba(99,60,220,0.45) 0%, transparent 60%),
          radial-gradient(ellipse 70% 50% at 90% 0%, rgba(14,165,233,0.25) 0%, transparent 55%),
          radial-gradient(ellipse 60% 70% at 50% 100%, rgba(79,50,180,0.35) 0%, transparent 65%),
          radial-gradient(ellipse 50% 40% at 80% 60%, rgba(20,184,166,0.15) 0%, transparent 50%),
          linear-gradient(160deg, #0d0b2e 0%, #0a1045 35%, #070d38 65%, #0b0828 100%)
        `
      }} />

      {/* Mesh grid */}
      <div className="absolute inset-0 opacity-[0.06]"
        style={{ backgroundImage: "linear-gradient(rgba(148,130,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(148,130,255,0.6) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />

      {/* Diagonal light streak */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(115deg, transparent 30%, rgba(120,100,255,0.04) 50%, transparent 70%)" }} />

      {/* Animated glow blobs */}
      <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.65, 0.4] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-32 -left-32 w-[700px] h-[700px] rounded-full blur-[140px] pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(109,40,217,0.55) 0%, rgba(67,56,202,0.3) 50%, transparent 75%)" }} />

      <motion.div animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute -bottom-20 -right-20 w-[650px] h-[650px] rounded-full blur-[120px] pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(14,165,233,0.35) 0%, rgba(79,70,229,0.25) 50%, transparent 75%)" }} />

      <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.38, 0.2] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[400px] rounded-full blur-[100px] pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(20,184,166,0.18) 0%, rgba(56,189,248,0.12) 50%, transparent 75%)" }} />

      {/* Warm amber accent glow — bottom center */}
      <motion.div animate={{ opacity: [0.1, 0.22, 0.1], scale: [1, 1.1, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[200px] rounded-full blur-[80px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(251,146,60,0.2) 0%, transparent 70%)" }} />

      <div className="relative z-10 container mx-auto px-6 pt-24 pb-12">
        <div className="flex flex-col items-center">

          {/* ── Main Content ── */}
          <div className="max-w-3xl text-center pt-16">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-white/[0.08] border border-violet-400/25 backdrop-blur-sm rounded-full px-4 py-2 text-xs font-semibold text-violet-200 mb-6 tracking-wider uppercase">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              India&apos;s Most Trusted CA Platform
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-6xl xl:text-7xl font-extrabold text-white leading-[1.08] tracking-tight mb-5">
              Expert CAs for
              <RotatingWord idx={activeIdx} />
              <span className="text-slate-300">& More</span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-slate-400 leading-relaxed mb-8 max-w-xl mx-auto">
              Connect with ICAI-verified Chartered Accountants for all your business and personal finance needs.
              Book a consultation for just <span className="text-amber-400 font-bold">₹499</span>.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
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

            {/* Trust badges */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
              className="flex flex-wrap gap-3 justify-center mb-4">
              {[{ icon: Shield, label: "ICAI Verified" }, { icon: Lock, label: "100% Confidential" }].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 text-xs text-slate-300 font-medium">
                  <Icon className="w-3.5 h-3.5 text-emerald-400" /> {label}
                </div>
              ))}
            </motion.div>

            {/* Quote carousel — synced with rotating word */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <QuoteCarousel activeIdx={activeIdx} />
            </motion.div>
          </div>

        </div>

        {/* ── Bottom Stats Bar ── */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 border-t border-white/8 pt-8">
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
