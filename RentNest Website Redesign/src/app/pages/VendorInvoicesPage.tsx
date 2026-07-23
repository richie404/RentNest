import React, { useState } from "react";
import { Plus, FileText, DollarSign, Calendar } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Input } from "@/components/ui/Input";
import { useVendorInvoicesQuery, useCreateInvoiceMutation } from "@/features/vendor/hooks/useVendorData";
import { showToast } from "@/components/ui/Toast";

export const VendorInvoicesPage: React.FC = () => {
  const { data: invoices } = useVendorInvoicesQuery();
  const createInvoiceMutation = useCreateInvoiceMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [workOrderId, setWorkOrderId] = useState("TKT-804");
  const [propertyTitle, setPropertyTitle] = useState("Grand Horizon Luxury Penthouse");
  const [amountBilled, setAmountBilled] = useState(330);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createInvoiceMutation.mutate(
      {
        invoiceNumber: `VINV-${Math.floor(1000 + Math.random() * 9000)}`,
        workOrderId,
        propertyTitle,
        amountBilled: Number(amountBilled),
        taxAmount: Number(amountBilled) * 0.08,
        totalAmount: Number(amountBilled) * 1.08,
        status: "PENDING",
      },
      {
        onSuccess: () => {
          showToast.success("Invoice Submitted", "Sent to property owner for authorization.");
          setIsModalOpen(false);
        },
      }
    );
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-foreground">
            Vendor Billing & Invoices
          </h1>
          <p className="text-xs text-muted-foreground">
            Issue itemized service invoices, track owner payouts authorization, and review tax totals.
          </p>
        </div>

        <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setIsModalOpen(true)}>
          Create Invoice
        </Button>
      </div>

      <div className="space-y-4">
        {invoices?.map((inv) => (
          <Card key={inv.id} variant="default" className="p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary font-bold text-xs">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-heading text-sm font-bold text-foreground">Invoice #{inv.invoiceNumber}</h3>
                  <p className="text-xs text-muted-foreground">
                    Work Order: {inv.workOrderId} • {inv.propertyTitle}
                  </p>
                </div>
              </div>
              <StatusBadge status={inv.status === "APPROVED" ? "COMPLETED" : inv.status} />
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-primary" /> Submitted on {inv.submittedDate}
              </span>
              <div className="text-right">
                <span className="text-[10px] text-muted-foreground block">Total Billed</span>
                <strong className="text-base font-extrabold text-primary">${inv.totalAmount || inv.amountBilled}</strong>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-card border border-border/50 p-6 shadow-2xl space-y-4">
            <h3 className="font-heading text-base font-bold text-foreground">Issue Work Order Invoice</h3>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Work Order Ticket Ref</label>
                <Input value={workOrderId} onChange={(e) => setWorkOrderId(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Property Title</label>
                <Input value={propertyTitle} onChange={(e) => setPropertyTitle(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Labor & Materials Amount ($)</label>
                <Input type="number" value={amountBilled} onChange={(e) => setAmountBilled(Number(e.target.value))} />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border/40">
                <Button variant="outline" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Submit Invoice
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorInvoicesPage;
