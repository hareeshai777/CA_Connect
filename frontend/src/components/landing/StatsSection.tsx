"use client";

import { motion, animate, useInView, useMotionValue } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, TrendingUp, Users, CheckCircle, Award, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const stats = [
  { to: 10, suffix: "+", label: "Years in Business", icon: Award, color: "from-amber-500 to-orange-500", glow: "shadow-amber-500/20" },
  { to: 50, suffix: "Cr+", label: "Tax Saved for Clients", icon: TrendingUp, color: "from-emerald-500 to-teal-500", glow: "shadow-emerald-500/20" },
  { to: 98, suffix: "%", label: "Client Satisfaction", icon: CheckCircle, color: "from-blue-500 to-cyan-400", glow: "shadow-blue-500/20" },
  { to: 25000, suffix: "+", label: "Cases Handled", icon: Users, color: "from-violet-500 to-purple-500", glow: "shadow-violet-500/20" },
];

function Counter({ to, suffix = "", decimals = 0 }: { to: number; suffix?: string; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const count = useMotionValue(0);
  const [display, setDisplay] = useState("0");
  useEffect(() => {
    if (!isInView) return;
    const ctrl = animate(count, to, { duration: 2.2, ease: "easeOut" });
    const unsub = count.on("change", v =>
      setDisplay(decimals > 0 ? v.toFixed(decimals) : Math.floor(v).toLocaleString("en-IN"))
    );
    return () => { ctrl.stop(); unsub(); };
  }, [isInView]);
  return <span ref={ref}>{display}{suffix}</span>;
}

export function StatsSection() {
  return (
    <section className="relative overflow-hidden py-28">
      {/* Background */}
      <div className="absolute inset-0 bg-[#070e2b]" />

      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.06]"
        style={{ backgroundImage: "linear-gradient(rgba(99,102,241,0.8) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.8) 1px,transparent 1px)", backgroundSize: "44px 44px" }} />

      {/* Gradient glow blobs */}
      <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.35, 0.15] }}
        transition={{ duration: 12, repeat: Infinity }}
        className="absolute -left-40 top-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-700/20 rounded-full blur-[130px] pointer-events-none" />
      <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.25, 0.1] }}
        transition={{ duration: 10, repeat: Infinity, delay: 3 }}
        className="absolute -right-40 top-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-700/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-5 gap-16 items-center mb-16">

          {/* Left — 3 cols */}
          <div className="lg:col-span-3">
            <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/25 rounded-full px-4 py-1.5 text-xs font-bold text-blue-400 uppercase tracking-widest mb-5">
              <Sparkles className="w-3.5 h-3.5" /> Our Track Record
            </motion.div>

            <motion.h2 initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="text-4xl md:text-5xl xl:text-6xl font-extrabold text-white leading-tight mb-6 tracking-tight">
              Your Trusted Partner
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 mt-1">
                With Proven Excellence
              </span>
            </motion.h2>

            <motion.p initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 }}
              className="text-slate-400 text-lg leading-relaxed mb-10 max-w-lg">
              We&apos;ve helped thousands of individuals and businesses achieve financial clarity, compliance, and growth through expert CA services.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl h-13 px-8 font-bold shadow-xl shadow-blue-700/30 border-0 text-base" asChild>
                <Link href="/services">Learn More About Us <ArrowRight className="ml-2 w-4 h-4" /></Link>
              </Button>
            </motion.div>
          </div>

          {/* Right — 2 cols — Premium visual */}
          <div className="lg:col-span-2 hidden lg:flex items-center justify-center relative h-80">
            {/* Outer glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-cyan-600/5 rounded-3xl blur-2xl" />

            {/* Pulsing rings */}
            {[1, 2, 3, 4].map((ring) => (
              <motion.div key={ring}
                animate={{ scale: [1, 1.06, 1], opacity: [0.08, 0.22, 0.08] }}
                transition={{ duration: 3 + ring, repeat: Infinity, delay: ring * 0.7, ease: "easeInOut" }}
                className="absolute rounded-full border border-cyan-400/30"
                style={{ width: `${ring * 90}px`, height: `${ring * 90}px` }}
              />
            ))}

            {/* Center orb */}
            <motion.div
              animate={{ boxShadow: ["0 0 30px 8px rgba(59,130,246,0.25)", "0 0 60px 20px rgba(6,182,212,0.35)", "0 0 30px 8px rgba(59,130,246,0.25)"] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative z-10 w-28 h-28 rounded-full bg-gradient-to-br from-blue-500 via-cyan-400 to-blue-600 flex items-center justify-center">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                className="absolute inset-2 rounded-full border-2 border-dashed border-white/25" />
              <TrendingUp className="w-11 h-11 text-white drop-shadow-lg" />
            </motion.div>

            {/* Orbiting dots with trails */}
            {[
              { delay: 0, color: "bg-blue-400", duration: 10 },
              { delay: 2.5, color: "bg-cyan-400", duration: 14 },
              { delay: 5, color: "bg-indigo-400", duration: 12 },
            ].map((dot, i) => (
              <motion.div key={i}
                animate={{ rotate: [0, 360] }}
                transition={{ duration: dot.duration, repeat: Infinity, ease: "linear", delay: dot.delay }}
                className="absolute"
                style={{ width: `${(i + 2) * 90}px`, height: `${(i + 2) * 90}px`, transformOrigin: "center" }}>
                <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 ${dot.color} rounded-full shadow-lg`} />
              </motion.div>
            ))}

            {/* Floating label chips */}
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-2 right-4 bg-white/8 backdrop-blur-md border border-white/15 rounded-2xl px-3 py-2 flex items-center gap-2 shadow-xl">
              <div className="w-6 h-6 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div>
                <p className="text-white text-xs font-bold leading-tight">ICAI Verified</p>
                <p className="text-slate-400 text-[10px]">500+ CAs</p>
              </div>
            </motion.div>

            <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-2 left-4 bg-white/8 backdrop-blur-md border border-white/15 rounded-2xl px-3 py-2 flex items-center gap-2 shadow-xl">
              <div className="w-6 h-6 bg-amber-500/20 rounded-lg flex items-center justify-center">
                <Award className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div>
                <p className="text-white text-xs font-bold leading-tight">Top Rated</p>
                <p className="text-slate-400 text-[10px]">4.9★ avg rating</p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-12" />

        {/* Stats grid — premium cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <motion.div key={s.label}
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -6, scale: 1.02 }}
              className={`relative group bg-white/[0.04] border border-white/8 rounded-2xl py-8 px-5 text-center overflow-hidden cursor-default transition-all duration-300 hover:border-white/15 hover:shadow-2xl hover:${s.glow}`}>

              {/* Gradient top accent */}
              <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${s.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

              {/* Icon */}
              <motion.div whileHover={{ rotate: 10, scale: 1.15 }} transition={{ duration: 0.3 }}
                className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${s.color} bg-opacity-20 flex items-center justify-center mx-auto mb-4 shadow-lg`}
                style={{ background: "rgba(255,255,255,0.07)" }}>
                <div className={`w-full h-full rounded-2xl bg-gradient-to-br ${s.color} opacity-20 absolute inset-0`} />
                <s.icon className="w-6 h-6 text-white relative z-10" />
              </motion.div>

              {/* Number */}
              <p className={`text-4xl font-extrabold mb-1 bg-gradient-to-r ${s.color} bg-clip-text text-transparent tracking-tight`}>
                <Counter to={s.to} suffix={s.suffix} />
              </p>

              {/* Label */}
              <p className="text-slate-400 text-sm font-medium">{s.label}</p>

              {/* Hover glow bg */}
              <div className={`absolute inset-0 bg-gradient-to-br ${s.color} opacity-0 group-hover:opacity-[0.05] transition-opacity duration-300 rounded-2xl pointer-events-none`} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
