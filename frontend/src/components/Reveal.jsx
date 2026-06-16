import { useEffect, useRef } from "react";

// Wraps content in an intersection observer that adds .is-visible to
// `.reveal` descendants. Also watches for new `.reveal` nodes added
// after initial mount (async data, lists, etc.) via MutationObserver.
export default function Reveal({ children, className = "" }) {
  const ref = useRef(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.08 }
    );

    const observe = (el) => {
      if (el.classList && el.classList.contains("reveal") && !el.classList.contains("is-visible")) {
        io.observe(el);
      }
    };

    // Initial pass
    if (root.classList.contains("reveal")) observe(root);
    root.querySelectorAll(".reveal").forEach(observe);

    // Watch for nodes added later
    const mo = new MutationObserver((muts) => {
      muts.forEach((m) => {
        m.addedNodes.forEach((n) => {
          if (n.nodeType !== 1) return;
          observe(n);
          n.querySelectorAll?.(".reveal").forEach(observe);
        });
      });
    });
    mo.observe(root, { childList: true, subtree: true });

    return () => { io.disconnect(); mo.disconnect(); };
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
