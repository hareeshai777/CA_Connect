"use client";

import { motion, useScroll, useTransform, animate, useInView, useMotionValue } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight, Shield, Star, Users, CheckCircle,
  Award, Zap, Building2,
  IndianRupee, CalendarCheck, MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef, useEffect, useState } from "react";

const stats = [
  { to: 10000, suffix: "+", label: "Total Clients", icon: Users, color: "text-blue-400" },
  { to: 500, suffix: "+", label: "Verified CAs", icon: Award, color: "text-purple-400" },
  { to: 25000, suffix: "+", label: "Registrations Done", icon: CheckCircle, color: "text-green-400" },
  { to: 4.9, suffix: "★", decimals: 1, label: "Satisfaction", icon: Star, color: "text-yellow-400" },
];

const trustBadges = [
  { label: "ICAI Verified", icon: Shield },
  { label: "Secure Payments", icon: Zap },
  { label: "Money-back Guarantee", icon: CheckCircle },
  { label: "100% Confidential", icon: Award },
];

const floatingCards = [
  {
    title: "Company Registration",
    subtitle: "Pvt Ltd incorporated",
    value: "In 7 days",
    icon: Building2,
    color: "from-purple-500 to-purple-600",
    position: "top-[20%] right-[3%]",
    delay: 1.0,
  },
  {
    title: "Consultation Booked",
    subtitle: "CA Priya Sharma",
    value: "Today 3:00 PM",
    icon: CalendarCheck,
    color: "from-green-500 to-green-600",
    position: "bottom-[25%] left-[2%]",
    delay: 1.2,
  },
  {
    title: "₹499 Paid",
    subtitle: "Razorpay · Secure",
    value: "Instantly confirmed",
    icon: IndianRupee,
    color: "from-orange-500 to-orange-600",
    position: "bottom-[28%] right-[2%]",
    delay: 1.4,
  },
];

function Counter({ to, suffix = "", decimals = 0 }: { to: number; suffix?: string; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const count = useMotionValue(0);
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!isInView) return;
    const controls = animate(count, to, { duration: 2.2, ease: "easeOut" });
    const unsubscribe = count.on("change", (v) => {
      const formatted = decimals > 0
        ? v.toFixed(decimals)
        : Math.floor(v).toLocaleString("en-IN");
      setDisplay(`${formatted}${suffix}`);
    });
    return () => { controls.stop(); unsubscribe(); };
  }, [isInView]);

  return <span ref={ref}>{display || `0${suffix}`}</span>;
}

const rotatingWords = ["Taxation", "GST Filing", "Compliance", "Registrations", "Audit"];

function RotatingWord() {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx((i) => (i + 1) % rotatingWords.length);
        setVisible(true);
      }, 300);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <span
      className="bg-gradient-to-r from-yellow-300 via-orange-300 to-yellow-200 bg-clip-text text-transparent inline-block transition-all duration-300"
      style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(8px)" }}
    >
      {rotatingWords[idx]}
    </span>
  );
}

const FloatingCard = ({ card }: { card: (typeof floatingCards)[0] }) => (
  <motion.div
    initial={{ opacity: 0, y: 30, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.6, delay: card.delay }}
    whileHover={{ scale: 1.06, y: -4 }}
    className={`absolute ${card.position} hidden lg:flex items-center gap-3 bg-white rounded-2xl p-3 shadow-2xl border border-border z-20 max-w-[200px] cursor-default`}
    style={{ animation: `float 4s ease-in-out infinite ${card.delay}s` }}
  >
    <div className={`w-9 h-9 bg-gradient-to-br ${card.color} rounded-xl flex items-center justify-center shrink-0 shadow-lg`}>
      <card.icon className="w-4 h-4 text-white" />
    </div>
    <div className="min-w-0">
      <p className="font-semibold text-xs leading-tight truncate">{card.title}</p>
      <p className="text-[10px] text-muted-foreground truncate">{card.subtitle}</p>
      <p className={`text-[10px] font-bold bg-gradient-to-r ${card.color} bg-clip-text text-transparent`}>{card.value}</p>
    </div>
    <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white animate-pulse" />
  </motion.div>
);

export function HeroSection() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);

  return (
    <section ref={containerRef} className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700" />

      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
        }}
      />

      <motion.div style={{ y }} className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.15, 0.1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-white/10 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.28, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-400/20 rounded-full blur-[100px]"
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-300/10 rounded-full blur-[80px]" />
      </motion.div>

      {floatingCards.map((card) => (
        <FloatingCard key={card.title} card={card} />
      ))}

      <div className="container mx-auto px-4 py-24 relative z-10">
        <div className="max-w-5xl mx-auto text-center">

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 bg-white/15 border border-white/30 rounded-full px-4 py-2 text-sm font-medium text-white mb-6 backdrop-blur-sm"
          >
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            India&apos;s Most Trusted CA Platform
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold font-heading text-white mb-6 leading-tight tracking-tight"
          >
            Expert CAs for{" "}
            <RotatingWord />
            <br />
            <span className="text-white/90">& More</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl md:text-2xl text-blue-100 mb-10 max-w-3xl mx-auto leading-relaxed"
          >
            Book a consultation for just{" "}
            <span className="font-bold text-yellow-300">₹499</span>
            . Verified CAs for all your business and personal finance needs.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-10"
          >
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Button
                size="xl"
                className="bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 shadow-2xl shadow-yellow-500/30 rounded-2xl font-bold text-lg px-10 py-4 h-auto border-0 text-gray-900"
                asChild
              >
                <Link href="/services">
                  <CalendarCheck className="mr-2 h-5 w-5" />
                  Book Consultation — ₹499
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Button
                size="xl"
                variant="outline"
                className="rounded-2xl border-2 border-white/40 text-white hover:bg-white/15 hover:border-white/60 font-semibold text-lg px-8 h-auto backdrop-blur-sm bg-white/10"
                asChild
              >
                <Link href="/services">
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Explore Services
                </Link>
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-3 mb-16"
          >
            {trustBadges.map(({ label, icon: Icon }) => (
              <motion.div
                key={label}
                whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.25)" }}
                className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm border border-white/30 rounded-full px-3 py-1.5 text-xs font-medium text-white cursor-default"
              >
                <Icon className="w-3.5 h-3.5 text-green-400" />
                {label}
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.5 + i * 0.1 }}
                whileHover={{ scale: 1.06, backgroundColor: "rgba(255,255,255,0.25)" }}
                className="text-center p-5 bg-white/15 backdrop-blur-md rounded-2xl border border-white/25 transition-colors group cursor-default"
              >
                <div className="flex justify-center mb-2">
                  <stat.icon className={`w-5 h-5 ${stat.color} group-hover:scale-110 transition-transform`} />
                </div>
                <div className="text-2xl font-bold font-heading text-white mb-1">
                  <Counter to={stat.to} suffix={stat.suffix} decimals={stat.decimals || 0} />
                </div>
                <div className="text-xs text-blue-100/80">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-10">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="block">
          <path
            d="M0 40L60 36.7C120 33.3 240 26.7 360 30C480 33.3 600 46.7 720 46.7C840 46.7 960 33.3 1080 30C1200 26.7 1320 33.3 1380 36.7L1440 40V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0V40Z"
            className="fill-background"
          />
        </svg>
      </div>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </section>
  );
}
