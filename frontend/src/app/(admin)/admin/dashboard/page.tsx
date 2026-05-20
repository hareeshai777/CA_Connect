"use client";

import { useEffect, useState } from "react";
import { Users, UserCheck, Calendar, IndianRupee, TrendingUp, Clock, CheckCircle, BarChart3, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { api } from "@/lib/api";
import { formatCurrency, formatDateTime, getInitials } from "@/lib/utils";

const DARK_CHART_STYLE = {
  contentStyle: { background: "#1f2937", border: "1px solid #374151", borderRadius: "8px", color: "#f9fafb" },
  cursor: { fill: "rgba(59,130,246,.1)" },
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/dashboard").then((r) => setStats(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const bookingChartData = [
    { month: "Jan", bookings: 45 }, { month: "Feb", bookings: 67 }, { month: "Mar", bookings: 89 },
    { month: "Apr", bookings: 112 }, { month: "May", bookings: 145 }, { month: "Jun", bookings: 178 },
  ];

  const revenueChartData = [
    { month: "Jan", revenue: 45000 }, { month: "Feb", revenue: 67000 }, { month: "Mar", revenue: 89000 },
    { month: "Apr", revenue: 112000 }, { month: "May", revenue: 145000 }, { month: "Jun", revenue: 178000 },
  ];

  const statCards = [
    { label: "Total Users", value: stats?.totalUsers ?? "—", icon: Users, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
    { label: "Active CAs", value: stats?.activeCAs ?? "—", icon: UserCheck, color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
    { label: "Pending Approvals", value: stats?.pendingCAs ?? "—", icon: Clock, color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
    { label: "Total Bookings", value: stats?.totalBookings ?? "—", icon: Calendar, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
    { label: "Platform Revenue", value: stats ? formatCurrency(stats.platformRevenue) : "—", icon: IndianRupee, color: "text-gold-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
    { label: "This Month", value: stats ? `${stats.thisMonthBookings} bookings` : "—", icon: TrendingUp, color: "text-teal-400", bg: "bg-teal-500/10 border-teal-500/20" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-heading text-gray-100">Platform Overview</h1>
        <p className="text-gray-400 mt-1">Monitor all activity across CA Pro</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, color, bg }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <div className={`p-5 rounded-2xl border ${bg}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">{label}</p>
                  <p className="text-2xl font-bold font-heading text-gray-100">{value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Bookings Chart */}
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <h3 className="font-semibold font-heading text-gray-100 mb-4">Monthly Bookings</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={bookingChartData}>
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#9ca3af" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#9ca3af" }} />
              <Tooltip {...DARK_CHART_STYLE} />
              <Bar dataKey="bookings" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Chart */}
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <h3 className="font-semibold font-heading text-gray-100 mb-4">Monthly Revenue (₹)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={revenueChartData}>
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#9ca3af" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#9ca3af" }} />
              <Tooltip {...DARK_CHART_STYLE} formatter={(v: any) => [`₹${v.toLocaleString()}`, "Revenue"]} />
              <Line type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending CA Approvals */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800">
          <div className="flex items-center justify-between p-6 border-b border-gray-800">
            <h3 className="font-semibold font-heading text-gray-100">Pending CA Approvals</h3>
            <Link href="/admin/ca-management" className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="p-4">
            {!stats?.pendingCAApprovals?.length ? (
              <div className="text-center py-8 text-gray-500 text-sm">No pending approvals</div>
            ) : (
              <div className="space-y-3">
                {stats.pendingCAApprovals.map((ca: any) => (
                  <div key={ca.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-800">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-brand-900 text-brand-400 text-xs font-bold">
                        {getInitials(ca.firstName, ca.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-100">{ca.firstName} {ca.lastName}</p>
                      <p className="text-xs text-gray-400">{ca.user?.email}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="h-7 text-xs rounded-lg bg-green-600 hover:bg-green-700"
                        onClick={() => api.put(`/admin/cas/${ca.id}/approve`).then(() => window.location.reload())}>
                        Approve
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 text-xs rounded-lg border-red-700 text-red-400 hover:bg-red-900/20"
                        onClick={() => api.put(`/admin/cas/${ca.id}/reject`, { reason: "Incomplete documents" }).then(() => window.location.reload())}>
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800">
          <div className="flex items-center justify-between p-6 border-b border-gray-800">
            <h3 className="font-semibold font-heading text-gray-100">Recent Bookings</h3>
          </div>
          <div className="p-4">
            {!stats?.recentBookings?.length ? (
              <div className="text-center py-8 text-gray-500 text-sm">No bookings yet</div>
            ) : (
              <div className="space-y-3">
                {stats.recentBookings.slice(0, 5).map((b: any) => (
                  <div key={b.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-800">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-100">{b.clientProfile?.firstName} → {b.caProfessional?.firstName} {b.caProfessional?.lastName}</p>
                      <p className="text-xs text-gray-400">{b.service?.name} • {formatDateTime(b.createdAt)}</p>
                    </div>
                    <Badge variant={b.status === "CONFIRMED" ? "success" : b.status === "COMPLETED" ? "info" : "warning"} className="text-xs shrink-0">
                      {b.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
