"use client";

import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  Shield, Users, Award, Zap, CheckCircle, TrendingUp,
  Heart, Target, Globe, ArrowRight, Star, Building,
  Briefcase, IndianRupee,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const stats = [
  { value: "10,000+", label: "Happy Clients", icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
  { value: "500+", label: "Verified CAs", icon: Award, color: "text-purple-500", bg: "bg-purple-50" },
  { value: "25,000+", label: "Services Completed", icon: CheckCircle, color: "text-green-500", bg: "bg-green-50" },
  { value: "₹50Cr+", label: "Tax Saved", icon: IndianRupee, color: "text-yellow-500", bg: "bg-yellow-50" },
];

const values = [
  { icon: Shield, title: "Trust & Integrity", desc: "Every CA on our platform is ICAI-verified. We maintain the highest standards of professional integrity and confidentiality.", color: "from-blue-500 to-cyan-500" },
  { icon: Zap, title: "Speed & Efficiency", desc: "Our streamlined workflows and dedicated assistance teams ensure your work gets done faster without compromising quality.", color: "from-purple-500 to-violet-500" },
  { icon: Heart, title: "Client First", desc: "Every decision we make starts with one question: does this make things better for our clients? That is our north star.", color: "from-rose-500 to-pink-500" },
  { icon: Target, title: "Precision", desc: "Financial and legal work demands accuracy. Our multi-layer verification process catches errors before they become problems.", color: "from-green-500 to-emerald-500" },
  { icon: Globe, title: "Accessibility", desc: "We believe great CA services should be accessible to every business, from startups to enterprises, across every city in India.", color: "from-orange-500 to-amber-500" },
  { icon: TrendingUp, title: "Innovation", desc: "We combine AI-powered insights with human expertise to deliver CA services that are smarter, faster, and more insightful.", color: "from-indigo-500 to-blue-600" },
];

const team = [
  { name: "Rajesh Sharma", role: "Founder & CEO", exp: "20+ years", qual: "CA, CPA", img: null },
  { name: "Priya Menon", role: "Head of CA Operations", exp: "15+ years", qual: "CA, CS", img: null },
  { name: "Arjun Patel", role: "CTO", exp: "12+ years", qual: "IIT Bombay, MBA", img: null },
  { name: "Sunita Rao", role: "Head of Compliance", exp: "18+ years", qual: "CA, LLB", img: null },
];

const milestones = [
  { year: "2018", title: "Platform Founded", desc: "Started with 10 CAs in Bengaluru" },
  { year: "2019", title: "1,000 Clients", desc: "Expanded to Mumbai, Delhi & Hyderabad" },
  { year: "2021", title: "100 CA Partners", desc: "Launched AI-powered document analysis" },
  { year: "2022", title: "₹10Cr Tax Saved", desc: "Introduced Assistance Team model" },
  { year: "2023", title: "500 CAs Onboarded", desc: "Pan-India presence across 30 cities" },
  { year: "2024", title: "10,000+ Clients", desc: "Launched real-time collaboration tools" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">

        {/* Hero */}
        <section className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 py-24 px-4 overflow-hidden">
          <div className="absolute inset-0 opacity-[0.06]"
            style={{ backgroundImage: `linear-gradient(rgba(99,102,241,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,.8) 1px, transparent 1px)`, backgroundSize: "50px 50px" }}
          />
          <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-[100px] pointer-events-none" />
          <div className="container mx-auto max-w-4xl text-center relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-full px-4 py-2 text-sm font-medium mb-6">
              <Briefcase className="w-4 h-4 text-blue-300" />
              About CA Pro
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="text-5xl md:text-6xl font-bold font-heading text-white mb-6 leading-tight">
              Connecting India&apos;s Best{" "}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                CA Professionals
              </span>
              {" "}with You
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
              className="text-xl text-blue-100/70 max-w-2xl mx-auto leading-relaxed">
              We built CA Pro to make high-quality chartered accountancy services accessible, transparent, and affordable for every Indian business — from first-time founders to large enterprises.
            </motion.p>
          </div>
        </section>

        {/* Stats */}
        <section className="py-16 px-4 bg-white border-b border-border">
          <div className="container mx-auto max-w-5xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, i) => (
                <motion.div key={stat.label}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className={`p-6 rounded-2xl ${stat.bg} text-center border border-border`}>
                  <div className="flex justify-center mb-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                  </div>
                  <p className="text-3xl font-bold font-heading mb-1">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <span className="text-sm font-semibold text-brand-600 uppercase tracking-wider">Our Mission</span>
                <h2 className="text-4xl font-bold font-heading mt-2 mb-5">Democratising Financial Expertise in India</h2>
                <p className="text-muted-foreground leading-relaxed mb-5">
                  For too long, access to expert CA services has been restricted to those who could afford premium retainers or who happened to know the right people. We&apos;re changing that.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  CA Pro is a marketplace where verified Chartered Accountants list their services, and businesses of all sizes can find, compare, and book the right expert for their needs — transparently, securely, and affordably starting at just ₹499.
                </p>
                <div className="flex gap-3">
                  <Button className="rounded-xl bg-brand-600 hover:bg-brand-700" asChild>
                    <Link href="/services">Explore Services <ArrowRight className="ml-2 w-4 h-4" /></Link>
                  </Button>
                  <Button variant="outline" className="rounded-xl" asChild>
                    <Link href="/contact">Contact Us</Link>
                  </Button>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                className="grid grid-cols-2 gap-4">
                {[
                  { icon: Building, title: "500+ CA Partners", desc: "ICAI-verified professionals across India" },
                  { icon: Shield, title: "Bank-level Security", desc: "End-to-end encrypted document storage" },
                  { icon: Star, title: "4.9★ Rating", desc: "Consistently rated by 10,000+ clients" },
                  { icon: Zap, title: "Same-day Booking", desc: "Auto-scheduled Google Meet calls" },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="p-5 bg-white rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-9 h-9 bg-brand-50 rounded-xl flex items-center justify-center mb-3">
                      <Icon className="w-4 h-4 text-brand-600" />
                    </div>
                    <p className="font-semibold text-sm mb-1">{title}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 px-4 bg-slate-50">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-14">
              <span className="text-sm font-semibold text-brand-600 uppercase tracking-wider">What Drives Us</span>
              <h2 className="text-4xl font-bold font-heading mt-2">Our Core Values</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {values.map((v, i) => (
                <motion.div key={v.title}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                  className="bg-white rounded-2xl p-6 border border-border hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${v.color} flex items-center justify-center mb-4 shadow-md`}>
                    <v.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-bold text-base mb-2">{v.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline / Milestones */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-3xl">
            <div className="text-center mb-14">
              <span className="text-sm font-semibold text-brand-600 uppercase tracking-wider">Our Journey</span>
              <h2 className="text-4xl font-bold font-heading mt-2">Building Trust, One CA at a Time</h2>
            </div>
            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-brand-500 via-brand-300 to-transparent" />
              <div className="space-y-8">
                {milestones.map((m, i) => (
                  <motion.div key={m.year}
                    initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                    className="flex gap-6 items-start">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold text-xs shadow-lg shrink-0 z-10">
                      {m.year.slice(2)}
                    </div>
                    <div className="flex-1 pt-2">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-xs font-semibold text-brand-600">{m.year}</span>
                        <h3 className="font-bold text-base">{m.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">{m.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-20 px-4 bg-slate-50">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-14">
              <span className="text-sm font-semibold text-brand-600 uppercase tracking-wider">Leadership</span>
              <h2 className="text-4xl font-bold font-heading mt-2">The Team Behind CA Pro</h2>
              <p className="text-muted-foreground mt-3 max-w-xl mx-auto text-sm">
                A blend of chartered accountants, technologists, and product builders united by a common mission.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {team.map((member, i) => (
                <motion.div key={member.name}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-2xl p-6 border border-border text-center hover:shadow-lg transition-shadow">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-xl font-bold mx-auto mb-4 shadow-md">
                    {member.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <h3 className="font-bold text-sm mb-0.5">{member.name}</h3>
                  <p className="text-xs text-brand-600 font-medium mb-1">{member.role}</p>
                  <p className="text-xs text-muted-foreground mb-0.5">{member.qual}</p>
                  <p className="text-xs text-muted-foreground">{member.exp} experience</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-4 bg-gradient-to-br from-brand-600 to-blue-700 text-white text-center">
          <div className="container mx-auto max-w-2xl">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="text-4xl font-bold font-heading mb-4">Ready to Get Started?</h2>
              <p className="text-brand-100 mb-8 text-lg">Book your ₹499 consultation and connect with an expert CA today.</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button size="lg" className="rounded-xl bg-white text-brand-700 hover:bg-brand-50 font-semibold" asChild>
                  <Link href="/services">Book Consultation — ₹499 <ArrowRight className="ml-2 w-4 h-4" /></Link>
                </Button>
                <Button size="lg" variant="outline" className="rounded-xl border-white/30 text-white hover:bg-white/10" asChild>
                  <Link href="/contact">Talk to Us</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
