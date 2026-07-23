import React, { useState } from "react";
import { Stepper, type StepItem } from "../ui/Stepper";
import { Button } from "../ui/Button";

interface WizardStep {
  title: string;
  subtitle?: string;
  content: React.ReactNode;
}

interface WizardProps {
  steps: WizardStep[];
  onComplete: () => void;
}

export const Wizard: React.FC<WizardProps> = ({ steps, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);

  const stepItems: StepItem[] = steps.map((s, idx) => ({
    number: idx + 1,
    title: s.title,
    subtitle: s.subtitle,
  }));

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep((prev) => prev + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div className="space-y-6 rounded-3xl border border-border/60 bg-card p-8 shadow-xl">
      <Stepper steps={stepItems} currentStep={currentStep} />

      <div className="py-4">{steps[currentStep - 1].content}</div>

      <div className="flex items-center justify-between border-t border-border/40 pt-4">
        <Button variant="outline" onClick={handleBack} disabled={currentStep === 1}>
          Previous Step
        </Button>

        <Button variant="primary" onClick={handleNext}>
          {currentStep === steps.length ? "Submit & Finish" : "Next Step"}
        </Button>
      </div>
    </div>
  );
};
