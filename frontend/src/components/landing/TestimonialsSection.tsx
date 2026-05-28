"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const testimonials = [
  {
    name: "Priya Sharma", role: "Founder, TechVenture Pvt Ltd", initials: "PS", rating: 5,
    comment: "CA Pro helped me find a brilliant CA for my startup's GST filing. The entire process from finding to booking was seamless. Compliance issues solved within a day!",
    service: "GST Filing", color: "from-pink-500 to-rose-500",
  },
  {
    name: "Rajesh Kumar", role: "Senior Manager, MNC", initials: "RK", rating: 5,
    comment: "Filing income tax was always a headache. With CA Pro, I found a certified CA who found deductions I wasn't aware of and saved me ₹85,000 in taxes. Absolutely worth it!",
    service: "Income Tax Filing", color: "from-blue-500 to-indigo-500",
  },
  {
    name: "Anita Desai", role: "E-commerce Entrepreneur", initials: "AD", rating: 5,
    comment: "Company registration that I thought would take months was done in 2 weeks! The CA was professional, responsive, and guided me through every single step.",
    service: "Company Registration", color: "from-emerald-500 to-teal-500",
  },
  {
    name: "Mohammed Ali", role: "Restaurant Owner", initials: "MA", rating: 5,
    comment: "WhatsApp reminders and Google Meet integration make consultations super convenient. My CA keeps all my business accounts perfectly maintained every month.",
    service: "Accounting Services", color: "from-amber-500 to-orange-500",
  },
  {
    name: "Sunita Patel", role: "HR Director, IT Company", initials: "SP", rating: 5,
    comment: "Our payroll processing and PF compliance has been flawless since we started using CA Pro. Our dedicated CA is always available and responds instantly.",
    service: "Payroll Services", color: "from-violet-500 to-purple-500",
  },
  {
    name: "Arjun Reddy", role: "Angel Investor", initials: "AR", rating: 5,
    comment: "The AI-powered CA recommendation was spot on. Got matched with a CA who specializes in investment compliance. The whole consultation was worth every rupee.",
    service: "Financial Planning", color: "from-teal-500 to-cyan-500",
  },
];

export function TestimonialsSection() {
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState(1);

  useEffect(() => {
    const t = setInterval(() => { setDir(1); setIdx(i => (i + 1) % testimonials.length); }, 6000);
    return () => clearInterval(t);
  }, []);

  const prev = () => { setDir(-1); setIdx(i => (i - 1 + testimonials.length) % testimonials.length); };
  const next = () => { setDir(1); setIdx(i => (i + 1) % testimonials.length); };

  const t = testimonials[idx];

  return (
    <section className="relative overflow-hidden bg-[#0d1b4a] py-24">
      {/* Dot grid */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.8) 1px,transparent 1px)", backgroundSize: "28px 28px" }} />

      {/* Glow */}
      <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.3, 0.15] }}
        transition={{ duration: 12, repeat: Infinity }}
        className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[130px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left — heading + CTA */}
          <div>
            <motion.div initial={{ opacity: 0, scaleX: 0 }} whileInView={{ opacity: 1, scaleX: 1 }} viewport={{ once: true }}
              className="w-12 h-1 bg-blue-400 rounded-full mb-5" />
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-3">
              Client Testimonials
            </motion.p>
            <motion.h2 initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-6">
              What Our Clients
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                Are Saying
              </span>
            </motion.h2>
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
              className="text-slate-300/80 text-lg leading-relaxed mb-8 max-w-lg">
              Don&apos;t take our word for it. Read what thousands of satisfied clients say about our CA professionals and platform.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 px-8 font-bold shadow-lg shadow-blue-700/30" asChild>
                <Link href="/services">Get Your Consultation</Link>
              </Button>
            </motion.div>

            {/* Navigation */}
            <div className="flex items-center gap-4 mt-10">
              <button onClick={prev}
                className="w-11 h-11 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex gap-2">
                {testimonials.map((_, i) => (
                  <button key={i} onClick={() => { setDir(i > idx ? 1 : -1); setIdx(i); }}
                    className={`transition-all duration-300 rounded-full ${i === idx ? "w-6 h-2 bg-blue-400" : "w-2 h-2 bg-white/20 hover:bg-white/40"}`} />
                ))}
              </div>
              <button onClick={next}
                className="w-11 h-11 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Right — testimonial card */}
          <div className="relative">
            <AnimatePresence mode="wait" custom={dir}>
              <motion.div key={idx}
                custom={dir}
                initial={{ opacity: 0, x: dir * 60, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: dir * -60, scale: 0.95 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="bg-white/[0.06] backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">

                <Quote className="w-10 h-10 text-blue-400/40 mb-5" />

                {/* Stars */}
                <div className="flex gap-1 mb-5">
                  {Array(t.rating).fill(0).map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
                  ))}
                </div>

                <p className="text-white/90 text-lg leading-relaxed mb-8 font-medium">
                  &ldquo;{t.comment}&rdquo;
                </p>

                <div className="flex items-center gap-4 pt-6 border-t border-white/10">
                  <Avatar className="h-12 w-12 shrink-0">
                    <AvatarFallback className={`bg-gradient-to-br ${t.color} text-white font-bold text-sm`}>
                      {t.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-base">{t.name}</p>
                    <p className="text-slate-400 text-sm truncate">{t.role}</p>
                  </div>
                  <span className={`shrink-0 text-[10px] font-bold bg-gradient-to-r ${t.color} bg-clip-text text-transparent border border-white/10 rounded-full px-3 py-1`}>
                    {t.service}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Stack effect behind card */}
            <div className="absolute -bottom-3 left-4 right-4 h-full bg-white/[0.03] border border-white/5 rounded-3xl -z-10 scale-[0.97]" />
            <div className="absolute -bottom-6 left-8 right-8 h-full bg-white/[0.02] border border-white/5 rounded-3xl -z-20 scale-[0.94]" />
          </div>
        </div>

        {/* Thumbnail row */}
        <div className="flex justify-center gap-4 mt-12 flex-wrap">
          {testimonials.map((test, i) => (
            <motion.button key={i} onClick={() => { setDir(i > idx ? 1 : -1); setIdx(i); }}
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-2.5 px-4 py-2 rounded-xl border transition-all duration-200 ${
                i === idx
                  ? "bg-white/10 border-white/25 text-white shadow-lg"
                  : "bg-transparent border-white/8 text-slate-400 hover:border-white/20"
              }`}>
              <Avatar className="h-7 w-7 shrink-0">
                <AvatarFallback className={`bg-gradient-to-br ${test.color} text-white text-[10px] font-bold`}>
                  {test.initials}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs font-medium">{test.name.split(" ")[0]}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}
