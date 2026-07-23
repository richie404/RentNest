import React from "react";
import { ReviewWidget } from "@/components/business/ReviewWidget";
import { ReviewCard } from "@/components/business/ReviewCard";

export const PropertyReviewsPage: React.FC = () => {
  const distribution = [
    { stars: 5, count: 28, percentage: 74 },
    { stars: 4, count: 7, percentage: 18 },
    { stars: 3, count: 2, percentage: 5 },
    { stars: 2, count: 1, percentage: 3 },
    { stars: 1, count: 0, percentage: 0 },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-foreground">
          Tenant Reviews & Ratings
        </h1>
        <p className="text-xs text-muted-foreground">
          Verified tenant ratings and community feedback for Grand Horizon Luxury Penthouse.
        </p>
      </div>

      <ReviewWidget averageRating={4.9} totalReviews={38} distribution={distribution} />

      <div className="space-y-4 pt-4">
        <ReviewCard
          reviewerName="Marcus Sterling"
          isVerified
          rating={5}
          date="July 12, 2026"
          comment="The panoramic glass skyline view is unbelievable! Management responds to maintenance within 2 hours. Couldn't ask for a better penthouse."
        />
        <ReviewCard
          reviewerName="Elena Rostova"
          isVerified
          rating={4.8}
          date="June 28, 2026"
          comment="Fantastic building amenities including the 24/7 concierge and underground garage parking."
        />
      </div>
    </div>
  );
};
