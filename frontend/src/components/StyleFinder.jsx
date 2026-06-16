import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { X, ArrowLeft, ArrowRight, Sparkles, RotateCcw, ChevronsRight } from "lucide-react";
import { useBooking } from "@/contexts/BookingContext";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// -----------------------------------------------------------------------
// Quiz data
// -----------------------------------------------------------------------
const FACE_SHAPES = [
  { id: "oval",    label: "Oval",    desc: "Balanced proportions" },
  { id: "square",  label: "Square",  desc: "Strong, angular jaw" },
  { id: "round",   label: "Round",   desc: "Soft, full cheeks" },
  { id: "diamond", label: "Diamond", desc: "Sharp cheekbones" },
];

const TEXTURES = [
  { id: "straight",     label: "Straight",        desc: "Smooth, flat" },
  { id: "wavy",         label: "Wavy",            desc: "Natural movement" },
  { id: "curly",        label: "Curly",           desc: "Defined coils" },
  { id: "thin",         label: "Thin / Receding", desc: "Fine or thinning" },
];

const VIBES = [
  { id: "corporate", label: "Corporate / Sharp",       desc: "Polished and refined" },
  { id: "casual",    label: "Low-Maintenance / Casual", desc: "Wash-and-go everyday" },
  { id: "creative",  label: "Bold / Creative",         desc: "Statement, expressive" },
];

// -----------------------------------------------------------------------
// Style catalogue + scoring rules
// -----------------------------------------------------------------------
// Each style has weights for face / texture / vibe options.
// Higher score wins. Tie → first in array.
const STYLES = [
  {
    id: "textured-crop",
    name: "The Textured Crop",
    description:
      "Short on the sides, lightly tousled on top. Effortless to style, hides a high forehead and works with your natural texture. A modern classic for everyday confidence.",
    serviceId: "haircut",
    weights: {
      face: { round: 3, oval: 2, square: 2, diamond: 1 },
      texture: { wavy: 3, curly: 3, straight: 1, thin: 2 },
      vibe: { casual: 3, creative: 2, corporate: 1 },
    },
  },
  {
    id: "classic-fade",
    name: "The Classic Fade",
    description:
      "Sharp tapered sides into a tailored top. Versatile, timeless, and unmistakably clean — frames the jaw and reads sharp in any setting.",
    serviceId: "haircut",
    weights: {
      face: { square: 3, oval: 3, diamond: 2, round: 1 },
      texture: { straight: 3, wavy: 2, curly: 1, thin: 1 },
      vibe: { corporate: 3, creative: 2, casual: 2 },
    },
  },
  {
    id: "executive-contour",
    name: "The Executive Contour",
    description:
      "Side-parted, length kept on top, contoured sides. Refined, boardroom-ready, and unmistakably sophisticated — designed to elevate every room you walk into.",
    serviceId: "vip-haircut",
    weights: {
      face: { oval: 3, diamond: 3, square: 2, round: 1 },
      texture: { straight: 3, wavy: 2, thin: 3, curly: 1 },
      vibe: { corporate: 4, casual: 1, creative: 1 },
    },
  },
  {
    id: "bold-pompadour",
    name: "The Bold Pompadour",
    description:
      "High-volume top, taper down, statement silhouette. A confident, expressive look that turns heads — built for those who lead with personality.",
    serviceId: "vip-haircut",
    weights: {
      face: { square: 3, diamond: 3, oval: 2, round: 1 },
      texture: { straight: 3, wavy: 3, curly: 1, thin: 1 },
      vibe: { creative: 4, corporate: 1, casual: 1 },
    },
  },
  {
    id: "soft-layered",
    name: "The Soft Layered Look",
    description:
      "Soft layers add volume and motion while masking thinning areas. Easy to maintain and instantly more youthful — comfortable and quietly stylish.",
    serviceId: "haircut",
    weights: {
      face: { round: 3, diamond: 2, oval: 2, square: 1 },
      texture: { thin: 4, curly: 2, wavy: 2, straight: 1 },
      vibe: { casual: 3, corporate: 2, creative: 1 },
    },
  },
];

