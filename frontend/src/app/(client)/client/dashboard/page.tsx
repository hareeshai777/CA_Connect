"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, FileText, ArrowRight, Clock, CheckCircle, Video, Sparkles, AlertCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { api, getErrorMessage } from "@/lib/api";
import { formatDateTime, getInitials } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";

const statusVariant: Record<string, any> = {
  CONFIRMED: "success", COMPLETED: "info", PENDING: "warning", CANCELLED: "destructive",
};

const isRealMeetLink = (link?: string | null) =>
  !!link && (
    (link.startsWith("https://meet.google.com/") && link !== "https://meet.google.com/new") ||
    link.startsWith("https://meet.jit.si/")
  );

function MeetingStatusBadge({ booking }: { booking: any }) {
  if (booking.status === "CANCELLED") return null;
  if (booking.status === "COMPLETED") {
    return <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-2 py-0.5 font-medium">✓ Completed</span>;
  }
  if (booking.status === "CONFIRMED") {
    if (isRealMeetLink(booking.meetingLink)) {
      return <span className="text-[10px] bg-green-50 text-green-700 border border-green-200 rounded-full px-2 py-0.5 font-medium flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse inline-block" />Meeting Ready</span>;
    }
    return <span className="text-[10px] bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-full px-2 py-0.5 font-medium">✅ Meeting Scheduled</span>;
  }
  return null;
}

