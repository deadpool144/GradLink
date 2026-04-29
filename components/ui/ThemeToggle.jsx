"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="w-9 h-9" />;

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative w-14 h-7 rounded-full transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-[rgb(var(--primary-rgb))] focus-visible:outline-offset-2"
      style={{ background: isDark ? "rgb(var(--primary-rgb))" : "var(--surface-3)" }}
      aria-label="Toggle theme"
    >
      {/* Track */}
      <span
        className="absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-sm transition-transform duration-300 flex items-center justify-center text-[13px]"
        style={{ transform: isDark ? "translateX(28px)" : "translateX(0)" }}
      >
        {isDark ? "🌙" : "☀️"}
      </span>
    </button>
  );
}
