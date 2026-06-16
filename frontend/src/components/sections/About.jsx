import Reveal from "@/components/Reveal";
import { SHOP_IMAGES } from "@/data/site";

export default function About() {
  return (
    <section id="about" data-testid="about-section" className="relative bg-[#0a0a0a] py-28 md:py-40 border-t hairline">
      <Reveal>
        <div className="max-w-[1500px] mx-auto px-6 md:px-10 grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16">
          <div className="md:col-span-5 reveal">
            <img
              src={SHOP_IMAGES.staircase}
              alt="Interior of ATH BARBERCLUB with calligraphy mural"
              className="w-full aspect-[3/4] object-cover"
              style={{ filter: "grayscale(100%) contrast(1.05)" }}
            />
            <p className="eyebrow mt-4">Plate 01 · The House</p>
          </div>

          <div className="md:col-span-6 md:col-start-7 flex flex-col justify-center reveal">
            <p className="eyebrow mb-6">— Chapter One</p>
            <h2 className="font-display text-5xl md:text-6xl lg:text-7xl tracking-tighter leading-[0.92]">
              A house of <span className="serif-italic font-light">precision</span>,
              <br className="hidden md:block" /> not a chair in a row.
            </h2>
            <div className="mt-10 max-w-xl space-y-6 text-base md:text-lg text-white/75 leading-relaxed">
              <p>
                <span className="font-display text-5xl float-left mr-3 mt-1 leading-[0.9] text-[#f5f3ef]">A</span>
                t ATH Barberclub, every cut is approached with the patience of a tailor and the eye of a photographer.
                We trade fluorescence for soft linear light, queues for private suites, and noise for the quiet
                ritual of becoming yourself again.
              </p>
              <p>
                Our barbers are obsessives. Our chairs are heirlooms. Our walls speak in calligraphy.
                Step inside — the city stays outside.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-3 gap-6 border-t hairline pt-8 max-w-lg">
              <div>
                <div className="font-display text-3xl">12</div>
                <div className="eyebrow mt-1">Services</div>
              </div>
              <div>
                <div className="font-display text-3xl">5</div>
                <div className="eyebrow mt-1">Master Barbers</div>
              </div>
              <div>
                <div className="font-display text-3xl">4.8★</div>
                <div className="eyebrow mt-1">90 Reviews</div>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
