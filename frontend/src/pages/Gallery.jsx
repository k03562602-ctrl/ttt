import PageHeader from "@/components/PageHeader";
import Reveal from "@/components/Reveal";
import { SHOP_IMAGES, STOCK } from "@/data/site";

const TILES = [
  { src: SHOP_IMAGES.storefront, alt: "Storefront", label: "Exterior", cls: "md:col-span-8 row-span-2" },
  { src: SHOP_IMAGES.interior1, alt: "Chairs row", label: "Floor", cls: "md:col-span-4" },
  { src: SHOP_IMAGES.interior2, alt: "Lounge", label: "Lounge", cls: "md:col-span-4" },
  { src: SHOP_IMAGES.staircase, alt: "Staircase mural", label: "Mural", cls: "md:col-span-5" },
  { src: STOCK.razor, alt: "Tools", label: "Tools", cls: "md:col-span-3" },
  { src: SHOP_IMAGES.exterior, alt: "Glass front", label: "Glass", cls: "md:col-span-4" },
  { src: STOCK.beardCloseup, alt: "Beard study", label: "Detail", cls: "md:col-span-4" },
  { src: STOCK.fadeBack, alt: "Fade back", label: "Cut", cls: "md:col-span-4" },
];

export default function Gallery() {
  return (
    <>
      <PageHeader
        section="04"
        label="Gallery"
        title="The Plates"
        intro="A visual diary of the house — light, lines and faces."
      />
      <Reveal>
        <section className="py-12 md:py-16" data-testid="gallery-page">
          <div className="max-w-[1500px] mx-auto px-5 md:px-8">
            <div className="grid grid-cols-12 gap-3 md:gap-4 auto-rows-[220px] md:auto-rows-[260px]">
              {TILES.map((t, i) => (
                <div
                  key={i}
                  data-testid={`gallery-tile-${i}`}
                  className={`col-span-12 ${t.cls} border-2 border-ink tile relative reveal`}
                >
                  <img src={t.src} alt={t.alt} className="w-full h-full object-cover" style={{ filter: "grayscale(100%)" }} />
                  <span className="absolute top-3 left-3 bg-[#E63329] text-white font-mono text-[0.6rem] uppercase tracking-[0.18em] px-1.5 py-0.5">
                    Plate #{String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="absolute bottom-3 right-3 bg-[#0A0A0A] text-white font-mono text-[0.6rem] uppercase tracking-[0.18em] px-1.5 py-0.5">
                    {t.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </Reveal>
    </>
  );
}
