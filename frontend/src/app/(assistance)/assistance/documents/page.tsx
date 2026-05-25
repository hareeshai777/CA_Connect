"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FileText, Search, CheckCircle, XCircle, AlertTriangle,
  Eye, Download, RefreshCw, Filter, Clock, Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { api } from "@/lib/api";

type DocStatus = "PENDING" | "VERIFIED" | "REJECTED" | "NEEDS_RESUBMISSION";

interface Doc {
  id: string;
  fileName?: string;
  type: string;
  verificationStatus: DocStatus;
  fileUrl?: string;
  fileSize?: number;
  createdAt: string;
  clientProfile?: { firstName: string; lastName: string; companyName?: string };
  caProfessional?: { firstName: string; lastName: string };
}

const statusConfig: Record<DocStatus, { color: string; icon: any; label: string }> = {
  PENDING:            { color: "warning",     icon: Clock,         label: "Pending Review"      },
  VERIFIED:           { color: "success",     icon: CheckCircle,   label: "Verified"            },
  REJECTED:           { color: "destructive", icon: XCircle,       label: "Rejected"            },
  NEEDS_RESUBMISSION: { color: "secondary",   icon: AlertTriangle, label: "Needs Resubmission"  },
};

const SAMPLE_PDF = "https://www.w3.org/WAI/WCAG21/Techniques/pdf/PDF2/table-1.pdf";

// Demo docs shown when no real docs exist yet (only for preview purposes)
const DEMO_DOCS: Doc[] = [
  { id: "d1", fileName: "PAN Card - Rahul Sharma.pdf",        type: "IDENTITY_PROOF",         verificationStatus: "PENDING",            fileUrl: SAMPLE_PDF, fileSize: 245000,  createdAt: new Date(Date.now() - 7200000).toISOString(),   clientProfile: { firstName: "Rahul",   lastName: "Sharma" },      caProfessional: { firstName: "Priya",  lastName: "Menon" } },
  { id: "d2", fileName: "Bank Statement - TechStart.pdf",     type: "CLIENT_DOCUMENT",        verificationStatus: "NEEDS_RESUBMISSION", fileUrl: SAMPLE_PDF, fileSize: 1200000, createdAt: new Date(Date.now() - 14400000).toISOString(),  clientProfile: { firstName: "TechStart", lastName: "Pvt Ltd" },  caProfessional: { firstName: "Arjun",  lastName: "Patel" } },
  { id: "d3", fileName: "Aadhaar Card - Sunita Rao.jpg",      type: "IDENTITY_PROOF",         verificationStatus: "VERIFIED",           fileUrl: SAMPLE_PDF, fileSize: 320000,  createdAt: new Date(Date.now() - 86400000).toISOString(),   clientProfile: { firstName: "Sunita",  lastName: "Rao" },         caProfessional: { firstName: "Vikram", lastName: "Singh" } },
  { id: "d4", fileName: "Form 16 - ABC Industries.pdf",       type: "CLIENT_DOCUMENT",        verificationStatus: "PENDING",            fileUrl: SAMPLE_PDF, fileSize: 890000,  createdAt: new Date(Date.now() - 86400000).toISOString(),   clientProfile: { firstName: "ABC",     lastName: "Industries" },  caProfessional: { firstName: "Deepa",  lastName: "Nair" } },
  { id: "d5", fileName: "GST Certificate - Rohit Gupta.pdf",  type: "REGISTRATION_CERTIFICATE", verificationStatus: "REJECTED",         fileUrl: SAMPLE_PDF, fileSize: 198000,  createdAt: new Date(Date.now() - 172800000).toISOString(),  clientProfile: { firstName: "Rohit",   lastName: "Gupta" },       caProfessional: { firstName: "Priya",  lastName: "Menon" } },
];

