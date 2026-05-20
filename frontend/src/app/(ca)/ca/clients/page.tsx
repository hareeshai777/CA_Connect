"use client";

import { useEffect, useState } from "react";
import { Search, Users, Calendar, Mail, Phone } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { formatDate, getInitials } from "@/lib/utils";

export default function CAClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get("/bookings/ca?limit=100&status=COMPLETED").then((res) => {
      const seen = new Set();
      const unique = (res.data.data || []).reduce((acc: any[], b: any) => {
        if (b.clientProfile?.userId && !seen.has(b.clientProfile.userId)) {
          seen.add(b.clientProfile.userId);
          acc.push({ ...b.clientProfile, lastBooking: b, totalBookings: 1 });
        }
        return acc;
      }, []);
      setClients(unique);
    }).catch(() => setClients([])).finally(() => setLoading(false));
  }, []);

  const filtered = search
    ? clients.filter((c) => `${c.firstName} ${c.lastName} ${c.phone}`.toLowerCase().includes(search.toLowerCase()))
    : clients;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-heading">My Clients</h1>
        <p className="text-muted-foreground mt-1">{clients.length} clients served</p>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search clients..." className="pl-10 rounded-xl" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-32 bg-muted animate-pulse rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">{search ? "No clients match your search" : "No clients yet. Complete consultations to see your clients here."}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c, i) => (
            <motion.div key={c.userId || i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-card rounded-2xl border border-border p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-11 w-11">
                  <AvatarImage src={c.avatarUrl} />
                  <AvatarFallback className="bg-brand-100 text-brand-700 font-bold">{getInitials(c.firstName, c.lastName)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-sm">{c.firstName} {c.lastName}</p>
                  <p className="text-xs text-muted-foreground">{c.city || "—"}</p>
                </div>
              </div>
              <div className="space-y-1.5 text-xs text-muted-foreground">
                {c.phone && <p className="flex items-center gap-1.5"><Phone className="w-3 h-3" />{c.phone}</p>}
                <p className="flex items-center gap-1.5"><Calendar className="w-3 h-3" />Last: {formatDate(c.lastBooking?.scheduledAt || c.lastBooking?.createdAt)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
