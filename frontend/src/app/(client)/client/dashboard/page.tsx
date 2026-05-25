"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, CreditCard, FileText, ArrowRight, Clock, CheckCircle, Video, TrendingUp, MessageSquare, Sparkles, Bell } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { api } from "@/lib/api";
import { formatDateTime, getInitials } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";

const statusColors: Record<string, string> = {
  CONFIRMED: "success",
  COMPLETED: "info",
  PENDING: "warning",
  CANCELLED: "destructive",
};

export default function ClientDashboardPage() {
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState<any[]>([]);
  const [docCount, setDocCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/bookings/my?limit=5"),
      api.get("/client/documents"),
    ]).then(([bookRes, docRes]) => {
      setBookings(bookRes.data.data || []);
      setDocCount((docRes.data.data || []).length);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const profile = user?.clientProfile;
  const upcoming = bookings.filter((b) => b.status === "CONFIRMED");
  const completed = bookings.filter((b) => b.status === "COMPLETED");
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-600 via-blue-600 to-indigo-600 p-6 text-white"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <p className="text-brand-100 text-sm mb-1">{greeting}!</p>
          <h1 className="text-2xl font-bold font-heading mb-1">
            Welcome back, {profile?.firstName || "there"} 👋
          </h1>
          <p className="text-brand-100 text-sm mb-4">
            {upcoming.length > 0 ? `You have ${upcoming.length} upcoming consultation${upcoming.length > 1 ? "s" : ""}.` : "Ready to connect with a CA expert?"}
          </p>
          <Button className="bg-white text-brand-700 hover:bg-brand-50 rounded-xl font-semibold text-sm h-9" asChild>
            <Link href="/services">
              <Sparkles className="mr-2 h-4 w-4" />
              Book Consultation — ₹499
            </Link>
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Bookings", value: bookings.length, icon: Calendar, color: "text-brand-600", bg: "bg-brand-50" },
          { label: "Upcoming", value: upcoming.length, icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50" },
          { label: "Completed", value: completed.length, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
          { label: "Documents", value: docCount, icon: FileText, color: "text-purple-600", bg: "bg-purple-50" },
        ].map(({ label, value, icon: Icon, color, bg }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{label}</p>
                    <p className="text-3xl font-bold font-heading">{value}</p>
                  </div>
                  <div className={`w-11 h-11 ${bg} rounded-xl flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bookings List */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">My Consultations</CardTitle>
            <Button variant="ghost" size="sm" className="text-brand-600 h-8 text-xs" asChild>
              <Link href="/client/bookings">View all <ArrowRight className="ml-1 w-3.5 h-3.5" /></Link>
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />)}
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-brand-600" />
                </div>
                <p className="font-semibold mb-1">No consultations yet</p>
                <p className="text-sm text-muted-foreground mb-5">Book your first ₹499 consultation with a CA expert</p>
                <Button className="rounded-xl bg-brand-600 hover:bg-brand-700" asChild>
                  <Link href="/services"><Sparkles className="mr-2 h-4 w-4" />Book Consultation — ₹499</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.map((booking) => (
                  <div key={booking.id} className="flex items-center gap-4 p-4 rounded-xl border border-border hover:bg-muted/30 transition-colors">
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarImage src={booking.caProfessional?.avatarUrl} />
                      <AvatarFallback className="bg-brand-100 text-brand-700 text-xs font-bold">
                        {getInitials(booking.caProfessional?.firstName || "C", booking.caProfessional?.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">
                        {booking.caProfessional?.firstName} {booking.caProfessional?.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">{booking.service?.name}</p>
                      <p className="text-xs text-muted-foreground">{formatDateTime(booking.scheduledAt)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <Badge variant={statusColors[booking.status] as any} className="text-xs">{booking.status}</Badge>
                      {booking.status === "CONFIRMED" && booking.meetingLink && (
                        <Button size="sm" variant="outline" className="h-7 text-xs rounded-lg" asChild>
                          <a href={booking.meetingLink} target="_blank" rel="noopener noreferrer">
                            <Video className="mr-1 h-3 w-3" />Join
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Process Steps Card */}
          <Card className="overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-brand-500 to-indigo-500" />
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-brand-600" />
                How It Works
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              {[
                { step: "1", label: "Select a Service", desc: "Browse 10+ CA services", color: "bg-blue-500" },
                { step: "2", label: "Pay ₹499", desc: "Secure Razorpay payment", color: "bg-purple-500" },
                { step: "3", label: "Get Meeting Link", desc: "Auto Google Meet generated", color: "bg-green-500" },
                { step: "4", label: "CA Consultation", desc: "Expert advice & service", color: "bg-orange-500" },
              ].map(({ step, label, desc, color }) => (
                <div key={step} className="flex items-center gap-3">
                  <div className={`w-7 h-7 ${color} rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0`}>{step}</div>
                  <div>
                    <p className="text-xs font-semibold">{label}</p>
                    <p className="text-[10px] text-muted-foreground">{desc}</p>
                  </div>
                </div>
              ))}
              <Button className="w-full mt-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-sm h-9" asChild>
                <Link href="/services">Book Now — ₹499</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Quick Access</CardTitle></CardHeader>
            <CardContent className="space-y-1 pt-0">
              {[
                { label: "Upload Documents", href: "/client/documents", icon: FileText },
                { label: "Payment History", href: "/client/payments", icon: CreditCard },
                { label: "AI Tax Assistant", href: "/client/ai-chat", icon: Sparkles },
                { label: "My Bookings", href: "/client/bookings", icon: MessageSquare },
                { label: "My Profile", href: "/client/profile", icon: Bell },
              ].map(({ label, href, icon: Icon }) => (
                <Link key={href} href={href} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted transition-colors group">
                  <Icon className="w-4 h-4 text-muted-foreground group-hover:text-brand-600" />
                  <span className="text-sm font-medium">{label}</span>
                  <ArrowRight className="ml-auto w-3.5 h-3.5 text-muted-foreground group-hover:text-brand-600" />
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
