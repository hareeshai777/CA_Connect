"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, Mail, Lock, User, Phone, Building } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, getErrorMessage } from "@/lib/api";

const schema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  password: z.string().min(8, "Password must be at least 8 characters").regex(/[A-Z]/, "Must contain uppercase").regex(/[0-9]/, "Must contain number"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, { message: "Passwords don't match", path: ["confirmPassword"] });

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"register" | "verify">("register");
  const [userId, setUserId] = useState("");
  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/register", {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: "CLIENT",
      });
      setUserId(res.data.data.userId);
      setStep("verify");
      toast.success("Account created! Check your email for the verification OTP.");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) return toast.error("Enter the 6-digit OTP");
    setVerifying(true);
    try {
      await api.post("/auth/verify-otp", { userId, otp });
      toast.success("Email verified! Please log in.");
      router.push("/auth/login");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setVerifying(false);
    }
  };

  if (step === "verify") {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-brand-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Mail className="w-8 h-8 text-brand-600" />
        </div>
        <h1 className="text-3xl font-bold font-heading mb-2">Verify your email</h1>
        <p className="text-muted-foreground mb-8">Enter the 6-digit code sent to your email address.</p>
        <div className="mb-6">
          <Input
            type="text"
            placeholder="000000"
            maxLength={6}
            className="text-center text-3xl font-bold tracking-[1rem] h-16 rounded-xl"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
          />
        </div>
        <Button className="w-full h-11 rounded-xl bg-brand-600 hover:bg-brand-700" onClick={handleVerifyOTP} disabled={verifying}>
          {verifying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {verifying ? "Verifying..." : "Verify Email"}
        </Button>
        <p className="mt-4 text-sm text-muted-foreground">
          Didn't receive the code?{" "}
          <button
            className="text-brand-600 font-medium hover:underline"
            onClick={() => api.post("/auth/resend-otp", { email: "" }).catch(() => {})}
          >
            Resend OTP
          </button>
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-heading mb-2">Create your account</h1>
        <p className="text-muted-foreground">Join CA Pro and connect with expert CAs</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>First Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rahul" className="pl-10 h-11" {...register("firstName")} />
            </div>
            {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Last Name</Label>
            <Input placeholder="Sharma" className="h-11" {...register("lastName")} />
            {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Email address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input type="email" placeholder="you@example.com" className="pl-10 h-11" {...register("email")} />
          </div>
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>Phone (optional)</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input type="tel" placeholder="+91 98765 43210" className="pl-10 h-11" {...register("phone")} />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input type={showPass ? "text" : "password"} placeholder="Min 8 chars, 1 uppercase, 1 number" className="pl-10 pr-10 h-11" {...register("password")} />
            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPass(!showPass)}>
              {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>Confirm Password</Label>
          <Input type="password" placeholder="Repeat your password" className="h-11" {...register("confirmPassword")} />
          {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
        </div>

        <p className="text-xs text-muted-foreground pt-1">
          By registering, you agree to our{" "}
          <Link href="/terms" className="text-brand-600 hover:underline">Terms of Service</Link> and{" "}
          <Link href="/privacy" className="text-brand-600 hover:underline">Privacy Policy</Link>.
        </p>

        <Button type="submit" className="w-full h-11 rounded-xl bg-brand-600 hover:bg-brand-700 font-semibold" disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {loading ? "Creating Account..." : "Create Account"}
        </Button>
      </form>

      <p className="text-center mt-6 text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/auth/login" className="text-brand-600 font-medium hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
