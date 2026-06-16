import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Reveal from "@/components/Reveal";
import { STOCK } from "@/data/site";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const IMG_MAP = {
  "haircut": STOCK.serviceHaircut,
  "kids-haircut": STOCK.serviceStyle,
  "haircut-beard": STOCK.beardCloseup,
  "beard-trim": STOCK.razor,
  "vip-haircut": STOCK.serviceHaircut,
  "vip-haircut-beard": STOCK.beardCloseup,
  "head-wash": STOCK.serviceStyle,
  "eyebrows": STOCK.serviceTools,
  "black-mask": STOCK.serviceTools,
  "grooming-deluxe": STOCK.serviceStyle,
  "deep-face": STOCK.serviceTools,
};

export default function Services() {
  const [services, setServices] = useState([]);

  useEffect(() => {
    axios.get(`${API}/services`)
      .then((r) => setServices(r.data))
      .catch(() => setServices([]));
  }, []);

  return (
    <section id="services" data-testid="services-section" className="relative bg-[#0a0a0a] py-28 md:py-40 border-t hairline">
      <Reveal>
        <div className="max-w-[1500px] mx-auto px-6 md:px-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16 reveal">
            <div>
              <p className="eyebrow">— The Menu</p>
              <h2 className="font-display text-5xl md:text-7xl lg:text-8xl tracking-tighter leading-[0.92] mt-3">
                Services <span className="serif-italic font-light">&amp;</span> Rituals
              </h2>
            </div>
            <p className="max-w-md text-white/65 text-base">
              Walk-ins welcome on quiet days, but the chair belongs to those who book.
              All prices in euros. Durations are indicative.
            </p>
          </div>

          <ul className="divide-y hairline border-t border-b hairline" data-testid="services-list">
            {services.map((s, i) => (
              <li
                key={s.id}
                data-testid={`service-row-${s.id}`}
                className="service-row reveal flex items-center justify-between py-7 md:py-9 px-2 md:px-4 group"
              >
                <div className="flex items-baseline gap-4 md:gap-8 z-10 relative">
                  <span className="font-display text-white/30 text-xl md:text-2xl tabular-nums w-10">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <div className="font-display text-2xl md:text-4xl tracking-tight">{s.name}</div>
                    <div className="eyebrow mt-1 text-white/45">{s.category} · {s.duration} min</div>
                  </div>
                </div>

                <img
                  src={IMG_MAP[s.id]}
                  alt={s.name}
                  className="service-img hidden md:block"
                />

                <div className="flex items-center gap-6 md:gap-10 z-10 relative">
                  <span className="font-display text-2xl md:text-3xl">€{s.price}</span>
                  <Link
                    to={`/book?service=${s.id}`}
                    data-testid={`book-${s.id}`}
                    className="hidden md:inline text-xs uppercase tracking-[0.28em] text-white/55 hover:text-[#f5f3ef] transition-colors"
                  >
                    Book →
                  </Link>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-14 flex justify-center reveal">
            <Link to="/book" data-testid="services-cta" className="btn-cream">Reserve a chair</Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
