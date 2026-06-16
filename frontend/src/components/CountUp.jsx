import { useEffect, useRef, useState } from "react";

// Counts from 0 to `to` when scrolled into view. Restarts when `to` changes.
export default function CountUp({ to, suffix = "", decimals = 0, duration = 1500, prefix = "" }) {
  const ref = useRef(null);
  const [v, setV] = useState(0);
  const inView = useRef(false);
  const rafId = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const animate = () => {
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        setV(to * eased);
        if (t < 1) rafId.current = requestAnimationFrame(tick);
      };
      cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(tick);
    };

    if (inView.current) {
      animate();
      return () => cancelAnimationFrame(rafId.current);
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !inView.current) {
            inView.current = true;
            animate();
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(rafId.current); };
  }, [to, duration]);

  return (
    <span ref={ref}>
      {prefix}
      {v.toFixed(decimals)}
      {suffix}
    </span>
  );
}
