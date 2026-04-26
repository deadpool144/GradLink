"use client";

import { forwardRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const variantStyles = {
  primary: "bg-primary text-white hover:brightness-110 shadow-sm shadow-primary/20",
  secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700",
  ghost: "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300",
  danger: "bg-red-500 text-white hover:bg-red-600 shadow-sm shadow-red-500/20",
};

const sizeStyles = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 py-2",
  lg: "h-12 px-6 text-lg",
  icon: "h-10 w-10 p-2",
};

const Button = forwardRef(({ 
  className, 
  variant = "primary", 
  size = "md", 
  asMotion = true,
  isLoading,
  children,
  ...props 
}, ref) => {
  const Comp = asMotion ? motion.button : "button";
  
  const baseClasses = cn(
    "inline-flex items-center justify-center rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50",
    variantStyles[variant],
    sizeStyles[size],
    className
  );

  return (
    <Comp
      ref={ref}
      className={baseClasses}
      whileTap={asMotion && !isLoading && !props.disabled ? { scale: 0.95 } : undefined}
      {...props}
    >
      {isLoading ? (
        <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : null}
      {children}
    </Comp>
  );
});

Button.displayName = "Button";

export { Button };
