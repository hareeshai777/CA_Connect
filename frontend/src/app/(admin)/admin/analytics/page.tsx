"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, ArrowDownRight, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

const CHART_STYLE = {
  contentStyle: { background: "#111827", border: "1px solid #1f2937", borderRadius: "10px", color: "#f9fafb", fontSize: "12px" },
  cursor: { fill: "rgba(59,130,246,.08)" },
};

// Static fallback analytics
const STATIC = {
  revenue: [
    { month: "Jan", revenue: 82000, commission: 8200 },
    { month: "Feb", revenue: 124000, commission: 12400 },
    { month: "Mar", revenue: 98000, commission: 9800 },
    { month: "Apr", revenue: 156000, commission: 15600 },
    { month: "May", revenue: 201000, commission: 20100 },
    { month: "Jun", revenue: 178000, commission: 17800 },
    { month: "Jul", revenue: 234000, commission: 23400 },
    { month: "Aug", revenue: 267000, commission: 26700 },
  ],
  bookings: [
    { month: "Jan", confirmed: 34, completed: 28, cancelled: 6 },
    { month: "Feb", confirmed: 52, completed: 46, cancelled: 8 },
    { month: "Mar", confirmed: 41, completed: 35, cancelled: 5 },
    { month: "Apr", confirmed: 67, completed: 60, cancelled: 9 },
    { month: "May", confirmed: 89, completed: 78, cancelled: 11 },
    { month: "Jun", confirmed: 76, completed: 68, cancelled: 7 },
    { month: "Jul", confirmed: 103, completed: 91, cancelled: 12 },
    { month: "Aug", confirmed: 118, completed: 105, cancelled: 14 },
  ],
  userGrowth: [
    { month: "Jan", clients: 45, cas: 8 },
    { month: "Feb", clients: 78, cas: 14 },
    { month: "Mar", clients: 112, cas: 19 },
    { month: "Apr", clients: 167, cas: 27 },
    { month: "May", clients: 231, cas: 38 },
    { month: "Jun", clients: 298, cas: 51 },
    { month: "Jul", clients: 389, cas: 64 },
    { month: "Aug", clients: 467, cas: 79 },
  ],
  servicePopularity: [
    { name: "GST Filing", bookings: 234, color: "#3b82f6" },
    { name: "Income Tax", bookings: 198, color: "#10b981" },
    { name: "Company Reg.", bookings: 134, color: "#8b5cf6" },
    { name: "Audit", bookings: 89, color: "#f59e0b" },
    { name: "Trademark", bookings: 67, color: "#ec4899" },
    { name: "Compliance", bookings: 54, color: "#14b8a6" },
  ],
  kpis: {
    totalRevenue: 1340000,
    revenueGrowth: 18.4,
    totalBookings: 580,
    bookingsGrowth: 24.1,
    avgBookingValue: 231000,
    avgGrowth: -3.2,
    caActivations: 79,
    activationsGrowth: 31.7,
  },
};

export default function AnalyticsPage() {
  const [data, setData] = useState(STATIC);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState<"3m" | "6m" | "1y">("6m");

  useEffect(() => {
    setLoading(true);
    api.get("/admin/analytics").then((r) => {
      if (r.data?.data) setData((prev) => ({ ...prev, ...r.data.data }));
    }).catch(() => {}).finally(() => setLoading(false));
  }, [period]);

  const kpis = data.kpis ?? STATIC.kpis;

  const KPI = ({ label, value, growth, format = "number" }: { label: string; value: number; growth: number; format?: string }) => {
    const isPositive = growth >= 0;
    return (
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
        <p className="text-sm text-gray-400 mb-2">{label}</p>
        <p className="text-2xl font-bold font-heading text-gray-100 mb-1">
          {format === "currency" ? formatCurrency(value) : value.toLocaleString("en-IN")}
        </p>
        <div className={`flex items-center gap-1 text-xs font-medium ${isPositive ? "text-green-400" : "text-red-400"}`}>
          {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
          {Math.abs(growth)}% vs last period
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-gray-100">Platform Analytics</h1>
          <p className="text-gray-400 mt-1">Performance overview and growth metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1 bg-gray-900 rounded-xl p-1 border border-gray-800">
            {(["3m", "6m", "1y"] as const).map((p) => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${period === p ? "bg-brand-600 text-white" : "text-gray-400 hover:text-gray-200"}`}>
                {p}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" className="border-gray-700 text-gray-300 hover:bg-gray-800"
            onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 800); }}>
            <RefreshCw className={`w-4 h-4 mr-1 ${loading ? "animate-spin" : ""}`} />Refresh
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
          <KPI label="Total Revenue" value={kpis.totalRevenue} growth={kpis.revenueGrowth} format="currency" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.07 }}>
          <KPI label="Total Bookings" value={kpis.totalBookings} growth={kpis.bookingsGrowth} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}>
          <KPI label="Avg. Booking Value" value={kpis.avgBookingValue} growth={kpis.avgGrowth} format="currency" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.21 }}>
          <KPI label="CA Activations" value={kpis.caActivations} growth={kpis.activationsGrowth} />
        </motion.div>
      </div>

      {/* Revenue + Bookings Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold font-heading text-gray-100">Revenue & Commission</h3>
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-brand-500 inline-block" />Revenue</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" />Commission</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data.revenue}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="comGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6b7280" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6b7280" }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip {...CHART_STYLE} formatter={(v: any) => [`₹${(v / 100).toLocaleString("en-IN")}`, ""]} />
              <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#revGrad)" />
              <Area type="monotone" dataKey="commission" stroke="#10b981" strokeWidth={2} fill="url(#comGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold font-heading text-gray-100">Booking Breakdown</h3>
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />Confirmed</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" />Completed</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" />Cancelled</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.bookings} barSize={8}>
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6b7280" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6b7280" }} />
              <Tooltip {...CHART_STYLE} />
              <Bar dataKey="confirmed" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="completed" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="cancelled" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* User Growth + Service Popularity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="lg:col-span-2 bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold font-heading text-gray-100">User Growth</h3>
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-brand-500 inline-block" />Clients</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500 inline-block" />CA Professionals</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data.userGrowth}>
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6b7280" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6b7280" }} />
              <Tooltip {...CHART_STYLE} />
              <Line type="monotone" dataKey="clients" stroke="#6366f1" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="cas" stroke="#f59e0b" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <h3 className="font-semibold font-heading text-gray-100 mb-4">Top Services</h3>
          <div className="space-y-3">
            {data.servicePopularity.map((s) => {
              const maxVal = Math.max(...data.servicePopularity.map(x => x.bookings));
              const pct = Math.round((s.bookings / maxVal) * 100);
              return (
                <div key={s.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-300">{s.name}</span>
                    <span className="text-xs text-gray-400">{s.bookings}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-gray-800">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: s.color }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pie mini */}
          <div className="mt-6">
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie data={data.servicePopularity} dataKey="bookings" nameKey="name" cx="50%" cy="50%" outerRadius={60} innerRadius={35}>
                  {data.servicePopularity.map((s, i) => <Cell key={i} fill={s.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#111827", border: "1px solid #1f2937", borderRadius: "8px", color: "#f9fafb", fontSize: "11px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
