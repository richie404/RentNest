import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-foreground">
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 text-muted-foreground pointer-events-none">
              {leftIcon}
            </div>
          )}

          <input
            id={inputId}
            ref={ref}
            className={cn(
              "w-full rounded-xl border bg-background/50 py-2.5 px-3.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all",
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              error
                ? "border-rose-500 focus:ring-rose-500/30 text-rose-500"
                : "border-border/60 focus:border-primary focus:ring-primary/20",
              className
            )}
            aria-invalid={!!error}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3.5 text-muted-foreground">
              {rightIcon}
            </div>
          )}
        </div>

        {error && <p className="text-[11px] font-medium text-rose-500">{error}</p>}
        {hint && !error && <p className="text-[11px] text-muted-foreground">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
