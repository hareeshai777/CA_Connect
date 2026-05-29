"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Eye, EyeOff, Loader2, Mail, Lock, User, Phone,
  CheckCircle, ArrowRight, Upload, FileText, Users, Briefcase, X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, getErrorMessage } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// ── Schemas ──────────────────────────────────────────────────────────────────

const clientSchema = z.object({
  firstName: z.string().min(2, "Required"),
  lastName: z.string().min(1, "Required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  password: z.string().min(8, "Min 8 chars").regex(/[A-Z]/, "Needs uppercase").regex(/[0-9]/, "Needs number"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, { message: "Passwords don't match", path: ["confirmPassword"] });

const caSchema = z.object({
  firstName: z.string().min(2, "Required"),
  lastName: z.string().min(1, "Required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(10, "Required"),
  password: z.string().min(8, "Min 8 chars").regex(/[A-Z]/, "Needs uppercase").regex(/[0-9]/, "Needs number"),
  membershipNumber: z.string().optional(),
  experienceYears: z.number().min(0).max(60),
  bio: z.string().min(50, "Min 50 characters"),
  city: z.string().min(2, "Required"),
  state: z.string().min(2, "Required"),
  languages: z.string().min(2, "Required"),
});

type ClientForm = z.infer<typeof clientSchema>;
type CAForm = z.infer<typeof caSchema>;

// ── Client Registration ───────────────────────────────────────────────────────

function ClientRegister() {
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"form" | "verify">("form");
  const [userId, setUserId] = useState("");
  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [email, setEmail] = useState("");
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<ClientForm>({ resolver: zodResolver(clientSchema) });

  const onSubmit = async (data: ClientForm) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/register", {
        ...data,
        phone: data.phone?.replace(/[\s\-().]/g, "") || undefined,
        role: "CLIENT",
      });
      setUserId(res.data.data.userId);
      setEmail(data.email);
      setStep("verify");
      toast.success("Account created! Check your email for the OTP.");
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setLoading(false); }
  };

  const handleVerify = async () => {
    if (otp.length !== 6) return toast.error("Enter the 6-digit OTP");
    setVerifying(true);
    try {
      await api.post("/auth/verify-otp", { userId, otp });
      toast.success("Email verified! Please log in.");
      router.push("/auth/login");
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setVerifying(false); }
  };

  if (step === "verify") {
    return (
      <div className="text-center">
        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <Mail className="w-7 h-7 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Verify your email</h2>
        <p className="text-gray-500 mb-6 text-sm">Enter the 6-digit code sent to <strong>{email}</strong></p>
        <Input type="text" placeholder="000000" maxLength={6}
          className="text-center text-3xl font-bold tracking-[1rem] h-16 rounded-xl mb-4"
          value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} />
        <Button className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold" onClick={handleVerify} disabled={verifying}>
          {verifying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {verifying ? "Verifying..." : "Verify Email"}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold text-gray-700">First Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Rahul" className="pl-10 h-11 rounded-xl border-gray-200 bg-gray-50 focus:bg-white" {...register("firstName")} />
          </div>
          {errors.firstName && <p className="text-xs text-red-500">{errors.firstName.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold text-gray-700">Last Name</Label>
          <Input placeholder="Sharma" className="h-11 rounded-xl border-gray-200 bg-gray-50 focus:bg-white" {...register("lastName")} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-sm font-semibold text-gray-700">Email address</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input type="email" placeholder="you@example.com" className="pl-10 h-11 rounded-xl border-gray-200 bg-gray-50 focus:bg-white" {...register("email")} />
        </div>
        {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label className="text-sm font-semibold text-gray-700">Phone (optional)</Label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input type="tel" placeholder="+91 98765 43210" className="pl-10 h-11 rounded-xl border-gray-200 bg-gray-50 focus:bg-white" {...register("phone")} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-sm font-semibold text-gray-700">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input type={showPass ? "text" : "password"} placeholder="Min 8 chars, 1 uppercase, 1 number" className="pl-10 pr-10 h-11 rounded-xl border-gray-200 bg-gray-50 focus:bg-white" {...register("password")} />
          <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" onClick={() => setShowPass(!showPass)}>
            {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label className="text-sm font-semibold text-gray-700">Confirm Password</Label>
        <Input type="password" placeholder="Repeat your password" className="h-11 rounded-xl border-gray-200 bg-gray-50 focus:bg-white" {...register("confirmPassword")} />
        {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>}
      </div>
      <p className="text-xs text-gray-400">
        By registering, you agree to our <Link href="/terms" className="text-blue-600 hover:underline">Terms</Link> and <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>.
      </p>
      <Button type="submit" className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold shadow-lg shadow-blue-600/25" disabled={loading}>
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        {loading ? "Creating Account..." : <>Create Account <ArrowRight className="ml-2 h-4 w-4" /></>}
      </Button>
    </form>
  );
}

// ── CA Registration ───────────────────────────────────────────────────────────

const CA_STEPS = ["Account", "Profile", "Certificate", "Done"];

function CARegister() {
  const [step, setStep] = useState(1);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [certFile, setCertFile] = useState<File | null>(null);
  const [certUploading, setCertUploading] = useState(false);
  const certRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const { register, handleSubmit, formState: { errors }, trigger } = useForm<CAForm>({
    resolver: zodResolver(caSchema),
    defaultValues: { experienceYears: 0 },
  });

  const nextStep = async (fields: (keyof CAForm)[]) => {
    const ok = await trigger(fields);
    if (ok) setStep((s) => s + 1);
  };

  const handleRegister = async (data: CAForm) => {
    setLoading(true);
    try {
      const userRes = await api.post("/auth/register", {
        firstName: data.firstName, lastName: data.lastName,
        email: data.email,
        phone: data.phone?.replace(/[\s\-().]/g, "") || undefined,
        password: data.password,
        role: "CA_PROFESSIONAL",
      });
      const newUserId = userRes.data.data.userId;
      const loginRes = await api.post("/auth/login", { email: data.email, password: data.password });
      const { accessToken, refreshToken, role } = loginRes.data.data;
      setAuth({ id: newUserId, email: data.email, role, isEmailVerified: false }, accessToken, refreshToken);

      await api.post("/ca/register", {
        firstName: data.firstName, lastName: data.lastName, bio: data.bio,
        membershipNumber: data.membershipNumber, experienceYears: data.experienceYears,
        consultationFee: 49900, city: data.city, state: data.state, languages: data.languages,
      });

      setStep(3); // Go to certificate upload step
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setLoading(false); }
  };

  const handleCertUpload = async () => {
    if (!certFile) { toast.error("Please select your certificate file"); return; }
    setCertUploading(true);
    try {
      const form = new FormData();
      form.append("certificate", certFile);
      await api.post("/ca/upload/certificate", form, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Certificate uploaded successfully!");
      setStep(4);
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setCertUploading(false); }
  };

  const skipCert = () => setStep(4);

  return (
    <div>
      {/* Step indicator */}
      <div className="flex items-center gap-1.5 mb-7">
        {CA_STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className={cn(
              "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all",
              step > i + 1 ? "bg-green-500 text-white" : step === i + 1 ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-400"
            )}>
              {step > i + 1 ? <CheckCircle className="w-4 h-4" /> : i + 1}
            </div>
            <span className={cn("text-xs hidden sm:block", step === i + 1 ? "text-blue-600 font-semibold" : "text-gray-400")}>{label}</span>
            {i < CA_STEPS.length - 1 && <div className={cn("h-0.5 w-6", step > i + 1 ? "bg-green-400" : "bg-gray-200")} />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Account */}
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
            <h2 className="text-2xl font-bold mb-1">Create CA Account</h2>
            <p className="text-gray-500 text-sm mb-5">Your login credentials</p>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label className="text-sm font-semibold text-gray-700">First Name</Label><Input placeholder="Anil" className="h-11 rounded-xl border-gray-200 bg-gray-50" {...register("firstName")} />{errors.firstName && <p className="text-xs text-red-500">{errors.firstName.message}</p>}</div>
                <div className="space-y-1.5"><Label className="text-sm font-semibold text-gray-700">Last Name</Label><Input placeholder="Kumar" className="h-11 rounded-xl border-gray-200 bg-gray-50" {...register("lastName")} /></div>
              </div>
              <div className="space-y-1.5"><Label className="text-sm font-semibold text-gray-700">Email</Label><div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><Input type="email" placeholder="ca@example.com" className="pl-10 h-11 rounded-xl border-gray-200 bg-gray-50" {...register("email")} /></div>{errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}</div>
              <div className="space-y-1.5"><Label className="text-sm font-semibold text-gray-700">Phone</Label><div className="relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><Input placeholder="+91 98765 43210" className="pl-10 h-11 rounded-xl border-gray-200 bg-gray-50" {...register("phone")} /></div>{errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}</div>
              <div className="space-y-1.5"><Label className="text-sm font-semibold text-gray-700">Password</Label><div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><Input type={showPass ? "text" : "password"} placeholder="Min 8 chars" className="pl-10 pr-10 h-11 rounded-xl border-gray-200 bg-gray-50" {...register("password")} /><button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" onClick={() => setShowPass(!showPass)}>{showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div>{errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}</div>
              <Button type="button" className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold"
                onClick={() => nextStep(["firstName", "lastName", "email", "phone", "password"])}>
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Professional Profile */}
        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
            <h2 className="text-2xl font-bold mb-1">Professional Profile</h2>
            <p className="text-gray-500 text-sm mb-5">Tell clients about your expertise</p>
            <div className="space-y-3">
              <div className="space-y-1.5"><Label className="text-sm font-semibold text-gray-700">ICAI Membership Number</Label><Input placeholder="ICAI-MH-2012-XXXXX" className="h-11 rounded-xl border-gray-200 bg-gray-50" {...register("membershipNumber")} /></div>
              <div className="space-y-1.5"><Label className="text-sm font-semibold text-gray-700">Experience (Years)</Label><Input type="number" className="h-11 rounded-xl border-gray-200 bg-gray-50" {...register("experienceYears", { valueAsNumber: true })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label className="text-sm font-semibold text-gray-700">City</Label><Input placeholder="Mumbai" className="h-11 rounded-xl border-gray-200 bg-gray-50" {...register("city")} />{errors.city && <p className="text-xs text-red-500">{errors.city.message}</p>}</div>
                <div className="space-y-1.5"><Label className="text-sm font-semibold text-gray-700">State</Label><Input placeholder="Maharashtra" className="h-11 rounded-xl border-gray-200 bg-gray-50" {...register("state")} /></div>
              </div>
              <div className="space-y-1.5"><Label className="text-sm font-semibold text-gray-700">Languages</Label><Input placeholder="English, Hindi, Marathi" className="h-11 rounded-xl border-gray-200 bg-gray-50" {...register("languages")} /></div>
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-gray-700">Professional Bio <span className="text-gray-400 font-normal">(min 50 chars)</span></Label>
                <textarea className="w-full rounded-xl border border-gray-200 bg-gray-50 focus:bg-white px-3 py-2.5 text-sm min-h-[100px] resize-none outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" placeholder="Describe your expertise and specializations..." {...register("bio")} />
                {errors.bio && <p className="text-xs text-red-500">{errors.bio.message}</p>}
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" className="flex-1 h-11 rounded-xl" onClick={() => setStep(1)}>Back</Button>
                <Button type="button" className="flex-1 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold" disabled={loading}
                  onClick={handleSubmit(handleRegister)}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {loading ? "Saving..." : "Continue"}
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 3: Certificate Upload */}
        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
            <h2 className="text-2xl font-bold mb-1">Upload Certificate</h2>
            <p className="text-gray-500 text-sm mb-6">Upload your ICAI membership certificate for verification</p>

            <div
              onClick={() => certRef.current?.click()}
              className={cn(
                "border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all mb-4",
                certFile ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
              )}
            >
              <input ref={certRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden"
                onChange={(e) => e.target.files?.[0] && setCertFile(e.target.files[0])} />
              {certFile ? (
                <div className="flex items-center justify-center gap-3">
                  <FileText className="w-8 h-8 text-blue-500" />
                  <div className="text-left">
                    <p className="font-semibold text-sm text-blue-700">{certFile.name}</p>
                    <p className="text-xs text-blue-500">{(certFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button type="button" onClick={(e) => { e.stopPropagation(); setCertFile(null); }} className="ml-2 text-gray-400 hover:text-red-500">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="font-semibold text-gray-600 mb-1">Click to upload certificate</p>
                  <p className="text-xs text-gray-400">PDF, JPG, PNG — max 10 MB</p>
                </>
              )}
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5">
              <p className="text-xs text-amber-700 font-medium">📋 Your account will be reviewed by our admin team after submission. You'll receive an email once approved (typically within 24 hours).</p>
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" className="flex-1 h-11 rounded-xl" onClick={skipCert}>Skip for now</Button>
              <Button type="button" className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold" onClick={handleCertUpload} disabled={certUploading || !certFile}>
                {certUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                {certUploading ? "Uploading..." : "Upload & Submit"}
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 4: Done */}
        {step === 4 && (
          <motion.div key="step4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-9 h-9 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Application Submitted!</h2>
            <p className="text-gray-500 text-sm mb-6">Your CA profile is under admin review. You'll receive an email notification once approved — typically within 24 hours.</p>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 text-left space-y-2">
              {["Profile visible after admin approval", "Access full CA dashboard", "Start accepting bookings"].map((b) => (
                <div key={b} className="flex items-center gap-2 text-sm text-blue-700"><CheckCircle className="w-4 h-4 text-blue-500 shrink-0" />{b}</div>
              ))}
            </div>
            <Button className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold" onClick={() => router.push("/ca/dashboard")}>
              Go to Dashboard
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {step <= 2 && (
        <p className="text-center mt-4 text-sm text-gray-500">
          Already have an account? <Link href="/auth/login" className="text-blue-600 font-semibold hover:underline">Sign in</Link>
        </p>
      )}
    </div>
  );
}

// ── Main page with tabs ───────────────────────────────────────────────────────

function RegisterContent() {
  // Read ?tab=ca from URL to pre-select CA tab (used by /ca/register redirect)
  const [tab, setTab] = useState<"client" | "ca">(() => {
    if (typeof window !== "undefined") {
      return new URLSearchParams(window.location.search).get("tab") === "ca" ? "ca" : "client";
    }
    return "client";
  });

  return (
    <div>
      {/* Header */}
      <div className="mb-7">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-1.5 tracking-tight">Create your account</h1>
        <p className="text-gray-500">Join CAConnect and get started today</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-xl mb-7">
        <button
          onClick={() => setTab("client")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 h-10 rounded-lg text-sm font-semibold transition-all",
            tab === "client" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
          )}
        >
          <Users className="w-4 h-4" /> I'm a Client
        </button>
        <button
          onClick={() => setTab("ca")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 h-10 rounded-lg text-sm font-semibold transition-all",
            tab === "ca" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
          )}
        >
          <Briefcase className="w-4 h-4" /> I'm a CA Professional
        </button>
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        {tab === "client" ? (
          <motion.div key="client" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <ClientRegister />
          </motion.div>
        ) : (
          <motion.div key="ca" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <CARegister />
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-center mt-5 text-sm text-gray-500">
        Already have an account?{" "}
        <Link href="/auth/login" className="text-blue-600 font-semibold hover:underline">Sign in</Link>
      </p>
    </div>
  );
}

export default function RegisterPage() {
  return <RegisterContent />;
}
