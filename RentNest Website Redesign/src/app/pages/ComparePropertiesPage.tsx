import React from "react";
import { CompareTable } from "@/features/property/components/CompareTable";
import { MOCK_PROPERTIES } from "@/features/property/data/mockProperties";

export const ComparePropertiesPage: React.FC = () => {
  const compareItems = MOCK_PROPERTIES.slice(0, 3);

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-foreground">
          Compare Property Specifications
        </h1>
        <p className="text-xs text-muted-foreground">
          Side-by-side comparison of rent prices, room dimensions, ratings, and amenity perks.
        </p>
      </div>

      <CompareTable properties={compareItems} />
    </div>
  );
};
