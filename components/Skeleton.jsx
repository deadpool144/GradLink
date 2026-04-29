"use client";

const Skeleton = ({ className = "", variant = "rect", width, height }) => {
  const baseStyles = "bg-slate-200 dark:bg-slate-800 animate-pulse";
  const variantStyles = {
    rect: "rounded-lg",
    circle: "rounded-full",
    text: "rounded-md h-4 w-full",
  };

  const style = {
    width: width ? (typeof width === "number" ? `${width}px` : width) : undefined,
    height: height ? (typeof height === "number" ? `${height}px` : height) : undefined,
  };

  return (
    <div 
      className={`${baseStyles} ${variantStyles[variant] || variantStyles.rect} ${className}`}
      style={style}
    />
  );
};

export default Skeleton;
