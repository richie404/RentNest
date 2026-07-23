import React from "react";
import { cn } from "@/lib/utils";

interface SkeletonLoaderProps {
  className?: string;
  variant?: "text" | "rectangular" | "circular" | "card";
  count?: number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  className,
  variant = "text",
  count = 1,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "circular":
        return "rounded-full h-10 w-10";
      case "rectangular":
        return "rounded-xl h-24 w-full";
      case "card":
        return "rounded-2xl h-64 w-full";
      default:
        return "rounded-md h-4 w-full";
    }
  };

  const items = Array.from({ length: count });

  return (
    <div className="space-y-2">
      {items.map((_, index) => (
        <div
          key={index}
          className={cn(
            "animate-pulse bg-muted/60 dark:bg-muted/40",
            getVariantStyles(),
            className
          )}
        />
      ))}
    </div>
  );
};
