"use client";

import { useEffect, useState } from "react";
import { IndianRupee, TrendingUp, Calendar, Download, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";

const STATIC_CHART = [
  { month: "Jan", earnings: 0 }, { month: "Feb", earnings: 0 },
  { month: "Mar", earnings: 0 }, { month: "Apr", earnings: 0 },
  { month: "May", earnings: 0 }, { month: "Jun", earnings: 0 },
];

export default function EarningsPage() {
  const [stats, setStats] = useState<any>(null);
  const [earnings, setEarnings] = useState<any[]>([]);
  const [chart, setChart] = useState(STATIC_CHART);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/ca/my/dashboard").catch(() => ({ data: { data: null } })),
      api.get("/ca/my/earnings").catch(() => ({ data: { data: [] } })),
    ]).then(([statsRes, earningsRes]) => {
      if (statsRes.data?.data) setStats(statsRes.data.data);
      if (earningsRes.data?.data?.length) setEarnings(earningsRes.data.data);
    }).finally(() => setLoading(false));
  }, []);

  const kpis = [
    { label: "Total Earnings", value: stats ? formatCurrency((stats.totalEarnings || 0) * 100) : "—", icon: IndianRupee, color: "text-brand-600", bg: "bg-brand-50 dark:bg-brand-950" },
    { label: "This Month", value: stats ? formatCurrency((stats.thisMonthEarnings || 0) * 100) : "—", icon: TrendingUp, color: "text-green-600", bg: "bg-green-50 dark:bg-green-950" },
    { label: "Total Bookings", value: stats?.totalBookings ?? "—", icon: Calendar, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-950" },
    { label: "Avg per Booking", value: stats?.totalEarnings && stats?.totalBookings ? formatCurrency((stats.totalEarnings / stats.totalBookings) * 100) : "—", icon: IndianRupee, color: "text-gold-600", bg: "bg-yellow-50 dark:bg-yellow-950" },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading">Earnings</h1>
          <p className="text-muted-foreground mt-1">Track your income from consultations</p>
        </div>
        <Button variant="outline" size="sm" className="rounded-xl gap-1.5">
          <Download className="w-4 h-4" />Export
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpis.map(({ label, value, icon: Icon, color, bg }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="bg-card rounded-2xl border border-border p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">{label}</p>
              <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center`}>
                <Icon className={`w-4.5 h-4.5 ${color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold font-heading">{value}</p>
          </motion.div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-card rounded-2xl border border-border p-6 mb-6">
        <h3 className="font-semibold font-heading mb-4">Monthly Earnings</h3>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chart}>
            <defs>
              <linearGradient id="earnGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${(v / 100).toLocaleString("en-IN")}`} />
            <Tooltip formatter={(v: any) => [`₹${(Number(v) / 100).toLocaleString("en-IN")}`, "Earnings"]}
              contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
            <Area type="monotone" dataKey="earnings" stroke="#6366f1" strokeWidth={2} fill="url(#earnGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Transactions */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="p-5 border-b border-border">
          <h3 className="font-semibold font-heading">Transaction History</h3>
        </div>
        {loading ? (
          <div className="p-8 text-center text-muted-foreground text-sm">Loading...</div>
        ) : earnings.length === 0 ? (
          <div className="p-16 text-center">
            <IndianRupee className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No earnings yet. Complete bookings to see your earnings here.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {earnings.map((e) => (
              <div key={e.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                <div>
                  <p className="text-sm font-medium">{e.booking?.clientProfile?.firstName} {e.booking?.clientProfile?.lastName}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(e.createdAt)} · {e.booking?.service?.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">+{formatCurrency(e.netAmount * 100)}</p>
                  <p className="text-xs text-muted-foreground">after {formatCurrency(e.platformFee * 100)} fee</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
