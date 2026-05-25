"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Clock, Calendar, RefreshCw, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { api, getErrorMessage } from "@/lib/api";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const SLOTS_PER_DAY = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"];

export default function CASchedulePage() {
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ date: "", startTime: "09:00", endTime: "10:00", isRecurring: false, dayOfWeek: "Monday" });

  const fetchSlots = async () => {
    setLoading(true);
    try {
      const res = await api.get("/ca/my/timeslots");
      setSlots(res.data.data || []);
    } catch { setSlots([]); } finally { setLoading(false); }
  };

  useEffect(() => { fetchSlots(); }, []);

  const addSlot = async () => {
    if (!form.date && !form.isRecurring) return toast.error("Please select a date");
    setAdding(true);
    try {
      await api.post("/ca/slots", {
        slots: [{
          date: form.isRecurring ? undefined : form.date,
          startTime: form.startTime,
          endTime: form.endTime,
          isRecurring: form.isRecurring,
          dayOfWeek: form.isRecurring ? form.dayOfWeek : undefined,
        }],
      });
      toast.success("Time slot added");
      fetchSlots();
    } catch (err) { toast.error(getErrorMessage(err)); } finally { setAdding(false); }
  };

  const deleteSlot = async (id: string) => {
    try {
      await api.delete(`/ca/slots/${id}`);
      toast.success("Slot removed");
      setSlots((prev) => prev.filter((s) => s.id !== id));
    } catch (err) { toast.error(getErrorMessage(err)); }
  };

  const upcoming = slots.filter((s) => !s.isBooked);
  const booked = slots.filter((s) => s.isBooked);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-heading">My Schedule</h1>
        <p className="text-muted-foreground mt-1">Manage your available time slots</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Slot Form */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="font-semibold font-heading mb-4 flex items-center gap-2"><Plus className="w-4 h-4 text-brand-600" />Add Time Slot</h3>

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
              <input type="checkbox" id="recurring" checked={form.isRecurring} onChange={(e) => setForm({ ...form, isRecurring: e.target.checked })} className="h-4 w-4 accent-brand-600" />
              <Label htmlFor="recurring" className="cursor-pointer text-sm">Recurring weekly slot</Label>
            </div>

            {form.isRecurring ? (
              <div>
                <Label className="text-xs mb-1.5 block">Day of Week</Label>
                <select value={form.dayOfWeek} onChange={(e) => setForm({ ...form, dayOfWeek: e.target.value })}
                  className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm">
                  {DAYS.map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>
            ) : (
              <div>
                <Label className="text-xs mb-1.5 block">Date</Label>
                <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                  min={new Date().toISOString().split("T")[0]} className="rounded-xl" />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs mb-1.5 block">Start Time</Label>
                <select value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                  className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm">
                  {SLOTS_PER_DAY.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <Label className="text-xs mb-1.5 block">End Time</Label>
                <select value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                  className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm">
                  {SLOTS_PER_DAY.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <Button onClick={addSlot} disabled={adding} className="w-full rounded-xl bg-brand-600 hover:bg-brand-700">
              {adding ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
              Add Slot
            </Button>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-blue-50 border border-blue-200">
            <p className="text-xs text-blue-700 flex items-start gap-2">
              <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              Clients can only book slots you mark as available here. Add recurring slots to save time.
            </p>
          </div>
        </div>

        {/* Available Slots */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold font-heading">Available Slots ({upcoming.length})</h3>
            <Button variant="ghost" size="sm" onClick={fetchSlots}><RefreshCw className="w-4 h-4" /></Button>
          </div>

          {loading ? (
            Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 bg-muted animate-pulse rounded-2xl" />)
          ) : upcoming.length === 0 ? (
            <div className="text-center py-16 bg-card rounded-2xl border border-border">
              <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No available slots. Add slots to start accepting bookings.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {upcoming.map((slot) => (
                <div key={slot.id} className="flex items-center justify-between p-4 rounded-2xl border border-border bg-card hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center">
                      <Clock className="w-5 h-5 text-brand-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {slot.isRecurring ? `Every ${slot.dayOfWeek}` : formatDate(slot.date)}
                      </p>
                      <p className="text-xs text-muted-foreground">{slot.startTime} – {slot.endTime}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {slot.isRecurring && <Badge variant="brand" className="text-xs">Recurring</Badge>}
                    <button onClick={() => deleteSlot(slot.id)} className="p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {booked.length > 0 && (
            <>
              <h3 className="font-semibold font-heading mt-6">Booked Slots ({booked.length})</h3>
              <div className="space-y-2">
                {booked.map((slot) => (
                  <div key={slot.id} className="flex items-center justify-between p-4 rounded-2xl border border-border bg-card opacity-70">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{formatDate(slot.date)}</p>
                        <p className="text-xs text-muted-foreground">{slot.startTime} – {slot.endTime}</p>
                      </div>
                    </div>
                    <Badge variant="success" className="text-xs">Booked</Badge>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
