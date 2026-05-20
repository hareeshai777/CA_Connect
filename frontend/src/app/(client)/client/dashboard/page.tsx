"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, CreditCard, FileText, ArrowRight, Clock, CheckCircle, Video, TrendingUp, Search } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { api } from "@/lib/api";
import { formatCurrency, formatDateTime, getInitials } from "@/lib/utils";
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/bookings/my?limit=5").then((res) => {
      setBookings(res.data.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const profile = user?.clientProfile;
  const upcoming = bookings.filter((b) => b.status === "CONFIRMED");
  const completed = bookings.filter((b) => b.status === "COMPLETED");

  return (
    <div>
      {/* Welcome */}
      <div className="mb-8">
        <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold font-heading">
          Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}, {profile?.firstName || "there"}! 👋
        </motion.h1>
        <p className="text-muted-foreground mt-1">Here's your account overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Bookings", value: bookings.length, icon: Calendar, color: "text-brand-600", bg: "bg-brand-50 dark:bg-brand-950" },
          { label: "Upcoming Meetings", value: upcoming.length, icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50 dark:bg-yellow-950" },
          { label: "Completed", value: completed.length, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50 dark:bg-green-950" },
          { label: "Documents", value: 0, icon: FileText, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-950" },
        ].map(({ label, value, icon: Icon, color, bg }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{label}</p>
                    <p className="text-3xl font-bold font-heading">{value}</p>
                  </div>
                  <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Bookings */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">My Bookings</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/client/bookings" className="text-brand-600">View all <ArrowRight className="ml-1 w-4 h-4" /></Link>
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />
                ))}
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">No bookings yet</p>
                <Button className="rounded-xl bg-brand-600 hover:bg-brand-700" asChild>
                  <Link href="/find-ca"><Search className="mr-2 h-4 w-4" />Find a CA</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.map((booking) => (
                  <div key={booking.id} className="flex items-center gap-4 p-4 rounded-xl border border-border hover:bg-muted/30 transition-colors">
                    <Avatar className="h-10 w-10">
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
                    <div className="flex flex-col items-end gap-1.5">
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

        {/* Quick Actions */}
        <div className="space-y-4">
          <Card className="bg-gradient-to-br from-brand-600 to-brand-800 text-white border-0">
            <CardContent className="p-6">
              <TrendingUp className="w-8 h-8 mb-3 opacity-80" />
              <h3 className="font-semibold font-heading text-lg mb-1">Book a Consultation</h3>
              <p className="text-brand-100 text-sm mb-4">Connect with expert CAs for your financial needs</p>
              <Button className="w-full bg-white text-brand-700 hover:bg-brand-50 rounded-xl font-semibold" asChild>
                <Link href="/find-ca"><Search className="mr-2 h-4 w-4" />Find CA</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Quick Links</CardTitle></CardHeader>
            <CardContent className="space-y-2 pt-0">
              {[
                { label: "Upload Documents", href: "/client/documents", icon: FileText },
                { label: "Payment History", href: "/client/payments", icon: CreditCard },
                { label: "AI Tax Assistant", href: "/client/ai-chat", icon: TrendingUp },
              ].map(({ label, href, icon: Icon }) => (
                <Link key={href} href={href} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors group">
                  <Icon className="w-4 h-4 text-muted-foreground group-hover:text-brand-600" />
                  <span className="text-sm font-medium">{label}</span>
                  <ArrowRight className="ml-auto w-4 h-4 text-muted-foreground group-hover:text-brand-600" />
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
