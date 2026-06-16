import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import PageHeader from "@/components/PageHeader";
import Reveal from "@/components/Reveal";
import { SERVICE_GROUPS } from "@/data/site";
import { ChevronsRight } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Services() {
  const [services, setServices] = useState([]);
  useEffect(() => { axios.get(`${API}/services`).then((r) => setServices(r.data)).catch(() => {}); }, []);

  return (
    <>
      <PageHeader
        section="02"
        label="Featured Services"
        title="Services"
        intro="All prices are indicative. Ask your barber for a personalised quote."
      />

      <Reveal>
        <section className="py-12 md:py-16" data-testid="services-page">
          <div className="max-w-[1500px] mx-auto px-5 md:px-8 space-y-14">
            {SERVICE_GROUPS.map((g, gi) => {
              const items = services.filter((s) => s.category === g.key);
              if (items.length === 0) return null;
              return (
                <div key={g.key} className="reveal" data-testid={`group-${g.key}`}>
                  <div className="flex items-center justify-between border-b-2 border-ink pb-3 mb-4 gap-4">
                    <div className="flex items-baseline gap-4">
                      <span className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-[#0A0A0A]/55">CH.0{gi + 1}</span>
                      <h2 className="title-massive text-3xl md:text-4xl">{g.label}</h2>
                    </div>
                    <span className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-[#0A0A0A]/55">
                      {String(items.length).padStart(2, "0")} Items
                    </span>
                  </div>

                  <ul className="border-2 border-ink divide-y-2 divide-[#0A0A0A]">
                    {items.map((s, i) => (
                      <li key={s.id} data-testid={`svc-${s.id}`} className="svc-row">
                        <Link to={`/book?service=${s.id}`} className="flex items-center justify-between gap-4 px-4 md:px-6 py-4 md:py-5">
                          <div className="flex items-baseline gap-4 md:gap-6 min-w-0">
                            <span className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[#0A0A0A]/55 w-10 shrink-0">
                              #{String(i + 1).padStart(3, "0")}
                            </span>
                            <span className="font-display uppercase text-lg md:text-2xl truncate">{s.name}</span>
                          </div>
                          <div className="flex items-center gap-6 md:gap-10 shrink-0">
                            <span className="hidden md:inline font-mono text-[0.66rem] uppercase tracking-[0.18em] text-[#0A0A0A]/55">
                              {s.duration} min
                            </span>
                            <span className="font-display text-xl md:text-3xl text-[#E63329] min-w-[80px] text-right">€{s.price}</span>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}

            <div className="flex justify-center pt-6 reveal">
              <Link to="/book" data-testid="services-cta" className="btn-red">
                <ChevronsRight size={14} /> Book Now
              </Link>
            </div>
          </div>
        </section>
      </Reveal>
    </>
  );
}
