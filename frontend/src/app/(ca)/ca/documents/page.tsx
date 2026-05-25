"use client";

import { useEffect, useRef, useState } from "react";
import { Upload, FileText, Download, Trash2, File, CheckCircle, Clock, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api, getErrorMessage } from "@/lib/api";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";

const statusVariant: Record<string, any> = {
  PENDING: "warning", VERIFIED: "success", REJECTED: "destructive",
};

const statusIcon: Record<string, any> = {
  PENDING: Clock, VERIFIED: CheckCircle, REJECTED: XCircle,
};

export default function CADocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const res = await api.get("/ca/my/documents");
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
    form.append("type", "CERTIFICATE");
    try {
      await api.post("/ca/documents", form, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Document uploaded successfully");
      fetchDocs();
    } catch (err) { toast.error(getErrorMessage(err)); } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading">Documents</h1>
          <p className="text-muted-foreground mt-1">Upload and manage your professional certificates</p>
        </div>
        <div>
          <input ref={fileRef} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={handleUpload} />
          <Button className="rounded-xl bg-brand-600 hover:bg-brand-700" onClick={() => fileRef.current?.click()} disabled={uploading}>
            <Upload className="w-4 h-4 mr-2" />{uploading ? "Uploading..." : "Upload Document"}
          </Button>
        </div>
      </div>

      {/* Upload Zone */}
      <div
        onClick={() => fileRef.current?.click()}
        className="mb-6 border-2 border-dashed border-border rounded-2xl p-10 text-center cursor-pointer hover:border-brand-400 hover:bg-brand-50/50:bg-brand-950/20 transition-colors"
      >
        <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
        <p className="font-medium text-sm">Drop files here or click to upload</p>
        <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG up to 10MB · CA Certificate, Degree, ID proof</p>
      </div>

      {/* Documents List */}
      {loading ? (
        Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 bg-muted animate-pulse rounded-2xl mb-3" />)
      ) : documents.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-2xl border border-border">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">No documents uploaded yet</p>
          <p className="text-xs text-muted-foreground mt-1">Upload your CA certificate and supporting documents</p>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((doc, i) => {
            const StatusIcon = statusIcon[doc.status] || Clock;
            return (
              <motion.div key={doc.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 p-4 bg-card rounded-2xl border border-border hover:bg-muted/30 transition-colors">
                <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center shrink-0">
                  <File className="w-5 h-5 text-brand-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{doc.fileName || doc.type}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(doc.createdAt)} · {doc.type}</p>
                </div>
                <Badge variant={statusVariant[doc.status]} className="text-xs gap-1 shrink-0">
                  <StatusIcon className="w-3 h-3" />{doc.status}
                </Badge>
                {doc.fileUrl && (
                  <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer"
                    className="p-2 rounded-xl text-muted-foreground hover:text-brand-600 hover:bg-brand-50:bg-brand-950 transition-colors">
                    <Download className="w-4 h-4" />
                  </a>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
