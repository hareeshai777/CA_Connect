"use client";

import { useEffect, useState } from "react";
import { Calendar, Search, Video, RefreshCw, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { api } from "@/lib/api";
import { formatCurrency, formatDateTime, getInitials } from "@/lib/utils";

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
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page), limit: "15",
        ...(status !== "ALL" && { status }),
      });
      const res = await api.get(`/bookings/ca?${params}`);
      setBookings(res.data.data || []);
      setTotal(res.data.meta?.total || 0);
    } catch { setBookings([]); } finally { setLoading(false); }
  };

  useEffect(() => { fetchBookings(); }, [page, status]);

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
        <Button variant="outline" size="sm" className="rounded-xl" onClick={fetchBookings}>
          <RefreshCw className="w-4 h-4 mr-1" />Refresh
        </Button>
      </div>

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

      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 bg-muted animate-pulse rounded-2xl" />)
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No bookings found</p>
          </div>
        ) : (
          filtered.map((b, i) => (
            <motion.div key={b.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="bg-card rounded-2xl border border-border p-5 flex flex-col sm:flex-row sm:items-center gap-4">
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
              <div className="flex flex-col items-start sm:items-end gap-2">
                <Badge variant={statusVariant[b.status]} className="text-xs">{b.status}</Badge>
                <p className="text-sm font-semibold text-brand-600">{formatCurrency(b.amount)}</p>
              </div>
              {b.status === "CONFIRMED" && b.meetingLink && !isMeetingExpired(b.scheduledAt, b.duration) && (
                <Button size="sm" className="rounded-xl bg-brand-600 hover:bg-brand-700 shrink-0" asChild>
                  <a href={b.meetingLink} target="_blank" rel="noopener noreferrer">
                    <Video className="mr-1.5 h-3.5 w-3.5" />Join Meet
                  </a>
                </Button>
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
