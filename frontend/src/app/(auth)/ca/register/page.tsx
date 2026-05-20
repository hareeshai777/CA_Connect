"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Mail, Lock, Phone, Building, FileText, CreditCard, CheckCircle, Loader2, Eye, EyeOff, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { api, getErrorMessage } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { formatCurrency } from "@/lib/utils";

const ONBOARDING_FEE = 49900;

const schema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(10),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
  membershipNumber: z.string().optional(),
  experienceYears: z.number().min(0).max(60),
  consultationFee: z.number().min(29900).max(50000000),
  bio: z.string().min(50, "Bio must be at least 50 characters"),
  city: z.string().min(2),
  state: z.string().min(2),
  languages: z.string().min(2),
});

type FormData = z.infer<typeof schema>;

export default function CARegisterPage() {
  const [step, setStep] = useState(1);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState("");
  const [caId, setCAId] = useState("");
  const [razorpayOrderId, setRazorpayOrderId] = useState("");
  const [paymentDone, setPaymentDone] = useState(false);
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const { register, handleSubmit, getValues, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { experienceYears: 0, consultationFee: 50000 },
  });

  const handleRegisterAndPay = async (data: FormData) => {
    setLoading(true);
    try {
      const userRes = await api.post("/auth/register", {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: "CA_PROFESSIONAL",
      });
      const newUserId = userRes.data.data.userId;
      setUserId(newUserId);

      const loginRes = await api.post("/auth/login", { email: data.email, password: data.password });
      const { accessToken, refreshToken, role } = loginRes.data.data;
      setAuth({ id: newUserId, email: data.email, role, isEmailVerified: false }, accessToken, refreshToken);

      const caRes = await api.post("/ca/register", {
        firstName: data.firstName,
        lastName: data.lastName,
        bio: data.bio,
        membershipNumber: data.membershipNumber,
        experienceYears: data.experienceYears,
        consultationFee: data.consultationFee,
        city: data.city,
        state: data.state,
        languages: data.languages,
      });

      setCAId(caRes.data.data.caId);
      setRazorpayOrderId(caRes.data.data.razorpayOrderId);
      setStep(3);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = () => {
    if (typeof window === "undefined" || !(window as any).Razorpay) {
      return toast.error("Razorpay not loaded. Please refresh.");
    }
    const rzp = new (window as any).Razorpay({
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: ONBOARDING_FEE,
      currency: "INR",
      order_id: razorpayOrderId,
      name: "CA Pro Platform",
      description: "CA Professional Onboarding Fee",
      handler: async (response: any) => {
        toast.success("Payment successful! Your account is under review.");
        setPaymentDone(true);
        setStep(4);
      },
      prefill: { name: `${getValues("firstName")} ${getValues("lastName")}`, email: getValues("email"), contact: getValues("phone") },
      theme: { color: "#1d4ed8" },
    });
    rzp.open();
  };

  return (
    <div>
      {/* Step Indicator */}
      <div className="flex items-center gap-2 mb-8">
        {["Account", "Profile", "Payment", "Done"].map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step > i + 1 ? "bg-green-500 text-white" : step === i + 1 ? "bg-brand-600 text-white" : "bg-muted text-muted-foreground"}`}>
              {step > i + 1 ? <CheckCircle className="w-4 h-4" /> : i + 1}
            </div>
            <span className={`text-xs hidden sm:block ${step === i + 1 ? "text-brand-600 font-medium" : "text-muted-foreground"}`}>{label}</span>
            {i < 3 && <div className={`flex-1 h-0.5 w-8 ${step > i + 1 ? "bg-green-400" : "bg-border"}`} />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div>
          <h2 className="text-2xl font-bold font-heading mb-1">Create CA Account</h2>
          <p className="text-muted-foreground mb-6">Register as a CA Professional</p>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label>First Name</Label><Input placeholder="Anil" className="h-11" {...register("firstName")} />{errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}</div>
              <div className="space-y-1.5"><Label>Last Name</Label><Input placeholder="Kumar" className="h-11" {...register("lastName")} /></div>
            </div>
            <div className="space-y-1.5"><Label>Email</Label><Input type="email" placeholder="ca@example.com" className="h-11" {...register("email")} />{errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}</div>
            <div className="space-y-1.5"><Label>Phone</Label><Input placeholder="+91 98765 43210" className="h-11" {...register("phone")} /></div>
            <div className="space-y-1.5">
              <Label>Password</Label>
              <div className="relative">
                <Input type={showPass ? "text" : "password"} placeholder="Min 8 chars" className="h-11 pr-10" {...register("password")} />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>
            <Button className="w-full h-11 rounded-xl bg-brand-600 hover:bg-brand-700 font-semibold" onClick={() => setStep(2)}>
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <form onSubmit={handleSubmit(handleRegisterAndPay)}>
          <h2 className="text-2xl font-bold font-heading mb-1">Professional Profile</h2>
          <p className="text-muted-foreground mb-6">Tell clients about your expertise</p>
          <div className="space-y-4">
            <div className="space-y-1.5"><Label>ICAI Membership Number</Label><Input placeholder="ICAI-MXXXXXXX" className="h-11" {...register("membershipNumber")} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label>Experience (Years)</Label><Input type="number" className="h-11" {...register("experienceYears", { valueAsNumber: true })} /></div>
              <div className="space-y-1.5"><Label>Consultation Fee (₹)</Label><Input type="number" placeholder="500" className="h-11" {...register("consultationFee", { valueAsNumber: true })} /><p className="text-xs text-muted-foreground">Min ₹299</p></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label>City</Label><Input placeholder="Mumbai" className="h-11" {...register("city")} /></div>
              <div className="space-y-1.5"><Label>State</Label><Input placeholder="Maharashtra" className="h-11" {...register("state")} /></div>
            </div>
            <div className="space-y-1.5"><Label>Languages</Label><Input placeholder="English, Hindi, Marathi" className="h-11" {...register("languages")} /></div>
            <div className="space-y-1.5">
              <Label>Professional Bio</Label>
              <textarea className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm min-h-[120px] resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder="Describe your expertise, experience, and specializations... (min 50 characters)" {...register("bio")} />
              {errors.bio && <p className="text-xs text-destructive">{errors.bio.message}</p>}
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" className="flex-1 h-11 rounded-xl" onClick={() => setStep(1)}>Back</Button>
              <Button type="submit" className="flex-1 h-11 rounded-xl bg-brand-600 hover:bg-brand-700" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {loading ? "Creating..." : "Continue to Payment"}
              </Button>
            </div>
          </div>
        </form>
      )}

      {step === 3 && (
        <div className="text-center">
          <div className="w-16 h-16 bg-brand-100 dark:bg-brand-950 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CreditCard className="w-8 h-8 text-brand-600" />
          </div>
          <h2 className="text-2xl font-bold font-heading mb-2">One-time Onboarding Fee</h2>
          <p className="text-muted-foreground mb-6">Complete your account activation with a one-time fee</p>
          <div className="bg-muted/50 rounded-2xl p-6 mb-6 text-left space-y-3">
            <div className="flex justify-between"><span className="text-muted-foreground">Onboarding fee</span><span className="font-semibold">{formatCurrency(ONBOARDING_FEE)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Profile verification</span><span className="font-semibold text-green-600">Included</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Dashboard access</span><span className="font-semibold text-green-600">Included</span></div>
            <div className="border-t border-border pt-3 flex justify-between"><span className="font-semibold">Total</span><span className="text-xl font-bold text-brand-600">{formatCurrency(ONBOARDING_FEE)}</span></div>
          </div>
          <div className="space-y-2 text-left mb-6">
            {["Profile appears to 10,000+ clients", "Access to CA Professional dashboard", "Consultation booking & calendar tools", "Earnings tracking & analytics"].map((b) => (
              <div key={b} className="flex items-center gap-2 text-sm"><CheckCircle className="w-4 h-4 text-green-500 shrink-0" />{b}</div>
            ))}
          </div>
          <Button className="w-full h-12 rounded-xl bg-brand-600 hover:bg-brand-700 font-semibold text-base" onClick={handlePayment}>
            <CreditCard className="mr-2 h-5 w-5" />
            Pay {formatCurrency(ONBOARDING_FEE)} Now
          </Button>
          <p className="text-xs text-muted-foreground mt-3">Secured by Razorpay • UPI, Cards, Net Banking accepted</p>
        </div>
      )}

      {step === 4 && (
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-950 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold font-heading mb-2">Application Submitted!</h2>
          <p className="text-muted-foreground mb-6">Your CA account is under review. We'll notify you within 24 hours once approved.</p>
          <Badge variant="success" className="text-sm mb-6">Payment Received ✓</Badge>
          <Button className="w-full h-11 rounded-xl bg-brand-600 hover:bg-brand-700" onClick={() => router.push("/ca/dashboard")}>
            Go to Dashboard
          </Button>
        </div>
      )}

      {step <= 2 && (
        <p className="text-center mt-4 text-sm text-muted-foreground">
          Already have an account?{" "}
          <a href="/auth/login" className="text-brand-600 font-medium hover:underline">Sign in</a>
        </p>
      )}

      {/* Load Razorpay */}
      <script src="https://checkout.razorpay.com/v1/checkout.js" async />
    </div>
  );
}
