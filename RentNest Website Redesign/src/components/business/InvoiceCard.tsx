import React from "react";
import { FileText, Download, Calendar, DollarSign } from "lucide-react";
import { Card } from "../ui/Card";
import { StatusBadge } from "../ui/StatusBadge";
import { Button } from "../ui/Button";

export interface InvoiceCardProps {
  invoiceNumber: string;
  amount: number;
  dueDate: string;
  status: "COMPLETED" | "PENDING" | "REJECTED";
  propertyTitle: string;
  onDownload?: () => void;
}

export const InvoiceCard: React.FC<InvoiceCardProps> = ({
  invoiceNumber,
  amount,
  dueDate,
  status,
  propertyTitle,
  onDownload,
}) => {
  return (
    <Card variant="default" className="p-5">
      <div className="flex items-center justify-between border-b border-border/40 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FileText className="h-4 w-4" />
          </div>
          <div>
            <h4 className="font-heading text-xs font-bold text-foreground">{invoiceNumber}</h4>
            <p className="text-[10px] text-muted-foreground">{propertyTitle}</p>
          </div>
        </div>

        <StatusBadge status={status === "COMPLETED" ? "APPROVED" : status} />
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-muted-foreground block">Amount Due</span>
          <div className="flex items-center font-heading text-lg font-extrabold text-foreground">
            <DollarSign className="h-4 w-4 text-emerald-500" />
            <span>{amount.toLocaleString()}</span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-muted-foreground block">Due Date</span>
          <div className="flex items-center gap-1 text-xs text-foreground font-semibold">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            <span>{dueDate}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-border/30 flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={onDownload}
          leftIcon={<Download className="h-3.5 w-3.5" />}
        >
          Download Receipt PDF
        </Button>
      </div>
    </Card>
  );
};
