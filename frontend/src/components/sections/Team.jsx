import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Reveal from "@/components/Reveal";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Team() {
  const [barbers, setBarbers] = useState([]);
  useEffect(() => { axios.get(`${API}/barbers`).then((r) => setBarbers(r.data)).catch(() => {}); }, []);

  return (
    <section id="team" data-testid="team-section" className="bg-[#F5F5F7] py-28 md:py-40">
      <Reveal>
        <div className="max-w-[1500px] mx-auto px-6 md:px-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-16">
            <div className="md:col-span-5 reveal">
              <p className="eyebrow">— The Hands</p>
              <h2 className="font-display text-5xl md:text-7xl tracking-tighter leading-[0.92] mt-3 text-[#1D1D1F]">
                Master barbers.
              </h2>
            </div>
            <p className="md:col-span-5 md:col-start-8 text-[#86868B] reveal self-end">
              Practitioners with decades of combined hours behind the chair. Pick your hand below.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-4">
            {barbers.map((b, i) => (
              <Link key={b.id} to={`/book?barber=${b.id}`} data-testid={`team-card-${b.id}`}
                className={`reveal group relative block ${i % 2 === 1 ? "md:translate-y-12" : ""}`}>
                <div className="aspect-[3/4] overflow-hidden bg-[#ECECEE] rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.07)] group-hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] transition-all duration-500">
                  <img src={b.image} alt={b.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="mt-4 flex items-start justify-between">
                  <div>
                    <div className="font-display text-xl tracking-tight text-[#1D1D1F]">{b.name}</div>
                    <div className="eyebrow mt-1">{b.role}</div>
                  </div>
                  <span className="text-xs uppercase tracking-[0.28em] text-[#A1A1A6] group-hover:text-[#1D1D1F] transition-colors">Book →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
