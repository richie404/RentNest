import React from "react";
import { Star, Wrench, CheckCircle2 } from "lucide-react";
import { Card } from "../ui/Card";
import { Avatar } from "../ui/Avatar";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";

export interface VendorCardProps {
  companyName: string;
  specialtyTrade: string;
  rating: number;
  completedJobs: number;
  avatarUrl?: string;
  isVerified?: boolean;
  onAssign?: () => void;
}

export const VendorCard: React.FC<VendorCardProps> = ({
  companyName,
  specialtyTrade,
  rating,
  completedJobs,
  avatarUrl,
  isVerified = true,
  onAssign,
}) => {
  return (
    <Card variant="default" className="p-5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar src={avatarUrl} fallbackInitials={companyName[0]} size="lg" />
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="font-heading text-sm font-bold text-foreground">{companyName}</h4>
              {isVerified && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
            </div>
            <Badge variant="default" className="mt-1 text-[10px]">
              <Wrench className="h-3 w-3 mr-1" />
              {specialtyTrade}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-amber-500/10 px-2.5 py-1 rounded-lg text-amber-500 text-xs font-bold">
          <Star className="h-3.5 w-3.5 fill-current" />
          <span>{rating.toFixed(1)}</span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-3 text-xs">
        <span className="text-muted-foreground">
          Completed Jobs: <strong className="text-foreground">{completedJobs}</strong>
        </span>

        {onAssign && (
          <Button variant="primary" size="sm" onClick={onAssign}>
            Assign Work Order
          </Button>
        )}
      </div>
    </Card>
  );
};
