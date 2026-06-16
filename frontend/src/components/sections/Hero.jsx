import { Link } from "react-router-dom";
import { SHOP_IMAGES } from "@/data/site";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section id="hero" data-testid="hero-section" className="relative min-h-[100svh] w-full overflow-hidden">
      {/* Background video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="https://customer-assets.emergentagent.com/job_tzoul-build-1/artifacts/9yz25ow3_Metallic_hair_cutting_scissor_ro%E2%80%A6_202606071856.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-black/60" />

      {/* Top eyebrow */}
      <div className="relative z-10 pt-32 md:pt-40 px-6 md:px-10">
        <div className="max-w-[1500px] mx-auto flex items-center justify-between">
          <span className="eyebrow">Est. Athens · Greece</span>
          <span className="eyebrow hidden md:inline">No. 526 Leoforos Irakleiou</span>
        </div>
      </div>

      {/* Headline */}
      <div className="relative z-10 px-6 md:px-10 mt-16 md:mt-28">
        <div className="max-w-[1500px] mx-auto">
          <h1
            data-testid="hero-headline"
            className="font-display font-black tracking-tighter text-white leading-[0.86] text-[18vw] md:text-[12vw] lg:text-[10.5rem]"
          >
            ATH<br/>
            <span className="serif-italic font-light text-[#f5f3ef]">barberclub</span>
          </h1>

          <div className="mt-10 md:mt-14 grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
            <p className="md:col-span-5 text-base md:text-lg text-white/75 max-w-md leading-relaxed">
              A private grooming house in the heart of Athens. Sharp fades, sculpted beards and editorial silhouettes
              — delivered by master barbers in VIP suites built for comfort and class.
            </p>
            <div className="md:col-span-4 md:col-start-9 flex flex-col items-start md:items-end gap-4">
              <Link
                to="/book"
                data-testid="hero-book-btn"
                className="btn-cream"
              >
                Book your seat <ArrowRight size={14} />
              </Link>
              <a
                href="#services"
                data-testid="hero-services-link"
                onClick={(e) => { e.preventDefault(); document.getElementById("services")?.scrollIntoView({ behavior: "smooth" }); }}
                className="text-xs uppercase tracking-[0.32em] text-white/55 hover:text-white transition-colors"
              >
                Explore the menu →
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom meta */}
      <div className="absolute bottom-6 inset-x-0 z-10 px-6 md:px-10">
        <div className="max-w-[1500px] mx-auto flex items-center justify-between text-[0.65rem] uppercase tracking-[0.32em] text-white/55">
          <span data-testid="hero-rating">★ 4.8 · 90 Google reviews</span>
          <span className="hidden md:inline">Scroll ↓</span>
          <span>By appointment only</span>
        </div>
      </div>
    </section>
  );
}
