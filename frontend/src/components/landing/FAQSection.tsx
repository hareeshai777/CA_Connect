"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, MessageCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const faqs = [
  {
    q: "How are CA professionals verified on CA Pro?",
    a: "All CA professionals on our platform undergo a rigorous verification process. They must submit their ICAI membership certificate, identity proof, and professional documents. Our team manually reviews each application, and only approved professionals with valid memberships can accept bookings.",
  },
  {
    q: "What happens after I book a consultation?",
    a: "After booking, you receive an instant confirmation via email and WhatsApp with your booking details. A Google Meet link is automatically generated, and a calendar event is added to both your and your CA's calendar. You'll also receive a reminder 1 hour and 15 minutes before the meeting.",
  },
  {
    q: "Is my financial information secure?",
    a: "Absolutely. We use bank-level encryption for all data transmission. All documents are stored in encrypted cloud storage. Our platform is GDPR-compliant, and we never share your information with third parties without your explicit consent.",
  },
  {
    q: "What is the CA onboarding fee?",
    a: "CA professionals pay a one-time onboarding fee of ₹499 to join our platform. This fee covers profile verification, account setup, and access to our consultation management tools. There is also a platform commission of 10% on each consultation.",
  },
  {
    q: "Can I get a refund if I'm not satisfied?",
    a: "Yes. We offer a satisfaction guarantee. If you're not satisfied with your consultation, you can raise a dispute within 24 hours of the meeting. Our support team will review the case and process a refund if warranted.",
  },
  {
    q: "How do I pay for consultations?",
    a: "We accept all major payment methods through Razorpay — UPI (PhonePe, GPay, Paytm), debit/credit cards, net banking, and EMI options. All payments are processed securely with Razorpay's PCI-DSS compliant infrastructure.",
  },
  {
    q: "Can I use CA Pro for ongoing monthly services?",
    a: "Yes! Many of our CA professionals offer retainer packages for ongoing services like monthly GST filing, accounting, payroll processing, and compliance management. You can discuss this directly with your CA after the initial consultation.",
  },
  {
    q: "What if my CA cancels the appointment?",
    a: "If a CA cancels a confirmed appointment, you'll receive an automatic full refund within 5-7 business days. You'll also receive a priority booking voucher for your next consultation.",
  },
];

export function FAQSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="section-padding">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-sm font-semibold text-brand-600 uppercase tracking-wider mb-3"
            >
              FAQ
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold font-heading mb-4"
            >
              Frequently Asked Questions
            </motion.h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="border border-border rounded-xl overflow-hidden bg-white"
              >
                <button
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-muted/30 transition-colors"
                  onClick={() => setOpen(open === index ? null : index)}
                >
                  <span className="font-medium pr-4">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-muted-foreground shrink-0 transition-transform ${open === index ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {open === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed border-t border-border pt-4">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12 p-8 bg-brand-50 rounded-2xl border border-brand-100">
            <MessageCircle className="w-10 h-10 text-brand-600 mx-auto mb-3" />
            <h3 className="font-semibold font-heading text-xl mb-2">Still have questions?</h3>
            <p className="text-muted-foreground mb-4">Our support team is here to help you 24/7</p>
            <Button className="rounded-xl bg-brand-600 hover:bg-brand-700" asChild>
              <Link href="/contact">Contact Support</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
