import React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  hint?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, options, error, hint, id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-semibold text-foreground">
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          <select
            id={selectId}
            ref={ref}
            className={cn(
              "w-full appearance-none rounded-xl border bg-background/50 py-2.5 pl-3.5 pr-10 text-xs text-foreground focus:outline-none focus:ring-2 transition-all",
              error
                ? "border-rose-500 focus:ring-rose-500/30"
                : "border-border/60 focus:border-primary focus:ring-primary/20",
              className
            )}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>

          <ChevronDown className="pointer-events-none absolute right-3.5 h-4 w-4 text-muted-foreground" />
        </div>

        {error && <p className="text-[11px] font-medium text-rose-500">{error}</p>}
        {hint && !error && <p className="text-[11px] text-muted-foreground">{hint}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
