"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  Star, MapPin, Clock, Languages, CheckCircle, Video, Loader2, CreditCard,
  FileText, Building, BarChart3, Shield, CheckSquare, Lightbulb, TrendingUp, BookOpen, Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { api, getErrorMessage } from "@/lib/api";
import { formatCurrency, formatDate, getInitials } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { motion } from "framer-motion";

// Icon + color map for all services
const SERVICE_META: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string; gradient: string }> = {
  "gst-filing":            { icon: FileText,   color: "text-blue-600",   gradient: "from-blue-500 to-cyan-400" },
  "income-tax-filing":     { icon: BarChart3,  color: "text-emerald-600", gradient: "from-emerald-500 to-teal-400" },
  "company-registration":  { icon: Building,   color: "text-violet-600", gradient: "from-violet-500 to-purple-400" },
  "audit-services":        { icon: Shield,     color: "text-rose-600",   gradient: "from-rose-500 to-pink-400" },
  "trademark-registration":{ icon: CheckSquare,color: "text-amber-600",  gradient: "from-amber-500 to-orange-400" },
  "business-compliance":   { icon: Shield,     color: "text-teal-600",   gradient: "from-teal-500 to-cyan-500" },
  "startup-consulting":    { icon: Lightbulb,  color: "text-yellow-600", gradient: "from-yellow-500 to-amber-400" },
  "financial-planning":    { icon: TrendingUp, color: "text-indigo-600", gradient: "from-indigo-500 to-blue-400" },
  "accounting-services":   { icon: BookOpen,   color: "text-pink-600",   gradient: "from-pink-500 to-rose-400" },
  "payroll-services":      { icon: Users,      color: "text-cyan-600",   gradient: "from-cyan-500 to-sky-400" },
};

