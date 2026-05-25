"use client";

import { motion } from "framer-motion";
import { FileSearch, CreditCard, Video, ClipboardCheck, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: FileSearch,
    title: "Select a Service",
    description: "Browse 10+ CA services — GST, income tax, company registration, audit, compliance, and more.",
    color: "from-blue-500 to-cyan-500",
    tag: "Step 1",
  },
  {
    icon: CreditCard,
    title: "Pay ₹499 Consultation Fee",
    description: "Pay the mandatory ₹499 initial consultation fee securely via Razorpay. UPI, cards & net banking accepted.",
    color: "from-purple-500 to-violet-500",
    tag: "Step 2",
  },
  {
    icon: Video,
    title: "Auto-Scheduled Google Meet",
    description: "A Google Meet link is auto-generated and sent instantly to your WhatsApp and email.",
    color: "from-green-500 to-emerald-500",
    tag: "Step 3",
  },
  {
    icon: ClipboardCheck,
    title: "Document Verification",
    description: "Our Assistance Team verifies all your documents and coordinates with your assigned CA professional.",
    color: "from-orange-500 to-amber-500",
    tag: "Step 4",
  },
  {
    icon: CheckCircle,
    title: "Service Completion",
    description: "Your CA completes the service with full compliance. Track status in real-time on your dashboard.",
    color: "from-teal-500 to-cyan-600",
    tag: "Step 5",
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
            Book to Completion in 5 Simple Steps
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            Start with a ₹499 consultation — our Assistance Team handles everything from document verification to service delivery.
          </motion.p>
        </div>

        <div className="relative">
          {/* Connector line desktop */}
          <div className="hidden lg:block absolute top-[2.75rem] left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-blue-200 via-purple-200 to-teal-200 z-0" />

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.tag}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center relative z-10"
              >
                <div className={`relative w-14 h-14 mx-auto mb-5 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}>
                  <step.icon className="w-6 h-6 text-white" />
                  <div className="absolute -top-2 -right-2 w-5 h-5 bg-white border-2 border-border rounded-full flex items-center justify-center text-[10px] font-bold text-foreground">
                    {index + 1}
                  </div>
                </div>
                <span className={`inline-block text-[10px] font-semibold bg-gradient-to-r ${step.color} bg-clip-text text-transparent mb-2`}>
                  {step.tag}
                </span>
                <h3 className="font-bold font-heading text-base mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
