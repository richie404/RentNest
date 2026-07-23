import React, { useState } from "react";
import { X, Wrench, Calendar, UserCheck, ShieldCheck } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import type { MaintenanceTicket } from "../types/maintenance";
import { BeforeAfterGallery } from "./BeforeAfterGallery";
import { MaintenanceTimeline } from "./MaintenanceTimeline";
import { MaintenanceCommentsThread } from "./MaintenanceCommentsThread";
import { MaintenanceInvoiceWidget } from "./MaintenanceInvoiceWidget";

interface MaintenanceTicketDetailDrawerProps {
  ticket?: MaintenanceTicket;
  isOpen: boolean;
  onClose: () => void;
  onAddComment: (text: string) => void;
  onApproveInvoice?: () => void;
  onOpenVendorAssignment?: () => void;
  onOpenCompletion?: () => void;
  userRole?: string;
}

export const MaintenanceTicketDetailDrawer: React.FC<MaintenanceTicketDetailDrawerProps> = ({
  ticket,
  isOpen,
  onClose,
  onAddComment,
  onApproveInvoice,
  onOpenVendorAssignment,
  onOpenCompletion,
  userRole = "ROLE_PROPERTY_OWNER",
}) => {
  const [activeTab, setActiveTab] = useState<"DETAILS" | "MEDIA" | "INVOICE" | "TIMELINE">("DETAILS");

  if (!isOpen || !ticket) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl bg-card border-l border-border/50 h-full flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-border/40 bg-card/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary font-bold text-xs">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading text-base font-bold text-foreground">{ticket.issueTitle}</h3>
                <StatusBadge status={ticket.status} />
              </div>
              <p className="text-xs text-muted-foreground">
                #{ticket.ticketNumber} • {ticket.propertyTitle} ({ticket.unitNumber})
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-border/40 px-6 bg-muted/20 text-xs font-semibold">
          {(["DETAILS", "MEDIA", "INVOICE", "TIMELINE"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-4 border-b-2 transition-all ${
                activeTab === tab
                  ? "border-primary text-primary font-bold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === "DETAILS" && (
            <div className="space-y-6">
              {/* Description */}
              <div className="space-y-1">
                <h4 className="font-heading text-xs font-bold text-foreground">Problem Description</h4>
                <p className="text-xs text-muted-foreground leading-relaxed bg-background/50 p-3 rounded-2xl border border-border/40">
                  {ticket.description}
                </p>
              </div>

              {/* Meta Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-muted/20 p-4 rounded-2xl border border-border/30">
                <div>
                  <span className="text-[10px] text-muted-foreground block">Category</span>
                  <strong className="text-foreground font-semibold">{ticket.category}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block">Priority Level</span>
                  <strong className="text-rose-500 font-semibold">{ticket.priority}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block">Dispatched Vendor</span>
                  <strong className="text-foreground font-semibold">{ticket.vendorName || "Unassigned"}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block">Preferred Date & Slot</span>
                  <strong className="text-foreground font-semibold">
                    {ticket.preferredDate} ({ticket.preferredTimeSlot})
                  </strong>
                </div>
              </div>

              {/* Safety Inspection */}
              {ticket.inspection && (
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-500 flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4" /> Safety Inspection Audit Passed
                    </span>
                    <span className="text-[10px] text-muted-foreground">{ticket.inspection.inspectionDate}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{ticket.inspection.notes}</p>
                </div>
              )}

              {/* Comments Thread */}
              <MaintenanceCommentsThread comments={ticket.comments} onAddComment={onAddComment} />
            </div>
          )}

          {activeTab === "MEDIA" && <BeforeAfterGallery media={ticket.media} />}

          {activeTab === "INVOICE" && (
            <MaintenanceInvoiceWidget
              invoice={ticket.invoice}
              onApproveInvoice={onApproveInvoice}
              userRole={userRole}
            />
          )}

          {activeTab === "TIMELINE" && <MaintenanceTimeline timeline={ticket.timeline} />}
        </div>

        {/* Footer Quick Actions */}
        <div className="p-4 border-t border-border/40 bg-card/60 flex justify-end gap-2">
          {onOpenVendorAssignment && !ticket.vendorName && (
            <Button variant="outline" size="sm" onClick={onOpenVendorAssignment} leftIcon={<UserCheck className="h-3.5 w-3.5" />}>
              Assign Vendor
            </Button>
          )}

          {onOpenCompletion && ticket.status !== "COMPLETED" && (
            <Button variant="primary" size="sm" onClick={onOpenCompletion}>
              Complete Work Order
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
