import React, { useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "./Calendar";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  label?: string;
  selectedDate?: Date;
  onDateChange?: (date: Date) => void;
  error?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  selectedDate,
  onDateChange,
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(selectedDate);

  const handleSelect = (d: Date) => {
    setDate(d);
    setIsOpen(false);
    if (onDateChange) onDateChange(d);
  };

  return (
    <div className="relative w-full space-y-1.5">
      {label && <label className="block text-xs font-semibold text-foreground">{label}</label>}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex w-full items-center justify-between rounded-xl border bg-background/50 py-2.5 px-3.5 text-xs text-foreground focus:outline-none focus:ring-2 transition-all",
          error ? "border-rose-500" : "border-border/60 focus:border-primary focus:ring-primary/20"
        )}
      >
        <span>{date ? date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "Select date..."}</span>
        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-2 shadow-2xl">
          <Calendar selectedDate={date} onDateSelect={handleSelect} />
        </div>
      )}

      {error && <p className="text-[11px] font-medium text-rose-500">{error}</p>}
    </div>
  );
};
