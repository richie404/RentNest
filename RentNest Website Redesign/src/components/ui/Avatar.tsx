import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallbackInitials?: string;
  size?: "sm" | "md" | "lg" | "xl";
  status?: "online" | "offline" | "busy";
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = "User Avatar",
  fallbackInitials = "RN",
  size = "md",
  status,
  className,
  ...props
}) => {
  const [imageError, setImageError] = useState(false);

  const sizeStyles = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
    xl: "h-16 w-16 text-lg",
  };

  const statusColorMap = {
    online: "bg-emerald-500",
    offline: "bg-muted-foreground",
    busy: "bg-rose-500",
  };

  return (
    <div className="relative inline-block" {...props}>
      <div
        className={cn(
          "relative flex shrink-0 overflow-hidden rounded-full border border-border/60 bg-muted font-bold text-foreground shadow-sm",
          sizeStyles[size],
          className
        )}
      >
        {src && !imageError ? (
          <img
            src={src}
            alt={alt}
            onError={() => setImageError(true)}
            className="aspect-square h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-primary/20 text-primary font-heading">
            {fallbackInitials.toUpperCase()}
          </div>
        )}
      </div>

      {status && (
        <span
          className={cn(
            "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ring-1 ring-background",
            statusColorMap[status]
          )}
        />
      )}
    </div>
  );
};
