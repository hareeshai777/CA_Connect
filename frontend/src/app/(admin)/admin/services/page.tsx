"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  PackageOpen, RefreshCw, Pencil, Check, X,
  ToggleLeft, ToggleRight, Star, StarOff, Eye, EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface Service {
  id: string;
  name: string;
  slug: string;
  shortDescription?: string;
  category: string;
  basePrice: number;
  isActive: boolean;
  isFeatured: boolean;
  showPrice: boolean;
  sortOrder: number;
  _count?: { bookings: number; specializations: number };
}

const categoryColors: Record<string, string> = {
  GST: "bg-orange-100 text-orange-700",
  TAX: "bg-blue-100 text-blue-700",
  REGISTRATION: "bg-purple-100 text-purple-700",
  AUDIT: "bg-red-100 text-red-700",
  COMPLIANCE: "bg-yellow-100 text-yellow-700",
  CONSULTING: "bg-green-100 text-green-700",
  FINANCIAL_PLANNING: "bg-cyan-100 text-cyan-700",
  ACCOUNTING: "bg-indigo-100 text-indigo-700",
  PAYROLL: "bg-pink-100 text-pink-700",
};

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<Service>>({});
  const [saving, setSaving] = useState(false);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/services");
      setServices(res.data.data || []);
    } catch {
      toast.error("Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchServices(); }, []);

  const startEdit = (svc: Service) => {
    setEditingId(svc.id);
    setEditValues({ name: svc.name, shortDescription: svc.shortDescription, basePrice: svc.basePrice });
  };

  const cancelEdit = () => { setEditingId(null); setEditValues({}); };

  const saveEdit = async (id: string) => {
    setSaving(true);
    try {
      await api.patch(`/admin/services/${id}`, editValues);
      toast.success("Service updated");
      setEditingId(null);
      fetchServices();
    } catch {
      toast.error("Failed to update service");
    } finally {
      setSaving(false);
    }
  };

  const toggleField = async (svc: Service, field: "isActive" | "isFeatured" | "showPrice") => {
    try {
      await api.patch(`/admin/services/${svc.id}`, { [field]: !svc[field] });
      setServices(prev => prev.map(s => s.id === svc.id ? { ...s, [field]: !svc[field] } : s));
      const msg = field === "isActive"
        ? (svc.isActive ? "deactivated" : "activated")
        : field === "isFeatured"
        ? (svc.isFeatured ? "unfeatured" : "featured")
        : (svc.showPrice ? "price hidden from clients" : "price shown to clients");
      toast.success(`Service ${msg}`);
    } catch {
      toast.error("Failed to update");
    }
  };

  const formatPrice = (p: number) => `₹${(p / 100).toLocaleString("en-IN")}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white font-heading">Service Management</h1>
          <p className="text-gray-400 text-sm mt-1">Edit prices, toggle visibility, and manage featured services</p>
        </div>
        <Button variant="outline" size="sm" className="rounded-xl gap-2 border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800" onClick={fetchServices} disabled={loading}>
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />Refresh
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Services", value: services.length, color: "text-brand-400" },
          { label: "Active", value: services.filter(s => s.isActive).length, color: "text-green-400" },
          { label: "Featured", value: services.filter(s => s.isFeatured).length, color: "text-yellow-400" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-gray-800 rounded-2xl border border-gray-700 p-5">
            <p className="text-gray-400 text-xs mb-1">{label}</p>
            <p className={`text-3xl font-bold font-heading ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Services table */}
      <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
        <div className="p-5 border-b border-gray-700">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <PackageOpen className="w-4 h-4 text-brand-400" />
            All Services
          </h3>
        </div>

        {loading ? (
          <div className="p-8 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-14 bg-gray-700 animate-pulse rounded-xl" />)}
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {services.map((svc, i) => {
              const isEditing = editingId === svc.id;
              return (
                <motion.div key={svc.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-gray-750 transition-colors">

                  {/* Category badge */}
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${categoryColors[svc.category] || "bg-gray-200 text-gray-700"}`}>
                    {svc.category.replace("_", " ")}
                  </span>

                  {/* Name / description */}
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <div className="space-y-1.5">
                        <Input
                          value={editValues.name ?? ""}
                          onChange={e => setEditValues(v => ({ ...v, name: e.target.value }))}
                          className="h-8 text-sm bg-gray-700 border-gray-600 text-white rounded-lg"
                          placeholder="Service name"
                        />
                        <Input
                          value={editValues.shortDescription ?? ""}
                          onChange={e => setEditValues(v => ({ ...v, shortDescription: e.target.value }))}
                          className="h-8 text-xs bg-gray-700 border-gray-600 text-white rounded-lg"
                          placeholder="Short description"
                        />
                      </div>
                    ) : (
                      <>
                        <p className="font-medium text-white text-sm truncate">{svc.name}</p>
                        <p className="text-xs text-gray-400 truncate">{svc.shortDescription}</p>
                      </>
                    )}
                  </div>

                  {/* Price */}
                  <div className="shrink-0 w-36">
                    {isEditing ? (
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                        <Input
                          type="number"
                          min={0}
                          value={editValues.basePrice !== undefined ? editValues.basePrice / 100 : ""}
                          onChange={e => setEditValues(v => ({ ...v, basePrice: Math.round(parseFloat(e.target.value || "0") * 100) }))}
                          className="h-8 text-sm bg-gray-700 border-gray-600 text-white rounded-lg pl-7"
                          placeholder="0"
                        />
                      </div>
                    ) : (
                      <div className="text-right">
                        <p className="text-brand-400 font-bold text-base">{formatPrice(svc.basePrice)}</p>
                        <p className="text-[10px] text-gray-500">{svc._count?.bookings ?? 0} bookings</p>
                      </div>
                    )}
                  </div>

                  {/* Toggles */}
                  {!isEditing && (
                    <div className="flex items-center gap-3 shrink-0">
                      {/* Show Price toggle */}
                      <button
                        onClick={() => toggleField(svc, "showPrice")}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                          svc.showPrice
                            ? "bg-blue-500/15 border-blue-500/40 text-blue-400 hover:bg-blue-500/25"
                            : "bg-gray-700/50 border-gray-600 text-gray-400 hover:bg-gray-700"
                        }`}
                        title={svc.showPrice ? "Click to hide price from clients" : "Click to show price to clients"}
                      >
                        {svc.showPrice
                          ? <Eye className="w-3.5 h-3.5" />
                          : <EyeOff className="w-3.5 h-3.5" />}
                        <span>{svc.showPrice ? "Price ON" : "Price OFF"}</span>
                      </button>

                      {/* Featured */}
                      <button
                        title={svc.isFeatured ? "Remove from featured" : "Mark as featured"}
                        onClick={() => toggleField(svc, "isFeatured")}
                        className="p-1.5 rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        {svc.isFeatured
                          ? <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          : <StarOff className="w-4 h-4 text-gray-500" />}
                      </button>

                      {/* Active */}
                      <button
                        title={svc.isActive ? "Deactivate" : "Activate"}
                        onClick={() => toggleField(svc, "isActive")}
                        className="p-1.5 rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        {svc.isActive
                          ? <ToggleRight className="w-5 h-5 text-green-400" />
                          : <ToggleLeft className="w-5 h-5 text-gray-500" />}
                      </button>
                    </div>
                  )}

                  {/* Status badge */}
                  {!isEditing && (
                    <Badge variant={svc.isActive ? "success" : "secondary"} className="text-[10px] shrink-0">
                      {svc.isActive ? "Active" : "Inactive"}
                    </Badge>
                  )}

                  {/* Edit / Save / Cancel */}
                  <div className="flex gap-1.5 shrink-0">
                    {isEditing ? (
                      <>
                        <Button size="sm" className="h-8 w-8 p-0 rounded-lg bg-green-600 hover:bg-green-700" onClick={() => saveEdit(svc.id)} disabled={saving}>
                          <Check className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0 rounded-lg border-gray-600 hover:bg-gray-700" onClick={cancelEdit}>
                          <X className="w-3.5 h-3.5 text-gray-300" />
                        </Button>
                      </>
                    ) : (
                      <Button size="sm" variant="outline" className="h-8 w-8 p-0 rounded-lg border-gray-600 hover:bg-gray-700" onClick={() => startEdit(svc)}>
                        <Pencil className="w-3.5 h-3.5 text-gray-300" />
                      </Button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
