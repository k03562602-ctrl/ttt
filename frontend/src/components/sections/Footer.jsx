import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer data-testid="site-footer" className="bg-[#0F172A] text-white border-t-2 border-[#0F172A]">
      <div className="max-w-[1500px] mx-auto px-6 md:px-10 py-14 grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-5">
          <div className="font-display text-3xl tracking-[0.08em] text-white">TZOUL<span className="text-[#38BDF8]">.</span>BARBER</div>
          <p className="mt-4 text-white/50 max-w-sm text-sm leading-relaxed">
            A premium grooming house in Athens. By appointment only.
          </p>
          <div className="mt-5 flex gap-2">
            <span className="inline-block w-2 h-2 bg-[#38BDF8] rounded-full" />
            <span className="inline-block w-2 h-2 bg-[#F97316] rounded-full" />
            <span className="inline-block w-2 h-2 bg-white/30 rounded-full" />
          </div>
        </div>
        <div className="md:col-span-3">
          <p className="eyebrow mb-4 text-white/40">House</p>
          <ul className="space-y-2 text-sm text-white/65">
            <li><a href="#about" data-testid="footer-link-about" className="hover:text-[#38BDF8] transition-colors">About</a></li>
            <li><a href="#services" data-testid="footer-link-services" className="hover:text-[#38BDF8] transition-colors">Services</a></li>
            <li><a href="#team" data-testid="footer-link-team" className="hover:text-[#38BDF8] transition-colors">Team</a></li>
            <li><a href="#gallery" data-testid="footer-link-gallery" className="hover:text-[#38BDF8] transition-colors">Gallery</a></li>
          </ul>
        </div>
        <div className="md:col-span-4">
          <p className="eyebrow mb-4 text-white/40">Contact</p>
          <ul className="space-y-2 text-sm text-white/65">
            <li>Leoforos Irakleiou 526, Athens</li>
            <li>+30 21 1218 0303</li>
            <li>athbarberclub@gmail.com</li>
          </ul>
          <Link to="/book" data-testid="footer-book" className="btn-orange mt-6 inline-flex items-center gap-2 text-xs">Book →</Link>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="max-w-[1500px] mx-auto px-6 md:px-10 py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-[0.65rem] uppercase tracking-[0.32em] text-white/25">
          <span>© {new Date().getFullYear()} TZOUL BARBER. All rights reserved.</span>
          <span>Athens · Greece</span>
        </div>
      </div>
    </footer>
  );
}
