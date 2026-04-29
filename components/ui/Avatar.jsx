"use client";

import { forwardRef } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const sizeMap = {
  xs: "w-6 h-6 text-[9px]",
  sm: "w-8 h-8 text-[10px]",
  md: "w-9 h-9 text-xs",
  lg: "w-11 h-11 text-sm",
  xl: "w-14 h-14 text-base",
};

const Avatar = forwardRef(function Avatar({ className, src, alt = "Avatar", fallback, size = "md", ...props }, ref) {
  const initials = fallback || alt?.charAt(0)?.toUpperCase() || "U";

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full font-semibold",
        "bg-[var(--surface-2)] border border-[var(--border)]",
        sizeMap[size] || sizeMap.md,
        className
      )}
      {...props}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="40px"
          className="object-cover w-full h-full"
        />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center font-bold"
          style={{ background: "var(--primary-alpha)", color: "rgb(var(--primary-rgb))" }}
        >
          {initials}
        </div>
      )}
    </div>
  );
});

Avatar.displayName = "Avatar";
export { Avatar };
