"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, TrendingUp, Users, Star, ArrowRight, Clock, Video, BarChart3, IndianRupee, Award, FolderOpen, AlertCircle, CalendarClock, RefreshCw, CheckCircle, Send } from "lucide-react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { api } from "@/lib/api";
import { formatCurrency, formatDateTime, getInitials } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";

const isRealMeetLink = (link?: string | null) =>
  !!link && link.startsWith("https://meet.google.com/") && link !== "https://meet.google.com/new";

export default function CADashboardPage() {
  const { user, fetchMe } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [openingCase, setOpeningCase] = useState<string | null>(null);
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleSlots, setRescheduleSlots] = useState<any[]>([]);
  const [rescheduleSlotId, setRescheduleSlotId] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [rescheduling, setRescheduling] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const caId = user?.caProfessional?.id;

  useEffect(() => {
    api.get("/ca/my/dashboard")
      .then((r) => setStats(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Re-load user if caProfessional profile hasn't been fetched yet
  useEffect(() => {
    if (!user?.caProfessional) {
      fetchMe();
    }
  }, []);

  const ca = user?.caProfessional;

  const fetchRescheduleSlots = async (date: string) => {
    if (!date || !caId) return;
    setLoadingSlots(true);
    setRescheduleSlots([]);
    setRescheduleSlotId("");
    try {
      const res = await api.get(`/ca/${caId}/slots?date=${date}`);
      setRescheduleSlots((res.data.data || []).filter((s: any) => !s.isBooked && !s.isBlocked));
    } catch { setRescheduleSlots([]); }
    finally { setLoadingSlots(false); }
  };

  const openReschedule = (id: string) => {
    setRescheduleId(prev => prev === id ? null : id);
    setRescheduleDate("");
    setRescheduleSlots([]);
    setRescheduleSlotId("");
  };

  const confirmReschedule = async (bookingId: string) => {
    if (!rescheduleSlotId) { toast.error("Select a time slot"); return; }
    setRescheduling(true);
    try {
      await api.patch(`/bookings/${bookingId}/ca-reschedule`, { slotId: rescheduleSlotId });
      toast.success("Meeting rescheduled!");
      setRescheduleId(null);
      setRescheduleDate("");
      setRescheduleSlots([]);
      setRescheduleSlotId("");
      const r = await api.get("/ca/my/dashboard");
      setStats(r.data.data);
    } catch (err: any) { toast.error(err?.response?.data?.message || "Failed to reschedule"); }
    finally { setRescheduling(false); }
  };

  const sendMeetingDetails = async (bookingId: string) => {
    setSendingId(bookingId);
    try {
      const res = await api.post(`/bookings/${bookingId}/send-meeting-details`);
      const { emailSent, whatsappSent } = res.data.data || {};
      const channels = [emailSent && "Email", whatsappSent && "WhatsApp"].filter(Boolean).join(" & ");
      toast.success(`Meeting details sent to client via ${channels || "notification"}!`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to send meeting details");
    } finally { setSendingId(null); }
  };

  const demoChartData = [
    { month: "Jan", bookings: 4 }, { month: "Feb", bookings: 7 }, { month: "Mar", bookings: 5 },
    { month: "Apr", bookings: 9 }, { month: "May", bookings: 12 }, { month: "Jun", bookings: 8 },
  ];

  const handleOpenCase = async (bookingId: string, clientName: string, serviceName: string) => {
    setOpeningCase(bookingId);
    try {
      const res = await api.post("/cases", {
        bookingId,
        title: `${serviceName} — ${clientName}`,
      });
      toast.success("Case opened successfully");
      window.location.href = `/ca/cases/${res.data.data.id}`;
    } catch (err: any) {
      const msg = err?.response?.data?.message || "";
      if (msg.toLowerCase().includes("already exists")) {
        toast.info("Case already exists for this booking");
        window.location.href = "/ca/cases";
      } else {
        toast.error("Failed to open case");
      }
    } finally {
      setOpeningCase(null);
    }
  };

  return (
    <div>
      {/* Welcome */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-2xl font-bold font-heading">
            Welcome, CA {ca?.firstName}! 👋
          </motion.h1>
          <p className="text-muted-foreground">Here's your practice overview</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-xl" asChild>
            <Link href="/ca/cases"><FolderOpen className="mr-2 h-4 w-4" />My Cases</Link>
          </Button>
          <Button className="rounded-xl bg-brand-600 hover:bg-brand-700" asChild>
            <Link href="/ca/schedule">Manage Schedule</Link>
          </Button>
        </div>
      </div>

      {/* CA profile not created yet */}
      {!ca && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-red-800">CA Profile Incomplete</p>
            <p className="text-sm text-red-700 mb-3">Your account was created but your CA professional profile was not set up. Please complete it to get listed and accept bookings.</p>
            <a href="/auth/register?tab=ca" className="inline-flex items-center gap-1.5 bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-red-700 transition-colors">
              Complete Profile Setup <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}

      {/* CA profile exists but pending approval */}
      {ca && ca.status !== "ACTIVE" && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center gap-3">
          <Clock className="w-5 h-5 text-yellow-600 shrink-0" />
          <div>
            <p className="font-medium text-yellow-800">Account Pending Approval</p>
            <p className="text-sm text-yellow-700">Your profile is under review. You'll be notified once approved.</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Bookings", value: loading ? "—" : (stats?.totalBookings ?? "0"), icon: Calendar, color: "text-brand-600", bg: "bg-brand-50" },
          { label: "This Month", value: loading ? "—" : (stats?.thisMonthBookings ?? "0"), icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
          { label: "Total Earnings", value: loading ? "—" : (stats ? formatCurrency(stats.totalEarnings * 100) : "₹0"), icon: IndianRupee, color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Avg Rating", value: loading ? "—" : (stats ? `${stats.averageRating?.toFixed(1)}★` : "N/A"), icon: Star, color: "text-yellow-600", bg: "bg-yellow-50" },
        ].map(({ label, value, icon: Icon, color, bg }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{label}</p>
                    <p className="text-2xl font-bold font-heading">{value}</p>
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
        {/* Chart + Upcoming Consultations */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Bookings Trend</CardTitle>
              <BarChart3 className="w-5 h-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={demoChartData}>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <Tooltip cursor={{ fill: "hsl(var(--muted))" }} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                  <Bar dataKey="bookings" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Upcoming Consultations — with Open Case button */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Upcoming Consultations</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">After each consultation, open a case to assign work to the assistance team</p>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/ca/bookings" className="text-brand-600">View all <ArrowRight className="ml-1 w-4 h-4" /></Link>
              </Button>
            </CardHeader>
            <CardContent>
              {!stats?.upcomingBookings?.length ? (
                <div className="text-center py-8 text-muted-foreground text-sm">No upcoming consultations</div>
              ) : (
                <div className="space-y-3">
                  {stats.upcomingBookings.map((b: any) => {
                    const clientName = `${b.clientProfile?.firstName ?? ""} ${b.clientProfile?.lastName ?? ""}`.trim();
                    const serviceName = b.service?.name ?? "Service";
                    const isOpen = rescheduleId === b.id;
                    return (
                      <div key={b.id} className="rounded-xl border border-border overflow-hidden">
                        <div className="flex items-center gap-3 p-4">
                          <Avatar className="h-10 w-10 shrink-0">
                            <AvatarImage src={b.clientProfile?.avatarUrl} />
                            <AvatarFallback className="bg-green-100 text-green-700 text-xs font-bold">
                              {getInitials(b.clientProfile?.firstName || "C", b.clientProfile?.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">{clientName}</p>
                            <p className="text-xs text-muted-foreground">{serviceName}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />{formatDateTime(b.scheduledAt)}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                            {/* Join Meet — only real links */}
                            {isRealMeetLink(b.meetingLink) && (
                              <Button size="sm" className="h-8 text-xs rounded-lg bg-brand-600 hover:bg-brand-700" asChild>
                                <a href={b.meetingLink} target="_blank" rel="noopener noreferrer">
                                  <Video className="mr-1 h-3 w-3" />Join Meet
                                </a>
                              </Button>
                            )}
                            {/* Notify Client — only when real meet link exists */}
                            {isRealMeetLink(b.meetingLink) && (
                              <Button size="sm" variant="outline"
                                className="h-8 text-xs rounded-lg gap-1 border-blue-300 text-blue-700 hover:bg-blue-50"
                                disabled={sendingId === b.id}
                                onClick={() => sendMeetingDetails(b.id)}>
                                {sendingId === b.id
                                  ? <><RefreshCw className="h-3 w-3 animate-spin" />Sending…</>
                                  : <><Send className="h-3 w-3" />Notify Client</>
                                }
                              </Button>
                            )}
                            {/* Reschedule */}
                            <Button size="sm" variant={isOpen ? "secondary" : "outline"}
                              className="h-8 text-xs rounded-lg gap-1"
                              onClick={() => openReschedule(b.id)}>
                              <CalendarClock className="h-3 w-3" />
                              {isOpen ? "Cancel" : "Reschedule"}
                            </Button>
                            {/* Open Case */}
                            <Button size="sm" variant="outline"
                              className="h-8 text-xs rounded-lg border-emerald-300 text-emerald-700 hover:bg-emerald-50 gap-1"
                              disabled={openingCase === b.id}
                              onClick={() => handleOpenCase(b.id, clientName, serviceName)}>
                              <FolderOpen className="h-3 w-3" />
                              {openingCase === b.id ? "Opening…" : "Open Case"}
                            </Button>
                          </div>
                        </div>

                        {/* Inline reschedule panel */}
                        {isOpen && (
                          <div className="px-4 pb-4 pt-0 border-t border-border bg-muted/30">
                            <p className="text-xs font-semibold text-muted-foreground mt-3 mb-2">Select new date & time from your schedule</p>
                            <input type="date" value={rescheduleDate}
                              min={new Date().toISOString().split("T")[0]}
                              onChange={(e) => { setRescheduleDate(e.target.value); fetchRescheduleSlots(e.target.value); }}
                              className="border border-border rounded-xl px-3 py-1.5 text-xs bg-background mb-3 focus:outline-none focus:ring-2 focus:ring-brand-300" />
                            {loadingSlots && <p className="text-xs text-muted-foreground mb-2"><RefreshCw className="w-3 h-3 inline animate-spin mr-1" />Loading slots…</p>}
                            {!loadingSlots && rescheduleDate && rescheduleSlots.length === 0 && (
                              <p className="text-xs text-amber-600 mb-2">No available slots. Add slots in My Schedule first.</p>
                            )}
                            {rescheduleSlots.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mb-3">
                                {rescheduleSlots.map((slot: any) => (
                                  <button key={slot.id} onClick={() => setRescheduleSlotId(slot.id)}
                                    className={`px-2.5 py-1 text-xs rounded-xl border transition-colors ${rescheduleSlotId === slot.id ? "bg-brand-600 text-white border-brand-600" : "border-border hover:border-brand-400"}`}>
                                    {slot.startTime} – {slot.endTime}
                                  </button>
                                ))}
                              </div>
                            )}
                            <div className="flex gap-2">
                              <Button size="sm" className="rounded-xl bg-brand-600 hover:bg-brand-700 h-8 text-xs"
                                disabled={!rescheduleSlotId || rescheduling}
                                onClick={() => confirmReschedule(b.id)}>
                                {rescheduling ? <><RefreshCw className="w-3 h-3 mr-1 animate-spin" />Rescheduling…</> : <><CheckCircle className="w-3 h-3 mr-1" />Confirm</>}
                              </Button>
                              <Button size="sm" variant="ghost" className="rounded-xl h-8 text-xs" onClick={() => openReschedule(b.id)}>Cancel</Button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4">
          <Card className="bg-gradient-to-br from-brand-600 to-brand-800 text-white border-0">
            <CardContent className="p-6">
              <Award className="w-8 h-8 mb-3 opacity-80" />
              <h3 className="font-semibold font-heading text-lg mb-1">This Month</h3>
              <div className="space-y-2 mt-3">
                <div className="flex justify-between text-sm">
                  <span className="text-brand-200">Bookings</span>
                  <span className="font-semibold">{stats?.thisMonthBookings ?? 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-brand-200">Earnings</span>
                  <span className="font-semibold">{stats ? formatCurrency(stats.thisMonthEarnings * 100) : "₹0"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-brand-200">Reviews</span>
                  <span className="font-semibold">{stats?.totalReviews ?? 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Recent Reviews</CardTitle></CardHeader>
            <CardContent className="pt-0">
              {!stats?.totalReviews ? (
                <p className="text-sm text-muted-foreground text-center py-4">No reviews yet</p>
              ) : (
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-xl">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <span className="font-bold">{stats?.averageRating?.toFixed(1)}</span>
                  <span className="text-sm text-muted-foreground">({stats?.totalReviews} reviews)</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Quick Actions</CardTitle></CardHeader>
            <CardContent className="space-y-2 pt-0">
              {[
                { label: "View My Cases",   href: "/ca/cases",    icon: FolderOpen },
                { label: "Add Time Slots",  href: "/ca/schedule", icon: Calendar },
                { label: "View Earnings",   href: "/ca/earnings", icon: TrendingUp },
                { label: "Manage Clients",  href: "/ca/clients",  icon: Users },
              ].map(({ label, href, icon: Icon }) => (
                <Link key={href} href={href} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors group">
                  <Icon className="w-4 h-4 text-muted-foreground group-hover:text-brand-600" />
                  <span className="text-sm font-medium">{label}</span>
                  <ArrowRight className="ml-auto w-4 h-4 text-muted-foreground" />
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
