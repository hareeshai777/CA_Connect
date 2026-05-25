"use client";

import { useEffect, useState } from "react";
import { CreditCard, IndianRupee, Download, RefreshCw, CheckCircle, XCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";

const statusVariant: Record<string, any> = { SUCCESS: "success", FAILED: "destructive", PENDING: "warning", REFUNDED: "info" };
const statusIcon: Record<string, any> = { SUCCESS: CheckCircle, FAILED: XCircle, PENDING: Clock, REFUNDED: RefreshCw };

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    api.get("/payments/history").then((r) => {
      setPayments(r.data.data || []);
      setTotal(r.data.meta?.total || r.data.data?.length || 0);
    }).catch(() => setPayments([])).finally(() => setLoading(false));
  }, []);

  const totalSpent = payments.filter((p) => p.status === "SUCCESS").reduce((sum, p) => sum + (p.amount || 0), 0);

  const handleExport = () => {
    if (payments.length === 0) { toast.error("No transactions to export"); return; }
    const rows = [
      ["Date", "Description", "Amount", "Status", "Order ID"],
      ...payments.map(p => [
        formatDate(p.createdAt),
        p.description || "Consultation",
        `₹${((p.amount || 0) / 100).toFixed(2)}`,
        p.status,
        p.orderId || p.razorpayOrderId || "—",
      ]),
    ];
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "payments.csv";
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
    toast.success("Exported to payments.csv");
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div><h1 className="text-2xl font-bold font-heading">Payment History</h1><p className="text-muted-foreground mt-1">{total} transactions</p></div>
        <Button variant="outline" size="sm" className="rounded-xl gap-1.5" onClick={handleExport}><Download className="w-4 h-4" />Export CSV</Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Spent", value: formatCurrency(totalSpent), icon: IndianRupee, color: "text-brand-600", bg: "bg-brand-50" },
          { label: "Successful", value: payments.filter(p => p.status === "SUCCESS").length, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
          { label: "Transactions", value: total, icon: CreditCard, color: "text-purple-600", bg: "bg-purple-50" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-card rounded-2xl border border-border p-5 flex items-center gap-4">
            <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center shrink-0`}><Icon className={`w-6 h-6 ${color}`} /></div>
            <div><p className="text-sm text-muted-foreground">{label}</p><p className="text-2xl font-bold font-heading">{value}</p></div>
          </div>
        ))}
      </div>

      {/* Transactions */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="p-5 border-b border-border"><h3 className="font-semibold font-heading">All Transactions</h3></div>
        {loading ? (
          <div className="p-8 text-center text-muted-foreground text-sm">Loading...</div>
        ) : payments.length === 0 ? (
          <div className="p-16 text-center">
            <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No payments yet. Book a consultation to get started.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {payments.map((p, i) => {
              const StatusIcon = statusIcon[p.status] || Clock;
              return (
                <motion.div key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${p.status === "SUCCESS" ? "bg-green-50" : "bg-muted"}`}>
                    <StatusIcon className={`w-5 h-5 ${p.status === "SUCCESS" ? "text-green-600" : "text-muted-foreground"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{p.type === "CA_ONBOARDING" ? "CA Registration Fee" : p.booking?.service?.name || "Consultation"}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(p.createdAt)} · {p.razorpayOrderId || p.id}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-semibold">{formatCurrency(p.amount)}</p>
                    <Badge variant={statusVariant[p.status]} className="text-xs mt-0.5">{p.status}</Badge>
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
