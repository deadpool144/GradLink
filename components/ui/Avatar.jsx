"use client";

import { forwardRef } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const Avatar = forwardRef(({ className, src, alt = "Avatar", fallback, size = "md", ...props }, ref) => {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-xl",
  };

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full font-bold",
        "border-2 border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800",
        sizeClasses[size] || sizeClasses.md,
        className
      )}
      {...props}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 40px"
          className="aspect-square h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary">
          {fallback || alt?.charAt(0)?.toUpperCase() || "U"}
        </div>
      )}
    </div>
  );
});

Avatar.displayName = "Avatar";

export { Avatar };
