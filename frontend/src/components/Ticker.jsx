// Baby blue horizontal ticker tape.
export default function Ticker({ words, theme = "blue" }) {
  return (
    <div data-testid="ticker" className="overflow-hidden border-y border-black/[0.06] bg-[#F5F5F7] py-4 md:py-5">
      <div className="marquee-track">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div key={idx} className="flex items-center gap-12 shrink-0">
            {words.map((w, i) => (
              <span key={`${idx}-${i}`} className="font-display uppercase text-3xl md:text-5xl tracking-tight whitespace-nowrap flex items-center gap-12 text-[#1D1D1F]">
                {w}
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#86868B]" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
