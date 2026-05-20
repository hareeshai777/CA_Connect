"use client";

import { motion } from "framer-motion";
import { Search, Calendar, CreditCard, Video, CheckCircle } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: Search,
    title: "Find Your CA",
    description: "Browse verified CA professionals by specialization, location, or use our AI-powered recommendation engine to find your perfect match.",
    color: "from-blue-500 to-blue-600",
    bg: "bg-blue-50 dark:bg-blue-950",
  },
  {
    step: "02",
    icon: Calendar,
    title: "Book a Time Slot",
    description: "View real-time availability and choose a convenient time slot that works for your schedule. All times are in IST.",
    color: "from-purple-500 to-purple-600",
    bg: "bg-purple-50 dark:bg-purple-950",
  },
  {
    step: "03",
    icon: CreditCard,
    title: "Secure Payment",
    description: "Pay securely via Razorpay with UPI, cards, or net banking. Your consultation fee is protected with our money-back guarantee.",
    color: "from-green-500 to-green-600",
    bg: "bg-green-50 dark:bg-green-950",
  },
  {
    step: "04",
    icon: Video,
    title: "Meet on Google Meet",
    description: "A Google Meet link is auto-generated and sent to both you and your CA. Calendar events are added automatically.",
    color: "from-orange-500 to-orange-600",
    bg: "bg-orange-50 dark:bg-orange-950",
  },
  {
    step: "05",
    icon: CheckCircle,
    title: "Get Expert Advice",
    description: "Have your consultation, get expert guidance, and access documents and notes directly from your dashboard.",
    color: "from-teal-500 to-teal-600",
    bg: "bg-teal-50 dark:bg-teal-950",
  },
];

export function HowItWorks() {
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
            How It Works
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold font-heading mb-4"
          >
            From Search to Consultation in Minutes
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-muted-foreground"
          >
            A seamless experience from finding your CA to the actual consultation.
          </motion.p>
        </div>

        <div className="relative">
          {/* Connector line */}
          <div className="hidden lg:block absolute top-16 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-blue-200 via-purple-200 via-green-200 via-orange-200 to-teal-200 dark:from-blue-900 dark:via-purple-900 dark:via-green-900 dark:via-orange-900 dark:to-teal-900" />

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center relative"
              >
                {/* Step number */}
                <div className={`relative w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg shadow-brand-200/30 dark:shadow-none`}>
                  <step.icon className="w-7 h-7 text-white" />
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-white dark:bg-gray-800 border-2 border-brand-200 dark:border-gray-700 rounded-full flex items-center justify-center text-xs font-bold text-brand-700 dark:text-brand-400">
                    {index + 1}
                  </div>
                </div>
                <h3 className="font-semibold font-heading text-lg mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
