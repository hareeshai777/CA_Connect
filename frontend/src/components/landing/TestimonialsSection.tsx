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
    comment: "CA Pro helped me find a brilliant CA for my startup's GST filing. The entire process from finding to booking was seamless. The CA was extremely knowledgeable and solved our compliance issues within a day.",
    service: "GST Filing",
    color: "bg-pink-100 text-pink-700",
  },
  {
    name: "Rajesh Kumar",
    role: "Senior Manager, MNC",
    initials: "RK",
    rating: 5,
    comment: "Filing income tax was always a headache for me. With CA Pro, I found a certified CA who handled everything, found deductions I wasn't aware of, and saved me ₹85,000 in taxes!",
    service: "Income Tax Filing",
    color: "bg-blue-100 text-blue-700",
  },
  {
    name: "Anita Desai",
    role: "E-commerce Entrepreneur",
    initials: "AD",
    rating: 5,
    comment: "Company registration process that I thought would take months was done in 2 weeks! The CA provided on CA Pro was professional, responsive, and guided me through every step.",
    service: "Company Registration",
    color: "bg-green-100 text-green-700",
  },
  {
    name: "Mohammed Ali",
    role: "Restaurant Owner",
    initials: "MA",
    rating: 5,
    comment: "Excellent platform! The WhatsApp reminders and Google Meet integration make consultations super convenient. My CA keeps all my business accounts perfectly maintained.",
    service: "Accounting Services",
    color: "bg-orange-100 text-orange-700",
  },
  {
    name: "Sunita Patel",
    role: "HR Director, IT Company",
    initials: "SP",
    rating: 5,
    comment: "Our payroll processing and PF compliance has been flawless since we started using CA Pro. Our dedicated CA is always available and responds to queries quickly.",
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
];

export function TestimonialsSection() {
  return (
    <section className="section-padding bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
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
            className="text-xl text-muted-foreground"
          >
            Real stories from businesses and individuals who transformed their financial compliance.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, index) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="bg-white rounded-2xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow"
            >
              <Quote className="w-8 h-8 text-brand-200 mb-4" />
              <div className="flex gap-1 mb-4">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-gold-500 fill-gold-500" />
                ))}
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">&ldquo;{t.comment}&rdquo;</p>
              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className={t.color + " font-bold"}>{t.initials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
                <div className="ml-auto">
                  <span className="text-xs bg-brand-50 text-brand-700 px-2 py-1 rounded-full">{t.service}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