export default function ClientDashboardPage() {
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState<any[]>([]);
  const [docCount, setDocCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState<string | null>(null);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      api.get("/bookings/my?limit=5&page=1"),
      api.get("/client/documents"),
    ]).then(([bookRes, docRes]) => {
      setBookings(bookRes.data.data || []);
      setDocCount((docRes.data.data || []).length);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  // Auto-fix stuck bookings with old placeholder link
  useEffect(() => {
    bookings.filter(b => b.status === "CONFIRMED" && b.meetingLink === "https://meet.google.com/new")
      .forEach(b => {
        api.post(`/bookings/${b.id}/regenerate-link`)
          .then(res => {
            const newLink = res.data.data?.meetingLink;
            if (newLink) setBookings(prev => prev.map(bk => bk.id === b.id ? { ...bk, meetingLink: newLink } : bk));
          }).catch(() => {});
      });
  }, [bookings]);

  const handleJoin = async (bookingId: string) => {
    setJoiningId(bookingId);
    try {
      const res = await api.post(`/bookings/${bookingId}/join`);
      const link = res.data.data?.meetingLink;
      if (link && isRealMeetLink(link)) {
        window.open(link, "_blank", "noopener,noreferrer");
        setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, clientJoinedAt: new Date().toISOString() } : b));
      } else {
        toast.error("Meeting link not ready yet. Please try again in a moment.");
      }
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setJoiningId(null); }
  };

  const profile = user?.clientProfile;
  const upcoming = bookings.filter(b => b.status === "CONFIRMED");
  const completed = bookings.filter(b => b.status === "COMPLETED");
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-600 via-blue-600 to-indigo-600 p-6 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <p className="text-brand-100 text-sm mb-1">{greeting}!</p>
          <h1 className="text-2xl font-bold font-heading mb-1">
            Welcome back, {profile?.firstName || "there"} 👋
          </h1>
          <p className="text-brand-100 text-sm mb-4">
            {upcoming.length > 0
              ? `You have ${upcoming.length} upcoming consultation${upcoming.length > 1 ? "s" : ""}. ${upcoming.some(b => isRealMeetLink(b.meetingLink)) ? "Your meeting link is ready!" : ""}`
              : "Ready to connect with a CA expert?"}
          </p>
          <Button className="bg-white text-brand-700 hover:bg-brand-50 rounded-xl font-semibold text-sm h-9" asChild>
            <Link href="/services"><Sparkles className="mr-2 h-4 w-4" />Book Consultation — ₹499</Link>
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Bookings", value: loading ? "—" : bookings.length, icon: Calendar, color: "text-brand-600", bg: "bg-brand-50" },
          { label: "Upcoming", value: loading ? "—" : upcoming.length, icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50" },
          { label: "Completed", value: loading ? "—" : completed.length, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
          { label: "Documents", value: loading ? "—" : docCount, icon: FileText, color: "text-purple-600", bg: "bg-purple-50" },
        ].map(({ label, value, icon: Icon, color, bg }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{label}</p>
                    <p className="text-2xl font-bold">{value}</p>
                  </div>
                  <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My Consultations */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg">My Consultations</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/client/bookings" className="text-brand-600">
                  View all <ArrowRight className="ml-1 w-3.5 h-3.5" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
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
                    <motion.div key={booking.id}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl border border-border overflow-hidden hover:border-brand-200 transition-colors">
                      <div className="flex items-start gap-3 p-4">
                        <Avatar className="h-10 w-10 shrink-0 mt-0.5">
                          <AvatarImage src={booking.caProfessional?.avatarUrl} />
                          <AvatarFallback className="bg-brand-100 text-brand-700 text-xs font-bold">
                            {getInitials(booking.caProfessional?.firstName || "C", booking.caProfessional?.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-0.5">
                            <p className="font-semibold text-sm">
                              CA {booking.caProfessional?.firstName} {booking.caProfessional?.lastName}
                            </p>
                            <Badge variant={statusVariant[booking.status]} className="text-xs">{booking.status}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{booking.service?.name}</p>
                          <div className="flex flex-wrap items-center gap-3 mt-1.5">
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />{formatDateTime(booking.scheduledAt)}
                            </p>
                            {booking.timeSlot && (
                              <p className="text-xs text-muted-foreground">
                                🕐 {booking.timeSlot.startTime} – {booking.timeSlot.endTime}
                              </p>
                            )}
                          </div>
                          <div className="mt-1.5">
                            <MeetingStatusBadge booking={booking} />
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          {/* Join Meeting Button */}
                          {booking.status === "CONFIRMED" && !booking.clientJoinedAt && isRealMeetLink(booking.meetingLink) && (
                            <Button size="sm"
                              className="h-8 text-xs rounded-lg bg-green-600 hover:bg-green-700 gap-1"
                              disabled={joiningId === booking.id}
                              onClick={() => handleJoin(booking.id)}>
                              {joiningId === booking.id
                                ? <><Loader2 className="h-3 w-3 animate-spin" />Joining…</>
                                : <><Video className="h-3 w-3" />Join Meet</>
                              }
                            </Button>
                          )}
                          {/* Already joined — show rejoin */}
                          {booking.status === "CONFIRMED" && booking.clientJoinedAt && isRealMeetLink(booking.meetingLink) && (
                            <Button size="sm" variant="outline"
                              className="h-8 text-xs rounded-lg gap-1 border-green-300 text-green-700"
                              asChild>
                              <a href={booking.meetingLink} target="_blank" rel="noopener noreferrer">
                                <Video className="h-3 w-3" />Rejoin
                              </a>
                            </Button>
                          )}
                          {/* Link pending */}
                          {booking.status === "CONFIRMED" && !isRealMeetLink(booking.meetingLink) && (
                            <span className="text-xs text-amber-600 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />Link pending
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4">
          {/* How It Works */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { step: 1, title: "Select a Service", desc: "Browse 10+ CA services", color: "bg-brand-600" },
                { step: 2, title: "Pay ₹499", desc: "Secure Razorpay payment", color: "bg-blue-600" },
                { step: 3, title: "Get Meeting Link", desc: "Auto Google Meet generated", color: "bg-green-600" },
                { step: 4, title: "CA Consultation", desc: "Expert advice & service", color: "bg-purple-600" },
              ].map(({ step, title, desc, color }) => (
                <div key={step} className="flex items-center gap-3">
                  <div className={`w-7 h-7 ${color} rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0`}>{step}</div>
                  <div>
                    <p className="text-sm font-medium">{title}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                </div>
              ))}
              <Button className="w-full rounded-xl bg-brand-600 hover:bg-brand-700 mt-2" asChild>
                <Link href="/services">Book Now — ₹499</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Quick Access */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Access</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { label: "Upload Documents", href: "/client/documents", icon: FileText },
                { label: "Payment History", href: "/client/payments", icon: Calendar },
                { label: "My Bookings", href: "/client/bookings", icon: Clock },
              ].map(({ label, href, icon: Icon }) => (
                <Link key={href} href={href}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-muted transition-colors group">
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{label}</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-brand-600 transition-colors" />
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
