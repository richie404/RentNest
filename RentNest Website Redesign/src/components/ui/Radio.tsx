import React from "react";
import { cn } from "@/lib/utils";

export interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, description, id, ...props }, ref) => {
    const radioId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="flex items-start gap-3">
        <input
          id={radioId}
          type="radio"
          ref={ref}
          className={cn(
            "h-4 w-4 shrink-0 border-border text-primary focus:ring-primary/20 cursor-pointer accent-primary",
            className
          )}
          {...props}
        />

        {(label || description) && (
          <label htmlFor={radioId} className="cursor-pointer text-xs">
            {label && <span className="font-medium text-foreground">{label}</span>}
            {description && <p className="text-[11px] text-muted-foreground">{description}</p>}
          </label>
        )}
      </div>
    );
  }
);

Radio.displayName = "Radio";