export default function AssistanceDocumentsPage() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const res = await api.get("/assistance/documents");
      const fetched: Doc[] = res.data.data;
      if (fetched.length === 0) {
        setDocs(DEMO_DOCS);
        setIsDemo(true);
      } else {
        setDocs(fetched);
        setIsDemo(false);
      }
    } catch {
      setDocs(DEMO_DOCS);
      setIsDemo(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDocs(); }, []);

  const handlePreview = (doc: Doc) => {
    const url = doc.fileUrl;
    if (!url) { toast.error("No file available for preview"); return; }
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleDownload = (doc: Doc) => {
    const url = doc.fileUrl;
    if (!url) { toast.error("No file available for download"); return; }
    const a = document.createElement("a");
    a.href = url;
    a.download = doc.fileName || doc.type;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success(`Downloading ${doc.fileName || doc.type}`);
  };

  const handleVerify = async (id: string, newStatus: DocStatus) => {
    setVerifyingId(id);
    if (!isDemo) {
      try {
        await api.patch(`/assistance/documents/${id}/verify`, { status: newStatus });
      } catch {
        toast.error("Failed to update document status");
        setVerifyingId(null);
        return;
      }
    }
    setDocs(prev => prev.map(d => d.id === id ? { ...d, verificationStatus: newStatus } : d));
    setVerifyingId(null);
    if (newStatus === "VERIFIED") toast.success("Document marked as Verified");
    else if (newStatus === "REJECTED") toast.error("Document marked as Rejected");
    else if (newStatus === "NEEDS_RESUBMISSION") toast.info("Document flagged for Resubmission");
  };

  const filtered = docs.filter(d => {
    const clientName = `${d.clientProfile?.firstName ?? ""} ${d.clientProfile?.lastName ?? ""}`.toLowerCase();
    const fileName = (d.fileName ?? d.type).toLowerCase();
    const matchSearch = fileName.includes(search.toLowerCase()) || clientName.includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || d.verificationStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = {
    PENDING:            docs.filter(d => d.verificationStatus === "PENDING").length,
    VERIFIED:           docs.filter(d => d.verificationStatus === "VERIFIED").length,
    NEEDS_RESUBMISSION: docs.filter(d => d.verificationStatus === "NEEDS_RESUBMISSION").length,
    REJECTED:           docs.filter(d => d.verificationStatus === "REJECTED").length,
  };

  const fileSizeLabel = (bytes?: number) => {
    if (!bytes) return "";
    if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`;
    return `${Math.round(bytes / 1024)} KB`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading">Document Verification</h1>
          <p className="text-muted-foreground text-sm mt-1">Review, verify, and manage client documents for your assigned cases</p>
        </div>
        <Button variant="outline" size="sm" className="rounded-xl gap-2" onClick={fetchDocs} disabled={loading}>
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />Refresh
        </Button>
      </div>

      {/* Scoping notice */}
      <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800">
        <Lock className="w-3.5 h-3.5 mt-0.5 shrink-0" />
        <span>You only see documents from clients whose cases are assigned to you. Other assistance team members cannot view your documents.</span>
      </div>

      {isDemo && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          Showing demo documents — real documents will appear once cases with documents are assigned to you.
        </div>
      )}

      {/* Status Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { status: "PENDING",            label: "Pending",      value: counts.PENDING,            color: "text-orange-600", bg: "bg-orange-50" },
          { status: "VERIFIED",           label: "Verified",     value: counts.VERIFIED,           color: "text-green-600",  bg: "bg-green-50" },
          { status: "NEEDS_RESUBMISSION", label: "Resubmission", value: counts.NEEDS_RESUBMISSION, color: "text-gray-600",   bg: "bg-gray-50" },
          { status: "REJECTED",           label: "Rejected",     value: counts.REJECTED,           color: "text-red-600",    bg: "bg-red-50" },
        ].map(({ status, label, value, color, bg }) => (
          <button key={status} onClick={() => setStatusFilter(statusFilter === status ? "ALL" : status)}
            className={`p-4 rounded-2xl border transition-all text-left ${statusFilter === status ? "ring-2 ring-emerald-500 border-emerald-500" : "border-border"} ${bg}`}>
            <p className={`text-2xl font-bold font-heading ${color}`}>{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search documents or clients..." className="pl-9 rounded-xl" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              {["ALL", "PENDING", "VERIFIED", "NEEDS_RESUBMISSION", "REJECTED"].map(s => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${statusFilter === s ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
                  {s === "ALL" ? "All" : s === "NEEDS_RESUBMISSION" ? "Resubmission" : s.charAt(0) + s.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{filtered.length} Document{filtered.length !== 1 ? "s" : ""}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />)
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="font-medium">No documents found</p>
              <p className="text-xs mt-1">Documents will appear once clients upload them for cases assigned to you</p>
            </div>
          ) : (
            filtered.map((doc, i) => {
              const cfg = statusConfig[doc.verificationStatus] ?? statusConfig.PENDING;
              const StatusIcon = cfg.icon;
              const clientName = doc.clientProfile
                ? `${doc.clientProfile.firstName} ${doc.clientProfile.lastName}`
                : "Unknown Client";
              return (
                <motion.div key={doc.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  className="flex items-start gap-4 p-4 rounded-xl border border-border hover:bg-muted/30 transition-colors">
                  <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-brand-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="font-medium text-sm line-clamp-1">{doc.fileName || doc.type}</p>
                      <Badge variant={cfg.color as any} className="text-[10px] shrink-0 flex items-center gap-1">
                        <StatusIcon className="w-3 h-3" />{cfg.label}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-0.5">
                      <p className="text-xs text-muted-foreground">Client: <span className="font-medium text-foreground">{clientName}</span></p>
                      {doc.caProfessional && (
                        <p className="text-xs text-muted-foreground">CA: CA {doc.caProfessional.firstName} {doc.caProfessional.lastName}</p>
                      )}
                      {doc.fileSize && <p className="text-xs text-muted-foreground">{fileSizeLabel(doc.fileSize)}</p>}
                      <p className="text-xs text-muted-foreground">
                        {new Date(doc.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button size="sm" variant="outline" className="h-8 w-8 p-0 rounded-lg" title="Preview" onClick={() => handlePreview(doc)}>
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 w-8 p-0 rounded-lg" title="Download" onClick={() => handleDownload(doc)}>
                      <Download className="w-3.5 h-3.5" />
                    </Button>
                    {doc.verificationStatus === "PENDING" && (
                      <>
                        <Button size="sm" onClick={() => handleVerify(doc.id, "VERIFIED")} disabled={verifyingId === doc.id}
                          className="h-8 text-xs rounded-lg bg-green-600 hover:bg-green-700 text-white px-2.5">
                          {verifyingId === doc.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleVerify(doc.id, "NEEDS_RESUBMISSION")} disabled={verifyingId === doc.id}
                          className="h-8 text-xs rounded-lg border-yellow-300 text-yellow-700 hover:bg-yellow-50 px-2.5">
                          <AlertTriangle className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleVerify(doc.id, "REJECTED")} disabled={verifyingId === doc.id}
                          className="h-8 text-xs rounded-lg border-red-300 text-red-600 hover:bg-red-50 px-2.5">
                          <XCircle className="w-3.5 h-3.5" />
                        </Button>
                      </>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
