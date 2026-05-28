"use client";

import Link from "next/link";
import { Briefcase, Shield, Star, Users, TrendingUp, CheckCircle, Award } from "lucide-react";
import { motion } from "framer-motion";

const stats = [
  { value: "500+", label: "Verified CAs", icon: Award },
  { value: "10,000+", label: "Happy Clients", icon: Users },
  { value: "₹50Cr+", label: "Tax Saved", icon: TrendingUp },
  { value: "4.9★", label: "Avg Rating", icon: Star },
];

const features = [
  "ICAI-verified CA professionals",
  "Auto Google Meet link on booking",
  "Secure Razorpay payments",
  "Real-time booking confirmation",
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">

      {/* ── Left Panel ── */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden flex-col justify-between p-12"
        style={{ background: "linear-gradient(145deg, #0a0f2e 0%, #0f1645 40%, #0d0b35 70%, #120828 100%)" }}>

        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: "linear-gradient(rgba(148,130,255,0.6) 1px,transparent 1px), linear-gradient(90deg,rgba(148,130,255,0.6) 1px,transparent 1px)", backgroundSize: "44px 44px" }} />

        {/* Glow blobs */}
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full blur-[130px] pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(99,60,220,0.5) 0%, transparent 70%)" }} />
        <motion.div animate={{ scale: [1, 1.25, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 11, repeat: Infinity, delay: 3 }}
          className="absolute bottom-0 right-0 w-[450px] h-[450px] rounded-full blur-[120px] pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(14,165,233,0.3) 0%, transparent 70%)" }} />

        {/* Logo */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="relative z-10">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center backdrop-blur border border-white/10">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-extrabold text-white tracking-tight">
              CA<span className="text-amber-400">Connect</span>
            </span>
          </Link>
        </motion.div>

        {/* Center content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
            <p className="text-xs font-bold text-violet-300 uppercase tracking-widest mb-4">
              India&apos;s Most Trusted CA Platform
            </p>
            <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight mb-5 tracking-tight">
              Expert CAs for<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
                Every Financial Need
              </span>
            </h1>
            <p className="text-slate-400 text-base leading-relaxed mb-8 max-w-md">
              Connect with ICAI-verified Chartered Accountants for GST, taxes, company registration, audits & more.
            </p>
          </motion.div>

          {/* Feature list */}
          <motion.ul initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="space-y-3 mb-10">
            {features.map((f, i) => (
              <motion.li key={f} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.08 }}
                className="flex items-center gap-3 text-sm text-slate-300">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                </div>
                {f}
              </motion.li>
            ))}
          </motion.ul>

          {/* Stats grid */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-2 gap-3">
            {stats.map((s, i) => (
              <motion.div key={s.label}
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.55 + i * 0.07 }}
                className="bg-white/[0.05] border border-white/8 rounded-2xl p-4 backdrop-blur-sm hover:bg-white/[0.08] transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  <s.icon className="w-4 h-4 text-violet-300" />
                </div>
                <p className="text-xl font-extrabold text-white leading-none">{s.value}</p>
                <p className="text-xs text-slate-400 mt-1">{s.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="relative z-10 flex items-center gap-2 text-slate-500 text-xs">
          <Shield className="w-3.5 h-3.5 text-emerald-500/60" />
          <span>Secure · Verified · Trusted by 10,000+ clients</span>
          <span className="ml-auto">© {new Date().getFullYear()} CAConnect</span>
        </motion.div>
      </div>

      {/* ── Right Panel — Form ── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-brand-600 to-brand-800 rounded-xl flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-extrabold">CA<span className="text-amber-500">Connect</span></span>
            </Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
