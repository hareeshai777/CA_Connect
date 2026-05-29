"use client";

import { useEffect, useState } from "react";
import { Search, Check, X, Pause, RefreshCw, FileText, ExternalLink, Play, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { api, getErrorMessage } from "@/lib/api";
import { toast } from "sonner";
import { formatDate, getInitials } from "@/lib/utils";

const statusFilters = ["ALL", "PENDING_APPROVAL", "ACTIVE", "SUSPENDED", "REJECTED", "PENDING_PAYMENT"];

const statusVariants: Record<string, any> = {
  ACTIVE: "success",
  PENDING_APPROVAL: "warning",
  PENDING_PAYMENT: "info",
  SUSPENDED: "destructive",
  REJECTED: "destructive",
};

const statusLabels: Record<string, string> = {
  ACTIVE: "Active",
  PENDING_APPROVAL: "Pending Review",
  PENDING_PAYMENT: "Pending Payment",
  SUSPENDED: "Suspended",
  REJECTED: "Rejected",
};

export default function CAManagementPage() {
  const [cas, setCAs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchCAs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20", ...(search && { search }), ...(statusFilter !== "ALL" && { status: statusFilter }) });
      const res = await api.get(`/admin/cas?${params}`);
      setCAs(res.data.data || []);
      setTotal(res.data.meta?.total || 0);
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCAs(); }, [page, statusFilter]);

  const handleAction = async (id: string, action: string) => {
    setActionId(id + action);
    try {
      await api.put(`/admin/cas/${id}/${action}`);
      const labels: Record<string, string> = {
        approve: "CA approved and activated",
        reject: "CA application rejected",
        suspend: "CA deactivated",
        activate: "CA activated",
        deactivate: "CA deactivated",
      };
      toast.success(labels[action] || "Done");
      fetchCAs();
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setActionId(null); }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">CA Management</h1>
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
          <Input placeholder="Search by name or email..." className="pl-10 bg-gray-900 border-gray-700 text-gray-100 placeholder:text-gray-500 rounded-xl"
            value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && fetchCAs()} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {statusFilters.map((s) => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-3 py-1.5 text-xs font-medium rounded-xl border transition-colors ${statusFilter === s ? "bg-blue-600 border-blue-600 text-white" : "border-gray-700 text-gray-400 hover:border-gray-500"}`}>
              {s === "ALL" ? "All" : statusLabels[s] || s}
            </button>
          ))}
        </div>
      </div>

      {/* CA List */}
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-28 bg-gray-900 animate-pulse rounded-2xl" />)
        ) : cas.length === 0 ? (
          <div className="text-center py-16 text-gray-500">No CAs found</div>
        ) : (
          cas.map((ca, i) => (
            <motion.div key={ca.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <div className="flex flex-col lg:flex-row lg:items-start gap-4">

                {/* Avatar + Info */}
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <Avatar className="h-12 w-12 shrink-0">
                    <AvatarImage src={ca.avatarUrl} />
                    <AvatarFallback className="bg-blue-900 text-blue-300 font-bold">
                      {getInitials(ca.firstName, ca.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <p className="font-semibold text-gray-100">{ca.firstName} {ca.lastName}</p>
                      <Badge variant={statusVariants[ca.status]} className="text-xs">
                        {statusLabels[ca.status] || ca.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-400">{ca.user?.email}</p>
                    <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-gray-500">
                      {ca.membershipNumber && <span>📋 {ca.membershipNumber}</span>}
                      {ca.city && <span>📍 {ca.city}, {ca.state}</span>}
                      {ca.experienceYears > 0 && <span>🕐 {ca.experienceYears}+ yrs</span>}
                      <span>📅 Joined {formatDate(ca.createdAt)}</span>
                    </div>

                    {/* Certificate */}
                    {ca.certificateUrl ? (
                      <a href={ca.certificateUrl} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 mt-2 text-xs text-blue-400 hover:text-blue-300 font-medium bg-blue-900/30 border border-blue-800/50 rounded-lg px-2.5 py-1">
                        <FileText className="w-3.5 h-3.5" /> View Certificate <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="inline-flex items-center gap-1 mt-2 text-xs text-gray-600">
                        <AlertCircle className="w-3.5 h-3.5" /> No certificate uploaded
                      </span>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap gap-2 shrink-0">
                  {/* PENDING_APPROVAL → Approve or Reject */}
                  {ca.status === "PENDING_APPROVAL" && (
                    <>
                      <Button size="sm" className="rounded-xl bg-green-600 hover:bg-green-700 text-white gap-1.5 font-semibold"
                        disabled={actionId === ca.id + "approve"}
                        onClick={() => handleAction(ca.id, "approve")}>
                        <Check className="w-3.5 h-3.5" /> Approve
                      </Button>
                      <Button size="sm" className="rounded-xl bg-red-600 hover:bg-red-700 text-white gap-1.5 font-semibold"
                        disabled={actionId === ca.id + "reject"}
                        onClick={() => handleAction(ca.id, "reject")}>
                        <X className="w-3.5 h-3.5" /> Reject
                      </Button>
                    </>
                  )}

                  {/* ACTIVE → Deactivate */}
                  {ca.status === "ACTIVE" && (
                    <Button size="sm" variant="outline" className="rounded-xl border-orange-700 text-orange-400 hover:bg-orange-900/30 gap-1.5"
                      disabled={actionId === ca.id + "deactivate"}
                      onClick={() => handleAction(ca.id, "deactivate")}>
                      <Pause className="w-3.5 h-3.5" /> Deactivate
                    </Button>
                  )}

                  {/* SUSPENDED or REJECTED → Activate */}
                  {(ca.status === "SUSPENDED" || ca.status === "REJECTED") && (
                    <Button size="sm" className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white gap-1.5 font-semibold"
                      disabled={actionId === ca.id + "activate"}
                      onClick={() => handleAction(ca.id, "activate")}>
                      <Play className="w-3.5 h-3.5" /> Activate
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Pagination */}
      {total > 20 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-gray-400">Showing {cas.length} of {total}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="rounded-xl border-gray-700 text-gray-300" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
            <Button variant="outline" size="sm" className="rounded-xl border-gray-700 text-gray-300" disabled={cas.length < 20} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        </div>
      )}
    </div>
  );
}
