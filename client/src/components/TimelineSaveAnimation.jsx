import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, CheckCircle2 } from "lucide-react";
import confetti from "canvas-confetti";

export default function TimelineSaveAnimation({ show, message, onComplete }) {
  useEffect(() => {
    if (show) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
      const t = setTimeout(() => {
        if (onComplete) onComplete();
      }, 2400);
      return () => clearTimeout(t);
    }
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-cyan-600 to-purple-600 text-white font-mono text-sm font-extrabold shadow-[0_0_30px_rgba(0,240,255,0.6)] flex items-center gap-3 border border-cyan-300"
        >
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <div className="text-xs uppercase tracking-wider text-cyan-200 font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 animate-spin" /> TIMELINE SECURED
            </div>
            <div className="text-sm font-semibold text-white drop-shadow">
              {message || "You saved the timeline by solving this question!"}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
