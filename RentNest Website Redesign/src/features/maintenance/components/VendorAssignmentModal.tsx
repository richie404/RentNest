import React, { useState } from "react";
import { UserCheck, Star, Clock, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { showToast } from "@/components/ui/Toast";

interface VendorOption {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  hourlyRate: number;
  slaArrival: string;
  phone: string;
}

const vendorList: VendorOption[] = [
  { id: "v1", name: "Apex Plumbing & Climate", specialty: "Plumbing & HVAC", rating: 4.9, hourlyRate: 95, slaArrival: "Within 2 Hours", phone: "+1 (555) 432-8800" },
  { id: "v2", name: "VoltCraft Electrical Ltd.", specialty: "Electrical & Wiring", rating: 4.8, hourlyRate: 110, slaArrival: "Within 4 Hours", phone: "+1 (555) 992-1144" },
  { id: "v3", name: "Master Craft Appliances", specialty: "General & Appliances", rating: 4.7, hourlyRate: 85, slaArrival: "Same Day", phone: "+1 (555) 334-9988" },
];

interface VendorAssignmentModalProps {
  isOpen: boolean;
  ticketId: string;
  onClose: () => void;
  onAssign: (vendorName: string, vendorPhone: string) => void;
}

export const VendorAssignmentModal: React.FC<VendorAssignmentModalProps> = ({
  isOpen,
  ticketId,
  onClose,
  onAssign,
}) => {
  const [selectedVendor, setSelectedVendor] = useState<VendorOption>(vendorList[0]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onAssign(selectedVendor.name, selectedVendor.phone);
    showToast.success("Vendor Dispatched", `Assigned ${selectedVendor.name} to ticket.`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-card border border-border/50 p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-border/40 pb-3">
          <div className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-primary" />
            <h3 className="font-heading text-base font-bold text-foreground">Dispatch Qualified Vendor</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3">
          {vendorList.map((v) => (
            <div
              key={v.id}
              onClick={() => setSelectedVendor(v)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                selectedVendor.id === v.id
                  ? "border-primary bg-primary/10 shadow-sm"
                  : "border-border/40 bg-background/50 hover:bg-muted/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-heading text-xs font-bold text-foreground">{v.name}</h4>
                  <p className="text-[10px] text-muted-foreground">{v.specialty}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-primary">${v.hourlyRate}/hr</span>
                  <div className="flex items-center gap-1 text-[10px] text-amber-500 mt-0.5">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {v.rating}
                  </div>
                </div>
              </div>

              <div className="mt-2 pt-2 border-t border-border/20 flex items-center gap-2 text-[10px] text-muted-foreground">
                <Clock className="h-3 w-3 text-emerald-500" />
                <span>SLA Response: {v.slaArrival}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleConfirm}>
            Confirm Dispatch
          </Button>
        </div>
      </div>
    </div>
  );
};
