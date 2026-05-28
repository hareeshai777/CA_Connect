"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Founder, TechVenture Pvt Ltd",
    initials: "PS",
    rating: 5,
    comment: "CA Pro helped me find a brilliant CA for my startup's GST filing. The entire process from finding to booking was seamless. The CA solved our compliance issues within a day.",
    service: "GST Filing",
    color: "bg-pink-100 text-pink-700",
  },
  {
    name: "Rajesh Kumar",
    role: "Senior Manager, MNC",
    initials: "RK",
    rating: 5,
    comment: "Filing income tax was always a headache. With CA Pro, my CA found deductions I wasn't aware of and saved me ₹85,000 in taxes!",
    service: "Income Tax Filing",
    color: "bg-blue-100 text-blue-700",
  },
  {
    name: "Anita Desai",
    role: "E-commerce Entrepreneur",
    initials: "AD",
    rating: 5,
    comment: "Company registration that I thought would take months was done in 2 weeks! The CA on CA Pro was professional, responsive, and guided me through every step.",
    service: "Company Registration",
    color: "bg-green-100 text-green-700",
  },
  {
    name: "Mohammed Ali",
    role: "Restaurant Owner",
    initials: "MA",
    rating: 5,
    comment: "Excellent platform! WhatsApp reminders and Google Meet integration make consultations super convenient. My CA keeps all my accounts perfectly maintained.",
    service: "Accounting Services",
    color: "bg-orange-100 text-orange-700",
  },
  {
    name: "Sunita Patel",
    role: "HR Director, IT Company",
    initials: "SP",
    rating: 5,
    comment: "Our payroll processing and PF compliance has been flawless since we started using CA Pro. Our CA is always available and responds to queries quickly.",
    service: "Payroll Services",
    color: "bg-purple-100 text-purple-700",
  },
  {
    name: "Arjun Reddy",
    role: "Angel Investor",
    initials: "AR",
    rating: 5,
    comment: "The AI-powered CA recommendation was spot on. Got matched with a CA who specializes in investment compliance. The whole consultation was worth every rupee.",
    service: "Financial Planning",
    color: "bg-teal-100 text-teal-700",
  },
  {
    name: "Kavitha Nair",
    role: "Startup Founder",
    initials: "KN",
    rating: 5,
    comment: "From trademark registration to annual compliance, CA Pro handles everything. I saved 40+ hours in the first month alone. Highly recommend!",
    service: "Business Compliance",
    color: "bg-indigo-100 text-indigo-700",
  },
  {
    name: "Suresh Verma",
    role: "Small Business Owner",
    initials: "SV",
    rating: 5,
    comment: "Booked a consultation in under 2 minutes. The CA was incredibly thorough and identified tax savings opportunities I never knew existed.",
    service: "Income Tax Filing",
    color: "bg-rose-100 text-rose-700",
  },
];

function TestimonialCard({ t }: { t: (typeof testimonials)[0] }) {
  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
      className="flex-shrink-0 w-80 bg-white rounded-2xl p-5 border border-border shadow-sm mx-3 cursor-default"
    >
      <div className="flex items-start justify-between mb-3">
        <Quote className="w-7 h-7 text-brand-200 shrink-0" />
        <div className="flex gap-0.5">
          {[...Array(t.rating)].map((_, i) => (
            <Star key={i} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
          ))}
        </div>
      </div>
      <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-3">&ldquo;{t.comment}&rdquo;</p>
      <div className="flex items-center gap-3 pt-3 border-t border-border">
        <Avatar className="h-9 w-9 shrink-0">
          <AvatarFallback className={`${t.color} font-bold text-xs`}>{t.initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{t.name}</p>
          <p className="text-xs text-muted-foreground truncate">{t.role}</p>
        </div>
        <span className="text-[10px] bg-brand-50 text-brand-700 px-2 py-1 rounded-full shrink-0 font-medium">{t.service}</span>
      </div>
    </motion.div>
  );
}

const row1 = [...testimonials.slice(0, 4), ...testimonials.slice(0, 4)];
const row2 = [...testimonials.slice(4), ...testimonials.slice(4)];

export function TestimonialsSection() {
  return (
    <section className="section-padding bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-sm font-semibold text-brand-600 uppercase tracking-wider mb-3"
          >
            Testimonials
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold font-heading mb-4"
          >
            Trusted by Thousands
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            Real stories from businesses and individuals who transformed their financial compliance.
          </motion.p>
        </div>
      </div>

      {/* Row 1 — scrolls left */}
      <div className="relative mb-5">
        <div className="flex marquee-left">
          {row1.map((t, i) => <TestimonialCard key={`r1-${i}`} t={t} />)}
        </div>
      </div>

      {/* Row 2 — scrolls right */}
      <div className="relative">
        <div className="flex marquee-right">
          {row2.map((t, i) => <TestimonialCard key={`r2-${i}`} t={t} />)}
        </div>
      </div>

      {/* Fade edges */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-gray-50 to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10" />

      <style jsx global>{`
        @keyframes marquee-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-right {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .marquee-left {
          animation: marquee-left 35s linear infinite;
          width: max-content;
        }
        .marquee-right {
          animation: marquee-right 35s linear infinite;
          width: max-content;
        }
        .marquee-left:hover,
        .marquee-right:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
