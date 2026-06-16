import { useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

export default function MusicToggle() {
  const [on, setOn] = useState(false);
  return (
    <button
      data-testid="music-toggle"
      onClick={() => setOn((v) => !v)}
      className="fixed bottom-5 left-5 z-40 bg-[#0A0A0A] text-white font-mono text-[0.66rem] uppercase tracking-[0.2em] px-3 py-2 flex items-center gap-2 border-2 border-[#0A0A0A] hover:bg-[#E63329] hover:border-[#E63329] transition-colors"
    >
      {on ? <Volume2 size={12} /> : <VolumeX size={12} />}
      {on ? "Pause Music" : "Play Music"}
    </button>
  );
}
