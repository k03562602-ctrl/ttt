import { useEffect, useState } from "react";
import axios from "axios";
import PageHeader from "@/components/PageHeader";
import Reveal from "@/components/Reveal";
import { Phone, Mail, MapPin, Instagram, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Contact() {
  const [biz, setBiz] = useState(null);
  useEffect(() => { axios.get(`${API}/business`).then((r) => setBiz(r.data)).catch(() => {}); }, []);
  if (!biz) return null;

  return (
    <>
      <PageHeader section="06" label="Contact" title="Visit" intro="Walk-ins welcome. Reservations strongly recommended." />

      <Reveal>
        <section className="py-12 md:py-16" data-testid="contact-page">
          <div className="max-w-[1500px] mx-auto px-5 md:px-8 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
            <div className="md:col-span-5 space-y-3 reveal">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(biz.address)}`}
                target="_blank" rel="noreferrer"
                data-testid="contact-address"
                className="border-2 border-ink p-5 flex items-start gap-3 hover:bg-[#0A0A0A] hover:text-white transition-colors"
              >
                <MapPin size={16} className="mt-1 shrink-0 text-[#E63329]" />
                <div>
                  <div className="font-mono text-[0.62rem] uppercase tracking-[0.2em] opacity-60">Address</div>
                  <div className="font-display uppercase text-lg mt-1">{biz.address}</div>
                </div>
                <ArrowUpRight size={16} className="ml-auto" />
              </a>
              <a href={`tel:${biz.phone.replace(/\s/g, "")}`} data-testid="contact-phone" className="border-2 border-ink p-5 flex items-start gap-3 hover:bg-[#0A0A0A] hover:text-white transition-colors">
                <Phone size={16} className="mt-1 shrink-0 text-[#E63329]" />
                <div>
                  <div className="font-mono text-[0.62rem] uppercase tracking-[0.2em] opacity-60">Phone</div>
                  <div className="font-display text-lg mt-1">{biz.phone}</div>
                </div>
                <ArrowUpRight size={16} className="ml-auto" />
              </a>
              <a href={`mailto:${biz.email}`} data-testid="contact-email" className="border-2 border-ink p-5 flex items-start gap-3 hover:bg-[#0A0A0A] hover:text-white transition-colors">
                <Mail size={16} className="mt-1 shrink-0 text-[#E63329]" />
                <div>
                  <div className="font-mono text-[0.62rem] uppercase tracking-[0.2em] opacity-60">Email</div>
                  <div className="font-display text-lg mt-1">{biz.email}</div>
                </div>
                <ArrowUpRight size={16} className="ml-auto" />
              </a>
              <a href={biz.instagram} target="_blank" rel="noreferrer" data-testid="contact-instagram" className="border-2 border-ink p-5 flex items-start gap-3 hover:bg-[#0A0A0A] hover:text-white transition-colors">
                <Instagram size={16} className="mt-1 shrink-0 text-[#E63329]" />
                <div>
                  <div className="font-mono text-[0.62rem] uppercase tracking-[0.2em] opacity-60">Instagram</div>
                  <div className="font-display text-lg mt-1">@athbarberclub</div>
                </div>
                <ArrowUpRight size={16} className="ml-auto" />
              </a>

              <div className="border-2 border-ink p-5">
                <div className="font-mono text-[0.62rem] uppercase tracking-[0.2em] opacity-60 mb-3">Opening Hours</div>
                <ul className="space-y-1.5 text-sm">
                  {Object.entries(biz.hours_label).map(([day, hours]) => (
                    <li key={day} className="flex justify-between border-b border-hair pb-1.5 last:border-b-0">
                      <span className="font-mono uppercase text-[0.7rem] tracking-[0.16em]">{day}</span>
                      <span className={hours === "Closed" ? "text-[#0A0A0A]/40" : "font-display"}>{hours}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link to="/book" data-testid="contact-book" className="btn-red w-full justify-center">
                Book Appointment <ArrowUpRight size={14} />
              </Link>
            </div>

            <div className="md:col-span-7 reveal map-grayscale border-2 border-ink">
              <iframe
                data-testid="contact-map"
                title="ATH BARBERCLUB Location"
                src={`https://www.google.com/maps?q=${encodeURIComponent(biz.address)}&output=embed`}
                className="w-full h-[500px] md:h-[760px] border-0 block"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </section>
      </Reveal>
    </>
  );
}
