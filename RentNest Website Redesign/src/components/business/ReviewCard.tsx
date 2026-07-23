import React from "react";
import { Star, CheckCircle } from "lucide-react";
import { Card } from "../ui/Card";
import { Avatar } from "../ui/Avatar";

export interface ReviewCardProps {
  reviewerName: string;
  reviewerAvatar?: string;
  isVerified?: boolean;
  rating: number;
  date: string;
  comment: string;
  propertyName?: string;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
  reviewerName,
  reviewerAvatar,
  isVerified = true,
  rating,
  date,
  comment,
  propertyName,
}) => {
  return (
    <Card variant="default" className="p-5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar src={reviewerAvatar} fallbackInitials={reviewerName[0]} size="md" />
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="font-heading text-xs font-bold text-foreground">{reviewerName}</h4>
              {isVerified && (
                <span className="flex items-center gap-0.5 text-[10px] font-semibold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                  <CheckCircle className="h-3 w-3" /> Verified Renter
                </span>
              )}
            </div>
            {propertyName && <p className="text-[10px] text-muted-foreground">{propertyName}</p>}
          </div>
        </div>

        <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded-lg text-amber-500 text-xs font-bold">
          <Star className="h-3.5 w-3.5 fill-current" />
          <span>{rating.toFixed(1)}</span>
        </div>
      </div>

      <p className="mt-3 text-xs text-muted-foreground leading-relaxed font-body">{comment}</p>
      <span className="mt-3 block text-[10px] text-muted-foreground">{date}</span>
    </Card>
  );
};
