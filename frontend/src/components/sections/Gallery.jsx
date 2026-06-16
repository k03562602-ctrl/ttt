import Reveal from "@/components/Reveal";
import { SHOP_IMAGES, STOCK } from "@/data/site";

const TILES = [
  { src: SHOP_IMAGES.exterior, alt: "Through the glass", span: "md:col-span-7 md:row-span-2" },
  { src: SHOP_IMAGES.interior2, alt: "Lounge", span: "md:col-span-5" },
  { src: STOCK.razor, alt: "Tools of the trade", span: "md:col-span-3 offset-down" },
  { src: SHOP_IMAGES.interior1, alt: "Mirrors row", span: "md:col-span-2" },
  { src: SHOP_IMAGES.staircase, alt: "Staircase and mural", span: "md:col-span-7" },
  { src: STOCK.beardCloseup, alt: "Beard study", span: "md:col-span-5 offset-down" },
];

export default function Gallery() {
  return (
    <section id="gallery" data-testid="gallery-section" className="bg-white py-28 md:py-40">
      <Reveal>
        <div className="max-w-[1500px] mx-auto px-6 md:px-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14 reveal">
            <div>
              <p className="eyebrow">— Plates</p>
              <h2 className="font-display text-5xl md:text-7xl tracking-tighter leading-[0.92] mt-3 text-[#1D1D1F]">
                The house, in still life.
              </h2>
            </div>
            <a href="https://www.instagram.com/athbarberclub" target="_blank" rel="noreferrer"
              data-testid="gallery-instagram-link" className="eyebrow hover:text-[#1D1D1F] transition-colors">
              @athbarberclub →
            </a>
          </div>

          <div className="grid grid-cols-12 gap-4 md:gap-5 auto-rows-[180px] md:auto-rows-[220px]">
            {TILES.map((t, i) => (
              <div key={i} data-testid={`gallery-tile-${i}`}
                className={`col-span-12 ${t.span} tile reveal relative bg-[#ECECEE] rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.10)] hover:-translate-y-1 transition-all duration-500`}>
                <img src={t.src} alt={t.alt} className="w-full h-full object-cover" />
                <span className="absolute bottom-3 left-3 font-mono text-[0.58rem] uppercase tracking-wider text-white/90 bg-black/30 backdrop-blur-sm px-2 py-0.5 rounded-full">Plate · {String(i + 1).padStart(2, "0")}</span>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