function pickStyle({ face, texture, vibe }) {
  let best = STYLES[0];
  let bestScore = -1;
  for (const s of STYLES) {
    const score =
      (s.weights.face[face] || 0) +
      (s.weights.texture[texture] || 0) +
      (s.weights.vibe[vibe] || 0);
    if (score > bestScore) {
      bestScore = score;
      best = s;
    }
  }
  return best;
}

// -----------------------------------------------------------------------
// SVG face shape illustrations (lightweight, no external deps)
// -----------------------------------------------------------------------
function FaceIcon({ shape, className }) {
  const common = "stroke-current fill-none";
  switch (shape) {
    case "oval":
      return (
        <svg viewBox="0 0 80 100" className={className}>
          <ellipse cx="40" cy="50" rx="26" ry="40" className={common} strokeWidth="3" />
        </svg>
      );
    case "square":
      return (
        <svg viewBox="0 0 80 100" className={className}>
          <path d="M14,16 L66,16 L66,72 Q66,86 40,90 Q14,86 14,72 Z" className={common} strokeWidth="3" />
        </svg>
      );
    case "round":
      return (
        <svg viewBox="0 0 80 100" className={className}>
          <circle cx="40" cy="50" r="32" className={common} strokeWidth="3" />
        </svg>
      );
    case "diamond":
      return (
        <svg viewBox="0 0 80 100" className={className}>
          <path d="M40,10 L70,50 L40,90 L10,50 Z" className={common} strokeWidth="3" />
        </svg>
      );
    default:
      return null;
  }
}

