import { useEffect, useState } from "react";
import axios from "axios";
import Reveal from "@/components/Reveal";
import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Instagram, ArrowRight } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Contact() {
  const [biz, setBiz] = useState(null);
  useEffect(() => { axios.get(`${API}/business`).then((r) => setBiz(r.data)).catch(() => {}); }, []);
  if (!biz) return null;

  return (
    <section id="contact" data-testid="contact-section" className="bg-[#0a0a0a] py-28 md:py-40 border-t hairline">
      <Reveal>
        <div className="max-w-[1500px] mx-auto px-6 md:px-10 grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="md:col-span-6 reveal">
            <p className="eyebrow">— Visit</p>
            <h2 className="font-display text-5xl md:text-7xl tracking-tighter leading-[0.92] mt-3">
              Find the <span className="serif-italic font-light">house</span>.
            </h2>

            <div className="mt-10 space-y-7 max-w-md">
              <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(biz.address)}`}
                 target="_blank" rel="noreferrer"
                 data-testid="contact-address"
                 className="flex items-start gap-4 text-white/80 hover:text-white">
                <MapPin size={18} className="mt-1 shrink-0 text-[#f5f3ef]" />
                <span>{biz.address}</span>
              </a>
              <a href={`tel:${biz.phone.replace(/\s/g, "")}`} data-testid="contact-phone"
                 className="flex items-center gap-4 text-white/80 hover:text-white">
                <Phone size={18} className="text-[#f5f3ef]" />
                <span>{biz.phone}</span>
              </a>
              <a href={`mailto:${biz.email}`} data-testid="contact-email"
                 className="flex items-center gap-4 text-white/80 hover:text-white">
                <Mail size={18} className="text-[#f5f3ef]" />
                <span>{biz.email}</span>
              </a>
              <a href={biz.instagram} target="_blank" rel="noreferrer" data-testid="contact-instagram"
                 className="flex items-center gap-4 text-white/80 hover:text-white">
                <Instagram size={18} className="text-[#f5f3ef]" />
                <span>@athbarberclub</span>
              </a>
            </div>

            <div className="mt-12 border-t hairline pt-8 max-w-md">
              <p className="eyebrow mb-5">Opening Hours</p>
              <ul className="space-y-2 text-sm">
                {Object.entries(biz.hours_label).map(([day, hours]) => (
                  <li key={day} className="flex justify-between border-b hairline pb-2 text-white/75">
                    <span className="uppercase tracking-[0.16em]">{day}</span>
                    <span className={hours === "Closed" ? "text-white/40" : ""}>{hours}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Link to="/book" data-testid="contact-book-btn" className="btn-cream mt-10">
              Book your seat <ArrowRight size={14} />
            </Link>
          </div>

          <div className="md:col-span-6 reveal map-grayscale">
            <iframe
              data-testid="contact-map"
              title="ATH BARBERCLUB Location"
              src={`https://www.google.com/maps?q=${encodeURIComponent(biz.address)}&output=embed`}
              className="w-full h-[460px] md:h-[680px] border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </Reveal>
    </section>
  );
}
