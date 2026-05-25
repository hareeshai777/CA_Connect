"use client";

import { motion } from "framer-motion";
import { Shield, Zap, Star, Clock, HeadphonesIcon, Lock, Bot, Video } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "ICAI Verified CAs",
    description: "Every CA on our platform is manually verified with valid ICAI membership and authentic credentials.",
    color: "text-blue-600 bg-blue-50",
  },
  {
    icon: Zap,
    title: "Instant Booking",
    description: "Book a consultation in under 2 minutes. Real-time slot availability with instant confirmation.",
    color: "text-yellow-600 bg-yellow-50",
  },
  {
    icon: Star,
    title: "Transparent Reviews",
    description: "Genuine client reviews and ratings to help you make informed decisions every time.",
    color: "text-gold-600 bg-gold-50",
  },
  {
    icon: Video,
    title: "Google Meet Integration",
    description: "Automatic Google Meet link generation with calendar invite sent to all parties.",
    color: "text-green-600 bg-green-50",
  },
  {
    icon: Lock,
    title: "Secure Payments",
    description: "Razorpay-powered secure payments with UPI, cards, and net banking. PCI-DSS compliant.",
    color: "text-purple-600 bg-purple-50",
  },
  {
    icon: Bot,
    title: "AI-Powered Matching",
    description: "Gemini AI recommends the best CA professionals based on your specific financial needs.",
    color: "text-pink-600 bg-pink-50",
  },
  {
    icon: Clock,
    title: "Flexible Scheduling",
    description: "Morning, afternoon, or evening — book consultations that fit your schedule, including weekends.",
    color: "text-orange-600 bg-orange-50",
  },
  {
    icon: HeadphonesIcon,
    title: "24/7 Support",
    description: "Round-the-clock customer support via chat, WhatsApp, and email. We're always here to help.",
    color: "text-teal-600 bg-teal-50",
  },
];

export function WhyChooseUs() {
  return (
    <section className="section-padding">
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
            Purpose-built for India's professionals and businesses.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.07 }}
              className="p-6 bg-white rounded-2xl border border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${feature.color}`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold font-heading text-lg mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
