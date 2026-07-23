import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StepItem {
  number: number;
  title: string;
  subtitle?: string;
}

interface StepperProps {
  steps: StepItem[];
  currentStep: number;
  className?: string;
}

export const Stepper: React.FC<StepperProps> = ({ steps, currentStep, className }) => {
  return (
    <div className={cn("flex items-center justify-between w-full", className)}>
      {steps.map((step, index) => {
        const isCompleted = step.number < currentStep;
        const isCurrent = step.number === currentStep;

        return (
          <React.Fragment key={step.number}>
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-bold text-xs transition-all",
                  isCompleted && "bg-emerald-500 text-white shadow-md shadow-emerald-500/20",
                  isCurrent && "bg-primary text-white shadow-md shadow-primary/25 ring-4 ring-primary/20",
                  !isCompleted && !isCurrent && "bg-muted text-muted-foreground"
                )}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : step.number}
              </div>

              <div className="hidden sm:block">
                <h5 className="text-xs font-bold text-foreground">{step.title}</h5>
                {step.subtitle && (
                  <p className="text-[10px] text-muted-foreground">{step.subtitle}</p>
                )}
              </div>
            </div>

            {index < steps.length - 1 && (
              <div
                className={cn(
                  "h-0.5 flex-1 mx-4 rounded-full transition-colors",
                  step.number < currentStep ? "bg-emerald-500" : "bg-border/60"
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
