"use client";

import { useEffect, useState } from "react";
import { Calendar, Search, Video, Star, RefreshCw, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { api, getErrorMessage } from "@/lib/api";
import { formatCurrency, formatDateTime, getInitials } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";

const STATUS_TABS = ["ALL", "CONFIRMED", "COMPLETED", "CANCELLED", "PENDING"];
const statusVariant: Record<string, any> = { CONFIRMED: "success", COMPLETED: "info", CANCELLED: "destructive", PENDING: "warning" };

const isMeetingExpired = (scheduledAt: string, duration = 45) => {
  if (!scheduledAt) return true;
  const end = new Date(scheduledAt);
  end.setMinutes(end.getMinutes() + duration);
  return Date.now() > end.getTime();
};

export default function ClientBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [reviewId, setReviewId] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleSlots, setRescheduleSlots] = useState<any[]>([]);
  const [rescheduleSlotId, setRescheduleSlotId] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [rescheduling, setRescheduling] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "15", ...(status !== "ALL" && { status }) });
      const res = await api.get(`/bookings/my?${params}`);
      setBookings(res.data.data || []);
      setTotal(res.data.meta?.total || 0);
    } catch { setBookings([]); toast.error("Failed to load bookings"); } finally { setLoading(false); }
  };

  useEffect(() => { fetchBookings(); }, [page, status]);

  const handleJoin = async (bookingId: string) => {
    setJoiningId(bookingId);
    try {
      const res = await api.post(`/bookings/${bookingId}/join`);
      const link = res.data.data?.meetingLink;
      if (link) window.open(link, "_blank", "noopener,noreferrer");
      setBookings((prev) => prev.map((b) => b.id === bookingId ? { ...b, clientJoinedAt: new Date().toISOString() } : b));
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setJoiningId(null); }
  };

  const openReschedule = (bookingId: string) => {
    setRescheduleId(rescheduleId === bookingId ? null : bookingId);
    setRescheduleDate("");
    setRescheduleSlots([]);
    setRescheduleSlotId("");
  };

  const fetchRescheduleSlots = async (caId: string, date: string) => {
    if (!date) return;
    setLoadingSlots(true);
    try {
      const res = await api.get(`/ca/${caId}/slots?date=${date}`);
      setRescheduleSlots(res.data.data || []);
      setRescheduleSlotId("");
    } catch { setRescheduleSlots([]); }
    finally { setLoadingSlots(false); }
  };

  const confirmReschedule = async (bookingId: string) => {
    if (!rescheduleSlotId) { toast.error("Please select a time slot"); return; }
    setRescheduling(true);
    try {
      await api.patch(`/bookings/${bookingId}/reschedule`, { slotId: rescheduleSlotId });
      toast.success("Booking rescheduled successfully!");
      setRescheduleId(null);
      setRescheduleDate("");
      setRescheduleSlots([]);
      setRescheduleSlotId("");
      fetchBookings();
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setRescheduling(false); }
  };

  const submitReview = async (bookingId: string) => {
    try {
      await api.post(`/bookings/${bookingId}/review`, { rating, comment });
      toast.success("Review submitted! Thank you.");
      setReviewId(null);
      fetchBookings();
    } catch (err) { toast.error(getErrorMessage(err)); }
  };

  const filtered = search
    ? bookings.filter((b) => `${b.caProfessional?.firstName} ${b.caProfessional?.lastName} ${b.service?.name}`.toLowerCase().includes(search.toLowerCase()))
    : bookings;

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold font-heading">My Bookings</h1><p className="text-muted-foreground mt-1">{total} total consultations</p></div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="rounded-xl" onClick={fetchBookings}><RefreshCw className="w-4 h-4 mr-1" />Refresh</Button>
          <Button size="sm" className="rounded-xl bg-brand-600 hover:bg-brand-700" asChild><Link href="/services">+ Book Consultation</Link></Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search CA or service..." className="pl-10 rounded-xl" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUS_TABS.map((s) => (
            <button key={s} onClick={() => { setStatus(s); setPage(1); }}
              className={`px-3 py-1.5 text-xs font-medium rounded-xl border transition-colors ${status === s ? "bg-brand-600 border-brand-600 text-white" : "border-border text-muted-foreground hover:border-brand-300"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 bg-muted animate-pulse rounded-2xl" />)
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">No bookings found</p>
            <Button className="rounded-xl bg-brand-600 hover:bg-brand-700" asChild><Link href="/services">Book a Consultation</Link></Button>
          </div>
        ) : (
          filtered.map((b, i) => (
            <motion.div key={b.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="bg-card rounded-2xl border border-border p-5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <Avatar className="h-12 w-12 shrink-0">
                  <AvatarImage src={b.caProfessional?.avatarUrl} />
                  <AvatarFallback className="bg-brand-100 text-brand-700 font-bold">
                    {getInitials(b.caProfessional?.firstName || "C", b.caProfessional?.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold">CA {b.caProfessional?.firstName} {b.caProfessional?.lastName}</p>
                  <p className="text-sm text-muted-foreground">{b.service?.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1"><Clock className="w-3 h-3" />{formatDateTime(b.scheduledAt)}</p>
                </div>
                <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
                  <Badge variant={statusVariant[b.status]} className="text-xs">{b.status}</Badge>
                  <p className="text-sm font-semibold text-brand-600">{formatCurrency(b.amount)}</p>
                </div>
                {b.status === "CONFIRMED" && b.meetingLink && !b.clientJoinedAt && !isMeetingExpired(b.scheduledAt, b.duration) && (
                  <Button
                    size="sm"
                    className="rounded-xl bg-brand-600 hover:bg-brand-700 shrink-0"
                    disabled={joiningId === b.id}
                    onClick={() => handleJoin(b.id)}
                  >
                    <Video className="mr-1.5 h-3.5 w-3.5" />
                    {joiningId === b.id ? "Joining…" : "Join"}
                  </Button>
                )}
                {["CONFIRMED", "PENDING"].includes(b.status) && !isMeetingExpired(b.scheduledAt, b.duration) && (
                  <Button size="sm" variant="outline" className="rounded-xl shrink-0 gap-1.5" onClick={() => openReschedule(b.id)}>
                    <Calendar className="w-3.5 h-3.5" />Reschedule
                  </Button>
                )}
                {b.status === "COMPLETED" && !b.review && (
                  <Button size="sm" variant="outline" className="rounded-xl shrink-0 gap-1.5" onClick={() => setReviewId(reviewId === b.id ? null : b.id)}>
                    <Star className="w-3.5 h-3.5 text-yellow-500" />Rate
                  </Button>
                )}
              </div>

              {rescheduleId === b.id && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-sm font-medium mb-3">Select a new date and time slot</p>
                  <input
                    type="date"
                    value={rescheduleDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => { setRescheduleDate(e.target.value); fetchRescheduleSlots(b.caProfessionalId, e.target.value); }}
                    className="border border-border rounded-xl px-3 py-2 text-sm mb-3 bg-background"
                  />
                  {loadingSlots && <p className="text-xs text-muted-foreground mb-3">Loading available slots…</p>}
                  {!loadingSlots && rescheduleDate && rescheduleSlots.length === 0 && (
                    <p className="text-xs text-muted-foreground mb-3">No slots available for this date.</p>
                  )}
                  {rescheduleSlots.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {rescheduleSlots.map((slot: any) => (
                        <button key={slot.id} onClick={() => setRescheduleSlotId(slot.id)}
                          className={`px-3 py-1.5 text-xs rounded-xl border transition-colors ${rescheduleSlotId === slot.id ? "bg-brand-600 text-white border-brand-600" : "border-border text-muted-foreground hover:border-brand-300"}`}>
                          {slot.startTime} – {slot.endTime}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button size="sm" className="rounded-xl bg-brand-600 hover:bg-brand-700"
                      disabled={!rescheduleSlotId || rescheduling}
                      onClick={() => confirmReschedule(b.id)}>
                      {rescheduling ? "Rescheduling…" : "Confirm Reschedule"}
                    </Button>
                    <Button size="sm" variant="ghost" className="rounded-xl" onClick={() => openReschedule(b.id)}>Cancel</Button>
                  </div>
                </div>
              )}

              {reviewId === b.id && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-sm font-medium mb-2">Rate your experience</p>
                  <div className="flex gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button key={n} onClick={() => setRating(n)}>
                        <Star className={`w-6 h-6 transition-colors ${n <= rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"}`} />
                      </button>
                    ))}
                  </div>
                  <Input placeholder="Write a comment (optional)" value={comment} onChange={(e) => setComment(e.target.value)} className="rounded-xl mb-3" />
                  <div className="flex gap-2">
                    <Button size="sm" className="rounded-xl bg-brand-600 hover:bg-brand-700" onClick={() => submitReview(b.id)}>Submit Review</Button>
                    <Button size="sm" variant="ghost" className="rounded-xl" onClick={() => setReviewId(null)}>Cancel</Button>
                  </div>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>

      {total > 15 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-muted-foreground">Showing {filtered.length} of {total}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="rounded-xl" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
            <Button variant="outline" size="sm" className="rounded-xl" disabled={bookings.length < 15} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        </div>
      )}
    </div>
  );
}
