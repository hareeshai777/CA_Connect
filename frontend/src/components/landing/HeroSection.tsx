"use client";

import { motion, animate, useInView, useMotionValue } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useRef, useMemo, useEffect, useState } from "react";
import * as THREE from "three";
import Link from "next/link";
import { ArrowRight, CalendarCheck, TrendingUp, Shield, Award, Users, CheckCircle, Star } from "lucide-react";
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

// ─── Hero ─────────────────────────────────────────────────────────────────────

const heroStats = [
  { to: 10000, suffix: "+", label: "Clients Served", icon: Users },
  { to: 500, suffix: "+", label: "Verified CAs", icon: Award },
  { to: 98, suffix: "%", label: "Success Rate", icon: CheckCircle },
  { to: 4.9, suffix: "★", decimals: 1, label: "Avg Rating", icon: Star },
];

const trustBadges = [
  { icon: Shield, label: "ICAI Verified" },
  { icon: TrendingUp, label: "Tax-Efficient" },
  { icon: Award, label: "Top Rated" },
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
              India&apos;s Premier CA Platform
            </motion.div>

            {/* Headline */}
            <motion.h1 initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.1 }}
              className="text-5xl md:text-6xl xl:text-7xl font-extrabold text-white leading-[1.05] tracking-tight mb-6">
              Empowering Your
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400 mt-1">
                Financial Future
              </span>
              With Proven Strategies
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-slate-300/80 leading-relaxed mb-9 max-w-2xl">
              Connect with ICAI-verified Chartered Accountants for GST, income tax, company registration, audits, and wealth management.
              Expert guidance starting at just <span className="text-blue-300 font-bold">₹499</span>.
            </motion.p>

            {/* CTAs */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 mb-10">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                <Button size="xl" className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-14 px-8 rounded-xl text-base shadow-2xl shadow-blue-700/40 border-0" asChild>
                  <Link href="/services">
                    <CalendarCheck className="mr-2 w-5 h-5" />
                    Get Started
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

          {/* Right — 2 cols — Glass info card */}
          <motion.div initial={{ opacity: 0, x: 40, scale: 0.95 }} animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="lg:col-span-2 hidden lg:flex flex-col gap-4">

            {/* Main glass card */}
            <div className="bg-white/[0.05] backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl">
              <p className="text-xs text-blue-300 font-semibold uppercase tracking-widest mb-4">Why Choose CAConnect</p>
              {[
                { pct: 98, label: "Client Satisfaction Rate", color: "from-blue-500 to-cyan-400" },
                { pct: 95, label: "On-Time Filing Rate", color: "from-emerald-500 to-teal-400" },
                { pct: 100, label: "ICAI-Verified Professionals", color: "from-violet-500 to-purple-400" },
              ].map((item, i) => (
                <motion.div key={item.label} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.12 }} className="mb-4">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-300 font-medium">{item.label}</span>
                    <span className="text-white font-bold">{item.pct}%</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${item.pct}%` }}
                      transition={{ duration: 1.5, delay: 0.8 + i * 0.15, ease: "easeOut" }}
                      className={`h-full bg-gradient-to-r ${item.color} rounded-full`} />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Floating mini cards */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { val: "₹85K", label: "Avg Tax Saved", color: "text-emerald-400" },
                { val: "2 min", label: "Booking Time", color: "text-blue-400" },
                { val: "9 days", label: "Company Reg.", color: "text-violet-400" },
                { val: "24/7", label: "CA Support", color: "text-amber-400" },
              ].map((item, i) => (
                <motion.div key={item.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 + i * 0.08 }}
                  className="bg-white/[0.05] border border-white/10 rounded-2xl p-4 backdrop-blur-sm text-center hover:bg-white/10 transition-colors">
                  <p className={`text-xl font-extrabold ${item.color}`}>{item.val}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{item.label}</p>
                </motion.div>
              ))}
            </div>
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
