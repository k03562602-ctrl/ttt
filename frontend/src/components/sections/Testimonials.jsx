import { useEffect, useState } from "react";
import axios from "axios";
import Reveal from "@/components/Reveal";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Testimonials() {
  const [items, setItems] = useState([]);
  useEffect(() => { axios.get(`${API}/testimonials`).then((r) => setItems(r.data)).catch(() => {}); }, []);

  return (
    <section id="reviews" data-testid="testimonials-section" className="bg-[#0a0a0a] py-28 md:py-40 border-t hairline overflow-hidden">
      <Reveal>
        <div className="max-w-[1500px] mx-auto px-6 md:px-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-end mb-16">
            <div className="md:col-span-7 reveal">
              <p className="eyebrow">— Press</p>
              <h2 className="font-display text-5xl md:text-7xl tracking-tighter leading-[0.92] mt-3">
                4.8 <span className="serif-italic font-light">★</span>
                <span className="ml-4 text-white/45 font-light">/ 5</span>
              </h2>
              <p className="mt-4 text-white/65">From 90 verified Google reviews and counting.</p>
            </div>
            <div className="md:col-span-4 md:col-start-9 reveal">
              <div className="font-display text-[8rem] leading-none text-[#f5f3ef]/10 select-none">"</div>
            </div>
          </div>
        </div>

        <div className="relative w-full overflow-hidden">
          <div className="marquee-track" data-testid="testimonials-marquee">
            {[...items, ...items].map((t, i) => (
              <figure
                key={i}
                data-testid={`testimonial-${i}`}
                className="w-[88vw] md:w-[520px] shrink-0 border hairline p-8 md:p-10 bg-[#0e0e0e]"
              >
                <div className="eyebrow text-[#f5f3ef]/70">★★★★★ · {t.source}</div>
                <blockquote className="font-display text-2xl md:text-3xl leading-tight mt-5 tracking-tight">
                  "{t.text}"
                </blockquote>
                <figcaption className="eyebrow mt-6">— {t.name}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
