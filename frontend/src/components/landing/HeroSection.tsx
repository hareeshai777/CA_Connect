"use client";

import { motion, animate, useInView, useMotionValue } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useRef, useMemo, useEffect, useState } from "react";
import * as THREE from "three";
import Link from "next/link";
import { ArrowRight, CalendarCheck, Shield, Award, Users, CheckCircle, Star, Lock as LockIcon, FileText, Building2, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Three.js Particle Field ──────────────────────────────────────────────────

function Particles({ count = 180 }: { count?: number }) {
  const mesh = useRef<THREE.Points>(null!);
  const { positions, speeds } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sp = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8;
      sp[i] = Math.random() * 0.3 + 0.05;
    }
    return { positions: pos, speeds: sp };
  }, [count]);

  useFrame(({ clock }) => {
    if (!mesh.current) return;
    const t = clock.getElapsedTime();
    const pos = mesh.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] += speeds[i] * 0.008;
      if (pos[i * 3 + 1] > 6) pos[i * 3 + 1] = -6;
    }
    mesh.current.geometry.attributes.position.needsUpdate = true;
    mesh.current.rotation.y = t * 0.04;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#818cf8" transparent opacity={0.7} sizeAttenuation />
    </points>
  );
}

function FloatingLines() {
  const group = useRef<THREE.Group>(null!);
  useFrame(({ clock }) => {
    if (!group.current) return;
    group.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.15) * 0.3;
    group.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.1) * 0.1;
  });
  const lineObjects = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => {
      const pts = Array.from({ length: 12 }, (_, j) => new THREE.Vector3(
        -5 + j * 0.9 + (Math.random() - 0.5) * 0.6,
        Math.sin(j * 0.7 + i) * 1.2 + (Math.random() - 0.5) * 0.5,
        (i - 4) * 0.4,
      ));
      const curve = new THREE.CatmullRomCurve3(pts);
      const geom = new THREE.BufferGeometry().setFromPoints(curve.getPoints(60));
      const mat = new THREE.LineBasicMaterial({
        color: i % 2 === 0 ? "#6366f1" : "#3b82f6",
        transparent: true,
        opacity: 0.25 + (i % 3) * 0.08,
      });
      return new THREE.Line(geom, mat);
    });
  }, []);

  return (
    <group ref={group}>
      {lineObjects.map((lineObj, i) => (
        <primitive key={i} object={lineObj} />
      ))}
    </group>
  );
}

function ThreeScene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <Particles count={200} />
      <FloatingLines />
    </>
  );
}

// ─── Counter ─────────────────────────────────────────────────────────────────

