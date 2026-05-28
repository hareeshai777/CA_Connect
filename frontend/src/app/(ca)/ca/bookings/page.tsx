"use client";

import { useEffect, useRef, useState } from "react";
import { Calendar, Search, Video, RefreshCw, Clock, AlertCircle, CalendarClock, CheckCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { api, getErrorMessage } from "@/lib/api";
import { formatCurrency, formatDateTime, getInitials } from "@/lib/utils";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";

const STATUS_TABS = ["ALL", "CONFIRMED", "COMPLETED", "CANCELLED", "PENDING"];

const statusVariant: Record<string, any> = {
  CONFIRMED: "success", COMPLETED: "info", CANCELLED: "destructive", PENDING: "warning",
};

const isMeetingExpired = (scheduledAt: string, duration = 45) => {
  if (!scheduledAt) return true;
  const end = new Date(scheduledAt);
  end.setMinutes(end.getMinutes() + duration);
  return Date.now() > end.getTime();
};

export default function CABookingsPage() {
  const { user } = useAuthStore();
  const caId = user?.caProfessional?.id;

  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  // Reschedule state
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleSlots, setRescheduleSlots] = useState<any[]>([]);
  const [rescheduleSlotId, setRescheduleSlotId] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [rescheduling, setRescheduling] = useState(false);

  const fetchBookings = async (retryCount = 0) => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "15", ...(status !== "ALL" && { status }) });
      const res = await api.get(`/bookings/ca?${params}`, { signal: abortRef.current.signal });
      setBookings(res.data.data || []);
      setTotal(res.data.meta?.total || 0);
    } catch (err: any) {
      if (err?.code === "ERR_CANCELED") return;
      if (retryCount < 1) { setTimeout(() => fetchBookings(retryCount + 1), 2000); return; }
      setBookings([]);
      const msg = getErrorMessage(err) || "Failed to load bookings";
      setError(msg);
      toast.error(msg);
    } finally { setLoading(false); }
  };

  useEffect(() => {
    fetchBookings();
    return () => abortRef.current?.abort();
  }, [page, status]);

  const openReschedule = (bookingId: string) => {
    setRescheduleId(rescheduleId === bookingId ? null : bookingId);
    setRescheduleDate("");
    setRescheduleSlots([]);
    setRescheduleSlotId("");
  };

  const fetchMySlots = async (date: string) => {
    if (!date || !caId) return;
    setLoadingSlots(true);
    try {
      const res = await api.get(`/ca/${caId}/slots?date=${date}`);
      // Only unbooked slots
      setRescheduleSlots((res.data.data || []).filter((s: any) => !s.isBooked && !s.isBlocked));
      setRescheduleSlotId("");
    } catch { setRescheduleSlots([]); }
    finally { setLoadingSlots(false); }
  };

  const confirmReschedule = async (bookingId: string) => {
    if (!rescheduleSlotId) { toast.error("Please select a time slot"); return; }
    setRescheduling(true);
    try {
      await api.patch(`/bookings/${bookingId}/ca-reschedule`, { slotId: rescheduleSlotId });
      toast.success("Meeting rescheduled successfully!");
      setRescheduleId(null);
      setRescheduleDate("");
      setRescheduleSlots([]);
      setRescheduleSlotId("");
      fetchBookings();
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setRescheduling(false); }
  };

  const filtered = search
    ? bookings.filter((b) =>
        `${b.clientProfile?.firstName} ${b.clientProfile?.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
        b.service?.name?.toLowerCase().includes(search.toLowerCase()))
    : bookings;

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading">My Bookings</h1>
          <p className="text-muted-foreground mt-1">{total} total consultations</p>
        </div>
        <Button variant="outline" size="sm" className="rounded-xl" onClick={() => fetchBookings()}>
          <RefreshCw className="w-4 h-4 mr-1" />Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search client or service..." className="pl-10 rounded-xl" value={search} onChange={(e) => setSearch(e.target.value)} />
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

      {/* List */}
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 bg-muted animate-pulse rounded-2xl" />)
        ) : error ? (
          <div className="text-center py-20 bg-red-50 rounded-2xl border border-red-100">
            <AlertCircle className="w-12 h-12 text-red-300 mx-auto mb-3" />
            <p className="text-red-600 font-medium mb-1">Could not load bookings</p>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button size="sm" className="rounded-xl bg-brand-600 hover:bg-brand-700" onClick={() => fetchBookings()}>
              <RefreshCw className="w-4 h-4 mr-1" /> Try Again
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No bookings found</p>
          </div>
        ) : (
          filtered.map((b, i) => (
            <motion.div key={b.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="bg-card rounded-2xl border border-border overflow-hidden">

              {/* Main row */}
              <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                <Avatar className="h-11 w-11 shrink-0">
                  <AvatarImage src={b.clientProfile?.avatarUrl} />
                  <AvatarFallback className="bg-brand-100 text-brand-700 text-sm font-bold">
                    {getInitials(b.clientProfile?.firstName || "C", b.clientProfile?.lastName)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold">{b.clientProfile?.firstName} {b.clientProfile?.lastName}</p>
                  <p className="text-sm text-muted-foreground">{b.service?.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                    <Clock className="w-3 h-3" />{formatDateTime(b.scheduledAt)}
                  </p>
                </div>

                <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
                  <Badge variant={statusVariant[b.status]} className="text-xs">{b.status}</Badge>
                  <p className="text-sm font-semibold text-brand-600">{formatCurrency(b.amount)}</p>
                </div>

                <div className="flex gap-2 shrink-0 flex-wrap">
                  {/* Join Meet */}
                  {b.status === "CONFIRMED" && b.meetingLink && !isMeetingExpired(b.scheduledAt, b.duration) && (
                    <Button size="sm" className="rounded-xl bg-brand-600 hover:bg-brand-700" asChild>
                      <a href={b.meetingLink} target="_blank" rel="noopener noreferrer">
                        <Video className="mr-1.5 h-3.5 w-3.5" />Join Meet
                      </a>
                    </Button>
                  )}
                  {/* Reschedule */}
                  {["CONFIRMED", "PENDING"].includes(b.status) && !isMeetingExpired(b.scheduledAt, b.duration) && (
                    <Button size="sm" variant={rescheduleId === b.id ? "secondary" : "outline"}
                      className="rounded-xl gap-1.5"
                      onClick={() => openReschedule(b.id)}>
                      <CalendarClock className="w-3.5 h-3.5" />
                      {rescheduleId === b.id ? "Cancel" : "Reschedule"}
                    </Button>
                  )}
                </div>
              </div>

              {/* Reschedule panel */}
              <AnimatePresence>
                {rescheduleId === b.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 pt-0 border-t border-border bg-muted/30">
                      <div className="pt-4">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-7 h-7 bg-brand-100 rounded-lg flex items-center justify-center">
                            <CalendarClock className="w-4 h-4 text-brand-600" />
                          </div>
                          <p className="text-sm font-semibold">Reschedule Meeting</p>
                          <button onClick={() => openReschedule(b.id)} className="ml-auto text-muted-foreground hover:text-foreground">
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <p className="text-xs text-muted-foreground mb-3">
                          Select a new date and time from your available schedule. The client will be notified.
                        </p>

                        {/* Date picker */}
                        <div className="flex flex-col sm:flex-row gap-3 mb-4">
                          <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1 block">Select Date</label>
                            <input
                              type="date"
                              value={rescheduleDate}
                              min={new Date().toISOString().split("T")[0]}
                              onChange={(e) => { setRescheduleDate(e.target.value); fetchMySlots(e.target.value); }}
                              className="border border-border rounded-xl px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-brand-300"
                            />
                          </div>
                        </div>

                        {/* Slot selector */}
                        {loadingSlots && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                            <RefreshCw className="w-3 h-3 animate-spin" /> Loading your available slots…
                          </div>
                        )}
                        {!loadingSlots && rescheduleDate && rescheduleSlots.length === 0 && (
                          <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
                            No available slots on this date. Please add time slots in <strong>My Schedule</strong> first.
                          </p>
                        )}
                        {rescheduleSlots.length > 0 && (
                          <div className="mb-4">
                            <label className="text-xs font-medium text-muted-foreground mb-2 block">Select Time Slot</label>
                            <div className="flex flex-wrap gap-2">
                              {rescheduleSlots.map((slot: any) => (
                                <button key={slot.id} onClick={() => setRescheduleSlotId(slot.id)}
                                  className={`px-3 py-1.5 text-xs rounded-xl border font-medium transition-all ${
                                    rescheduleSlotId === slot.id
                                      ? "bg-brand-600 text-white border-brand-600 shadow-md"
                                      : "border-border text-muted-foreground hover:border-brand-400 hover:text-brand-600"
                                  }`}>
                                  {slot.startTime} – {slot.endTime}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2">
                          <Button size="sm"
                            className="rounded-xl bg-brand-600 hover:bg-brand-700"
                            disabled={!rescheduleSlotId || rescheduling}
                            onClick={() => confirmReschedule(b.id)}>
                            {rescheduling ? (
                              <><RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />Rescheduling…</>
                            ) : (
                              <><CheckCircle className="w-3.5 h-3.5 mr-1.5" />Confirm Reschedule</>
                            )}
                          </Button>
                          <Button size="sm" variant="ghost" className="rounded-xl" onClick={() => openReschedule(b.id)}>Cancel</Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
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
