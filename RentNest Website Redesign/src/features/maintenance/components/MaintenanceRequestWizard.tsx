import React, { useState } from "react";
import { Wrench, AlertTriangle, Calendar, Clock, Camera, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { showToast } from "@/components/ui/Toast";
import type { TicketCategory, PriorityLevel } from "../types/maintenance";

interface MaintenanceRequestWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export const MaintenanceRequestWizard: React.FC<MaintenanceRequestWizardProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState<TicketCategory>("PLUMBING");
  const [priority, setPriority] = useState<PriorityLevel>("MEDIUM");
  const [issueTitle, setIssueTitle] = useState("");
  const [description, setDescription] = useState("");
  const [permissionToEnter, setPermissionToEnter] = useState(true);
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTimeSlot, setPreferredTimeSlot] = useState("10:00 AM - 12:00 PM");

  if (!isOpen) return null;

  const handleNext = () => {
    if (step === 1 && !category) return;
    if (step === 2 && (!issueTitle.trim() || !description.trim())) {
      showToast.error("Required Fields", "Please enter issue title and detailed description.");
      return;
    }
    if (step < 4) {
      setStep(step + 1);
    } else {
      onSubmit({
        category,
        priority,
        issueTitle,
        description,
        permissionToEnter,
        preferredDate,
        preferredTimeSlot,
      });
      showToast.success("Ticket Submitted", "Your work order request has been dispatched.");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="relative w-full max-w-xl rounded-3xl bg-card border border-border/50 p-6 shadow-2xl space-y-6">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-border/40 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-heading text-lg font-bold text-foreground">Submit Maintenance Ticket</h3>
              <p className="text-xs text-muted-foreground">Step {step} of 4: Work Order Request Wizard</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Step Indicators */}
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all ${
                step >= i ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Step 1: Category & Priority */}
        {step === 1 && (
          <div className="space-y-4">
            <h4 className="font-heading text-sm font-bold text-foreground">Select Issue Category</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {(["PLUMBING", "ELECTRICAL", "HVAC", "APPLIANCE", "GENERAL", "SAFETY"] as TicketCategory[]).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`p-3 rounded-2xl border text-xs font-semibold text-center transition-all ${
                    category === cat
                      ? "border-primary bg-primary/10 text-primary shadow-sm"
                      : "border-border/50 bg-background/50 text-foreground hover:bg-muted/50"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <h4 className="font-heading text-sm font-bold text-foreground pt-2">Urgency Priority Level</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(["LOW", "MEDIUM", "HIGH", "URGENT"] as PriorityLevel[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                    priority === p
                      ? p === "URGENT"
                        ? "border-rose-500 bg-rose-500/10 text-rose-500"
                        : "border-primary bg-primary/10 text-primary"
                      : "border-border/40 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Description */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Issue Summary Title</label>
              <Input
                placeholder="e.g. Garbage Disposal Motor Jammed"
                value={issueTitle}
                onChange={(e) => setIssueTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Detailed Problem Description</label>
              <textarea
                rows={4}
                placeholder="Please describe symptoms, noises, or leak locations..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-2xl border border-border/60 bg-background/50 p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        )}

        {/* Step 3: Media Upload */}
        {step === 3 && (
          <div className="space-y-4 text-center py-4">
            <div className="p-8 border-2 border-dashed border-border/60 rounded-3xl bg-muted/20 flex flex-col items-center justify-center gap-2">
              <Camera className="h-8 w-8 text-primary animate-pulse" />
              <h4 className="font-heading text-xs font-bold text-foreground">Upload Initial Issue Photo / Video</h4>
              <p className="text-[11px] text-muted-foreground max-w-xs">
                Drag and drop photos of the leak or damage to help technicians bring exact replacement parts.
              </p>
              <Button variant="secondary" size="sm" className="mt-2">
                Browse Files
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Scheduling & Review */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Preferred Date</label>
                <Input
                  type="date"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Preferred Time Window</label>
                <select
                  value={preferredTimeSlot}
                  onChange={(e) => setPreferredTimeSlot(e.target.value)}
                  className="w-full rounded-2xl border border-border/60 bg-background/50 py-2.5 px-3 text-xs text-foreground focus:outline-none"
                >
                  <option>08:00 AM - 10:00 AM</option>
                  <option>10:00 AM - 12:00 PM</option>
                  <option>01:00 PM - 03:00 PM</option>
                  <option>03:00 PM - 05:00 PM</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl border border-border/40 bg-muted/30">
              <input
                type="checkbox"
                id="enterAuth"
                checked={permissionToEnter}
                onChange={(e) => setPermissionToEnter(e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
              <label htmlFor="enterAuth" className="text-xs text-foreground font-medium cursor-pointer">
                Permission to enter unit if tenant is not present at appointment time
              </label>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-border/40 pt-4">
          {step > 1 ? (
            <Button variant="outline" size="sm" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          ) : (
            <div />
          )}

          <Button variant="primary" size="sm" onClick={handleNext}>
            {step === 4 ? "Submit Request" : "Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
};
