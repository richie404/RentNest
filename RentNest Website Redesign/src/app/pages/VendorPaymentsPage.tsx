import React from "react";
import { DollarSign, ArrowUpRight, ShieldCheck, CreditCard } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useVendorPaymentsQuery } from "@/features/vendor/hooks/useVendorData";

export const VendorPaymentsPage: React.FC = () => {
  const { data: payments } = useVendorPaymentsQuery();

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-foreground">
          Vendor Payouts & Earnings Ledger
        </h1>
        <p className="text-xs text-muted-foreground">
          Direct deposit disbursements, net payout statements, platform commission breakdown, and tax forms.
        </p>
      </div>

      <div className="space-y-4">
        {payments?.map((pay) => (
          <Card key={pay.id} variant="default" className="p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 font-bold text-xs">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-heading text-sm font-bold text-foreground">Disbursement #{pay.paymentNumber}</h3>
                  <p className="text-xs text-muted-foreground">Method: {pay.method} • Date: {pay.paymentDate}</p>
                </div>
              </div>
              <StatusBadge status="COMPLETED" />
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs bg-muted/20 p-3 rounded-2xl">
              <div>
                <span className="text-[10px] text-muted-foreground block">Gross Billed</span>
                <strong className="text-foreground">${pay.grossAmount}</strong>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground block">Platform Processing Fee</span>
                <strong className="text-rose-500">-${pay.platformFee}</strong>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground block">Net Bank Payout</span>
                <strong className="text-emerald-500 font-bold text-base">${pay.netPayout}</strong>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default VendorPaymentsPage;
