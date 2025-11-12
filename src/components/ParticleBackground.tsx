"use client";
import { motion, useAnimationControls } from "framer-motion";

export function ParticleBackground() {
  const base = typeof window !== "undefined" ? (window.innerWidth < 640 ? 16 : window.innerWidth < 1024 ? 28 : 42) : 28;
  const dots = Array.from({ length: base });
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {dots.map((_, i) => {
        const x = (i * 37) % 100;
        const y = (i * 53) % 100;
        const delay = (i % 7) * 0.4;
        const drift = (i % 5) - 2; // -2..2
        const size = 1 + (i % 3) * 0.5;
        return (
          <motion.span
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              width: `${size * 1.4}px`,
              height: `${size * 1.4}px`,
              background:
                i % 2 === 0
                  ? "radial-gradient(circle, rgba(20,183,255,0.95) 0%, transparent 70%)"
                  : "radial-gradient(circle, rgba(87,124,255,0.95) 0%, transparent 70%)",
              filter: "blur(0.2px)",
            }}
            animate={{ opacity: [0.18, 0.55, 0.18], y: [0, -6 - drift, 0], x: [0, drift, 0] }}
            transition={{ duration: 5.2, repeat: Infinity, delay, ease: "easeInOut" }}
          />
        );
      })}
    </div>
  );
}


