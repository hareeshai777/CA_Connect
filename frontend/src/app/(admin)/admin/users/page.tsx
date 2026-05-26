"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, RefreshCw, UserX, UserCheck, Mail, Phone, Shield, User, Briefcase } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { api, getErrorMessage } from "@/lib/api";
import { toast } from "sonner";
import { formatDate, getInitials } from "@/lib/utils";

const ROLE_FILTERS = ["ALL", "CLIENT", "CA_PROFESSIONAL", "SUPER_ADMIN"];
const STATUS_FILTERS = ["ALL", "ACTIVE", "SUSPENDED"];

const roleIcon: Record<string, any> = {
  CLIENT: User,
  CA_PROFESSIONAL: Briefcase,
  SUPER_ADMIN: Shield,
};

const roleVariant: Record<string, any> = {
  CLIENT: "info",
  CA_PROFESSIONAL: "brand",
  SUPER_ADMIN: "warning",
};

// Static fallback data
const STATIC_USERS = [
  { id: "u1", email: "client@demo.com", role: "CLIENT", isActive: true, createdAt: "2024-01-15", clientProfile: { firstName: "Demo", lastName: "Client", phone: "+91 9876543210" } },
  { id: "u2", email: "ca@demo.com", role: "CA_PROFESSIONAL", isActive: true, createdAt: "2024-01-10", caProfessional: { firstName: "Rajesh", lastName: "Kumar" }, clientProfile: null },
  { id: "u3", email: "admin@casaas.com", role: "SUPER_ADMIN", isActive: true, createdAt: "2024-01-01", clientProfile: { firstName: "Super", lastName: "Admin", phone: "+91 9000000000" } },
  { id: "u4", email: "user2@demo.com", role: "CLIENT", isActive: false, createdAt: "2024-02-20", clientProfile: { firstName: "Priya", lastName: "Sharma", phone: "+91 9123456789" } },
];

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>(STATIC_USERS);
  const [total, setTotal] = useState(STATIC_USERS.length);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "20",
        ...(search && { search }),
        ...(roleFilter !== "ALL" && { role: roleFilter }),
        ...(statusFilter !== "ALL" && { isActive: statusFilter === "ACTIVE" ? "true" : "false" }),
      });
      const res = await api.get(`/admin/users?${params}`);
      if (res.data?.data?.length > 0) {
        setUsers(res.data.data);
        setTotal(res.data.meta?.total || res.data.data.length);
      }
    } catch {
      // use static fallback silently
    } finally {
      setLoading(false);
    }
  }, [page, roleFilter, statusFilter, search]);

  useEffect(() => { fetchUsers(); }, [page, roleFilter, statusFilter]);

  const toggleStatus = async (id: string, currentActive: boolean) => {
    try {
      await api.put(`/admin/users/${id}/toggle-status`);
      toast.success(`User ${currentActive ? "suspended" : "activated"} successfully`);
      setUsers((prev) => prev.map((u) => u.id === id ? { ...u, isActive: !u.isActive } : u));
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const getName = (u: any) => {
    if (u.role === "CA_PROFESSIONAL" && u.caProfessional) return `${u.caProfessional.firstName} ${u.caProfessional.lastName}`;
    if (u.clientProfile) return `${u.clientProfile.firstName} ${u.clientProfile.lastName}`;
    return (u.email || "").split("@")[0] || "Unknown";
  };

  const getPhone = (u: any) => u.clientProfile?.phone || u.caProfessional?.phone || "—";

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-gray-100">User Management</h1>
          <p className="text-gray-400 mt-1">{total} registered users</p>
        </div>
        <Button variant="outline" size="sm" className="border-gray-700 text-gray-300 hover:bg-gray-800" onClick={fetchUsers}>
          <RefreshCw className="w-4 h-4 mr-1" />Refresh
        </Button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Users", value: total, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
          { label: "Clients", value: users.filter(u => u.role === "CLIENT").length, color: "text-brand-400", bg: "bg-brand-500/10 border-brand-500/20" },
          { label: "CA Professionals", value: users.filter(u => u.role === "CA_PROFESSIONAL").length, color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
          { label: "Suspended", value: users.filter(u => !u.isActive).length, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`p-4 rounded-2xl border ${bg}`}>
            <p className="text-xs text-gray-400 mb-1">{label}</p>
            <p className={`text-2xl font-bold font-heading ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search by name or email..."
            className="pl-10 bg-gray-900 border-gray-700 text-gray-100 placeholder:text-gray-500 rounded-xl"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchUsers()}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {ROLE_FILTERS.map((r) => (
            <button key={r} onClick={() => { setRoleFilter(r); setPage(1); }}
              className={`px-3 py-1.5 text-xs font-medium rounded-xl border transition-colors ${roleFilter === r ? "bg-brand-600 border-brand-600 text-white" : "border-gray-700 text-gray-400 hover:border-gray-600 hover:text-gray-200"}`}>
              {r.replace("_", " ")}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {STATUS_FILTERS.map((s) => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-3 py-1.5 text-xs font-medium rounded-xl border transition-colors ${statusFilter === s ? "bg-gray-600 border-gray-600 text-white" : "border-gray-700 text-gray-400 hover:border-gray-600 hover:text-gray-200"}`}>
              {s}
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
                {["User", "Role", "Status", "Phone", "Joined", "Actions"].map((h) => (
                  <th key={h} className="text-left py-4 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={6} className="py-3 px-4"><div className="h-10 bg-gray-800 rounded-xl animate-pulse" /></td></tr>
                ))
              ) : users.length === 0 ? (
                <tr><td colSpan={6} className="py-16 text-center text-gray-500">No users found</td></tr>
              ) : (
                users.map((u) => {
                  const RoleIcon = roleIcon[u.role] || User;
                  return (
                    <tr key={u.id}
                      className="hover:bg-gray-800/50 cursor-pointer transition-colors" onClick={() => setSelectedUser(selectedUser?.id === u.id ? null : u)}>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={u.caProfessional?.avatarUrl} />
                            <AvatarFallback className="bg-brand-900 text-brand-400 text-xs font-bold">
                              {getInitials(getName(u).split(" ")[0], getName(u).split(" ")[1])}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium text-gray-100">{getName(u)}</p>
                            <p className="text-xs text-gray-400 flex items-center gap-1"><Mail className="w-3 h-3" />{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant={roleVariant[u.role]} className="text-xs gap-1">
                          <RoleIcon className="w-3 h-3" />{(u.role || "UNKNOWN").replace(/_/g, " ")}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant={u.isActive ? "success" : "destructive"} className="text-xs">
                          {u.isActive ? "Active" : "Suspended"}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-300">
                        {getPhone(u) !== "—" ? (
                          <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-gray-500" />{getPhone(u)}</span>
                        ) : "—"}
                      </td>
                      <td className="py-4 px-4 text-xs text-gray-400">{formatDate(u.createdAt)}</td>
                      <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                        {u.role !== "SUPER_ADMIN" && (
                          <button
                            onClick={() => toggleStatus(u.id, u.isActive)}
                            className={`p-1.5 rounded-lg transition-colors ${u.isActive
                              ? "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                              : "bg-green-500/10 text-green-400 hover:bg-green-500/20"
                            }`}
                            title={u.isActive ? "Suspend" : "Activate"}
                          >
                            {u.isActive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Expanded row detail */}
        <AnimatePresence>
          {selectedUser && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-gray-800 bg-gray-800/50 p-6"
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div><p className="text-gray-500 text-xs mb-1">Full Name</p><p className="text-gray-100">{getName(selectedUser)}</p></div>
                <div><p className="text-gray-500 text-xs mb-1">Email</p><p className="text-gray-100">{selectedUser.email}</p></div>
                <div><p className="text-gray-500 text-xs mb-1">Role</p><p className="text-gray-100">{selectedUser.role}</p></div>
                <div><p className="text-gray-500 text-xs mb-1">Phone</p><p className="text-gray-100">{getPhone(selectedUser)}</p></div>
                <div><p className="text-gray-500 text-xs mb-1">User ID</p><p className="text-gray-400 font-mono text-xs">{selectedUser.id}</p></div>
                <div><p className="text-gray-500 text-xs mb-1">Account Status</p>
                  <Badge variant={selectedUser.isActive ? "success" : "destructive"} className="text-xs">
                    {selectedUser.isActive ? "Active" : "Suspended"}
                  </Badge>
                </div>
                <div><p className="text-gray-500 text-xs mb-1">Joined</p><p className="text-gray-100">{formatDate(selectedUser.createdAt)}</p></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-gray-800">
          <p className="text-sm text-gray-400">Showing {users.length} of {total}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="border-gray-700 text-gray-400" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
            <Button variant="outline" size="sm" className="border-gray-700 text-gray-400" disabled={users.length < 20} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
