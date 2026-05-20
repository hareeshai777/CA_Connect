"use client";

import { useEffect, useRef, useState } from "react";
import { Upload, FileText, Download, File, Info } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api, getErrorMessage } from "@/lib/api";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";

const statusVariant: Record<string, any> = { PENDING: "warning", VERIFIED: "success", REJECTED: "destructive" };
const DOC_TYPES = ["PAN Card", "Aadhaar Card", "Bank Statement", "Form 26AS", "ITR", "GST Certificate", "Incorporation Certificate", "Other"];

export default function ClientDocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [docType, setDocType] = useState("PAN Card");
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const res = await api.get("/client/documents");
      setDocuments(res.data.data || []);
    } catch { setDocuments([]); } finally { setLoading(false); }
  };

  useEffect(() => { fetchDocs(); }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const form = new FormData();
    form.append("document", file);
    form.append("type", docType);
    try {
      await api.post("/client/documents", form, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Document uploaded");
      fetchDocs();
    } catch (err) { toast.error(getErrorMessage(err)); } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div><h1 className="text-2xl font-bold font-heading">Documents</h1><p className="text-muted-foreground mt-1">Upload and manage your financial documents</p></div>
      </div>

      {/* Upload section */}
      <div className="bg-card rounded-2xl border border-border p-6 mb-6">
        <h3 className="font-semibold font-heading mb-4">Upload Document</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <select value={docType} onChange={(e) => setDocType(e.target.value)}
            className="h-10 rounded-xl border border-input bg-background px-3 text-sm flex-1">
            {DOC_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
          <input ref={fileRef} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={handleUpload} />
          <Button className="rounded-xl bg-brand-600 hover:bg-brand-700" onClick={() => fileRef.current?.click()} disabled={uploading}>
            <Upload className="w-4 h-4 mr-2" />{uploading ? "Uploading..." : "Choose File"}
          </Button>
        </div>
        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-xl border border-blue-200 dark:border-blue-800">
          <p className="text-xs text-blue-700 dark:text-blue-300 flex items-start gap-2">
            <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />Accepted formats: PDF, JPG, PNG · Max 10MB per file. Documents shared with your CA for verification.
          </p>
        </div>
      </div>

      {/* Documents list */}
      {loading ? (
        Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 bg-muted animate-pulse rounded-2xl mb-3" />)
      ) : documents.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-2xl border border-border">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">No documents uploaded yet</p>
          <p className="text-xs text-muted-foreground mt-1">Upload your PAN card, Aadhaar, or tax documents</p>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((doc, i) => (
            <motion.div key={doc.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
              className="flex items-center gap-4 p-4 bg-card rounded-2xl border border-border hover:bg-muted/30 transition-colors">
              <div className="w-10 h-10 bg-brand-50 dark:bg-brand-950 rounded-xl flex items-center justify-center shrink-0">
                <File className="w-5 h-5 text-brand-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{doc.fileName || doc.type}</p>
                <p className="text-xs text-muted-foreground">{formatDate(doc.createdAt)} · {doc.type}</p>
              </div>
              <Badge variant={statusVariant[doc.status] || "secondary"} className="text-xs shrink-0">{doc.status || "PENDING"}</Badge>
              {doc.fileUrl && (
                <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer"
                  className="p-2 rounded-xl text-muted-foreground hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950 transition-colors">
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
