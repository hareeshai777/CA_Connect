"use client";

import { useEffect, useState } from "react";
import { Search, Check, X, Pause, RefreshCw, FileText, ExternalLink, Play, AlertCircle, Bell } from "lucide-react";
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
  ALL: "All",
  ACTIVE: "Active",
  PENDING_APPROVAL: "Pending Review",
  PENDING_PAYMENT: "Pending Payment",
  SUSPENDED: "Suspended",
  REJECTED: "Rejected",
};

export default function CAManagementPage() {
  const [cas, setCAs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [incomplete, setIncomplete] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchCAs = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "20",
        ...(search && { search }),
        ...(statusFilter !== "ALL" && { status: statusFilter }),
      });
      const [res, pendingRes, incompleteRes] = await Promise.allSettled([
        api.get(`/admin/cas?${params}`),
        api.get("/admin/cas?status=PENDING_APPROVAL&limit=1"),
        api.get("/admin/cas/incomplete"),
      ]);
      if (res.status === "fulfilled") {
        setCAs(res.value.data.data || []);
        setTotal(res.value.data.meta?.total || 0);
      }
      if (pendingRes.status === "fulfilled") {
        setPendingCount(pendingRes.value.data.meta?.total || 0);
      }
      if (incompleteRes.status === "fulfilled") {
        setIncomplete(incompleteRes.value.data.data || []);
      }
    } catch {
      // silent — partial failures handled via allSettled above
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount and when filters change
  useEffect(() => { fetchCAs(); }, [page, statusFilter]);

  // Auto-refresh when the admin switches back to this tab
  useEffect(() => {
    const onFocus = () => fetchCAs(true);
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [page, statusFilter, search]);

  const handleAction = async (id: string, action: string) => {
    setActionId(id + action);
    try {
      await api.put(`/admin/cas/${id}/${action}`);
      const labels: Record<string, string> = {
        approve: "CA approved and activated ✓",
        reject: "CA application rejected",
        suspend: "CA deactivated",
        activate: "CA activated ✓",
        deactivate: "CA deactivated",
      };
      toast.success(labels[action] || "Done");
      fetchCAs();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActionId(null);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-100">CA Management</h1>
            {pendingCount > 0 && (
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                className="flex items-center gap-1.5 bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-bold px-2.5 py-1 rounded-full"
              >
                <Bell className="w-3 h-3" />
                {pendingCount} pending review
              </motion.div>
            )}
          </div>
          <p className="text-gray-400 mt-1">{total} CA professionals</p>
        </div>
        <div className="flex gap-2">
          {pendingCount > 0 && (
            <Button size="sm" className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold gap-1.5"
              onClick={() => { setStatusFilter("PENDING_APPROVAL"); setPage(1); }}>
              <Bell className="w-3.5 h-3.5" /> Review {pendingCount} Pending
            </Button>
          )}
          <Button variant="outline" size="sm" className="border-gray-700 text-gray-300 hover:bg-gray-800 rounded-xl"
            onClick={() => fetchCAs()}>
            <RefreshCw className="w-4 h-4 mr-1" />Refresh
          </Button>
        </div>
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
              className={`px-3 py-1.5 text-xs font-medium rounded-xl border transition-colors relative ${
                statusFilter === s
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "border-gray-700 text-gray-400 hover:border-gray-500"
              }`}>
              {statusLabels[s] || s}
              {s === "PENDING_APPROVAL" && pendingCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-amber-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {pendingCount > 9 ? "9+" : pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Incomplete CA registrations — User created but no CA profile */}
      {incomplete.length > 0 && (
        <div className="mb-5 bg-red-950/40 border border-red-800/50 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <p className="text-sm font-semibold text-red-300">
              {incomplete.length} incomplete CA registration{incomplete.length > 1 ? "s" : ""} — profile not set up
            </p>
          </div>
          <div className="space-y-2">
            {incomplete.map((u) => (
              <div key={u.id} className="flex items-center justify-between bg-red-950/30 border border-red-800/30 rounded-xl px-4 py-2.5">
                <div>
                  <p className="text-sm text-gray-200">{u.email}</p>
                  <p className="text-xs text-gray-500">Registered {formatDate(u.createdAt)} · No CA profile created</p>
                </div>
                <span className="text-[10px] bg-red-800/40 text-red-300 border border-red-700/40 rounded-full px-2.5 py-1 font-semibold">
                  Incomplete
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CA List */}
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-gray-900 animate-pulse rounded-2xl" />
          ))
        ) : cas.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <AlertCircle className="w-10 h-10 mx-auto mb-3 text-gray-700" />
            <p>No CAs found for this filter</p>
            {statusFilter !== "ALL" && (
              <button onClick={() => setStatusFilter("ALL")}
                className="mt-2 text-sm text-blue-400 hover:underline">
                View all CAs
              </button>
            )}
          </div>
        ) : (
          cas.map((ca, i) => (
            <motion.div key={ca.id}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`bg-gray-900 border rounded-2xl p-5 ${
                ca.status === "PENDING_APPROVAL" ? "border-amber-700/50" : "border-gray-800"
              }`}>
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
                      {ca.status === "PENDING_APPROVAL" && (
                        <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full px-2 py-0.5 font-semibold animate-pulse">
                          Awaiting your review
                        </span>
                      )}
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
                  {(ca.status === "PENDING_APPROVAL" || ca.status === "PENDING_PAYMENT") && (
                    <>
                      <Button size="sm"
                        className="rounded-xl bg-green-600 hover:bg-green-700 text-white gap-1.5 font-semibold"
                        disabled={actionId === ca.id + "approve"}
                        onClick={() => handleAction(ca.id, "approve")}>
                        <Check className="w-3.5 h-3.5" /> Approve
                      </Button>
                      <Button size="sm"
                        className="rounded-xl bg-red-600 hover:bg-red-700 text-white gap-1.5 font-semibold"
                        disabled={actionId === ca.id + "reject"}
                        onClick={() => handleAction(ca.id, "reject")}>
                        <X className="w-3.5 h-3.5" /> Reject
                      </Button>
                    </>
                  )}

                  {ca.status === "ACTIVE" && (
                    <Button size="sm" variant="outline"
                      className="rounded-xl border-orange-700 text-orange-400 hover:bg-orange-900/30 gap-1.5"
                      disabled={actionId === ca.id + "deactivate"}
                      onClick={() => handleAction(ca.id, "deactivate")}>
                      <Pause className="w-3.5 h-3.5" /> Deactivate
                    </Button>
                  )}

                  {(ca.status === "SUSPENDED" || ca.status === "REJECTED") && (
                    <Button size="sm"
                      className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white gap-1.5 font-semibold"
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
            <Button variant="outline" size="sm" className="rounded-xl border-gray-700 text-gray-300"
              disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
            <Button variant="outline" size="sm" className="rounded-xl border-gray-700 text-gray-300"
              disabled={cas.length < 20} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        </div>
      )}
    </div>
  );
}
