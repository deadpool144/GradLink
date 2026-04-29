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
  const [showNotice, setShowNotice] = useState(true);

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
      <div className="fixed bottom-24 right-10 z-50 flex flex-col items-end gap-3">
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

      {/* Static Floating Notification for Testing Phase */}
      <AnimatePresence>
        {showNotice && pathname === "/" && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[60] w-full max-w-[400px] px-4"
          >
            <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-white/10 p-4 rounded-3xl shadow-2xl relative">
              <button
                onClick={() => setShowNotice(false)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shadow-md transition-all duration-200"
              >
                <X size={12} />
              </button>
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 rounded-full bg-amber-500 mt-1.5 animate-pulse shrink-0 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                <div className="space-y-1">
                  <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300 font-medium">
                    <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[10px] letter-spacing-medium bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 rounded-md mr-1.5">Testing Phase</span>
                    This platform uses a locally hosted AI model, so responses may be slower than usual.
                    Please avoid excessive or repeated requests to ensure smooth performance for all users.
                    The app is hosted on a free Render server, so the first request may take around 40–60 seconds due to cold start.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AiChat isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default AiChatButton;
