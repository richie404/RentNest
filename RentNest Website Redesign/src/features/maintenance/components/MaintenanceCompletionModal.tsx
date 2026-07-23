import React, { useState } from "react";
import { Star, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { showToast } from "@/components/ui/Toast";

interface MaintenanceCompletionModalProps {
  isOpen: boolean;
  ticketId: string;
  onClose: () => void;
  onSubmit: (rating: number, feedback: string) => void;
}

export const MaintenanceCompletionModal: React.FC<MaintenanceCompletionModalProps> = ({
  isOpen,
  ticketId,
  onClose,
  onSubmit,
}) => {
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(rating, feedback);
    showToast.success("Work Order Closed", "Thank you for confirming maintenance resolution.");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-card border border-border/50 p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-border/40 pb-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            <h3 className="font-heading text-base font-bold text-foreground">Confirm Repair Completion</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-foreground block mb-2 text-center">
              Rate Vendor Workmanship Quality & Timeliness
            </label>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`h-7 w-7 ${
                      star <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">Feedback Comments</label>
            <textarea
              rows={3}
              placeholder="e.g. Vendor arrived on time and fixed the disposal cleanly."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full rounded-2xl border border-border/60 bg-background/50 p-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
            <Button variant="outline" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Sign Off & Close Ticket
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
