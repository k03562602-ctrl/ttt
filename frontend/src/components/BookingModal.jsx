import { useEffect, useMemo, useRef, useState, Fragment } from "react";
import axios from "axios";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast, Toaster } from "sonner";
import { ArrowLeft, ArrowRight, Check, Loader2, Scissors, User, CalendarIcon, ClipboardList, ChevronsRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useBooking } from "@/contexts/BookingContext";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const STEPS = [
  { label: "Service",     icon: Scissors,      heading: "Service" },
  { label: "Barber",      icon: User,          heading: "Barber" },
  { label: "Date & Time", icon: CalendarIcon,  heading: "Date & Time" },
  { label: "Details",     icon: ClipboardList, heading: "Details" },
];

function fmtDate(d) {
  if (!d) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function BookingModal() {
  const { isBookingOpen, closeBooking, presetServiceId, presetBarberId, presetDate, presetTime,
          services, barbers } = useBooking();
  const [step, setStep] = useState(0);
  const [serviceId, setServiceId] = useState("");
  const [barberId, setBarberId] = useState("");
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
  const scrollRef = useRef(null);

  // Scroll modal to top whenever the step changes (or success screen appears)
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [step, success]);

  useEffect(() => {
    if (!isBookingOpen) return;
    // data pre-loaded via BookingContext — nothing to fetch here
  }, [isBookingOpen]);

  // Apply preset service when modal opens with a recommended service
  useEffect(() => {
    if (!isBookingOpen) return;

    if (presetServiceId && presetBarberId && presetDate && presetTime) {
      // Full preset from hero quick-book widget → jump straight to contact details
      setServiceId(presetServiceId);
      setBarberId(presetBarberId);
      setDate(new Date(presetDate + "T00:00:00"));
      setTime(presetTime);
      setStep(3);
    } else if (presetServiceId) {
      setServiceId(presetServiceId);
      setStep(1); // jump straight to Barber step
    }
  }, [isBookingOpen, presetServiceId, presetBarberId, presetDate, presetTime]);

  // Lock background scroll while the modal is open
  useEffect(() => {
    if (!isBookingOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [isBookingOpen]);

  useEffect(() => {
    if (!date) { setSlots([]); return; }
    setLoadingSlots(true);
    axios.get(`${API}/availability`, { params: { date: fmtDate(date), barber_id: barberId || undefined } })
      .then((r) => setSlots(r.data.slots || []))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [date, barberId]);

  // Filter barbers by the selected service (a barber with empty/no service_ids is treated as "offers all")
  const eligibleBarbers = serviceId
    ? barbers.filter((b) => !b.service_ids || b.service_ids.length === 0 || b.service_ids.includes(serviceId))
    : barbers;

  // If current barber selection becomes invalid after switching service, clear it
  useEffect(() => {
    if (barberId && !eligibleBarbers.some((b) => b.id === barberId)) {
      setBarberId("");
    }
  }, [serviceId, eligibleBarbers, barberId]);

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

  const resetForm = () => {
    setStep(0);
    setServiceId("");
    setBarberId("");
    setDate(null);
    setTime("");
    setName("");
    setPhone("");
    setEmail("");
    setNotes("");
    setSuccess(null);
  };

  const handleClose = () => {
    resetForm();
    closeBooking();
  };

  const disabled = (d) => {
    const t = new Date(); t.setHours(0,0,0,0);
    if (d < t) return true;
    const wd = d.getDay();
    return wd === 0 || wd === 1;
  };

  if (!isBookingOpen) return null;

  return (
    <AnimatePresence>
      {/* Backdrop — solid, no blur (backdrop-blur on full overlay is very GPU heavy) */}
      <motion.div
        key="booking-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4"
        onClick={handleClose}
      >
        <Toaster theme="light" position="top-center" />

        {/* Modal — solid white, simple y+opacity (no scale, no backdrop-blur) */}
        <motion.div
          key="booking-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          ref={scrollRef}
          className="relative bg-white w-full max-w-5xl max-h-[92vh] overflow-y-auto overscroll-contain rounded-3xl shadow-[0_24px_60px_rgba(0,0,0,0.18),0_4px_16px_rgba(0,0,0,0.08)]"
          onClick={(e) => e.stopPropagation()}
          data-testid="booking-modal"
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-black/[0.08] rounded-t-3xl" />

          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-20 p-2 bg-white border border-black/[0.10] shadow-[0_2px_8px_rgba(0,0,0,0.10)] hover:bg-[#1D1D1F] hover:text-white hover:border-transparent rounded-full transition-colors duration-150"
            data-testid="close-modal"
          >
            <X size={20} />
          </button>

          <div className="p-6 md:p-10">
            {!success && (
              <>
                {/* Header */}
                <div className="mb-6">
                  <h2 className="title-massive text-4xl md:text-5xl">Book Now.</h2>
                  <p className="mt-2 text-[#86868B] text-sm">Complete your reservation in {STEPS.length} simple steps.</p>
                </div>

                {/* Step tabs */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-8" data-testid="booking-stepper">
                  {STEPS.map((s, i) => {
                    const Icon = s.icon;
                    const active = i === step;
                    const completed = i < step;
                    return (
                      <button
                        key={s.label}
                        data-testid={`step-tab-${i}`}
                        onClick={() => i < step && setStep(i)}
                        className={`flex flex-col items-start gap-1 p-3 rounded-xl transition-colors duration-150 ${
                          active   ? "bg-[#1D1D1F] text-white shadow-[0_4px_14px_rgba(0,0,0,0.12)]" :
                          completed ? "bg-[#F5F5F7] text-[#1D1D1F]" :
                                      "bg-[#F5F5F7] text-[#A1A1A6]"
                        }`}
                      >
                        <span className={`font-mono text-[0.6rem] uppercase tracking-wider ${active ? "text-white/60" : "text-[#A1A1A6]"}`}>
                          Step 0{i + 1}
                        </span>
                        <span className="flex items-center gap-2 font-display uppercase text-sm">
                          <Icon size={12} /> {s.label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="max-w-4xl mx-auto">
                  <div className="lg:col-span-8">
                    {/* Section heading */}
                    <div className="mb-5">
                      <h3 className="title-massive text-2xl md:text-3xl">{STEPS[step].heading}.</h3>
                    </div>

                    {/* Step content — CSS fade only, no JS animation overhead */}
                    <div key={step} className="modal-step-fade">

                    {step === 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5" data-testid="step-service">
                        {services.map((s, idx) => {
                          const sel = serviceId === s.id;
                          return (
                            <button
                              key={s.id}
                              data-testid={`pick-service-${s.id}`}
                              onClick={() => setServiceId(s.id)}
                              style={{
                                animationName: "fadeInUp",
                                animationDuration: "0.32s",
                                animationDelay: `${idx * 0.035}s`,
                                animationFillMode: "both",
                                animationTimingFunction: "cubic-bezier(0.2,0.7,0.2,1)",
                              }}
                              className={`text-left rounded-2xl p-4 transition-all duration-200 ${
                                sel
                                  ? "bg-[#1D1D1F] text-white shadow-[0_6px_20px_rgba(0,0,0,0.14)] scale-[1.02]"
                                  : "bg-[#F5F5F7] hover:bg-white hover:shadow-[0_4px_16px_rgba(0,0,0,0.07)] border border-transparent hover:border-black/[0.06]"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-3">
                                <span className={`font-display uppercase text-base truncate ${sel ? "text-white" : "text-[#1D1D1F]"}`}>{s.name}</span>
                                <span className={`font-display text-xl shrink-0 ${sel ? "text-white/80" : "text-[#1D1D1F]"}`}>€{s.price}</span>
                              </div>
                              <div className={`font-mono text-[0.6rem] uppercase tracking-wider mt-2 ${sel ? "text-white/50" : "text-[#A1A1A6]"}`}>
                                {s.category} · {s.duration} min
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {step === 1 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5" data-testid="step-barber">
                        {eligibleBarbers.length === 0 && (
                          <div className="col-span-full p-6 rounded-2xl bg-[#F5F5F7] border border-black/[0.06] text-[#86868B] text-sm" data-testid="no-eligible-barbers">
                            No barber currently offers this service. Please go back and choose another service.
                          </div>
                        )}
                        {eligibleBarbers.map((b) => {
                          const sel = barberId === b.id;
                          return (
                            <button
                              key={b.id}
                              data-testid={`pick-barber-${b.id}`}
                              onClick={() => setBarberId(b.id)}
                              className={`flex items-center gap-4 text-left rounded-2xl p-3.5 transition-all duration-200 ${
                                sel
                                  ? "bg-[#1D1D1F] shadow-[0_6px_20px_rgba(0,0,0,0.14)] scale-[1.02]"
                                  : "bg-[#F5F5F7] hover:bg-white hover:shadow-[0_4px_16px_rgba(0,0,0,0.07)] border border-transparent hover:border-black/[0.06]"
                              }`}
                            >
                              <div className="shrink-0 w-14 h-14 rounded-full overflow-hidden bg-[#ECECEE] ring-2 ring-white/30">
                                <img src={b.image} alt={b.name} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className={`font-display uppercase text-sm leading-tight truncate ${sel ? "text-white" : "text-[#1D1D1F]"}`}>{b.name}</div>
                                <div className={`font-mono text-[0.58rem] uppercase tracking-wider mt-0.5 ${sel ? "text-white/55" : "text-[#A1A1A6]"}`}>{b.role}</div>
                              </div>
                              {sel && <Check size={14} className="shrink-0 text-white/70" />}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {step === 2 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="step-datetime">
                        <div className="rounded-2xl border border-black/[0.06] p-4 md:p-5 bg-[#F5F5F7]">
                          <div className="font-mono text-[0.62rem] uppercase tracking-wider text-[#86868B] mb-3">Pick a date</div>
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={(d) => { setDate(d); setTime(""); }}
                            disabled={disabled}
                            className="text-[#1D1D1F]"
                            data-testid="booking-calendar"
                          />
                        </div>
                        <div className="rounded-2xl border border-black/[0.06] p-4 md:p-5 bg-[#F5F5F7]">
                          <div className="font-mono text-[0.62rem] uppercase tracking-wider text-[#86868B] mb-3">Pick a time</div>
                          {!date && <p className="text-[#A1A1A6] text-sm">Select a date first.</p>}
                          {date && loadingSlots && (
                            <p className="text-[#86868B] text-sm flex items-center gap-2">
                              <Loader2 size={14} className="animate-spin" /> Loading slots…
                            </p>
                          )}
                          {date && !loadingSlots && slots.length === 0 && (
                            <p className="text-[#86868B] text-sm">No times available for this day.</p>
                          )}
                          {date && !loadingSlots && slots.length > 0 && (
                            <div className="grid grid-cols-3 gap-2" data-testid="time-slots">
                              {slots.map((t) => (
                                <button
                                  key={t}
                                  data-testid={`slot-${t}`}
                                  onClick={() => setTime(t)}
                                  className={`py-3 text-sm font-mono rounded-xl transition-all duration-200 ${
                                    time === t
                                      ? "bg-[#1D1D1F] text-white shadow-[0_4px_12px_rgba(0,0,0,0.12)] scale-105"
                                      : "bg-white border border-black/[0.06] text-[#1D1D1F] hover:border-[#1D1D1F] hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
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
                      <div className="rounded-2xl border border-black/[0.06] p-5 md:p-8 bg-[#F5F5F7] grid grid-cols-1 md:grid-cols-2 gap-6" data-testid="step-details">
                        <div className="md:col-span-2">
                          <Label htmlFor="b-name" className="font-mono text-[0.62rem] uppercase tracking-wider text-[#86868B]">Your name *</Label>
                          <Input id="b-name" data-testid="input-name" value={name} onChange={(e) => setName(e.target.value)}
                                 className="mt-2 bg-white border border-black/[0.08] rounded-xl focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:border-black/30 px-4 py-2.5 text-lg text-[#1D1D1F]" />
                        </div>
                        <div>
                          <Label htmlFor="b-phone" className="font-mono text-[0.62rem] uppercase tracking-wider text-[#86868B]">Phone *</Label>
                          <Input id="b-phone" data-testid="input-phone" value={phone} onChange={(e) => setPhone(e.target.value)}
                                 className="mt-2 bg-white border border-black/[0.08] rounded-xl focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:border-black/30 px-4 py-2.5 text-lg text-[#1D1D1F]" />
                        </div>
                        <div>
                          <Label htmlFor="b-email" className="font-mono text-[0.62rem] uppercase tracking-wider text-[#86868B]">Email</Label>
                          <Input id="b-email" data-testid="input-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                 className="mt-2 bg-white border border-black/[0.08] rounded-xl focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:border-black/30 px-4 py-2.5 text-lg text-[#1D1D1F]" />
                        </div>
                        <div className="md:col-span-2">
                          <Label htmlFor="b-notes" className="font-mono text-[0.62rem] uppercase tracking-wider text-[#86868B]">Notes (optional)</Label>
                          <Textarea id="b-notes" data-testid="input-notes" value={notes} onChange={(e) => setNotes(e.target.value)}
                                    rows={3} className="mt-2 bg-white border border-black/[0.08] rounded-xl focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:border-black/30 text-[#1D1D1F]" />
                        </div>
                      </div>
                    )}

                    </div>
                  </div>

                  {/* Navigation */}
                  <div className="flex items-center gap-3 mt-8 max-w-md mx-auto">
                      <button
                        data-testid="step-back"
                        onClick={() => setStep((s) => Math.max(0, s - 1))}
                        disabled={step === 0}
                        className="flex-1 px-4 py-3 border border-black/[0.10] rounded-xl font-display uppercase text-sm text-[#86868B] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#F5F5F7] hover:text-[#1D1D1F] transition-colors duration-150 flex items-center justify-center gap-2"
                      >
                        <ArrowLeft size={13} /> Back
                      </button>
                      {step < 3 ? (
                        <button
                          data-testid="step-next"
                          disabled={!canNext()}
                          onClick={() => setStep((s) => s + 1)}
                          className="flex-1 px-4 py-3 bg-[#1D1D1F] text-white rounded-xl font-display uppercase text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#333] transition-colors duration-150 shadow-[0_4px_14px_rgba(0,0,0,0.10)] flex items-center justify-center gap-2"
                        >
                          Next <ArrowRight size={13} />
                        </button>
                      ) : (
                        <button
                          data-testid="confirm-booking"
                          disabled={submitting || !canNext()}
                          onClick={submit}
                          className="flex-1 px-4 py-3 bg-[#1D1D1F] text-white rounded-xl font-display uppercase text-sm disabled:opacity-50 hover:bg-[#333] transition-colors duration-150 shadow-[0_4px_14px_rgba(0,0,0,0.10)] flex items-center justify-center gap-2"
                        >
                          {submitting ? <><Loader2 size={13} className="animate-spin" /> Confirming…</> : <>Confirm Booking <Check size={13} /></>}
                        </button>
                      )}
                    </div>
                  </div>
              </>
            )}

            {success && (
              <div className="modal-step-fade">
                <SuccessCard booking={success} onNew={() => resetForm()} onClose={handleClose} />
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function ReviewRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-6 py-3 border-b border-black/[0.06] last:border-0">
      <span className="font-mono text-[0.62rem] uppercase tracking-wider text-[#86868B]">{label}</span>
      <span className="text-right text-[#1D1D1F] font-medium">{value}</span>
    </div>
  );
}

function SumRow({ k, v }) {
  return (
    <div className="flex justify-between gap-3 items-center">
      <span className="font-mono text-[0.62rem] uppercase tracking-wider text-[#86868B]">{k}</span>
      <span className="font-display uppercase text-right truncate text-[#1D1D1F]">{v}</span>
    </div>
  );
}

function SuccessCard({ booking, onNew, onClose }) {
  return (
    <div className="max-w-3xl mx-auto rounded-3xl overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.12)] border border-black/[0.06]" data-testid="booking-success">
      <div className="bg-[#1D1D1F] text-white p-6 md:p-8">
        <div className="font-mono text-[0.62rem] uppercase tracking-wider text-white/50">Reservation Confirmed</div>
        <h2 className="title-massive text-4xl md:text-5xl mt-2 leading-tight">
          See you at the house.
        </h2>
        <p className="mt-2 text-white/60 text-sm">Thanks, {booking.name.split(" ")[0]}. Your seat is locked in.</p>
      </div>
      <div className="p-6 md:p-8 space-y-3 bg-white">
        <ReviewRow label="Service"   value={`${booking.service_name} · €${booking.price}`} />
        <ReviewRow label="Barber"    value={booking.barber_name} />
        <ReviewRow label="Date"      value={booking.date} />
        <ReviewRow label="Time"      value={booking.time} />
        <ReviewRow label="Reference" value={booking.id.slice(0, 8).toUpperCase()} />
      </div>
      <div className="border-t border-black/[0.06] p-5 md:p-6 flex flex-wrap items-center gap-3 justify-between bg-[#F5F5F7]">
        <p className="text-xs text-[#86868B] max-w-md">
          To reschedule, call <span className="font-display text-[#1D1D1F]">+30 21 1218 0303</span>.
        </p>
        <div className="flex gap-3">
          <button data-testid="success-new" onClick={onNew} className="px-4 py-2 border border-black/[0.10] rounded-xl font-display uppercase text-sm text-[#86868B] hover:bg-white hover:text-[#1D1D1F] transition-all">New booking</button>
          <button data-testid="success-home" onClick={onClose} className="btn-dark px-4 py-2 text-sm flex items-center gap-2"><ChevronsRight size={14} /> Close</button>
        </div>
      </div>
    </div>
  );
}
