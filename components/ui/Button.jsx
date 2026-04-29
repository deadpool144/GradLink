import { cn } from "@/lib/utils";

const sizeMap = {
  sm:   "h-8 px-3 text-xs rounded-[10px]",
  md:   "h-9 px-4 text-sm rounded-xl",
  lg:   "h-11 px-6 text-sm rounded-[14px]",
  xl:   "h-12 px-8 text-base rounded-2xl",
  icon: "h-9 w-9 rounded-xl",
};

const variantMap = {
  default:  "bg-[rgb(var(--primary-rgb))] text-white shadow-[var(--shadow-primary)] hover:bg-[rgb(var(--primary-hover))] hover:shadow-[0_6px_20px_rgba(67,56,202,0.38)] hover:-translate-y-px active:translate-y-0",
  secondary:"bg-[var(--surface-2)] text-[var(--text-1)] border border-[var(--border-strong)] hover:bg-[var(--surface-3)]",
  ghost:    "bg-transparent text-[var(--text-2)] hover:bg-[var(--surface-2)] hover:text-[var(--text-1)]",
  danger:   "bg-transparent text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40",
  outline:  "bg-transparent border border-[var(--border-strong)] text-[var(--text-1)] hover:bg-[var(--surface-2)]",
};

export function Button({
  children, variant = "default", size = "md", className = "",
  disabled = false, isLoading = false, ...props
}) {
  return (
    <button
      disabled={disabled || isLoading}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-semibold tracking-tight transition-all duration-150 cursor-pointer select-none whitespace-nowrap",
        "focus-visible:outline-2 focus-visible:outline-[rgb(var(--primary-rgb))] focus-visible:outline-offset-2",
        "disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none",
        variantMap[variant] || variantMap.default,
        sizeMap[size]       || sizeMap.md,
        className
      )}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
