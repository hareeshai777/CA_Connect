"use client";

import { useEffect, useRef, useState } from "react";
import { Upload, FileText, Download, File, Info, User } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { api, getErrorMessage } from "@/lib/api";
import { toast } from "sonner";
import { formatDate, getInitials } from "@/lib/utils";

const statusVariant: Record<string, any> = {
  PENDING: "warning",
  VERIFIED: "success",
  REJECTED: "destructive",
  NEEDS_RESUBMISSION: "secondary",
};

const DOC_TYPES = [
  "PAN Card", "Aadhaar Card", "Bank Statement", "Form 26AS",
  "ITR", "GST Certificate", "Incorporation Certificate",
  "Form 16", "Salary Slip", "Audit Report", "Other",
];

interface CA {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  membershipNumber?: string;
}

export default function ClientDocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [myCAList, setMyCAList] = useState<CA[]>([]);
  const [selectedCAId, setSelectedCAId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [docType, setDocType] = useState("PAN Card");
  const fileRef = useRef<HTMLInputElement>(null);

  // Load documents and the CAs this client has booked
  const fetchAll = async () => {
    setLoading(true);
    try {
      const [docsRes, bookingsRes] = await Promise.all([
        api.get("/client/documents"),
        api.get("/bookings/my?limit=100"),
      ]);

      setDocuments(docsRes.data.data || []);

      // Extract unique CAs from bookings
      const seen = new Set<string>();
      const cas: CA[] = [];
      for (const b of (bookingsRes.data.data || [])) {
        const ca = b.caProfessional;
        if (ca && !seen.has(ca.id || b.caProfessionalId)) {
          seen.add(ca.id || b.caProfessionalId);
          cas.push({
            id: b.caProfessionalId,
            firstName: ca.firstName || "CA",
            lastName: ca.lastName || "",
            avatarUrl: ca.avatarUrl,
          });
        }
      }
      setMyCAList(cas);
      if (cas.length > 0 && !selectedCAId) setSelectedCAId(cas[0].id);
    } catch {
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!selectedCAId) {
      toast.error("Please select a CA to upload documents for");
      return;
    }
    setUploading(true);
    const form = new FormData();
    form.append("document", file);
    form.append("type", docType);
    form.append("caId", selectedCAId);
    try {
      await api.post("/client/documents", form, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Document uploaded successfully");
      fetchAll();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const selectedCA = myCAList.find(c => c.id === selectedCAId);

  // Filter docs by selected CA
  const filteredDocs = selectedCAId
    ? documents.filter(d => d.caProfessionalId === selectedCAId || !d.caProfessionalId)
    : documents;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-heading">Documents</h1>
        <p className="text-muted-foreground mt-1">Upload and manage your financial documents</p>
      </div>

      {/* Upload section */}
      <div className="bg-card rounded-2xl border border-border p-6 mb-6">
        <h3 className="font-semibold font-heading mb-4">Upload Document</h3>

        {/* CA Selector */}
        {myCAList.length > 0 ? (
          <div className="mb-4">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
              Upload for CA
            </label>
            <div className="flex flex-wrap gap-2">
              {myCAList.map(ca => (
                <button
                  key={ca.id}
                  onClick={() => setSelectedCAId(ca.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
                    selectedCAId === ca.id
                      ? "border-brand-500 bg-brand-50 text-brand-700"
                      : "border-border text-muted-foreground hover:border-brand-300 hover:text-foreground"
                  }`}
                >
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-[10px] font-bold bg-brand-100 text-brand-700">
                      {getInitials(ca.firstName, ca.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  CA {ca.firstName} {ca.lastName}
                  {selectedCAId === ca.id && (
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-600 ml-1" />
                  )}
                </button>
              ))}
            </div>
            {selectedCA && (
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <User className="w-3 h-3" />
                Uploading for CA {selectedCA.firstName} {selectedCA.lastName}
              </p>
            )}
          </div>
        ) : (
          !loading && (
            <div className="mb-4 p-3 bg-amber-50 rounded-xl border border-amber-200">
              <p className="text-xs text-amber-700 flex items-start gap-2">
                <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                You haven't booked a consultation yet. Book a consultation first to upload documents for your CA.
              </p>
            </div>
          )
        )}

        {/* Doc type + upload */}
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={docType}
            onChange={e => setDocType(e.target.value)}
            className="h-10 rounded-xl border border-input bg-background px-3 text-sm flex-1"
          >
            {DOC_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
          <input
            ref={fileRef}
            type="file"
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleUpload}
          />
          <Button
            className="rounded-xl bg-brand-600 hover:bg-brand-700"
            onClick={() => fileRef.current?.click()}
            disabled={uploading || myCAList.length === 0}
          >
            <Upload className="w-4 h-4 mr-2" />
            {uploading ? "Uploading..." : "Choose File"}
          </Button>
        </div>

        <div className="mt-3 p-3 bg-blue-50 rounded-xl border border-blue-200">
          <p className="text-xs text-blue-700 flex items-start gap-2">
            <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            Accepted formats: PDF, JPG, PNG · Max 10MB per file. Documents are shared with your selected CA for verification.
          </p>
        </div>
      </div>

      {/* CA filter tabs for document list */}
      {myCAList.length > 1 && (
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="text-xs text-muted-foreground font-medium">Filter by CA:</span>
          <button
            onClick={() => setSelectedCAId("")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${!selectedCAId ? "bg-brand-600 text-white" : "bg-muted text-muted-foreground hover:text-foreground"}`}
          >
            All
          </button>
          {myCAList.map(ca => (
            <button
              key={ca.id}
              onClick={() => setSelectedCAId(ca.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${selectedCAId === ca.id ? "bg-brand-600 text-white" : "bg-muted text-muted-foreground hover:text-foreground"}`}
            >
              CA {ca.firstName} {ca.lastName}
            </button>
          ))}
        </div>
      )}

      {/* Documents list */}
      {loading ? (
        Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 bg-muted animate-pulse rounded-2xl mb-3" />
        ))
      ) : filteredDocs.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-2xl border border-border">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
          <p className="text-muted-foreground font-medium">No documents uploaded yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            {myCAList.length > 0
              ? "Upload your PAN card, Aadhaar, or tax documents above"
              : "Book a consultation first, then upload documents for your CA"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDocs.map((doc, i) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-4 p-4 bg-card rounded-2xl border border-border hover:bg-muted/30 transition-colors"
            >
              <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center shrink-0">
                <File className="w-5 h-5 text-brand-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{doc.fileName || doc.type}</p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <p className="text-xs text-muted-foreground">{formatDate(doc.createdAt)} · {doc.type}</p>
                  {doc.caProfessional && (
                    <span className="text-xs text-brand-600 font-medium">
                      → CA {doc.caProfessional.firstName} {doc.caProfessional.lastName}
                    </span>
                  )}
                </div>
              </div>
              <Badge variant={statusVariant[doc.verificationStatus || doc.status] || "secondary"} className="text-xs shrink-0">
                {doc.verificationStatus || doc.status || "PENDING"}
              </Badge>
              {doc.fileUrl && (
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl text-muted-foreground hover:text-brand-600 hover:bg-brand-50 transition-colors"
                >
                  <Download className="w-4 h-4" />
                </a>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
