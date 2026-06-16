import { motion } from "framer-motion";

// Letter-by-letter reveal — short cascade, all letters visible quickly.
export default function TextReveal({ children, className = "", delay = 0, stagger = 0.025, as = "span" }) {
  const text = String(children);
  const Tag = motion[as] || motion.span;
  return (
    <Tag
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
      className={className}
      aria-label={text}
    >
      {text.split("").map((ch, i) => (
        <motion.span
          key={i}
          variants={{
            hidden:  { y: "0.6em", opacity: 0 },
            visible: { y: 0,      opacity: 1, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
          }}
          className="inline-block whitespace-pre"
        >
          {ch}
        </motion.span>
      ))}
    </Tag>
  );
}
