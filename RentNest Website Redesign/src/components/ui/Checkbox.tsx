import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, id, checked, ...props }, ref) => {
    const checkboxId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="flex items-start gap-3">
        <div className="relative flex items-center pt-0.5">
          <input
            id={checkboxId}
            type="checkbox"
            ref={ref}
            checked={checked}
            className={cn(
              "peer h-4 w-4 shrink-0 rounded border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 checked:bg-primary checked:border-primary transition-all cursor-pointer",
              className
            )}
            {...props}
          />
          <Check className="pointer-events-none absolute left-0.5 top-1 h-3 w-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
        </div>

        {(label || description) && (
          <label htmlFor={checkboxId} className="cursor-pointer text-xs">
            {label && <span className="font-medium text-foreground">{label}</span>}
            {description && <p className="text-[11px] text-muted-foreground">{description}</p>}
          </label>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
