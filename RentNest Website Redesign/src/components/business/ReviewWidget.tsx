import React from "react";
import { Star } from "lucide-react";
import { Card } from "../ui/Card";

export interface RatingDistribution {
  stars: number;
  count: number;
  percentage: number;
}

interface ReviewWidgetProps {
  averageRating: number;
  totalReviews: number;
  distribution: RatingDistribution[];
}

export const ReviewWidget: React.FC<ReviewWidgetProps> = ({
  averageRating,
  totalReviews,
  distribution,
}) => {
  return (
    <Card variant="default" className="p-6">
      <div className="flex flex-col md:flex-row items-center gap-8">
        <div className="text-center md:border-r border-border/40 md:pr-8">
          <h2 className="font-heading text-5xl font-extrabold text-foreground">{averageRating.toFixed(1)}</h2>
          <div className="mt-2 flex justify-center text-amber-500">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${i < Math.round(averageRating) ? "fill-current" : "text-muted"}`}
              />
            ))}
          </div>
          <span className="mt-1 block text-xs text-muted-foreground">{totalReviews} Global Reviews</span>
        </div>

        <div className="flex-1 w-full space-y-2">
          {distribution.map((d) => (
            <div key={d.stars} className="flex items-center gap-3 text-xs">
              <span className="w-8 text-right font-bold text-foreground">{d.stars} ★</span>
              <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${d.percentage}%` }}
                />
              </div>
              <span className="w-10 text-muted-foreground text-[11px]">{d.count}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
