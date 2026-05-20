"use client";

import { useEffect, useState } from "react";
import { Search, Check, X, Pause, Eye, Filter, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { api, getErrorMessage } from "@/lib/api";
import { toast } from "sonner";
import { formatDate, getInitials } from "@/lib/utils";

const statusFilters = ["ALL", "ACTIVE", "PENDING_APPROVAL", "PENDING_PAYMENT", "SUSPENDED", "REJECTED"];

const statusVariants: Record<string, any> = {
  ACTIVE: "success",
  PENDING_APPROVAL: "warning",
  PENDING_PAYMENT: "info",
  SUSPENDED: "destructive",
  REJECTED: "destructive",
};

export default function CAManagementPage() {
  const [cas, setCAs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);

  const fetchCAs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20", ...(search && { search }), ...(statusFilter !== "ALL" && { status: statusFilter }) });
      const res = await api.get(`/admin/cas?${params}`);
      setCAs(res.data.data);
      setTotal(res.data.meta?.total || 0);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCAs(); }, [page, statusFilter]);

  const handleAction = async (id: string, action: "approve" | "reject" | "suspend", reason?: string) => {
    try {
      await api.put(`/admin/cas/${id}/${action}`, { reason });
      toast.success(`CA ${action}d successfully`);
      fetchCAs();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-gray-100">CA Management</h1>
          <p className="text-gray-400 mt-1">{total} CA professionals</p>
        </div>
        <Button variant="outline" size="sm" className="border-gray-700 text-gray-300 hover:bg-gray-800" onClick={fetchCAs}>
          <RefreshCw className="w-4 h-4 mr-1" />Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search by name or email..."
            className="pl-10 bg-gray-900 border-gray-700 text-gray-100 placeholder:text-gray-500 rounded-xl"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchCAs()}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {statusFilters.map((s) => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-3 py-1.5 text-xs font-medium rounded-xl border transition-colors ${statusFilter === s ? "bg-brand-600 border-brand-600 text-white" : "border-gray-700 text-gray-400 hover:border-gray-600 hover:text-gray-200"}`}>
              {s.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                {["CA Professional", "Status", "Experience", "Fee", "Bookings", "Joined", "Actions"].map((h) => (
                  <th key={h} className="text-left py-4 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                <tr><td colSpan={7} className="py-12 text-center text-gray-500">Loading...</td></tr>
              ) : cas.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center text-gray-500">No CA professionals found</td></tr>
              ) : cas.map((ca, i) => (
                <motion.tr key={ca.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="hover:bg-gray-800/50">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={ca.avatarUrl} />
                        <AvatarFallback className="bg-brand-900 text-brand-400 text-xs font-bold">{getInitials(ca.firstName, ca.lastName)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-gray-100">{ca.firstName} {ca.lastName}</p>
                        <p className="text-xs text-gray-400">{ca.user?.email}</p>
                        <p className="text-xs text-gray-500">{ca.city}, {ca.state}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4"><Badge variant={statusVariants[ca.status]} className="text-xs">{ca.status}</Badge></td>
                  <td className="py-4 px-4 text-sm text-gray-300">{ca.experienceYears}y</td>
                  <td className="py-4 px-4 text-sm text-gray-300">₹{(ca.consultationFee / 100).toFixed(0)}</td>
                  <td className="py-4 px-4 text-sm text-gray-300">{ca._count?.bookings ?? 0}</td>
                  <td className="py-4 px-4 text-xs text-gray-400">{formatDate(ca.user?.createdAt)}</td>
                  <td className="py-4 px-4">
                    <div className="flex gap-1">
                      {ca.status === "PENDING_APPROVAL" && (
                        <>
                          <button onClick={() => handleAction(ca.id, "approve")} className="p-1.5 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors" title="Approve"><Check className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleAction(ca.id, "reject")} className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors" title="Reject"><X className="w-3.5 h-3.5" /></button>
                        </>
                      )}
                      {ca.status === "ACTIVE" && (
                        <button onClick={() => handleAction(ca.id, "suspend")} className="p-1.5 rounded-lg bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 transition-colors" title="Suspend"><Pause className="w-3.5 h-3.5" /></button>
                      )}
                      <button className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors" title="View"><Eye className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-gray-800">
          <p className="text-sm text-gray-400">Showing {cas.length} of {total}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="border-gray-700 text-gray-400" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
            <Button variant="outline" size="sm" className="border-gray-700 text-gray-400" disabled={cas.length < 20} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
