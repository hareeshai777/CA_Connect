"use client";

import { motion, useInView } from "framer-motion";
import { FileSearch, CreditCard, Video, ClipboardCheck, CheckCircle } from "lucide-react";
import { useState, useRef } from "react";

const steps = [
  {
    icon: FileSearch,
    title: "Select a Service",
    description: "Browse 10+ CA services — GST, income tax, company registration, audit, compliance, and more.",
    detail: "Use our AI-powered search to find exactly what your business needs. Filter by service type, CA expertise, price range, and availability.",
    color: "from-blue-500 to-cyan-500",
    bg: "bg-blue-50",
    border: "border-blue-200",
    tag: "Step 1",
  },
  {
    icon: CreditCard,
    title: "Pay ₹499 Fee",
    description: "Pay the ₹499 initial consultation fee securely via Razorpay. UPI, cards & net banking accepted.",
    detail: "Your payment is 100% secure with Razorpay's PCI-DSS compliant gateway. Instant payment confirmation with digital receipt.",
    color: "from-purple-500 to-violet-500",
    bg: "bg-purple-50",
    border: "border-purple-200",
    tag: "Step 2",
  },
  {
    icon: Video,
    title: "Auto-Scheduled Meet",
    description: "A Google Meet link is auto-generated and sent instantly to your WhatsApp and email.",
    detail: "No manual scheduling. The system auto-generates a Google Meet link and sends calendar invites to both you and your CA immediately.",
    color: "from-green-500 to-emerald-500",
    bg: "bg-green-50",
    border: "border-green-200",
    tag: "Step 3",
  },
  {
    icon: ClipboardCheck,
    title: "Document Verification",
    description: "Our Assistance Team verifies all your documents and coordinates with your assigned CA.",
    detail: "Our dedicated Assistance Team reviews your documents, flags any missing information, and ensures your CA has everything needed before the consultation.",
    color: "from-orange-500 to-amber-500",
    bg: "bg-orange-50",
    border: "border-orange-200",
    tag: "Step 4",
  },
  {
    icon: CheckCircle,
    title: "Service Completion",
    description: "Your CA completes the service with full compliance. Track status in real-time on your dashboard.",
    detail: "Get real-time updates on your dashboard. Once complete, download all documents and certificates directly from your account.",
    color: "from-teal-500 to-cyan-600",
    bg: "bg-teal-50",
    border: "border-teal-200",
    tag: "Step 5",
  },
];

export function HowItWorks() {
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const lineRef = useRef(null);
  const lineInView = useInView(lineRef, { once: true, amount: 0.5 });

  return (
    <section className="section-padding bg-white">
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
            Book to Completion in 5 Steps
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
          <p className="text-xs text-muted-foreground mt-2">Click any step to learn more</p>
        </div>

        <div className="relative">
          {/* Animated connector line */}
          <div ref={lineRef} className="hidden lg:block absolute top-[2.75rem] left-[10%] right-[10%] h-0.5 bg-gray-100 z-0 overflow-hidden rounded-full">
            <motion.div
              className="h-full rounded-full"
              style={{ background: "linear-gradient(to right, #60a5fa, #a78bfa, #34d399, #fb923c, #2dd4bf)" }}
              initial={{ width: "0%" }}
              animate={{ width: lineInView ? "100%" : "0%" }}
              transition={{ duration: 1.5, ease: "easeInOut", delay: 0.3 }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {steps.map((step, index) => {
              const isActive = activeStep === index;
              return (
                <motion.div
                  key={step.tag}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setActiveStep(isActive ? null : index)}
                  className={`text-center relative z-10 cursor-pointer select-none`}
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    animate={isActive ? { scale: 1.05 } : { scale: 1 }}
                    className={`rounded-2xl p-4 border-2 transition-all duration-300 ${
                      isActive
                        ? `${step.bg} ${step.border} shadow-lg`
                        : "bg-white border-transparent hover:border-gray-100 hover:shadow-md"
                    }`}
                  >
                    <motion.div
                      animate={isActive ? { rotate: 360 } : { rotate: 0 }}
                      transition={{ duration: 0.5 }}
                      className={`relative w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}
                    >
                      <step.icon className="w-6 h-6 text-white" />
                      <div className={`absolute -top-2 -right-2 w-5 h-5 ${isActive ? "bg-gradient-to-br " + step.color + " text-white" : "bg-white border-2 border-border text-foreground"} rounded-full flex items-center justify-center text-[10px] font-bold transition-all`}>
                        {index + 1}
                      </div>
                    </motion.div>

                    <span className={`inline-block text-[10px] font-semibold bg-gradient-to-r ${step.color} bg-clip-text text-transparent mb-1`}>
                      {step.tag}
                    </span>
                    <h3 className="font-bold font-heading text-base mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>

                    <motion.div
                      initial={false}
                      animate={{ height: isActive ? "auto" : 0, opacity: isActive ? 1 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className={`text-xs mt-3 pt-3 border-t text-left leading-relaxed font-medium ${step.border}`}
                        style={{ borderColor: isActive ? undefined : "transparent" }}>
                        {step.detail}
                      </p>
                    </motion.div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