// -----------------------------------------------------------------------
// Main component
// -----------------------------------------------------------------------
export default function StyleFinder({ open, onClose }) {
  const { openBooking } = useBooking();
  const [step, setStep] = useState(0);
  const [face, setFace] = useState("");
  const [texture, setTexture] = useState("");
  const [vibe, setVibe] = useState("");
  const [barbers, setBarbers] = useState([]);

  // Lock background scroll
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  useEffect(() => {
    if (open) {
      axios.get(`${API}/barbers`).then((r) => setBarbers(r.data)).catch(() => {});
    }
  }, [open]);

  const reset = () => {
    setStep(0);
    setFace("");
    setTexture("");
    setVibe("");
  };

  const handleClose = () => {
    reset();
    onClose?.();
  };

  const result = step === 3 && face && texture && vibe ? pickStyle({ face, texture, vibe }) : null;
  // Pick the first barber that offers the recommended service (fallback: first barber)
  const matchBarber = result
    ? (barbers.find((b) => !b.service_ids || b.service_ids.length === 0 || b.service_ids.includes(result.serviceId)) || barbers[0])
    : null;

  const canNext = () => {
    if (step === 0) return !!face;
    if (step === 1) return !!texture;
    if (step === 2) return !!vibe;
    return true;
  };

  const handleBookStyle = () => {
    handleClose();
    setTimeout(() => openBooking(result.serviceId), 250); // wait for close animation
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="sf-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4"
        onClick={handleClose}
      >
        <motion.div
          key="sf-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative bg-white w-full max-w-5xl max-h-[90vh] overflow-y-auto overscroll-contain rounded-3xl shadow-[0_24px_60px_rgba(0,0,0,0.18),0_4px_16px_rgba(0,0,0,0.08)]"
          onClick={(e) => e.stopPropagation()}
          data-testid="style-finder-modal"
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-black/[0.08] rounded-t-3xl" />

          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-20 p-2 bg-white border border-black/[0.10] shadow-[0_2px_8px_rgba(0,0,0,0.10)] hover:bg-[#1D1D1F] hover:text-white hover:border-transparent rounded-full transition-colors duration-150"
            data-testid="style-finder-close"
          >
            <X size={20} />
          </button>

          <div className="p-6 md:p-10">
            {/* Quiz questions */}
            {!result && (
              <div key={step} className="modal-step-fade">
                <h2 className="title-massive text-3xl md:text-5xl">
                  {step === 0 && "What is your face shape?"}
                  {step === 1 && "How would you describe your hair?"}
                  {step === 2 && "What is your daily vibe?"}
                </h2>
                {/* Progress bar */}
                <div className="mt-6 flex gap-2" data-testid="style-progress">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= step ? "bg-[#1D1D1F]" : "bg-black/[0.08]"}`}
                    />
                  ))}
                </div>

                {/* Options */}
                <div className="mt-8">
                  {step === 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3" data-testid="face-options">
                      {FACE_SHAPES.map((f) => {
                        const sel = face === f.id;
                        return (
                          <button
                            key={f.id}
                            data-testid={`face-${f.id}`}
                            onClick={() => setFace(f.id)}
                            className={`p-5 rounded-2xl transition-all duration-200 text-left ${
                              sel
                                ? "bg-[#1D1D1F] text-white shadow-[0_6px_20px_rgba(0,0,0,0.14)] scale-[1.02]"
                                : "bg-[#F5F5F7] hover:bg-white hover:shadow-[0_4px_16px_rgba(0,0,0,0.07)] border border-transparent hover:border-black/[0.06]"
                            }`}
                          >
                            <div className={`mx-auto w-20 h-24 mb-3 ${sel ? "text-white" : "text-[#1D1D1F]"}`}>
                              <FaceIcon shape={f.id} className="w-full h-full" />
                            </div>
                            <div className="font-display uppercase text-sm text-center">{f.label}</div>
                            <div className={`font-mono text-[0.58rem] uppercase tracking-wider text-center mt-1 ${sel ? "text-white/55" : "text-[#A1A1A6]"}`}>{f.desc}</div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {step === 1 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3" data-testid="texture-options">
                      {TEXTURES.map((t) => {
                        const sel = texture === t.id;
                        return (
                          <button
                            key={t.id}
                            data-testid={`texture-${t.id}`}
                            onClick={() => setTexture(t.id)}
                            className={`p-5 rounded-2xl transition-all duration-200 text-left ${
                              sel
                                ? "bg-[#1D1D1F] text-white shadow-[0_6px_20px_rgba(0,0,0,0.14)] scale-[1.02]"
                                : "bg-[#F5F5F7] hover:bg-white hover:shadow-[0_4px_16px_rgba(0,0,0,0.07)] border border-transparent hover:border-black/[0.06]"
                            }`}
                          >
                            <TextureGlyph id={t.id} active={sel} />
                            <div className="font-display uppercase text-sm mt-3">{t.label}</div>
                            <div className={`font-mono text-[0.58rem] uppercase tracking-wider mt-1 ${sel ? "text-white/55" : "text-[#A1A1A6]"}`}>{t.desc}</div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {step === 2 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3" data-testid="vibe-options">
                      {VIBES.map((v) => {
                        const sel = vibe === v.id;
                        return (
                          <button
                            key={v.id}
                            data-testid={`vibe-${v.id}`}
                            onClick={() => setVibe(v.id)}
                            className={`p-6 rounded-2xl transition-all duration-200 text-left ${
                              sel
                                ? "bg-[#1D1D1F] text-white shadow-[0_6px_20px_rgba(0,0,0,0.14)] scale-[1.02]"
                                : "bg-[#F5F5F7] hover:bg-white hover:shadow-[0_4px_16px_rgba(0,0,0,0.07)] border border-transparent hover:border-black/[0.06]"
                            }`}
                          >
                            <div className="font-display uppercase text-base">{v.label}</div>
                            <div className={`font-mono text-[0.58rem] uppercase tracking-wider mt-2 ${sel ? "text-white/55" : "text-[#A1A1A6]"}`}>{v.desc}</div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Nav */}
                <div className="flex items-center gap-3 mt-10 max-w-md mx-auto">
                  <button
                    data-testid="style-back"
                    onClick={() => setStep((s) => Math.max(0, s - 1))}
                    disabled={step === 0}
                    className="flex-1 px-4 py-3 border border-black/[0.10] rounded-xl font-display uppercase text-sm text-[#86868B] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#F5F5F7] hover:text-[#1D1D1F] transition-colors duration-150 flex items-center justify-center gap-2"
                  >
                    <ArrowLeft size={13} /> Back
                  </button>
                  <button
                    data-testid="style-next"
                    onClick={() => setStep((s) => s + 1)}
                    disabled={!canNext()}
                    className="flex-1 px-4 py-3 bg-[#1D1D1F] text-white rounded-xl font-display uppercase text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#333] transition-colors duration-150 shadow-[0_4px_14px_rgba(0,0,0,0.10)] flex items-center justify-center gap-2"
                  >
                    {step === 2 ? "Reveal my style" : "Next"} <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            )}

            {/* Result */}
            {result && (
              <div className="modal-step-fade" data-testid="style-result">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-[#86868B]" />
                  <span className="font-mono text-[0.66rem] uppercase tracking-wider text-[#86868B]">Your match</span>
                </div>
                <h2 className="title-massive text-4xl md:text-6xl leading-[0.95] mt-2">
                  {result.name}.
                </h2>
                <p className="mt-4 text-[#86868B] text-sm md:text-base max-w-2xl leading-relaxed">
                  {result.description}
                </p>

                {matchBarber && (
                  <div className="mt-8 p-5 md:p-6 rounded-2xl bg-[#1D1D1F] text-white flex flex-col md:flex-row items-start md:items-center gap-5" data-testid="style-barber-match">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden ring-2 ring-white/20 flex-shrink-0">
                      <img src={matchBarber.image} alt={matchBarber.name} className="w-full h-full object-cover" style={{ filter: "grayscale(100%)" }} />
                    </div>
                    <div className="flex-1">
                      <div className="font-mono text-[0.6rem] uppercase tracking-wider text-white/50">Best match barber</div>
                      <div className="font-display uppercase text-xl mt-1">{matchBarber.name}</div>
                      <div className="font-mono text-[0.62rem] uppercase tracking-wider text-white/55 mt-0.5">{matchBarber.role} — specialised in this style.</div>
                    </div>
                  </div>
                )}

                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  <button
                    data-testid="style-book"
                    onClick={handleBookStyle}
                    className="px-7 py-3.5 bg-[#1D1D1F] text-white rounded-xl font-display uppercase text-sm hover:bg-[#333] transition-colors duration-150 shadow-[0_4px_14px_rgba(0,0,0,0.10)] flex items-center justify-center gap-2"
                  >
                    <ChevronsRight size={15} /> Book this style now
                  </button>
                  <button
                    data-testid="style-retake"
                    onClick={reset}
                    className="px-7 py-3.5 border border-black/[0.10] rounded-xl font-display uppercase text-sm text-[#86868B] hover:bg-[#F5F5F7] hover:text-[#1D1D1F] transition-colors duration-150 flex items-center justify-center gap-2"
                  >
                    <RotateCcw size={14} /> Retake quiz
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Simple inline glyph for hair textures
function TextureGlyph({ id, active }) {
  const stroke = active ? "white" : "#0a0a0a";
  switch (id) {
    case "straight":
      return (
        <svg viewBox="0 0 60 40" className="w-14 h-10">
          {[8, 18, 28, 38, 48].map((x) => (
            <line key={x} x1={x} y1="4" x2={x} y2="36" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
          ))}
        </svg>
      );
    case "wavy":
      return (
        <svg viewBox="0 0 60 40" className="w-14 h-10">
          {[0, 10, 20].map((dy) => (
            <path
              key={dy}
              d={`M4,${8 + dy} Q15,${2 + dy} 30,${8 + dy} T56,${8 + dy}`}
              stroke={stroke}
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
          ))}
        </svg>
      );
    case "curly":
      return (
        <svg viewBox="0 0 60 40" className="w-14 h-10">
          {[10, 25, 40].map((cx) => (
            <circle key={cx} cx={cx} cy="20" r="6" stroke={stroke} strokeWidth="2" fill="none" />
          ))}
          {[18, 33].map((cx) => (
            <circle key={cx} cx={cx} cy="10" r="4" stroke={stroke} strokeWidth="2" fill="none" />
          ))}
        </svg>
      );
    case "thin":
      return (
        <svg viewBox="0 0 60 40" className="w-14 h-10">
          {[10, 22, 36, 50].map((x, i) => (
            <line
              key={x}
              x1={x}
              y1={10 + i * 2}
              x2={x}
              y2={30 - i}
              stroke={stroke}
              strokeWidth="1.2"
              strokeLinecap="round"
              opacity={1 - i * 0.18}
            />
          ))}
        </svg>
      );
    default:
      return null;
  }
}
