"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="w-10 h-10" />;

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 bg-white/10 dark:bg-zinc-900/50 backdrop-blur-xl border border-white/20 dark:border-zinc-800 hover:border-blue-500/50 active:scale-95 group relative overflow-hidden"
      aria-label="Toggle theme"
    >
      <motion.div
        initial={false}
        animate={{ rotate: isDark ? 0 : 90, scale: isDark ? 1 : 0, opacity: isDark ? 1 : 0 }}
        transition={{ duration: 0.3, ease: "backOut" }}
        className="absolute"
      >
        <Sun className="w-4 h-4 text-yellow-500 fill-yellow-500/20" />
      </motion.div>
      <motion.div
        initial={false}
        animate={{ rotate: isDark ? -90 : 0, scale: isDark ? 0 : 1, opacity: isDark ? 0 : 1 }}
        transition={{ duration: 0.3, ease: "backOut" }}
        className="absolute"
      >
        <Moon className="w-4 h-4 text-indigo-400 fill-indigo-400/10" />
      </motion.div>
    </button>
  );
}
