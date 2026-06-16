import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";

// Monochrome curtain — deep charcoal bg, white TZOUL wordmark, clean underline.
// Fires on every route change (and initial load), then wipes right.
//
// Timing:
//   0.00s  charcoal curtain covers screen
//   0.15s  T fades + lifts in
//   0.55s  last letter done, underline bar scales in
//   1.40s  wipe begins → 2.20s curtain gone
const WORD = ["T", "Z", "O", "U", "L"];

const containerVariants = {
  hidden: {},
  visible: { transition: { delayChildren: 0.15, staggerChildren: 0.08 } },
};

const letterVariants = {
  hidden:   { opacity: 0, y: 36 },
  visible:  { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

export default function PageTransition({ children }) {
  const { pathname } = useLocation();
  return (
    <>
      <motion.div
        key={pathname}
        initial={{ x: "0%" }}
        animate={{ x: "100%" }}
        transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1], delay: 1.4 }}
        className="fixed inset-0 z-[100] bg-[#1D1D1F] pointer-events-none overflow-hidden"
        data-testid="page-curtain"
      >
        {/* Subtle dot grid overlay */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

        <div className="absolute bottom-10 left-10 md:bottom-20 md:left-24 select-none">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="text-white font-display leading-[0.85] text-[18vw] md:text-[14vw] lg:text-[10rem] tracking-tight flex"
            data-testid="curtain-wordmark"
          >
            {WORD.map((ch, i) => (
              <motion.span key={i} variants={letterVariants} className="inline-block">{ch}</motion.span>
            ))}
          </motion.div>

          {/* Thin underline — white, fades in after letters */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.9 }}
            style={{ transformOrigin: "left center" }}
            className="h-px w-16 md:w-24 lg:w-28 bg-white/30 mt-4"
          />

          {/* Eyebrow label */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 1.0 }}
            className="font-mono text-[0.58rem] uppercase tracking-[0.28em] text-white/35 mt-3"
          >
            BARBER · ATHENS
          </motion.div>
        </div>
      </motion.div>
      {children}
    </>
  );
}
