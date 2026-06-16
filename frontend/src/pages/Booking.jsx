import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast, Toaster } from "sonner";
import { ArrowLeft, ArrowRight, Check, Loader2, Scissors, User, CalendarIcon, ClipboardList, Sparkles, ChevronsRight } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import Magnetic from "@/components/Magnetic";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const STEPS = [
  { label: "Service",     icon: Scissors,      heading: "Service" },
  { label: "Barber",      icon: User,          heading: "Barber" },
  { label: "Date & Time", icon: CalendarIcon,  heading: "Date & Time" },
  { label: "Details",     icon: ClipboardList, heading: "Details" },
  { label: "Confirm",     icon: Sparkles,      heading: "Confirm" },
];

function useQuery() { const { search } = useLocation(); return useMemo(() => new URLSearchParams(search), [search]); }
function fmtDate(d) {
  if (!d) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function Booking() {
  const q = useQuery();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [services, setServices] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [serviceId, setServiceId] = useState(q.get("service") || "");
  const [barberId, setBarberId] = useState(q.get("barber") || "");
  const [date, setDate] = useState(null);
  const [time, setTime] = useState("");
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    axios.get(`${API}/services`).then((r) => setServices(r.data)).catch(() => {});
    axios.get(`${API}/barbers`).then((r) => setBarbers(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!date) { setSlots([]); return; }
    setLoadingSlots(true);
    axios.get(`${API}/availability`, { params: { date: fmtDate(date), barber_id: barberId || undefined } })
      .then((r) => setSlots(r.data.slots || []))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [date, barberId]);

  const service = services.find((s) => s.id === serviceId);
  const barber = barbers.find((b) => b.id === barberId);

  const canNext = () => {
    if (step === 0) return !!serviceId;
    if (step === 1) return !!barberId;
    if (step === 2) return !!date && !!time;
    if (step === 3) return name.length >= 2 && phone.length >= 5;
    return true;
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        service_id: serviceId, barber_id: barberId,
        date: fmtDate(date), time, name, phone,
        email: email || null, notes: notes || null,
      };
      const { data } = await axios.post(`${API}/bookings`, payload);
      setSuccess(data);
      toast.success("Reservation confirmed");
    } catch (e) {
      const detail = e?.response?.data?.detail || "Could not create booking. Please try again.";
      toast.error(detail);
    } finally {
      setSubmitting(false);
    }
  };

  // Scroll to top whenever the wizard step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step, success]);

  const disabled = (d) => {
    const t = new Date(); t.setHours(0,0,0,0);
    if (d < t) return true;
    const wd = d.getDay();
    return wd === 0 || wd === 1; // Sun/Mon closed
  };

  return (
    <>
      <PageHeader section="07" label="Book Now" title="Book" />
      <Toaster theme="light" position="top-center" />

      <section className="py-10 md:py-14" data-testid="booking-page">
        <div className="max-w-[1500px] mx-auto px-5 md:px-8">

          {!success && (
            <>
              {/* Step tabs */}
              <div className="grid grid-cols-2 md:grid-cols-5 border-2 border-ink divide-x-0 md:divide-x-2 md:divide-[#0A0A0A]" data-testid="booking-stepper">
                {STEPS.map((s, i) => {
                  const Icon = s.icon;
                  const active = i === step;
                  return (
                    <button
                      key={s.label}
                      data-testid={`step-tab-${i}`}
                      onClick={() => i < step && setStep(i)}
                      className={`flex flex-col items-start gap-1 p-3 text-left ${active ? "bg-[#E63329] text-white" : "bg-[#F5EFE7]"} ${i < STEPS.length - 1 ? "border-b-2 md:border-b-0 border-[#0A0A0A]" : ""}`}
                    >
                      <span className={`font-mono text-[0.6rem] uppercase tracking-[0.18em] ${active ? "text-white/85" : "text-[#0A0A0A]/55"}`}>
                        Step 0{i + 1}
                      </span>
                      <span className="flex items-center gap-2 font-display uppercase text-sm md:text-base">
                        <Icon size={12} /> {s.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 mt-8">
                <div className="lg:col-span-8">
                  {/* Section heading */}
                  <div className="mb-5">
                    <div className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-[#0A0A0A]/55">
                      Ch. 0{step + 1} — {STEPS[step].label}
                    </div>
                    <h2 className="title-massive text-2xl md:text-3xl mt-1">
                      {STEPS[step].heading}<span className="text-[#E63329]">.</span>
                    </h2>
                  </div>

                  {step === 0 && (
                    <div className="border-2 border-ink p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-3" data-testid="step-service">
                      {services.map((s, i) => {
                        const sel = serviceId === s.id;
                        return (
                          <button
                            key={s.id}
                            data-testid={`pick-service-${s.id}`}
                            onClick={() => setServiceId(s.id)}
                            className={`text-left border-2 ${sel ? "border-[#E63329] bg-[#E63329]/5" : "border-ink"} p-4 hover:bg-[#0A0A0A]/5 transition-colors`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-baseline gap-2 min-w-0">
                                <span className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-[#0A0A0A]/55 shrink-0">
                                  #{String(i + 1).padStart(2, "0")}
                                </span>
                                <span className="font-display uppercase text-base md:text-lg truncate">{s.name}</span>
                              </div>
                              <span className="font-display text-xl shrink-0">€{s.price}</span>
                            </div>
                            <div className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-[#0A0A0A]/55 mt-2">
                              {s.category} · {s.duration} min
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {step === 1 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3" data-testid="step-barber">
                      {barbers.map((b) => {
                        const sel = barberId === b.id;
                        return (
                          <button
                            key={b.id}
                            data-testid={`pick-barber-${b.id}`}
                            onClick={() => setBarberId(b.id)}
                            className={`text-left border-2 ${sel ? "border-[#E63329]" : "border-ink"} transition-colors`}
                          >
                            <div className="aspect-[3/4] overflow-hidden bg-[#0A0A0A]">
                              <img src={b.image} alt={b.name} className="w-full h-full object-cover" style={{ filter: "grayscale(100%)" }} />
                            </div>
                            <div className={`p-3 border-t-2 ${sel ? "border-[#E63329]" : "border-ink"} ${sel ? "bg-[#E63329] text-white" : ""}`}>
                              <div className="font-display uppercase text-sm md:text-base leading-tight">{b.name}</div>
                              <div className={`font-mono text-[0.58rem] uppercase tracking-[0.18em] mt-1 ${sel ? "text-white/85" : "text-[#0A0A0A]/60"}`}>
                                {b.role}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {step === 2 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6" data-testid="step-datetime">
                      <div className="border-2 border-ink p-4 md:p-5 bg-[#F5EFE7]">
                        <div className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-[#0A0A0A]/55 mb-3">Pick a date</div>
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={(d) => { setDate(d); setTime(""); }}
                          disabled={disabled}
                          className="text-[#0A0A0A]"
                          data-testid="booking-calendar"
                        />
                      </div>
                      <div className="border-2 border-ink p-4 md:p-5">
                        <div className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-[#0A0A0A]/55 mb-3">Pick a time</div>
                        {!date && <p className="text-[#0A0A0A]/65 text-sm">Select a date first.</p>}
                        {date && loadingSlots && <p className="text-[#0A0A0A]/65 text-sm flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> Loading slots…</p>}
                        {date && !loadingSlots && slots.length === 0 && <p className="text-[#0A0A0A]/65 text-sm">No times available for this day.</p>}
                        {date && !loadingSlots && slots.length > 0 && (
                          <div className="grid grid-cols-3 md:grid-cols-4 gap-2" data-testid="time-slots">
                            {slots.map((t) => (
                              <button
                                key={t}
                                data-testid={`slot-${t}`}
                                onClick={() => setTime(t)}
                                className={`py-3 text-sm font-mono border-2 transition-colors ${
                                  time === t ? "border-[#E63329] bg-[#E63329] text-white" : "border-ink hover:bg-[#0A0A0A] hover:text-white"
                                }`}
                              >
                                {t}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="border-2 border-ink p-5 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6" data-testid="step-details">
                      <div className="md:col-span-2">
                        <Label htmlFor="b-name" className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-[#0A0A0A]/65">Your name *</Label>
                        <Input id="b-name" data-testid="input-name" value={name} onChange={(e) => setName(e.target.value)}
                               className="mt-2 bg-transparent border-0 border-b-2 border-ink rounded-none focus-visible:ring-0 focus-visible:border-[#E63329] px-0 text-lg" />
                      </div>
                      <div>
                        <Label htmlFor="b-phone" className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-[#0A0A0A]/65">Phone *</Label>
                        <Input id="b-phone" data-testid="input-phone" value={phone} onChange={(e) => setPhone(e.target.value)}
                               className="mt-2 bg-transparent border-0 border-b-2 border-ink rounded-none focus-visible:ring-0 focus-visible:border-[#E63329] px-0 text-lg" />
                      </div>
                      <div>
                        <Label htmlFor="b-email" className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-[#0A0A0A]/65">Email</Label>
                        <Input id="b-email" data-testid="input-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                               className="mt-2 bg-transparent border-0 border-b-2 border-ink rounded-none focus-visible:ring-0 focus-visible:border-[#E63329] px-0 text-lg" />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="b-notes" className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-[#0A0A0A]/65">Notes (optional)</Label>
                        <Textarea id="b-notes" data-testid="input-notes" value={notes} onChange={(e) => setNotes(e.target.value)}
                                  rows={3} className="mt-2 bg-transparent border-2 border-ink rounded-none focus-visible:ring-0 focus-visible:border-[#E63329]" />
                      </div>
                    </div>
                  )}

                  {step === 4 && (
                    <div className="border-2 border-ink p-5 md:p-8" data-testid="step-confirm">
                      <div className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-[#0A0A0A]/55">Final review</div>
                      <h3 className="title-massive text-2xl md:text-3xl mt-1">Your reservation<span className="text-[#E63329]">.</span></h3>
                      <div className="mt-6 divide-y-2 divide-[#0A0A0A]/15 border-y-2 border-ink">
                        <ReviewRow label="Service" value={service ? `${service.name} · €${service.price} · ${service.duration} min` : "—"} />
                        <ReviewRow label="Barber"  value={barber?.name || "—"} />
                        <ReviewRow label="Date"    value={date ? date.toDateString() : "—"} />
                        <ReviewRow label="Time"    value={time || "—"} />
                        <ReviewRow label="Name"    value={name} />
                        <ReviewRow label="Phone"   value={phone} />
                        {email && <ReviewRow label="Email" value={email} />}
                        {notes && <ReviewRow label="Notes" value={notes} />}
                      </div>
                    </div>
                  )}

                  {/* Step nav */}
                  <div className="mt-8 flex items-center justify-between gap-4">
                    <button
                      data-testid="step-back"
                      onClick={() => setStep((s) => Math.max(0, s - 1))}
                      disabled={step === 0}
                      className="btn-outline disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ArrowLeft size={13} /> Back
                    </button>
                    {step < 4 ? (
                      <Magnetic strength={0.22}>
                        <button
                          data-testid="step-next"
                          disabled={!canNext()}
                          onClick={() => setStep((s) => s + 1)}
                          className="btn-red disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          Next <ArrowRight size={13} />
                        </button>
                      </Magnetic>
                    ) : (
                      <Magnetic strength={0.22}>
                        <button
                          data-testid="confirm-booking"
                          disabled={submitting}
                          onClick={submit}
                          className="btn-red disabled:opacity-50"
                        >
                          {submitting ? <><Loader2 size={13} className="animate-spin" /> Confirming…</> : <>Confirm Booking <Check size={13} /></>}
                        </button>
                      </Magnetic>
                    )}
                  </div>
                </div>

                {/* Sticky summary */}
                <aside className="lg:col-span-4">
                  <div className="border-2 border-ink lg:sticky lg:top-24" data-testid="booking-summary">
                    <div className="bg-[#0A0A0A] text-white p-5 flex items-center justify-between">
                      <div>
                        <div className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-white/55">Summary</div>
                        <div className="font-display uppercase text-xl mt-1">Your slot</div>
                      </div>
                      <span className="w-3 h-3 bg-[#E63329]" />
                    </div>
                    <div className="p-5 space-y-3 text-sm">
                      <SumRow k="Service" v={service?.name || "—"} />
                      <SumRow k="Barber"  v={barber?.name || "—"} />
                      <SumRow k="Date"    v={date ? date.toLocaleDateString() : "—"} />
                      <SumRow k="Time"    v={time || "—"} />
                    </div>
                    <div className="border-t-2 border-ink p-5 flex items-baseline justify-between">
                      <span className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-[#0A0A0A]/55">Total</span>
                      <span className="font-display text-3xl text-[#E63329]">{service ? `€${service.price}` : "—"}</span>
                    </div>
                    <div className="border-t border-hair p-5 text-xs text-[#0A0A0A]/60 leading-relaxed">
                      Payment in-house after the service. Cancellations up to 2h before the appointment.
                    </div>
                  </div>
                </aside>
              </div>
            </>
          )}

          {success && (
            <SuccessCard
              booking={success}
              onNew={() => { setSuccess(null); setStep(0); setServiceId(""); setBarberId(""); setDate(null); setTime(""); setName(""); setPhone(""); setEmail(""); setNotes(""); }}
              onHome={() => navigate("/")}
            />
          )}
        </div>
      </section>
    </>
  );
}

function ReviewRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-6 py-3">
      <span className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-[#0A0A0A]/55">{label}</span>
      <span className="text-right text-[#0A0A0A]">{value}</span>
    </div>
  );
}

function SumRow({ k, v }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-[#0A0A0A]/55">{k}</span>
      <span className="font-display uppercase text-right truncate">{v}</span>
    </div>
  );
}

function SuccessCard({ booking, onNew, onHome }) {
  return (
    <div className="mt-8 border-2 border-ink max-w-3xl" data-testid="booking-success">
      <div className="bg-[#E63329] text-white p-6 md:p-8 border-b-2 border-ink">
        <div className="font-mono text-[0.7rem] uppercase tracking-[0.22em] text-white/80">Reservation Confirmed</div>
        <h2 className="title-massive text-4xl md:text-5xl mt-2 leading-[0.92]">
          See you at the house<span className="text-[#0A0A0A]">.</span>
        </h2>
        <p className="mt-2 text-white/90">Thanks, {booking.name.split(" ")[0]}. Your seat is locked in.</p>
      </div>
      <div className="p-6 md:p-8 divide-y-2 divide-[#0A0A0A]/15">
        <ReviewRow label="Service"   value={`${booking.service_name} · €${booking.price}`} />
        <ReviewRow label="Barber"    value={booking.barber_name} />
        <ReviewRow label="Date"      value={booking.date} />
        <ReviewRow label="Time"      value={booking.time} />
        <ReviewRow label="Reference" value={booking.id.slice(0, 8).toUpperCase()} />
      </div>
      <div className="border-t-2 border-ink p-5 md:p-6 flex flex-wrap items-center gap-3 justify-between bg-[#F5EFE7]">
        <p className="text-xs text-[#0A0A0A]/65 max-w-md">
          To reschedule, call <span className="font-display">+30 21 1218 0303</span>.
        </p>
        <div className="flex gap-3">
          <button data-testid="success-new" onClick={onNew} className="btn-outline">New booking</button>
          <button data-testid="success-home" onClick={onHome} className="btn-red"><ChevronsRight size={14} /> Home</button>
        </div>
      </div>
    </div>
  );
}
