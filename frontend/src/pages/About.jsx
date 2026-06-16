import { Link } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import Reveal from "@/components/Reveal";
import { SHOP_IMAGES } from "@/data/site";
import { ChevronsRight } from "lucide-react";

const PILLARS = [
  { k: "Tradition", v: "Straight razor, hot towel." },
  { k: "Modern",    v: "Contemporary fades & styling." },
  { k: "Culture",   v: "Music, art, street." },
  { k: "Products",  v: "Curated. Premium." },
];

export default function About() {
  return (
    <>
      <PageHeader section="05" label="About" title="About" />

      <Reveal>
        <section className="py-12 md:py-16" data-testid="about-page">
          <div className="max-w-[1500px] mx-auto px-5 md:px-8 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
            <div className="md:col-span-5 reveal">
              <div className="border-2 border-ink overflow-hidden tile relative">
                <img src={SHOP_IMAGES.interior2} alt="Inside ATH" className="w-full h-[460px] md:h-[640px] object-cover" />
                <span className="absolute top-3 left-3 bg-[#E63329] text-white font-mono text-[0.62rem] uppercase tracking-[0.2em] px-2 py-1">
                  "Est. 2019"
                </span>
              </div>
            </div>

            <div className="md:col-span-7 reveal space-y-8">
              <div>
                <div className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-[#0A0A0A]/55">Ch. 01 — Origin</div>
                <h3 className="title-massive text-3xl md:text-4xl mt-1">Beyond the chair<span className="text-[#E63329]">.</span></h3>
                <p className="mt-3 text-[#0A0A0A]/75 max-w-2xl">
                  ATH Barberclub was born from a love for traditional barbering and music. Records on the wall, hip-hop in the air,
                  references to Athenian street art — every corner tells a story.
                </p>
              </div>

              <div>
                <div className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-[#0A0A0A]/55">Ch. 02 — Philosophy</div>
                <h3 className="title-massive text-3xl md:text-4xl mt-1">The Philosophy<span className="text-[#E63329]">.</span></h3>
                <p className="mt-3 text-[#0A0A0A]/75 max-w-2xl">
                  Curated products, vintage Belmont and Takara chairs, hot towels, straight razor. No rushing.
                  Every client leaves transformed.
                </p>

                <div className="mt-6 grid grid-cols-2 gap-0 border-2 border-ink">
                  {PILLARS.map((p, i) => (
                    <div key={p.k} className={`p-4 md:p-5 ${i < 2 ? "border-b-2 border-ink" : ""} ${i % 2 === 0 ? "border-r-2 border-ink" : ""}`}>
                      <div className="font-display uppercase text-base md:text-lg">{p.k}</div>
                      <div className="font-mono text-xs text-[#0A0A0A]/60 mt-1">{p.v}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-[#0A0A0A]/55">Ch. 03 — The Space</div>
                <h3 className="title-massive text-3xl md:text-4xl mt-1">The Space<span className="text-[#E63329]">.</span></h3>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <img src={SHOP_IMAGES.interior1} alt="Interior 1" className="border-2 border-ink h-44 md:h-56 w-full object-cover" />
                  <img src={SHOP_IMAGES.staircase} alt="Staircase" className="border-2 border-ink h-44 md:h-56 w-full object-cover" />
                  <img src={SHOP_IMAGES.exterior} alt="Exterior" className="border-2 border-ink h-44 md:h-56 w-full object-cover" />
                  <img src={SHOP_IMAGES.storefront} alt="Storefront" className="border-2 border-ink h-44 md:h-56 w-full object-cover" />
                </div>
              </div>

              <Link to="/book" data-testid="about-book" className="btn-red">
                <ChevronsRight size={14} /> Book Now
              </Link>
            </div>
          </div>
        </section>
      </Reveal>
    </>
  );
}
