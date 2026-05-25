"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Download, FileText, Receipt, Award, RefreshCw,
  FolderOpen, CheckCircle, Clock, XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";

type DocType = "TAX_SUMMARY" | "GST_FILING" | "ITR" | "CERTIFICATE" | "INVOICE" | "CLIENT_DOCUMENT" | "IDENTITY_PROOF" | "REGISTRATION_CERTIFICATE";

const docTypeConfig: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  TAX_SUMMARY:              { label: "Tax Summary",          icon: FileText,   color: "text-blue-600",   bg: "bg-blue-50" },
  GST_FILING:               { label: "GST Filing",           icon: Receipt,    color: "text-orange-600", bg: "bg-orange-50" },
  ITR:                      { label: "Income Tax Return",    icon: FileText,   color: "text-green-600",  bg: "bg-green-50" },
  CERTIFICATE:              { label: "Certificate",          icon: Award,      color: "text-purple-600", bg: "bg-purple-50" },
  INVOICE:                  { label: "Invoice",              icon: Receipt,    color: "text-yellow-600", bg: "bg-yellow-50" },
  CLIENT_DOCUMENT:          { label: "Document",             icon: FileText,   color: "text-brand-600",  bg: "bg-brand-50" },
  IDENTITY_PROOF:           { label: "Identity Proof",       icon: Award,      color: "text-teal-600",   bg: "bg-teal-50" },
  REGISTRATION_CERTIFICATE: { label: "Registration Cert.",   icon: Award,      color: "text-indigo-600", bg: "bg-indigo-50" },
};

const statusConfig: Record<string, { variant: any; icon: any }> = {
  VERIFIED:           { variant: "success",     icon: CheckCircle },
  PENDING:            { variant: "warning",     icon: Clock },
  REJECTED:           { variant: "destructive", icon: XCircle },
  NEEDS_RESUBMISSION: { variant: "secondary",   icon: Clock },
};

export default function ClientDownloadsPage() {
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const res = await api.get("/client/documents");
      setDocs(res.data.data || []);
    } catch {
      setDocs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDocs(); }, []);

  const handleDownload = (doc: any) => {
    if (!doc.fileUrl) { toast.error("File not available for download"); return; }
    const a = document.createElement("a");
    a.href = doc.fileUrl;
    a.download = doc.fileName || doc.type;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success(`Downloading ${doc.fileName || doc.type}`);
  };

  const filtered = filter === "ALL" ? docs : docs.filter((d) => d.type === filter);

  const categories = [
    { key: "ALL", label: "All" },
    { key: "CLIENT_DOCUMENT", label: "Documents" },
    { key: "IDENTITY_PROOF", label: "Identity" },
    { key: "REGISTRATION_CERTIFICATE", label: "Certificates" },
    { key: "TAX_SUMMARY", label: "Tax Summary" },
    { key: "GST_FILING", label: "GST Filing" },
    { key: "ITR", label: "ITR" },
    { key: "INVOICE", label: "Invoices" },
  ];

  const fileSizeLabel = (bytes?: number) => {
    if (!bytes) return "";
    if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`;
    return `${Math.round(bytes / 1024)} KB`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading">Downloads</h1>
          <p className="text-muted-foreground mt-1 text-sm">Tax summaries, filings, certificates and all your documents</p>
        </div>
        <Button variant="outline" size="sm" className="rounded-xl gap-2" onClick={fetchDocs} disabled={loading}>
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Files", value: docs.length, icon: FolderOpen, color: "text-brand-600", bg: "bg-brand-50" },
          { label: "Verified", value: docs.filter(d => d.verificationStatus === "VERIFIED").length, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
          { label: "Pending", value: docs.filter(d => d.verificationStatus === "PENDING").length, icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50" },
          { label: "Certificates", value: docs.filter(d => d.type === "REGISTRATION_CERTIFICATE" || d.type === "CERTIFICATE").length, icon: Award, color: "text-purple-600", bg: "bg-purple-50" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-card rounded-2xl border border-border p-4 flex items-center gap-3">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center shrink-0`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-2xl font-bold font-heading">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {categories.map(({ key, label }) => (
          <button key={key} onClick={() => setFilter(key)}
            className={`px-3 py-1.5 text-xs font-medium rounded-xl border transition-colors ${filter === key ? "bg-brand-600 border-brand-600 text-white" : "border-border text-muted-foreground hover:border-brand-300"}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Documents list */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="p-5 border-b border-border">
          <h3 className="font-semibold font-heading">{filtered.length} file{filtered.length !== 1 ? "s" : ""}</h3>
        </div>

        {loading ? (
          <div className="p-8 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center">
            <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="font-medium mb-1">No files found</p>
            <p className="text-sm text-muted-foreground">
              {docs.length === 0
                ? "Upload documents from the Documents tab to see them here."
                : "No files match the selected category."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((doc, i) => {
              const cfg = docTypeConfig[doc.type] ?? docTypeConfig.CLIENT_DOCUMENT;
              const Icon = cfg.icon;
              const status = statusConfig[doc.verificationStatus ?? "PENDING"];
              const StatusIcon = status?.icon ?? Clock;
              return (
                <motion.div key={doc.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors">
                  <div className={`w-10 h-10 ${cfg.bg} rounded-xl flex items-center justify-center shrink-0`}>
                    <Icon className={`w-5 h-5 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{doc.fileName || cfg.label}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-muted-foreground">{cfg.label}</span>
                      {doc.fileSize && <span className="text-xs text-muted-foreground">{fileSizeLabel(doc.fileSize)}</span>}
                      <span className="text-xs text-muted-foreground">{formatDate(doc.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={status?.variant ?? "secondary"} className="text-[10px] flex items-center gap-1">
                      <StatusIcon className="w-3 h-3" />
                      {doc.verificationStatus ?? "PENDING"}
                    </Badge>
                    <Button size="sm" variant="outline" className="h-8 rounded-lg gap-1.5" onClick={() => handleDownload(doc)}>
                      <Download className="w-3.5 h-3.5" />
                      <span className="text-xs">Download</span>
                    </Button>
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
