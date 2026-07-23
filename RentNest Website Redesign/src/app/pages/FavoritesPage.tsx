import React from "react";
import { PropertyCatalogCard } from "@/components/ui/PropertyCatalogCard";
import { MOCK_PROPERTIES } from "@/features/property/data/mockProperties";
import { EmptyState } from "@/components/ui/EmptyState";

export const FavoritesPage: React.FC = () => {
  const favorites = MOCK_PROPERTIES.slice(0, 2);

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-foreground">
          My Saved Properties
        </h1>
        <p className="text-xs text-muted-foreground">
          Wishlisted homes and apartments saved for easy access and tour scheduling.
        </p>
      </div>

      {favorites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((prop) => (
            <PropertyCatalogCard
              key={prop.id}
              id={prop.id}
              title={prop.title}
              propertyType={prop.propertyType}
              monthlyRent={prop.monthlyRent}
              bedrooms={prop.bedrooms}
              bathrooms={prop.bathrooms}
              squareFeet={prop.squareFeet}
              address={`${prop.city}, ${prop.state}`}
              images={prop.images}
              rating={prop.rating}
              reviewCount={prop.reviewCount}
              isVerified={prop.isVerified}
            />
          ))}
        </div>
      ) : (
        <EmptyState title="No Saved Favorites" description="You have not saved any property listings yet." />
      )}
    </div>
  );
};
