import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { ArrowUpRight } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import Reveal from "@/components/Reveal";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Split name into first + rest so we can paint the second word red.
function splitName(full) {
  const parts = full.split(" ");
  if (parts.length === 1) return [full, ""];
  return [parts[0], parts.slice(1).join(" ")];
}

export default function Team() {
  const [barbers, setBarbers] = useState([]);
  useEffect(() => { axios.get(`${API}/barbers`).then((r) => setBarbers(r.data)).catch(() => {}); }, []);

  return (
    <>
      <PageHeader
        section="03"
        label="The Team"
        title="The Barbers"
        intro="Five personalities, one philosophy. Every chair tells its own story."
      />

      <Reveal>
        <section className="py-12 md:py-16" data-testid="team-page">
          <div className="max-w-[1500px] mx-auto px-5 md:px-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {barbers.map((b, i) => {
              const [first, last] = splitName(b.name);
              const dark = i === 3; // make the 4th card dark like the reference
              return (
                <div
                  key={b.id}
                  data-testid={`team-${b.id}`}
                  className={`reveal border-2 border-ink ${dark ? "bg-[#0A0A0A] text-white" : "bg-[#F5EFE7]"} grid grid-cols-1 md:grid-cols-5`}
                >
                  <div className="md:col-span-2 relative aspect-[4/5] md:aspect-auto tile overflow-hidden">
                    <img src={b.image} alt={b.name} className="w-full h-full object-cover" style={{ filter: "grayscale(100%) contrast(1.05)" }} />
                    <span className={`absolute top-3 left-3 ${dark ? "bg-[#E63329]" : "bg-[#E63329]"} text-white font-mono text-[0.6rem] uppercase tracking-[0.18em] px-1.5 py-0.5`}>
                      #{String(i + 1).padStart(3, "0")}
                    </span>
                    <span className="absolute bottom-3 left-3 bg-[#E63329] text-white font-mono text-[0.6rem] uppercase tracking-[0.18em] px-1.5 py-0.5">
                      "{b.role}"
                    </span>
                  </div>
                  <div className="md:col-span-3 flex flex-col">
                    <div className="flex items-center justify-between p-4 border-b border-hair">
                      <span className={`font-mono text-[0.6rem] uppercase tracking-[0.18em] ${dark ? "text-white/60" : "text-[#0A0A0A]/60"}`}>
                        #{String(i + 1).padStart(3, "0")} / Barber
                      </span>
                      <span className={`font-mono text-[0.6rem] uppercase tracking-[0.18em] ${dark ? "text-white/60" : "text-[#0A0A0A]/60"}`}>
                        Ch. 03
                      </span>
                    </div>
                    <div className="p-5 md:p-6 flex-1">
                      <h3 className="title-massive text-3xl md:text-4xl leading-[0.92]">
                        {first}<br />
                        <span className="text-[#E63329]">{last || ""}</span>
                      </h3>
                      <p className={`mt-4 text-sm md:text-base ${dark ? "text-white/80" : "text-[#0A0A0A]/75"} max-w-sm`}>{b.bio}</p>
                    </div>
                    <Link
                      to={`/book?barber=${b.id}`}
                      data-testid={`team-book-${b.id}`}
                      className={`flex items-center justify-between gap-2 px-5 md:px-6 py-4 font-mono text-[0.7rem] uppercase tracking-[0.22em] border-t-2 ${dark ? "border-white hover:bg-white hover:text-[#0A0A0A]" : "border-ink hover:bg-[#0A0A0A] hover:text-white"} transition-colors`}
                    >
                      Book with {first}
                      <ArrowUpRight size={14} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </Reveal>
    </>
  );
}
