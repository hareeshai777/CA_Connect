"use client";

import { motion } from "framer-motion";
import { Shield, Zap, Star, Clock, Lock, Video } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "ICAI Verified CAs",
    description: "Every CA on our platform is manually verified with valid ICAI membership and authentic credentials.",
    gradient: "from-blue-500 to-cyan-500",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    glow: "group-hover:shadow-blue-200",
  },
  {
    icon: Zap,
    title: "Instant Booking",
    description: "Book a consultation in under 2 minutes. Real-time slot availability with instant confirmation.",
    gradient: "from-yellow-500 to-orange-400",
    iconBg: "bg-yellow-50",
    iconColor: "text-yellow-600",
    glow: "group-hover:shadow-yellow-200",
  },
  {
    icon: Star,
    title: "Transparent Reviews",
    description: "Genuine client reviews and ratings help you make informed decisions every time.",
    gradient: "from-amber-500 to-yellow-400",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    glow: "group-hover:shadow-amber-200",
  },
  {
    icon: Video,
    title: "Google Meet Integration",
    description: "Automatic Meet link generation with calendar invite sent to all parties instantly.",
    gradient: "from-green-500 to-emerald-500",
    iconBg: "bg-green-50",
    iconColor: "text-green-600",
    glow: "group-hover:shadow-green-200",
  },
  {
    icon: Lock,
    title: "Secure Payments",
    description: "Razorpay-powered payments with UPI, cards, and net banking. PCI-DSS compliant.",
    gradient: "from-purple-500 to-violet-500",
    iconBg: "bg-purple-50",
    iconColor: "text-purple-600",
    glow: "group-hover:shadow-purple-200",
  },
  {
    icon: Clock,
    title: "Flexible Scheduling",
    description: "Morning, afternoon, or evening — book consultations that fit your schedule, including weekends.",
    gradient: "from-orange-500 to-red-400",
    iconBg: "bg-orange-50",
    iconColor: "text-orange-600",
    glow: "group-hover:shadow-orange-200",
  },
];

export function WhyChooseUs() {
  return (
    <section className="section-padding bg-gradient-to-b from-white to-slate-50/60">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-sm font-semibold text-brand-600 uppercase tracking-wider mb-3"
          >
            Why CA Pro
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold font-heading mb-4"
          >
            The Smarter Way to Get CA Services
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            Purpose-built for India&apos;s professionals and businesses.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.07, duration: 0.4 }}
              whileHover={{ y: -6 }}
              className={`group relative p-6 bg-white rounded-2xl border border-border shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-default ${feature.glow}`}
            >
              {/* Gradient shine on hover */}
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br ${feature.gradient} pointer-events-none`}
                style={{ opacity: 0 }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.04")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "0")}
              />

              {/* Top accent bar */}
              <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-2xl`} />

              <motion.div
                whileHover={{ rotate: [0, -8, 8, 0], scale: 1.15 }}
                transition={{ duration: 0.4 }}
                className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${feature.iconBg} ${feature.iconColor} shadow-sm group-hover:shadow-md transition-shadow`}
              >
                <feature.icon className="w-6 h-6" />
              </motion.div>

              <h3 className="font-semibold font-heading text-lg mb-2 group-hover:text-gray-900 transition-colors">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>

              {/* Subtle gradient border glow on hover */}
              <div className={`absolute inset-0 rounded-2xl ring-0 group-hover:ring-2 ring-opacity-20 transition-all duration-300`}
                style={{ boxShadow: "none" }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
