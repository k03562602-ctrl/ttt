import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { ChevronsRight, ArrowUpRight, ArrowRight, Phone, Mail, MapPin, Instagram, Sparkles } from "lucide-react";
import Reveal from "@/components/Reveal";
import CountUp from "@/components/CountUp";
import Magnetic from "@/components/Magnetic";
import ParallaxImage from "@/components/ParallaxImage";
import { SHOP_IMAGES, STOCK, SERVICE_GROUPS } from "@/data/site";
import { useBooking } from "@/contexts/BookingContext";
import BookingModal from "@/components/BookingModal";
import StyleFinder from "@/components/StyleFinder";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Home() {
  const [services, setServices] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [biz, setBiz] = useState(null);
  const [instagramPosts, setInstagramPosts] = useState([]);
  const [styleFinderOpen, setStyleFinderOpen] = useState(false);
  const { openBooking } = useBooking();

  useEffect(() => {
    axios.get(`${API}/services`).then((r) => setServices(r.data)).catch(() => {});
    axios.get(`${API}/barbers`).then((r) => setBarbers(r.data)).catch(() => {});
    axios.get(`${API}/business`).then((r) => setBiz(r.data)).catch(() => {});
    axios.get(`${API}/instagram-posts`).then((r) => setInstagramPosts(r.data)).catch(() => {});
  }, []);

  return (
    <>
      <BookingModal />
      <StyleFinder open={styleFinderOpen} onClose={() => setStyleFinderOpen(false)} />

      {/* HERO — Canvas image-sequence scrub (preload-gated, Apple-style) */}
      <HeroSection services={services} barbers={barbers} openBooking={openBooking} />

      {/* SITE BODY — the curtain. z-20 + solid background so it covers the hero.
          marginTop:-300vh pulls site-body up to start overlapping the pin spacer
          at ~33 % of the 6-screen track (scrollY = 2×vh), fully covering at
          ~50 % (scrollY = 3×vh) while the canvas animation is still playing. */}
      <div className="relative z-[20] bg-[#1D1D1F]" data-testid="site-body" style={{ marginTop: "-300vh", borderRadius: "2.5rem 2.5rem 0 0", boxShadow: "0 -40px 100px rgba(0,0,0,0.55)" }}>

      {/* STYLE FINDER CTA */}
      <Reveal>
        <section id="style-finder" className="py-14 md:py-20 bg-[#1D1D1F] text-white relative overflow-hidden" data-testid="style-finder-cta">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
          <div className="max-w-[1500px] mx-auto px-5 md:px-8 relative">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-7 reveal">
                <h2 className="title-massive text-3xl md:text-5xl lg:text-6xl leading-[0.95]">
                  Not sure which cut suits you?
                </h2>
                <p className="mt-5 max-w-xl text-white/55 text-sm md:text-base leading-relaxed">
                  Answer 3 quick questions about your face shape, hair texture, and daily vibe — we'll match you with the cut that fits your story.
                </p>
                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <Magnetic strength={0.25}>
                    <button onClick={() => setStyleFinderOpen(true)} data-testid="open-style-finder"
                      className="btn-white flex items-center gap-2">
                      <Sparkles size={13} /> Find your style
                    </button>
                  </Magnetic>
                  <span className="font-mono text-[0.6rem] uppercase tracking-wider text-white/35">~30 seconds</span>
                </div>
              </div>
              <div className="md:col-span-5 reveal">
                <div className="grid grid-cols-3 gap-3">
                  {[{ l: "Step 01", t: "Face shape" }, { l: "Step 02", t: "Hair texture" }, { l: "Step 03", t: "Daily vibe" }].map((s, i) => (
                    <div key={s.t} className="aspect-square rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 flex flex-col justify-between hover:bg-white/10 transition-all">
                      <div className="font-mono text-[0.56rem] uppercase tracking-wider text-white/40">{s.l}</div>
                      <div>
                        <div className="font-display text-lg md:text-xl leading-tight">{s.t}</div>
                        <div className="mt-2 w-5 h-px bg-white/30" />
                      </div>
                      <div className="font-display text-3xl md:text-4xl text-white/10 self-end">0{i + 1}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      {/* SERVICES */}
      <Reveal>
        <section id="services" className="py-14 md:py-20 bg-white" data-testid="services-section">
          <div className="max-w-[1500px] mx-auto px-5 md:px-8">
            <div className="reveal flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-8">
              <div>
                <h2 className="title-massive text-3xl md:text-5xl lg:text-6xl mt-2">Services.</h2>
              </div>
              <p className="text-gray-500 text-sm max-w-md">
                All prices are indicative. Ask your barber for a personalised quote.
              </p>
            </div>

            <div className="space-y-6">
              {SERVICE_GROUPS.map((g) => {
                const items = services.filter((s) => s.category === g.key);
                if (items.length === 0) return null;
                return (
                  <div key={g.key} className="reveal" data-testid={`group-${g.key}`}>
                    <div className="flex items-center justify-between pb-2 mb-3 gap-4">
                      <h3 className="title-massive text-xl md:text-2xl">{g.label}</h3>
                      <span className="font-mono text-[0.6rem] uppercase tracking-wider text-gray-400">
                        {String(items.length).padStart(2, "0")} Items
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3" data-testid={`svc-list-${g.key}`}>
                      {items.map((s) => (
                        <div
                          key={s.id}
                          data-testid={`svc-${s.id}`}
                          onClick={openBooking}
                          className="group flex items-center justify-between gap-3 px-5 py-4 bg-white rounded-2xl hover:bg-[#F5F5F7] transition-all duration-300 border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.09)] hover:-translate-y-0.5 cursor-pointer"
                        >
                          <div className="flex flex-col min-w-0">
                            <span className="font-body text-sm md:text-base font-medium text-[#1D1D1F] truncate group-hover:text-[#1D1D1F] transition-colors">{s.name}</span>
                            <span className="font-mono text-[0.58rem] uppercase tracking-wider text-gray-500 mt-0.5">
                              {s.duration} min
                            </span>
                          </div>
                          <span className="font-display text-xl md:text-2xl text-[#1D1D1F] shrink-0">€{s.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-center pt-8 reveal">
              <Magnetic strength={0.25}>
                <button onClick={openBooking} data-testid="services-cta" className="btn-dark flex items-center gap-2">
                  <ChevronsRight size={13} /> Book Your Service
                </button>
              </Magnetic>
            </div>
          </div>
        </section>
      </Reveal>

      {/* INSTAGRAM FEED */}
      <Reveal>
        <section id="instagram" className="py-14 md:py-20 bg-white" data-testid="instagram-section">
          <div className="max-w-[1500px] mx-auto px-5 md:px-8">
            <div className="reveal flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-8">
              <div>
                <h2 className="title-massive text-3xl md:text-5xl lg:text-6xl mt-2">On Instagram.</h2>
                <p className="text-gray-500 text-sm mt-2">See our latest work and transformations</p>
              </div>
              <a
                href="https://www.instagram.com/tzoulian_haircutz"
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-display uppercase text-sm hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg flex items-center gap-2"
              >
                <Instagram size={16} /> @tzoulian_haircutz
              </a>
            </div>

            {instagramPosts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" data-testid="instagram-grid">
                {instagramPosts.slice(0, 8).map((post) => (
                  <a
                    key={post.id}
                    href={post.post_url || "https://www.instagram.com/tzoulian_haircutz"}
                    target="_blank"
                    rel="noreferrer"
                    className="group relative aspect-square rounded-xl overflow-hidden bg-gray-900 hover:shadow-xl transition-all"
                  >
                    <img
                      src={post.image_url}
                      alt={post.caption || "Instagram post"}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
                      <div className="p-4 w-full">
                        {post.caption && (
                          <p className="text-white text-sm line-clamp-3">{post.caption}</p>
                        )}
                      </div>
                    </div>
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Instagram size={16} className="text-pink-600" />
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
                <Instagram size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">Follow us on Instagram to see our latest work</p>
                <a
                  href="https://www.instagram.com/tzoulian_haircutz"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block mt-4 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-display uppercase text-sm hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
                >
                  @tzoulian_haircutz
                </a>
              </div>
            )}
          </div>
        </section>
      </Reveal>

      {/* GALLERY */}
      <Reveal>
        <section id="gallery" className="py-10 md:py-14 bg-white" data-testid="gallery-section">
          <div className="max-w-[1500px] mx-auto px-5 md:px-8">
            <div className="reveal flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-5">
              <div>
                <h2 className="title-massive text-3xl md:text-5xl lg:text-6xl mt-2">The Plates.</h2>
              </div>
              <a
                href="https://www.instagram.com/tzoulian_haircutz" target="_blank" rel="noreferrer"
                data-testid="gallery-ig-link"
                className="font-mono text-[0.62rem] uppercase tracking-wider text-gray-500 hover:text-[#E63329] transition-colors"
              >
                @tzoulian_haircutz →
              </a>
            </div>

            <div className="grid grid-cols-12 gap-3">
              {/* Row 1 — 3 images */}
              <div className="col-span-12 md:col-span-5 rounded-xl overflow-hidden"><ParallaxImage src={SHOP_IMAGES.storefront} alt="Storefront" label="Plate · 01" height={200} /></div>
              <div className="col-span-6 md:col-span-4 rounded-xl overflow-hidden"><ParallaxImage src={SHOP_IMAGES.interior1} alt="Chairs" label="Plate · 02" height={200} /></div>
              <div className="col-span-6 md:col-span-3 rounded-xl overflow-hidden"><ParallaxImage src={SHOP_IMAGES.interior2} alt="Lounge" label="Plate · 03" height={200} /></div>
              {/* Row 2 — 4 images */}
              <div className="col-span-6 md:col-span-3 rounded-xl overflow-hidden"><ParallaxImage src={STOCK.razor} alt="Tools" label="Plate · 04" height={175} /></div>
              <div className="col-span-6 md:col-span-3 rounded-xl overflow-hidden"><ParallaxImage src={SHOP_IMAGES.staircase} alt="Mural" label="Plate · 05" height={175} /></div>
              <div className="col-span-6 md:col-span-3 rounded-xl overflow-hidden"><ParallaxImage src={STOCK.beardCloseup} alt="Beard" label="Plate · 06" height={175} /></div>
              <div className="col-span-6 md:col-span-3 rounded-xl overflow-hidden"><ParallaxImage src={SHOP_IMAGES.exterior} alt="Exterior" label="Plate · 07" height={175} /></div>
            </div>
          </div>
        </section>
      </Reveal>

      {/* ABOUT */}
      <Reveal>
        <section id="about" className="py-14 md:py-20 bg-gradient-to-b from-gray-50 to-white" data-testid="about-section">
          <div className="max-w-[1500px] mx-auto px-5 md:px-8 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
            <div className="md:col-span-5 reveal">
              <div className="rounded-xl overflow-hidden">
                <ParallaxImage src={SHOP_IMAGES.interior2} alt="Inside TZOUL BARBER" label="****** ****" height={520} />
              </div>
            </div>

            <div className="md:col-span-7 reveal space-y-7">
              <div>
                <h2 className="title-massive text-3xl md:text-5xl lg:text-6xl mt-2">About.</h2>
              </div>

              <div>
                <h3 className="title-massive text-xl md:text-3xl mt-1">Beyond the chair.</h3>
                <p className="mt-3 text-sm md:text-base text-[#86868B] max-w-2xl leading-relaxed">
                  ***** ******* *** **** **** * **** *** ********** ********* *** *****.
                  ******* ** *** ****, ******** ** *** ***, ********** ** ******** ****** *** — ***** ****** ***** * *****.
                </p>
              </div>

              <div>
                <h3 className="title-massive text-xl md:text-3xl mt-1">The Philosophy.</h3>
                <p className="mt-3 text-sm md:text-base text-gray-600 max-w-2xl leading-relaxed">
                  ******* ********, ******* ******* *** ****** ******, *** ******, ******** *****. ** *******.
                  ***** ****** ****** **********.
                </p>

                <div className="mt-6 grid grid-cols-2 gap-4 max-w-2xl">
                  {[
                    { k: "Tradition", v: "******* *****, *** *****." },
                    { k: "Modern",    v: "************ ***** & ********." },
                    { k: "Culture",   v: "*****, ***, ******." },
                    { k: "Products",  v: "*******. *******." },
                  ].map((p) => (
                    <div key={p.k} className="p-4 bg-white rounded-2xl border border-black/[0.05] shadow-[0_2px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all">
                      <div className="font-display uppercase text-sm md:text-base">{p.k}</div>
                      <div className="font-mono text-[0.62rem] text-gray-500 mt-1">{p.v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      {/* CONTACT */}
      <Reveal>
        <section id="contact" className="py-14 md:py-20 bg-white" data-testid="contact-section">
          <div className="max-w-[1500px] mx-auto px-5 md:px-8">
            <div className="reveal flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-8">
              <div>
                <h2 className="title-massive text-3xl md:text-5xl lg:text-6xl mt-2">Visit.</h2>
              </div>
              <p className="text-gray-500 text-sm max-w-md">
                Walk-ins welcome. Reservations strongly recommended.
              </p>
            </div>

            {biz && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
                <div className="md:col-span-5 space-y-3 reveal">
                  <ContactCard testid="contact-address" icon={<MapPin size={14} className="shrink-0 text-[#86868B]" />} label="Address" value={biz.address} href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(biz.address)}`} />
                  <ContactCard testid="contact-phone"   icon={<Phone size={14} className="shrink-0 text-[#86868B]" />} label="Phone"   value={biz.phone}   href={`tel:${biz.phone.replace(/\s/g, "")}`} />
                  <ContactCard testid="contact-email"   icon={<Mail size={14} className="shrink-0 text-[#86868B]" />} label="Email"   value={biz.email}   href={`mailto:${biz.email}`} />
                  <ContactCard testid="contact-instagram" icon={<Instagram size={14} className="shrink-0 text-[#86868B]" />} label="Instagram" value="@tzoulian_haircutz" href={biz.instagram} />

                  <div className="rounded-xl border border-gray-200 p-5 bg-gray-50">
                    <div className="font-mono text-[0.58rem] uppercase tracking-wider text-gray-500 mb-3">Opening Hours</div>
                    <ul className="space-y-2 text-xs">
                      {Object.entries(biz.hours_label).map(([day, hours]) => (
                        <li key={day} className="flex justify-between pb-2 border-b border-gray-200 last:border-0">
                          <span className="font-mono uppercase text-[0.66rem] tracking-wider text-gray-700">{day}</span>
                          <span className={hours === "Closed" ? "text-gray-400" : "font-display text-gray-900"}>{hours}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="md:col-span-7 reveal rounded-xl overflow-hidden border border-gray-200 shadow-lg">
                  <iframe
                    data-testid="contact-map"
                    title="TZOUL BARBER Location"
                    src={`https://www.google.com/maps?q=${encodeURIComponent(biz.address)}&output=embed`}
                    className="w-full h-[380px] md:h-[560px] border-0 block"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>
            )}
          </div>
        </section>
      </Reveal>

      {/* CTA BAND */}
      <section className="bg-[#1D1D1F] text-white py-16 md:py-24" data-testid="cta-band">
        <div className="max-w-[1500px] mx-auto px-5 md:px-8 text-center">
          <h2 className="title-massive text-5xl md:text-7xl lg:text-8xl leading-tight mt-3 text-white">Book the chair.</h2>
          <p className="mt-4 text-white/45 text-sm md:text-base max-w-md mx-auto">By appointment only. No walk-ins.</p>
          <div className="mt-8 inline-block">
            <Magnetic strength={0.3}>
              <button onClick={openBooking} data-testid="cta-band-book" className="btn-white flex items-center gap-2">
                Book Appointment <ChevronsRight size={16} />
              </button>
            </Magnetic>
          </div>
        </div>
      </section>

</div>{/* /site-body curtain */}
    </>
  );
}

function ContactCard({ icon, label, value, href, testid }) {
  return (
    <a
      href={href}
      data-testid={testid}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel="noreferrer"
      className="rounded-2xl border border-black/[0.05] p-4 flex items-start gap-3 bg-white hover:bg-[#F5F5F7] transition-all group shadow-[0_2px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)] hover:-translate-y-0.5"
    >
      {icon}
      <div className="min-w-0 flex-1">
        <div className="font-mono text-[0.58rem] uppercase tracking-wider text-gray-500">{label}</div>
        <div className="font-display uppercase text-base mt-1 truncate text-gray-900">{value}</div>
      </div>
      <ArrowUpRight size={14} className="shrink-0 text-[#A1A1A6] group-hover:text-[#1D1D1F] transition-colors" />
    </a>
  );
}


/* ---------------------------------------------------------------------------
 * HeroSection — High-performance canvas image-sequence scrub (Apple-style).
 *
 * Pipeline:
 *   1. Preload ALL frames into memory via new Image() + onload, gated behind a
 *      "Loading Experience…" overlay. Page scroll is locked until 100 % loaded.
 *   2. Only after every frame is decoded do we draw frame 0 and init GSAP +
 *      ScrollTrigger. This guarantees zero decode-stutter during the scrub.
 *   3. A pinned, scrubbed master timeline (12-screen track, pinSpacing:true)
 *      drives a proxy { value } 0 → lastFrame over the first 85 % of the track.
 *      Each onUpdate clears the canvas and paints the frame (object-fit:cover).
 *   4. The "TZO"/"UL" wordmark splits outward + fades during the first ~15 %
 *      of the track; the last frame then holds for the final 15 %.
 *   5. CURTAIN: the hero stays pinned (z-1) for the whole track. Section 2
 *      (z-20, solid bg) has marginTop:-100vh so it overlaps the final screen
 *      of the reserved track and rides UP over the still-pinned hero on plain
 *      scroll — covering a finished animation, not interrupting it.
 *
 * ── FRAME ASSETS ────────────────────────────────────────────────────────────
 *   Files live in /public/frames/ezgif-frame-001.png … ezgif-frame-065.png and
 *   are served statically. Update FRAME_COUNT / FRAME_URL if you re-export.
 *   NOTE: these are 1920×1080 PNGs (~47 MB total). For production, re-encode to
 *   JPEG q≈2 to cut the preload payload to ~6–8 MB.
 * ────────────────────────────────────────────────────────────────────────── */
const FRAME_COUNT = 65;
const FRAME_URL = (i) =>
  `${process.env.PUBLIC_URL}/frames/ezgif-frame-${String(i + 1).padStart(3, "0")}.png`;

function HeroSection({ services, barbers, openBooking }) {
  void services; void barbers;

  const sectionRef  = useRef(null);
  const canvasRef   = useRef(null);
  const framesRef   = useRef([]);     // pre-loaded Image objects
  const cornerRRef  = useRef(null);
  const wordLRef    = useRef(null);
  const wordRRef    = useRef(null);
  const subtitleRef = useRef(null);
  const bottomRef   = useRef(null);
  const stat0Ref  = useRef(null);  // "2019"   — slides from left
  const stat1Ref  = useRef(null);  // "4.8★"  — slides from right
  const stat2Ref  = useRef(null);  // "No.526" — slides from left
  const mTitleRef = useRef(null);  // heading  — slides from right
  const mTextRef  = useRef(null);  // paragraph — slides from left

  // Preload state
  const [loaded, setLoaded]   = useState(false);   // all frames decoded?
  const [progress, setProgress] = useState(0);     // 0..100 for the loader

  // ── 1. PRELOAD ALL FRAMES (gate everything behind this) ──────────────────
  useEffect(() => {
    let cancelled = false;
    let done = 0;
    const frames = new Array(FRAME_COUNT);
    framesRef.current = frames;

    const onOne = () => {
      if (cancelled) return;
      done += 1;
      setProgress(Math.round((done / FRAME_COUNT) * 100));
      if (done === FRAME_COUNT) setLoaded(true);
    };

    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      img.onload = onOne;
      img.onerror = onOne; // don't deadlock the gate on a single bad frame
      img.src = FRAME_URL(i);
      frames[i] = img;
    }

    return () => { cancelled = true; };
  }, []);

  // ── 2. Lock body scroll while loading ────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = loaded ? "" : "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [loaded]);

  // ── 3. Once loaded: draw frame 0 + init GSAP ScrollTrigger ───────────────
  useEffect(() => {
    if (!loaded) return;

    const canvas  = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;
    const ctx = canvas.getContext("2d");
    // Skip bilinear interpolation — the frames are already high-res so the
    // browser doesn't need to resample, and turning this off saves GPU time.
    ctx.imageSmoothingEnabled = false;

    // Cover-math cache — all 65 frames share the same natural dimensions
    // (1920×1080), so we only need to recompute scale/x/y when the canvas
    // itself is resized, not on every drawFrame call.
    let coverScale = 1, coverX = 0, coverY = 0;

    // Size the canvas backing store to its CSS box (handles 100vw × 100vh)
    const resizeCanvas = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      // Recompute cover-math for the new canvas size using the first frame
      // as the size reference (all frames are identical dimensions).
      const ref = framesRef.current[0];
      if (ref && ref.naturalWidth) {
        coverScale = Math.max(canvas.width / ref.naturalWidth, canvas.height / ref.naturalHeight);
        coverX = (canvas.width  - ref.naturalWidth  * coverScale) / 2;
        coverY = (canvas.height - ref.naturalHeight * coverScale) / 2;
      }
    };

    // Paint one frame — cover-math is pre-cached in coverScale/X/Y
    const drawFrame = (rawIndex) => {
      const idx = Math.max(0, Math.min(Math.round(rawIndex), FRAME_COUNT - 1));
      const img = framesRef.current[idx];
      if (!img || !img.complete || !img.naturalWidth) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, coverX, coverY, img.naturalWidth * coverScale, img.naturalHeight * coverScale);
    };

    resizeCanvas();
    drawFrame(0);                       // first frame visible immediately
    const onResize = () => { resizeCanvas(); drawFrame(frameProxy.value); };
    window.addEventListener("resize", onResize);

    // Proxy object the scrub animates — only .value changes here; the ticker draws
    const frameProxy = { value: 0 };
    let lastRendered = -1;

    // Disable GSAP's lag-compensation: when a frame drops, GSAP normally
    // advances time to "catch up", which causes a sudden jump in the canvas.
    // With lagSmoothing(0) it simply resumes from where it left off.
    gsap.ticker.lagSmoothing(0);

    // GSAP Ticker: runs every rAF, draws only when the frame index has changed.
    // Decoupling draw from onUpdate means the compositor never has to wait for a
    // canvas paint to finish before the next scroll event is processed.
    const tickerFn = () => {
      const idx = Math.round(frameProxy.value);
      if (idx !== lastRendered) {
        drawFrame(frameProxy.value);
        lastRendered = idx;
      }
    };
    gsap.ticker.add(tickerFn);

    const TEXT_EXIT_AT   = 0.15; // wordmark fully gone by 15 % of the track
    const CANVAS_DONE_AT = 0.65; // last frame reached at 65 % of the track
    const D = 0.05;              // fade duration per element
    const G = 0.02;              // hold gap before crossfade starts
    const S = 0.18;              // sequence start position

    // Set initial state for each manifesto element. Alternating left/right so
    // they fly in from opposite edges. Use window.innerWidth so they start
    // fully off-screen. Managed by GSAP (not JSX style props) to survive
    // React re-renders triggered by API data loading.
    gsap.set([stat0Ref.current, stat1Ref.current, stat2Ref.current, mTitleRef.current, mTextRef.current], { opacity: 0 });

    // Scope all GSAP work to a context so StrictMode's double-mount (and
    // unmount) can fully REVERT the pin-spacer + inline styles. Killing a
    // pinned ScrollTrigger without reverting leaves a stale 0-height spacer,
    // which collapses the canvas on the second mount.
    const gsapCtx = gsap.context(() => {
      // One scrubbed master timeline pinned over a 12-screen cinematic track.
      // pinSpacing:true RESERVES that whole track so the canvas + text play out
      // fully BEFORE anything covers the hero. Section 2 then rides up over the
      // still-pinned hero on plain scroll (its -100vh margin overlaps the final
      // screen — see the JSX) so the curtain lands on a finished animation.
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger:             section,
          start:               "top top",
          end:                 () => "+=" + (window.innerHeight * 6),
          pin:                 true,
          pinSpacing:          true,
          scrub:               2,
          invalidateOnRefresh: true,
          onRefresh:           () => { resizeCanvas(); drawFrame(frameProxy.value); },
        },
      });

      // 0 → 15 %: wordmark splits outward + fades, corners/subtitle/bottom exit
      tl.to(wordLRef.current,    { xPercent: -150, opacity: 0, ease: "none", duration: TEXT_EXIT_AT }, 0)
        .to(wordRRef.current,    { xPercent:  150, opacity: 0, ease: "none", duration: TEXT_EXIT_AT }, 0)
        .to(cornerRRef.current,  { opacity: 0, ease: "none", duration: 0.06 }, 0)
        .to(subtitleRef.current, { opacity: 0, y: 10, ease: "none", duration: TEXT_EXIT_AT }, 0)
        .to(bottomRef.current,   { opacity: 0, y: 32, ease: "none", duration: TEXT_EXIT_AT }, 0)
        // 0 → 65 %: scrub only updates frameProxy.value — ticker handles the draw
        .to(frameProxy, { value: FRAME_COUNT - 1, ease: "none", duration: CANVAS_DONE_AT }, 0)
        // Crossfade sequence: each element fades out as the next fades in.
        // title in → crossfade to text → crossfade to stat0 → stat1 → stat2 → out
        .fromTo(mTitleRef.current, { opacity: 0 }, { opacity: 1, ease: "none", duration: D }, S)
        .to(mTitleRef.current,     { opacity: 0, ease: "none", duration: D }, S + D + G)
        .fromTo(mTextRef.current,  { opacity: 0 }, { opacity: 1, ease: "none", duration: D }, S + D + G)
        .to(mTextRef.current,      { opacity: 0, ease: "none", duration: D }, S + D*2 + G*2)
        .fromTo(stat0Ref.current,  { opacity: 0 }, { opacity: 1, ease: "none", duration: D }, S + D*2 + G*2)
        .to(stat0Ref.current,      { opacity: 0, ease: "none", duration: D }, S + D*3 + G*3)
        .fromTo(stat1Ref.current,  { opacity: 0 }, { opacity: 1, ease: "none", duration: D }, S + D*3 + G*3)
        .to(stat1Ref.current,      { opacity: 0, ease: "none", duration: D }, S + D*4 + G*4)
        .fromTo(stat2Ref.current,  { opacity: 0 }, { opacity: 1, ease: "none", duration: D }, S + D*4 + G*4)
        .to(stat2Ref.current,      { opacity: 0, ease: "none", duration: D }, S + D*5 + G*5)
        // 65 → 100 %: hold last frame while curtain rises
        .to({}, { duration: 1 - CANVAS_DONE_AT });
    }, sectionRef);

    ScrollTrigger.refresh();

    return () => {
      gsap.ticker.remove(tickerFn);
      window.removeEventListener("resize", onResize);
      gsapCtx.revert();
    };
  }, [loaded]);

  return (
    // Holder only cancels the 64px sticky <Nav> above us (negative margin) so the
    // scrub starts on the very first pixel. It carries no fixed height — GSAP's
    // pinSpacing:true spacer (≈13 screens) lives inside it and reserves the track.
    <div style={{ position: "relative", zIndex: 1, marginTop: "-4rem" }}>
    <section
      ref={sectionRef}
      id="hero"
      data-testid="hero"
      style={{ position: "relative", zIndex: 1, width: "100%", height: "100vh", overflow: "hidden", background: "#000" }}
    >
      {/* Canvas — image sequence painted here; covers section like object-fit:cover */}
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 1, willChange: "contents", transform: "translateZ(0)" }}
      />

      {/* Dim overlay */}
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 1 }} />

      {/* ── LOADING OVERLAY — solid black, blocks interaction until frames ready ── */}
      {!loaded && (
        <div
          data-testid="hero-loader"
          style={{
            position: "absolute", inset: 0, zIndex: 5, background: "#000",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1.5rem",
          }}
        >
          <div className="font-mono uppercase text-white/70" style={{ fontSize: "0.7rem", letterSpacing: "0.42em" }}>
            Loading Experience…
          </div>
          <div style={{ width: "min(60vw, 240px)", height: "2px", background: "rgba(255,255,255,0.12)", overflow: "hidden" }}>
            <div style={{ width: `${progress}%`, height: "100%", background: "#fff", transition: "width 0.2s ease" }} />
          </div>
          <div className="font-mono text-white/40" style={{ fontSize: "0.62rem", letterSpacing: "0.2em" }}>
            {progress}%
          </div>
        </div>
      )}

      {/* Content overlay — single absolute container, flex-column inside */}
      <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 2, display: "flex", flexDirection: "column" }}>

        {/* Corner labels */}
        <div style={{ padding: "7rem 2.5rem 0" }}>
          <div className="max-w-[1500px] mx-auto flex items-start justify-end">
            <div ref={cornerRRef} className="hidden md:block font-mono text-[0.58rem] uppercase tracking-[0.32em] text-white/50 text-right">
              FOR PRIVATE APPOINTMENT<br />
              <span className="opacity-70">SCHEDULED · NOT WALKED-IN</span>
            </div>
          </div>
        </div>

        {/* Wordmark */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 1.25rem" }}>
          <div style={{ width: "100%" }}>
            <h1
              data-testid="hero-title"
              className="font-display font-light uppercase text-white text-center select-none"
              style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(7rem, 28vw, 26rem)", letterSpacing: "-0.045em", lineHeight: 0.82, fontWeight: 700 }}
            >
              <span ref={wordLRef} style={{ display: "inline-block" }}>TZO</span>
              <span ref={wordRRef} style={{ display: "inline-block" }}>
                UL
                <span aria-hidden="true" className="align-top text-white/40 font-mono"
                  style={{ fontSize: "0.18em", marginLeft: "0.05em", letterSpacing: "0.05em" }}>®</span>
              </span>
            </h1>
            <div
              ref={subtitleRef}
              className="font-mono uppercase text-white/50"
              style={{ marginTop: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem", fontSize: "0.7rem", letterSpacing: "0.42em" }}
            >
              <span style={{ display: "inline-block", width: "3rem", height: "1px", background: "rgba(255,255,255,0.2)" }} />
              BARBER · ATHENS
              <span style={{ display: "inline-block", width: "3rem", height: "1px", background: "rgba(255,255,255,0.2)" }} />
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div ref={bottomRef} style={{ padding: "0 2.5rem 1.5rem" }}>
          <div className="max-w-[1500px] mx-auto flex items-end justify-end gap-4">
            <Magnetic strength={0.3}>
              <button data-testid="hero-book-btn" onClick={openBooking}
                className="btn-dark group flex items-center gap-3 px-6 py-3">
                <span className="inline-block w-1.5 h-1.5 bg-white/60 rounded-full" aria-hidden="true" />
                Book
                <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
              </button>
            </Magnetic>
          </div>
        </div>

      </div>

      {/* Manifesto overlay — title/text flush right, stats centered, both vertically centered */}
      <div style={{ position: "absolute", inset: 0, zIndex: 2, padding: "0 2.5rem", pointerEvents: "none", display: "flex", alignItems: "center" }}>
        <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center" }}>

          {/* Stats — far left, vertically centered */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
            <div ref={stat0Ref} style={{ borderLeft: "2px solid rgba(255,255,255,0.2)", paddingLeft: "1.25rem" }}>
              <div className="font-display font-black text-2xl md:text-3xl text-white leading-none">2019</div>
              <div className="font-mono uppercase text-white/45 mt-1" style={{ fontSize: "0.58rem", letterSpacing: "0.24em" }}>Est. Athens</div>
            </div>
            <div ref={stat1Ref} style={{ borderLeft: "2px solid rgba(255,255,255,0.2)", paddingLeft: "1.25rem" }}>
              <div className="font-display font-black text-2xl md:text-3xl text-white leading-none">4.8★</div>
              <div className="font-mono uppercase text-white/45 mt-1" style={{ fontSize: "0.58rem", letterSpacing: "0.24em" }}>90+ Reviews</div>
            </div>
            <div ref={stat2Ref} style={{ borderLeft: "2px solid rgba(255,255,255,0.2)", paddingLeft: "1.25rem" }}>
              <div className="font-display font-black text-2xl md:text-3xl text-white leading-none">No.526</div>
              <div className="font-mono uppercase text-white/45 mt-1" style={{ fontSize: "0.58rem", letterSpacing: "0.24em" }}>Leoforos Irakleiou</div>
            </div>
          </div>

          {/* Title + text — far right, vertically centered, right-aligned */}
          <div style={{ maxWidth: "24rem", textAlign: "right" }}>
            <h2 ref={mTitleRef} className="font-display font-black uppercase text-white leading-tight"
              style={{ fontSize: "clamp(1.4rem, 3vw, 2.8rem)", letterSpacing: "-0.03em" }}>
              It's not just a haircut.<br />It's a ritual.
            </h2>
            <p ref={mTextRef} className="mt-3 text-white/55 leading-relaxed"
              style={{ fontSize: "clamp(0.78rem, 1.1vw, 0.95rem)" }}>
              At TZOUL BARBER we fuse classic American barbering with the raw aesthetic of modern Athens.
              Vintage chairs, hot towels, music, culture — all under a wall covered in typography.
            </p>
          </div>

        </div>
      </div>
    </section>
    </div>
  );
}
