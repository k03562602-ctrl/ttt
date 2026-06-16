import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { NAV_LINKS } from "@/data/site";
import { Menu, X, ChevronsRight } from "lucide-react";
import Magnetic from "@/components/Magnetic";
import { useBooking } from "@/contexts/BookingContext";

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("hero");
  const loc = useLocation();
  const nav = useNavigate();
  const { openBooking } = useBooking();
  useEffect(() => { setOpen(false); }, [loc.pathname]);

  // Scroll-spy
  useEffect(() => {
    if (loc.pathname !== "/") return;
    const onScroll = () => {
      const y = window.scrollY + 120;
      let current = "hero";
      for (const l of NAV_LINKS) {
        const el = document.getElementById(l.id);
        if (el && el.offsetTop <= y) current = l.id;
      }
      setActive(current);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [loc.pathname]);

  const goToSection = (id) => (e) => {
    e.preventDefault();
    if (loc.pathname !== "/") {
      nav(`/#${id}`);
      return;
    }
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    setOpen(false);
  };

  return (
    <header data-testid="site-nav" className="sticky top-0 z-50 bg-black">
      <div className="max-w-[1500px] mx-auto px-5 md:px-8 h-16 flex items-center justify-between gap-4 relative">
        {/* Brand */}
        <a href="/#hero" onClick={goToSection("hero")} data-testid="brand-logo" className="flex items-center gap-3 shrink-0 group">
          <span className="font-display text-2xl md:text-3xl leading-none text-white relative">
            TZOUL
            <sup className="font-mono text-[0.36rem] align-super ml-1 text-white/40">®</sup>
          </span>
          <span className="hidden md:inline font-mono text-[0.6rem] uppercase tracking-wider text-white/40 border-l border-white/20 pl-3">
            BARBER / ATHENS
          </span>
        </a>

        {/* Center nav — absolutely centered so it's always pixel-perfect */}
        <nav className="hidden lg:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
          {NAV_LINKS.map((l) => {
            const isActive = loc.pathname === "/" && active === l.id;
            return (
              <a
                key={l.id}
                href={`/#${l.id}`}
                onClick={goToSection(l.id)}
                data-testid={`nav-link-${l.id}`}
                className={`group flex items-center gap-2 transition-colors ${isActive ? "text-white" : "text-white/45 hover:text-white"}`}
              >
                <span className="font-mono text-[0.6rem] text-white/30">{l.num}</span>
                <span className={`font-display text-xs tracking-wide uppercase ${isActive ? "font-semibold" : ""}`}>
                  {l.label}
                </span>
              </a>
            );
          })}
        </nav>

        {/* Right */}
        <div className="flex items-center gap-3 shrink-0">
          <Magnetic strength={0.2}>
            <button onClick={openBooking} data-testid="nav-book-btn" className="bg-white text-[#1D1D1F] hover:bg-white/90 transition-colors text-xs flex items-center gap-1.5 px-4 py-2 rounded-full font-display uppercase">
              <ChevronsRight size={12} /> Book now
            </button>
          </Magnetic>
          <button
            data-testid="mobile-menu-btn"
            className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors text-white"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <div data-testid="mobile-drawer" className="lg:hidden border-t border-white/10 bg-black">
          <div className="px-5 py-5 flex flex-col gap-2">
            {NAV_LINKS.map((l) => {
              const isActive = loc.pathname === "/" && active === l.id;
              return (
                <a
                  key={l.id}
                  href={`/#${l.id}`}
                  onClick={goToSection(l.id)}
                  data-testid={`mobile-nav-${l.id}`}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? "bg-white text-[#1D1D1F]" : "hover:bg-white/10 text-white"}`}
                >
                  <span className={`font-mono text-[0.58rem] ${isActive ? "text-[#1D1D1F]/50" : "text-white/40"}`}>{l.num}</span>
                  <span className="font-display uppercase text-base">{l.label}</span>
                </a>
              );
            })}
            <button onClick={openBooking} data-testid="mobile-book-btn" className="bg-white text-[#1D1D1F] mt-2 w-full flex items-center justify-center gap-2 py-3 rounded-xl font-display uppercase text-sm">
              <ChevronsRight size={12} /> Book Appointment
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