export default function CAProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [ca, setCA] = useState<any>(null);
  const [allServices, setAllServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [slots, setSlots] = useState<any[]>([]);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      api.get(`/ca/${id}`),
      api.get("/services"),
    ]).then(([caRes, svcRes]) => {
      setCA(caRes.data.data);
      setAllServices(svcRes.data.data || []);
      // Pre-select first specialization
      if (caRes.data.data.specializations?.length > 0) {
        setSelectedService(caRes.data.data.specializations[0].service);
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id || !selectedDate) return;
    api.get(`/ca/${id}/slots?date=${selectedDate}`).then((r) => setSlots(r.data.data || [])).catch(() => {});
  }, [id, selectedDate]);

  const handleBooking = async () => {
    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=/ca/${id}`);
      return;
    }
    if (!selectedSlot || !selectedService) {
      toast.error("Please select a service and time slot");
      return;
    }
    setBookingLoading(true);

    try {
      const orderRes = await api.post("/bookings/order", {
        caId: id, serviceId: selectedService.id, slotId: selectedSlot.id,
      });
      const { razorpayOrderId, amount, currency, key, prefill } = orderRes.data.data;
      if (!key || key === "rzp_test_" || !(window as any).Razorpay) throw new Error("Razorpay not configured");
      const rzp = new (window as any).Razorpay({
        key, amount, currency, order_id: razorpayOrderId, name: "CA Pro Platform",
        description: `${selectedService.name} with ${ca.firstName} ${ca.lastName}`,
        handler: async (response: any) => {
          try {
            await api.post("/bookings/confirm", {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              caId: id, serviceId: selectedService.id, slotId: selectedSlot.id,
            });
            toast.success("Booking confirmed! Check your email for details.");
            router.push("/client/bookings");
          } catch (err) { toast.error(getErrorMessage(err)); }
        },
        prefill, theme: { color: "#1d4ed8" },
      });
      rzp.open();
    } catch {
      try {
        await api.post("/bookings/direct", { caId: id, serviceId: selectedService.id, slotId: selectedSlot.id });
        toast.success("Booking confirmed! Your consultation is scheduled.");
        router.push("/client/bookings");
      } catch (err) { toast.error(getErrorMessage(err)); }
    } finally { setBookingLoading(false); }
  };

  const today = new Date();
  const next7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-10 h-10 animate-spin text-brand-600" />
    </div>
  );

  if (!ca) return <div className="min-h-screen flex items-center justify-center"><p>CA not found</p></div>;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">

        {/* ── Profile Header ── */}
        <div className="bg-gradient-to-r from-brand-50 to-blue-50 border-b border-border">
          <div className="container mx-auto px-4 py-12">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="relative">
                <Avatar className="h-28 w-28 border-4 border-white shadow-xl">
                  <AvatarImage src={ca.avatarUrl} />
                  <AvatarFallback className="text-4xl font-bold bg-brand-100 text-brand-700">
                    {getInitials(ca.firstName, ca.lastName)}
                  </AvatarFallback>
                </Avatar>
                {ca.isAvailable && <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white" />}
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold font-heading">{ca.firstName} {ca.lastName}</h1>
                  <CheckCircle className="w-6 h-6 text-brand-600" />
                  <Badge variant={ca.isAvailable ? "success" : "secondary"}>{ca.isAvailable ? "Available" : "Busy"}</Badge>
                </div>
                <div className="flex flex-wrap gap-4 text-muted-foreground mb-4">
                  <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{ca.city}, {ca.state}</span>
                  <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{ca.experienceYears}+ years experience</span>
                  <span className="flex items-center gap-1.5"><Languages className="w-4 h-4" />{ca.languages}</span>
                </div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1.5">
                    <Star className="w-5 h-5 text-gold-500 fill-gold-500" />
                    <span className="font-bold text-lg">{ca.averageRating?.toFixed(1)}</span>
                    <span className="text-muted-foreground">({ca.totalReviews} reviews)</span>
                  </div>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">{ca._count?.bookings || 0} consultations</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {ca.specializations?.map(({ service }: any) => (
                    <Badge key={service.slug} variant="info" className="text-sm">{service.name}</Badge>
                  ))}
                </div>
              </div>

              <div className="text-right">
                <p className="text-sm text-muted-foreground mb-1">Consultation fee</p>
                <p className="text-3xl font-bold text-brand-600">{formatCurrency(ca.consultationFee)}</p>
                <p className="text-xs text-muted-foreground">per session (60 min)</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* ── Left Column ── */}
            <div className="lg:col-span-2 space-y-6">

              {/* About */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold font-heading mb-3">About</h2>
                  <p className="text-muted-foreground leading-relaxed">{ca.bio}</p>
                </CardContent>
              </Card>

              {/* ── Select a Service ── */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-xl font-bold font-heading">Select a Service to Book</h2>
                    {selectedService && (
                      <span className="text-xs bg-brand-50 text-brand-700 border border-brand-200 rounded-full px-3 py-1 font-semibold">
                        ✓ {selectedService.name}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(allServices.length > 0 ? allServices : ca.specializations?.map((s: any) => s.service) || []).map((service: any, i: number) => {
                      const meta = SERVICE_META[service.slug] || { icon: FileText, color: "text-brand-600", gradient: "from-brand-500 to-brand-400" };
                      const Icon = meta.icon;
                      const isSelected = selectedService?.id === service.id;
                      return (
                        <motion.button
                          key={service.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.03 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedService(service)}
                          className={`relative flex items-start gap-3 p-4 rounded-xl border text-left transition-all duration-200 group ${
                            isSelected
                              ? "border-brand-500 bg-brand-50 shadow-sm"
                              : "border-border hover:border-brand-300 hover:bg-muted/40"
                          }`}
                        >
                          {/* Icon */}
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${meta.gradient} flex items-center justify-center shrink-0 shadow-sm`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          {/* Text */}
                          <div className="flex-1 min-w-0">
                            <p className={`font-semibold text-sm leading-tight ${isSelected ? "text-brand-700" : "text-foreground"}`}>
                              {service.name}
                            </p>
                            {service.shortDescription && (
                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{service.shortDescription}</p>
                            )}
                          </div>
                          {/* Selected tick */}
                          {isSelected && (
                            <div className="absolute top-3 right-3 w-5 h-5 bg-brand-600 rounded-full flex items-center justify-center">
                              <CheckCircle className="w-3.5 h-3.5 text-white" />
                            </div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Specializations */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold font-heading mb-4">Specializations</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {ca.specializations?.map(({ service }: any) => (
                      <div key={service.slug} className="flex items-center gap-3 p-3 rounded-xl border border-border">
                        <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                        <span className="font-medium text-sm">{service.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Reviews */}
              {ca.reviews?.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold font-heading mb-4">Client Reviews</h2>
                    <div className="space-y-4">
                      {ca.reviews.map((r: any) => (
                        <div key={r.id} className="border-b border-border last:border-0 pb-4 last:pb-0">
                          <div className="flex items-center gap-3 mb-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs bg-muted">{getInitials(r.clientProfile?.firstName || "C", r.clientProfile?.lastName)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{r.clientProfile?.firstName} {r.clientProfile?.lastName}</p>
                              <div className="flex gap-0.5">
                                {[...Array(r.rating)].map((_, i) => <Star key={i} className="w-3 h-3 text-gold-500 fill-gold-500" />)}
                              </div>
                            </div>
                            <span className="ml-auto text-xs text-muted-foreground">{formatDate(r.createdAt)}</span>
                          </div>
                          {r.comment && <p className="text-sm text-muted-foreground">{r.comment}</p>}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* ── Right: Booking sidebar (date + slot + pay) ── */}
            <div>
              <Card className="sticky top-20">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold font-heading mb-1">Book Consultation</h2>

                  {/* Selected service pill */}
                  {selectedService ? (
                    <div className="flex items-center gap-2 bg-brand-50 border border-brand-200 rounded-xl px-3 py-2 mb-5">
                      <CheckCircle className="w-4 h-4 text-brand-600 shrink-0" />
                      <span className="text-sm font-semibold text-brand-700 truncate">{selectedService.name}</span>
                    </div>
                  ) : (
                    <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mb-5">
                      ← Select a service on the left first
                    </p>
                  )}

                  {/* Date selection */}
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">Select Date</p>
                    <div className="grid grid-cols-4 gap-2">
                      {next7Days.map((date) => {
                        const d = date.toISOString().split("T")[0];
                        return (
                          <button key={d} onClick={() => { setSelectedDate(d); setSelectedSlot(null); }}
                            className={`p-2 rounded-xl border text-center text-xs transition-colors ${selectedDate === d ? "border-brand-500 bg-brand-50 text-brand-700 font-semibold" : "border-border hover:border-brand-300"}`}>
                            <div className="font-medium">{date.toLocaleDateString("en", { weekday: "short" })}</div>
                            <div>{date.getDate()}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Slot selection */}
                  {selectedDate && (
                    <div className="mb-5">
                      <p className="text-sm font-medium mb-2">Select Time Slot</p>
                      {slots.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-3">No slots available</p>
                      ) : (
                        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                          {slots.map((slot) => (
                            <button key={slot.id} onClick={() => setSelectedSlot(slot)}
                              className={`p-2.5 rounded-xl border text-xs font-medium transition-colors ${selectedSlot?.id === slot.id ? "border-brand-500 bg-brand-50 text-brand-700" : "border-border hover:border-brand-300"}`}>
                              {slot.startTime} - {slot.endTime}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Booking summary */}
                  {selectedSlot && selectedService && (
                    <div className="bg-muted/50 rounded-xl p-4 mb-4 text-sm space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Service</span>
                        <span className="font-medium text-right max-w-[120px] truncate">{selectedService.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Date</span>
                        <span className="font-medium">{selectedDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Time</span>
                        <span className="font-medium">{selectedSlot.startTime} - {selectedSlot.endTime}</span>
                      </div>
                      <div className="flex justify-between border-t border-border pt-2">
                        <span className="font-semibold">Total</span>
                        <span className="font-bold text-brand-600">{formatCurrency(ca.consultationFee)}</span>
                      </div>
                    </div>
                  )}

                  <Button className="w-full h-12 rounded-xl bg-brand-600 hover:bg-brand-700 font-semibold"
                    onClick={handleBooking}
                    disabled={bookingLoading || !selectedSlot || !selectedService}>
                    {bookingLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CreditCard className="mr-2 h-4 w-4" />}
                    {bookingLoading ? "Processing..." : isAuthenticated ? "Book & Pay" : "Sign In to Book"}
                  </Button>

                  <div className="flex items-center gap-2 justify-center mt-3 text-xs text-muted-foreground">
                    <Video className="w-3.5 h-3.5" />Google Meet link generated automatically
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <script src="https://checkout.razorpay.com/v1/checkout.js" async />
    </div>
  );
}
