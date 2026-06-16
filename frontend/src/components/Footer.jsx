import { useEffect, useState } from "react";
import axios from "axios";
import { Instagram, MapPin, Phone, Mail, ArrowUpRight } from "lucide-react";
import Magnetic from "@/components/Magnetic";
import { useBooking } from "@/contexts/BookingContext";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Footer() {
  const [biz, setBiz] = useState(null);
  const { openBooking } = useBooking();
  useEffect(() => { axios.get(`${API}/business`).then((r) => setBiz(r.data)).catch(() => {}); }, []);

  return (
    <footer data-testid="site-footer" className="bg-[#E63329] text-white border-t-2 border-[#E63329]">
      <div className="max-w-[1500px] mx-auto px-5 md:px-8 pt-12 md:pt-16 pb-8">
        <div className="flex items-end justify-between flex-wrap gap-6">
          <div className="font-display leading-tight text-[18vw] md:text-[12vw] lg:text-[9rem] text-white">
            TZOUL<span className="inline-block w-[0.18em] h-[0.18em] bg-white/30 rounded-sm align-baseline ml-2" />
          </div>
          <div className="font-mono text-[0.66rem] uppercase tracking-wider text-white/80 text-right">
            <div>Est. 2019 — Athens, GR</div>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-white/30 grid grid-cols-1 md:grid-cols-4 gap-8">
          <FCol label="Address" testid="footer-address">
            <a href={biz ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(biz.address)}` : "#"} target="_blank" rel="noreferrer" className="flex items-start gap-2 text-white/85 hover:text-[#38BDF8] transition-colors">
              <MapPin size={13} className="mt-1 shrink-0" />
              <span className="text-sm">{biz?.address || "Leoforos Irakleiou 526, Athens"}</span>
            </a>
          </FCol>
          <FCol label="Opening Hours" testid="footer-hours">
            <div className="text-white/85 font-display tracking-tight text-sm">TUE–SAT · 11:00 – 21:00</div>
            <div className="text-white/55 text-xs mt-1">Wed closes 18:00 · Sun/Mon Closed</div>
          </FCol>
          <FCol label="Contact" testid="footer-contact">
            <a href={`tel:${(biz?.phone || "+302112180303").replace(/\s/g, "")}`} className="flex items-center gap-2 text-white/85 hover:text-[#38BDF8] text-sm transition-colors">
              <Phone size={13} /> {biz?.phone || "+30 21 1218 0303"}
            </a>
            <a href={`mailto:${biz?.email || "tzoulbarber@gmail.com"}`} className="flex items-center gap-2 text-white/85 hover:text-[#38BDF8] text-sm mt-1 transition-colors">
              <Mail size={13} /> {biz?.email || "tzoulbarber@gmail.com"}
            </a>
          </FCol>
          <FCol label="Social" testid="footer-social">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <a href="https://www.instagram.com/tzoulian_haircutz" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-white/85 hover:text-[#38BDF8] text-sm transition-colors" data-testid="footer-ig">
                <Instagram size={13} /> @tzoulian_haircutz
              </a>
              <Magnetic strength={0.18}>
                <button onClick={openBooking} data-testid="footer-book" className="btn-white text-[0.62rem] px-3 py-1.5 flex items-center gap-1">
                  Book now <ArrowUpRight size={11} />
                </button>
              </Magnetic>
            </div>
          </FCol>
        </div>

        <div className="mt-8 pt-4 border-t border-white/30 relative flex flex-col md:flex-row items-center justify-between gap-3 font-mono text-[0.62rem] uppercase tracking-wider text-white/80">
          <span>© {new Date().getFullYear()} TZOUL BARBER. All rights reserved.</span>
          <span className="md:absolute md:left-1/2 md:-translate-x-1/2">Made by Pavlos Konidas</span>
          <span>Athens · Greece</span>
        </div>
      </div>
    </footer>
  );
}

function FCol({ label, children, testid }) {
  return (
    <div data-testid={testid}>
      <div className="font-mono text-[0.62rem] uppercase tracking-wider text-white/75 mb-3 flex items-center gap-2">
        <span className="text-white/90">¦</span> {label}
      </div>
      <div className="leading-relaxed">{children}</div>
    </div>
  );
}
