import { useRef, useEffect } from "react";

// Image with parallax (Y translate based on scroll) using rAF + direct DOM
// mutation — no React setState so zero re-renders on scroll.
export default function ParallaxImage({ src, alt, label, className = "", height = 320 }) {
  const wrapRef = useRef(null);
  const imgRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const onScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        const el = wrapRef.current;
        const img = imgRef.current;
        if (!el || !img) return;
        const r = el.getBoundingClientRect();
        const dist = window.innerHeight / 2 - (r.top + r.height / 2);
        img.style.transform = `translateY(${dist * 0.06}px) scale(1.08)`;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div ref={wrapRef} className={`relative overflow-hidden ${className}`} style={{ height }}>
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        style={{ filter: "grayscale(100%) contrast(1.05)" }}
        className="absolute inset-0 w-full h-full object-cover will-change-transform"
      />
      {label && (
        <span className="absolute top-3 left-3 bg-[#1D1D1F] text-white font-mono text-[0.6rem] uppercase tracking-[0.18em] px-1.5 py-0.5 z-10">
          {label}
        </span>
      )}
    </div>
  );
}
