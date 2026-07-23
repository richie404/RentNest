import React, { useState } from "react";
import { Search, SlidersHorizontal, MapPin } from "lucide-react";
import { Button } from "../ui/Button";

export interface FilterValues {
  query: string;
  propertyType: string;
  minPrice: string;
  maxPrice: string;
}

interface SearchFilterProps {
  onSearch: (filters: FilterValues) => void;
  onOpenAdvanced?: () => void;
}

export const SearchFilter: React.FC<SearchFilterProps> = ({ onSearch, onOpenAdvanced }) => {
  const [query, setQuery] = useState("");
  const [propertyType, setPropertyType] = useState("ALL");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ query, propertyType, minPrice, maxPrice });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col lg:flex-row items-center gap-3 rounded-2xl border border-border/60 bg-card p-3 shadow-xl backdrop-blur-xl"
    >
      <div className="relative flex-1 w-full">
        <MapPin className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter city, neighborhood, or ZIP code..."
          className="w-full rounded-xl border border-border/40 bg-background/50 py-2.5 pl-10 pr-4 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="flex w-full lg:w-auto items-center gap-2">
        <select
          value={propertyType}
          onChange={(e) => setPropertyType(e.target.value)}
          className="rounded-xl border border-border/40 bg-background/50 py-2.5 px-3 text-xs text-foreground focus:outline-none"
        >
          <option value="ALL">All Property Types</option>
          <option value="APARTMENT">Apartment</option>
          <option value="CONDO">Condo</option>
          <option value="SINGLE_FAMILY">Single Family House</option>
          <option value="TOWNHOUSE">Townhouse</option>
        </select>

        {onOpenAdvanced && (
          <Button type="button" variant="outline" size="md" onClick={onOpenAdvanced}>
            <SlidersHorizontal className="h-4 w-4 mr-1.5" /> Filters
          </Button>
        )}

        <Button type="submit" variant="primary" size="md" leftIcon={<Search className="h-4 w-4" />}>
          Search
        </Button>
      </div>
    </form>
  );
};
