"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Loader2, ArrowLeft, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, getErrorMessage } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast.error("Please enter your email");
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-950 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold font-heading mb-2">Check your email</h1>
        <p className="text-muted-foreground mb-8">
          If <strong>{email}</strong> is registered, you'll receive a password reset link within a few minutes.
        </p>
        <Button variant="outline" className="w-full rounded-xl" asChild>
          <Link href="/auth/login"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Sign In</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-heading mb-2">Reset password</h1>
        <p className="text-muted-foreground">Enter your email and we'll send you a reset link.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label>Email address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="email"
              placeholder="you@example.com"
              className="pl-10 h-11"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>
        <Button type="submit" className="w-full h-11 rounded-xl bg-brand-600 hover:bg-brand-700 font-semibold" disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
          {loading ? "Sending..." : "Send Reset Link"}
        </Button>
      </form>

      <p className="text-center mt-6 text-sm text-muted-foreground">
        Remember your password?{" "}
        <Link href="/auth/login" className="text-brand-600 font-medium hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
