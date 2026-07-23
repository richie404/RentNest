import React, { useState } from "react";
import { SearchFilter, type FilterValues } from "@/components/business/SearchFilter";
import { AdvancedFilter } from "@/components/business/AdvancedFilter";
import { SortDropdown } from "@/components/business/SortDropdown";
import { PropertyCatalogCard } from "@/components/ui/PropertyCatalogCard";
import { SkeletonLoader } from "@/components/common/SkeletonLoader";
import { usePropertyListQuery } from "@/features/property/hooks/useProperties";

export const BrowsePage: React.FC = () => {
  const [filters, setFilters] = useState<FilterValues>({ query: "", propertyType: "ALL", minPrice: "", maxPrice: "" });
  const [sort, setSort] = useState("RECOMMENDED");
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const { data: properties, isLoading } = usePropertyListQuery({
    query: filters.query,
    type: filters.propertyType,
  });

  return (
    <div className="space-y-8 pb-12">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h1 className="font-heading text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
          Discover Premium Property Rentals
        </h1>
        <p className="text-xs text-muted-foreground">
          Filter verified apartments, villas, and condos matching your luxury lifestyle requirements.
        </p>
      </div>

      <SearchFilter
        onSearch={(f) => setFilters(f)}
        onOpenAdvanced={() => setIsAdvancedOpen(true)}
      />

      <div className="flex items-center justify-between border-b border-border/40 pb-4">
        <span className="text-xs font-bold text-foreground">
          Showing <span className="text-primary">{properties?.length || 0}</span> Available Properties
        </span>
        <SortDropdown value={sort} onChange={setSort} />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonLoader variant="card" count={3} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties?.map((prop) => (
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
      )}

      <AdvancedFilter
        isOpen={isAdvancedOpen}
        onClose={() => setIsAdvancedOpen(false)}
        onApply={() => {}}
      />
    </div>
  );
};
