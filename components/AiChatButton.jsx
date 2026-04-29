"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, X, Sparkles } from "lucide-react";
import { usePathname } from "next/navigation";
import AiChat from "./AiChat";

// ─── Pulse ring animation ─────────────────────────────────────────────────────
const PulseRing = () => (
  <motion.div
    className="absolute inset-0 rounded-[24px] border-2 border-indigo-500"
    initial={{ opacity: 0.6, scale: 1 }}
    animate={{ opacity: 0, scale: 1.45 }}
    transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
  />
);

const AiChatButton = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [showLabel, setShowLabel] = useState(false);

  // Show label after 2s on first open (nudge)
  useEffect(() => {
    const t = setTimeout(() => setShowLabel(true), 2000);
    return () => clearTimeout(t);
  }, []);

  if (pathname && pathname === "/ai-assistant") return null;

  const handleClick = () => {
    setIsOpen((p) => !p);
    setShowLabel(false);
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {/* Floating label nudge */}
        <AnimatePresence>
          {showLabel && !isOpen && (
            <motion.div
              initial={{ opacity: 0, x: 10, scale: 0.85 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 10, scale: 0.85 }}
              transition={{ type: "spring", damping: 22, stiffness: 300 }}
              className="bg-white dark:bg-[#161b27] border border-slate-200 dark:border-white/[0.08]
                px-4 py-2.5 rounded-2xl shadow-xl
                text-[13px] font-semibold text-slate-700 dark:text-slate-300
                flex items-center gap-2 pointer-events-none"
              style={{ letterSpacing: "-0.02em" }}
            >
              <Sparkles size={13} className="text-indigo-500" />
              Ask Alumni AI
            </motion.div>
          )}
        </AnimatePresence>

        {/* FAB */}
        <div className="relative">
          {/* Pulse rings — only when closed */}
          {!isOpen && <PulseRing />}

          <motion.button
            whileHover={{ scale: 1.07, y: -2 }}
            whileTap={{ scale: 0.93 }}
            onClick={handleClick}
            className={`
              relative w-[60px] h-[60px] rounded-[22px] overflow-hidden
              flex items-center justify-center
              shadow-[0_8px_32px_rgba(0,0,0,0.18)] transition-all duration-300
              ${isOpen
                ? "bg-slate-900 dark:bg-slate-950 shadow-slate-900/40"
                : "bg-indigo-600 shadow-indigo-600/40"
              }
            `}
          >
            {/* Shimmer overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 pointer-events-none" />

            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.div
                  key="close"
                  initial={{ opacity: 0, rotate: -45, scale: 0.6 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 45, scale: 0.6 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                >
                  <X size={24} className="text-white" strokeWidth={2} />
                </motion.div>
              ) : (
                <motion.div
                  key="open"
                  initial={{ opacity: 0, scale: 0.6, rotate: 45 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.6, rotate: -45 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-center justify-center"
                >
                  <GraduationCap size={28} className="text-white" strokeWidth={1.8} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      <AiChat isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default AiChatButton;