function Counter({ to, suffix = "", decimals = 0 }: { to: number; suffix?: string; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const count = useMotionValue(0);
  const [display, setDisplay] = useState(`0${suffix}`);
  useEffect(() => {
    if (!isInView) return;
    const ctrl = animate(count, to, { duration: 2.2, ease: "easeOut" });
    const unsub = count.on("change", v =>
      setDisplay(`${decimals > 0 ? v.toFixed(decimals) : Math.floor(v).toLocaleString("en-IN")}${suffix}`)
    );
    return () => { ctrl.stop(); unsub(); };
  }, [isInView]);
  return <span ref={ref}>{display}</span>;
}

// ─── Rotating Word ───────────────────────────────────────────────────────────

const rotatingWords = ["Tax Filing", "GST Compliance", "Registrations", "Audits", "Payroll"];

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
    <span
      className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-300 transition-all duration-350"
      style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(10px)" }}
    >
      {rotatingWords[idx]}
    </span>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

const heroStats = [
  { to: 10000, suffix: "+", label: "Clients Served", icon: Users },
  { to: 500, suffix: "+", label: "Verified CAs", icon: Award },
  { to: 98, suffix: "%", label: "Success Rate", icon: CheckCircle },
  { to: 4.9, suffix: "★", decimals: 1, label: "Avg Rating", icon: Star },
];

const trustBadges = [
  { icon: Shield, label: "ICAI Verified" },
  { icon: LockIcon, label: "100% Confidential" },
];

export function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-[#0b1120]">

      {/* ── Three.js Canvas background ── */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 8], fov: 60 }} gl={{ alpha: true, antialias: true }}>
          <Suspense fallback={null}>
            <ThreeScene />
          </Suspense>
        </Canvas>
      </div>

      {/* Deep blue gradient overlay */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#0b1120]/95 via-[#0d1b4a]/80 to-[#1a0a5e]/70" />

      {/* Glow blobs */}
      <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.55, 0.3] }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute top-0 left-0 w-[700px] h-[700px] bg-blue-700/20 rounded-full blur-[140px] -translate-x-1/3 -translate-y-1/3 pointer-events-none z-0" />
      <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 14, repeat: Infinity, delay: 3 }}
        className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-700/25 rounded-full blur-[120px] translate-x-1/4 translate-y-1/4 pointer-events-none z-0" />

      {/* ── Content ── */}
      <div className="relative z-10 container mx-auto px-6 pt-28 pb-12 flex flex-col min-h-screen justify-center">

        <div className="grid lg:grid-cols-5 gap-12 items-center">

          {/* Left — 3 cols */}
          <div className="lg:col-span-3">

            {/* Label */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-blue-500/15 border border-blue-500/30 rounded-full px-4 py-1.5 text-xs font-semibold text-blue-300 mb-7 tracking-widest uppercase backdrop-blur-sm">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
              India&apos;s Most Trusted CA Platform
            </motion.div>

            {/* Headline */}
            <motion.h1 initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.1 }}
              className="text-5xl md:text-6xl xl:text-7xl font-extrabold text-white leading-[1.08] tracking-tight mb-6">
              Expert CAs for
              <RotatingWord />
              <span className="block text-white/70 text-5xl md:text-6xl xl:text-7xl mt-1">& More</span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-slate-300/80 leading-relaxed mb-9 max-w-2xl">
              Connect with ICAI-verified Chartered Accountants for all your business and personal finance needs.
              Book a consultation for just <span className="text-amber-400 font-bold">₹499</span>.
            </motion.p>

            {/* CTAs */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 mb-10">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                <Button size="xl" className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-gray-900 font-extrabold h-14 px-8 rounded-xl text-base shadow-2xl shadow-amber-500/30 border-0" asChild>
                  <Link href="/services">
                    <CalendarCheck className="mr-2 w-5 h-5" />
                    Book Consultation — ₹499
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                <Button size="xl" className="bg-transparent border-2 border-white/25 text-white hover:bg-white/10 backdrop-blur-sm h-14 px-8 rounded-xl text-base font-semibold" asChild>
                  <Link href="/services">Explore Services</Link>
                </Button>
              </motion.div>
            </motion.div>

            {/* Trust badges */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-3">
              {trustBadges.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 text-xs text-slate-300 font-medium backdrop-blur-sm">
                  <Icon className="w-3.5 h-3.5 text-blue-400" /> {label}
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — Dashboard Activity Card */}
          <motion.div initial={{ opacity: 0, x: 40, scale: 0.95 }} animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="lg:col-span-2 hidden lg:block relative">

            {/* Glow behind */}
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 to-indigo-600/15 rounded-3xl blur-3xl scale-110 pointer-events-none" />

            {/* Floating CA chip — top right */}
            <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-4 -right-4 z-20 flex items-center gap-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl px-3 py-2 shadow-xl">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">PM</div>
              <div>
                <p className="text-xs font-semibold text-white leading-tight">CA Priya Menon</p>
                <p className="text-[10px] text-slate-300">⭐ 4.9 · Available Now</p>
              </div>
            </motion.div>

            {/* Main dashboard card */}
            <div className="relative bg-white/[0.05] backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">Your CA Dashboard</p>
                  <p className="text-lg font-bold text-white mt-0.5">Recent Activity</p>
                </div>
                <div className="flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-xl px-3 py-1.5">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-xs text-emerald-400 font-semibold">Live</span>
                </div>
              </div>

              {/* Activity items */}
              <div className="space-y-2.5 mb-5">
                {[
                  { icon: CalendarCheck, label: "GST Return Filed", sub: "Today · ARN Generated", color: "from-emerald-500 to-teal-500" },
                  { icon: FileText, label: "ITR-3 Submitted", sub: "Refund ₹24,500 processed", color: "from-blue-500 to-indigo-500" },
                  { icon: Building2, label: "Company Registered", sub: "CIN issued in 9 days", color: "from-violet-500 to-purple-600" },
                  { icon: BarChart3, label: "Audit Completed", sub: "Form 3CD certified", color: "from-rose-500 to-pink-600" },
                ].map((item, i) => (
                  <motion.div key={item.label}
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.55 + i * 0.1 }}
                    className="flex items-center gap-3 bg-white/[0.04] border border-white/8 rounded-2xl p-3 hover:bg-white/[0.07] transition-colors">
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shrink-0 shadow-lg`}>
                      <item.icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{item.label}</p>
                      <p className="text-[11px] text-slate-400 truncate">{item.sub}</p>
                    </div>
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  </motion.div>
                ))}
              </div>

              {/* Mini stats */}
              <div className="grid grid-cols-3 gap-2.5">
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
            </div>

            {/* Floating tax chip — bottom left */}
            <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-4 -left-4 z-20 flex items-center gap-2 bg-amber-500/20 backdrop-blur-lg border border-amber-500/30 rounded-2xl px-3 py-2 shadow-xl">
              <Award className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-amber-300 leading-tight">₹85K Tax Saved</p>
                <p className="text-[10px] text-amber-400/70">This financial year</p>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* ── Stats bar ── */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 pt-10 border-t border-white/8">
          {heroStats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + i * 0.08 }}
              whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.08)" }}
              className="flex items-center gap-3 bg-white/[0.04] border border-white/8 rounded-2xl px-5 py-4 cursor-default backdrop-blur-sm">
              <div className="w-10 h-10 rounded-xl bg-blue-600/25 border border-blue-500/20 flex items-center justify-center shrink-0">
                <s.icon className="w-5 h-5 text-blue-400" />
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
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <svg viewBox="0 0 1440 70" className="block">
          <path d="M0 35L60 31C120 27 240 19 360 23C480 27 600 43 720 43C840 43 960 27 1080 23C1200 19 1320 27 1380 31L1440 35V70H0V35Z" fill="white" />
        </svg>
      </div>
    </section>
  );
}
