"use client";

import { motion, animate, useInView, useMotionValue } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, TrendingUp, Users, CheckCircle, Award } from "lucide-react";
import { Button } from "@/components/ui/button";

const stats = [
  { to: 10, suffix: "+", label: "Years in Business", icon: Award },
  { to: 50, suffix: "Cr+", label: "Tax Saved for Clients", icon: TrendingUp },
  { to: 98, suffix: "%", label: "Client Satisfaction", icon: CheckCircle },
  { to: 25000, suffix: "+", label: "Cases Handled", icon: Users },
];

function Counter({ to, suffix = "", decimals = 0 }: { to: number; suffix?: string; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const count = useMotionValue(0);
  const [display, setDisplay] = useState(`0`);
  useEffect(() => {
    if (!isInView) return;
    const ctrl = animate(count, to, { duration: 2, ease: "easeOut" });
    const unsub = count.on("change", v =>
      setDisplay(decimals > 0 ? v.toFixed(decimals) : Math.floor(v).toLocaleString("en-IN"))
    );
    return () => { ctrl.stop(); unsub(); };
  }, [isInView]);
  return <span ref={ref}>{display}{suffix}</span>;
}

export function StatsSection() {
  return (
    <section className="relative overflow-hidden bg-[#0d1b4a] py-24">
      {/* Decorative grid */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.6) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />

      {/* Glow */}
      <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute left-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left — text */}
          <div>
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-4">
              Our Track Record
            </motion.p>
            <motion.h2 initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-6">
              Your Trusted Partner<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                With Proven Excellence
              </span>
            </motion.h2>
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.15 }}
              className="text-slate-300/80 text-lg leading-relaxed mb-8 max-w-lg">
              We&apos;ve helped thousands of individuals and businesses achieve financial clarity, compliance, and growth through expert CA services.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 px-8 font-bold shadow-lg shadow-blue-700/30" asChild>
                <Link href="/services">Learn More About Us <ArrowRight className="ml-2 w-4 h-4" /></Link>
              </Button>
            </motion.div>
          </div>

          {/* Right — animated rings visual */}
          <div className="relative flex items-center justify-center h-72 hidden lg:flex">
            {[1, 2, 3].map((ring) => (
              <motion.div key={ring}
                animate={{ scale: [1, 1.08, 1], opacity: [0.15, 0.35, 0.15] }}
                transition={{ duration: 4 + ring, repeat: Infinity, delay: ring * 0.8 }}
                className="absolute rounded-full border border-blue-400/30"
                style={{ width: `${ring * 120}px`, height: `${ring * 120}px` }}
              />
            ))}
            {/* Center orb */}
            <div className="relative z-10 w-28 h-28 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-2xl shadow-blue-500/40">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-2 rounded-full border-2 border-dashed border-white/20" />
              <TrendingUp className="w-10 h-10 text-white" />
            </div>
            {/* Orbiting dots */}
            {[0, 90, 180, 270].map((deg, i) => (
              <motion.div key={deg}
                animate={{ rotate: [deg, deg + 360] }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear", delay: i * 0.5 }}
                className="absolute w-full h-full"
                style={{ transformOrigin: "center" }}>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-400 rounded-full shadow-lg shadow-blue-400/50" />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mt-16 pt-10 border-t border-white/8">
          {stats.map((s, i) => (
            <motion.div key={s.label}
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4, backgroundColor: "rgba(255,255,255,0.06)" }}
              className="text-center bg-white/[0.03] border border-white/8 rounded-2xl py-6 px-4 cursor-default transition-all">
              <div className="flex justify-center mb-3">
                <div className="w-11 h-11 rounded-xl bg-blue-600/20 border border-blue-500/20 flex items-center justify-center">
                  <s.icon className="w-5 h-5 text-blue-400" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-white mb-1">
                <Counter to={s.to} suffix={s.suffix} decimals={0} />
              </p>
              <p className="text-xs text-slate-400">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
