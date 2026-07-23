import React, { useState } from "react";
import { Heart, Bed, Bath, Square, MapPin, CheckCircle2 } from "lucide-react";
import { cn, formatCurrency } from "../../lib/utils";

export interface PropertyData {
  id: number;
  title: string;
  address: string;
  city: string;
  monthlyRent: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  imageUrl: string;
  isVerifiedLandlord?: boolean;
  propertyType?: string;
}

interface PropertyCatalogCardProps {
  property: PropertyData;
  isFavorite?: boolean;
  onFavoriteToggle?: (id: number) => void;
  onCardClick?: (id: number) => void;
  className?: string;
}

export const PropertyCatalogCard: React.FC<PropertyCatalogCardProps> = ({
  property,
  isFavorite = false,
  onFavoriteToggle,
  onCardClick,
  className,
}) => {
  const [favorite, setFavorite] = useState(isFavorite);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorite(!favorite);
    if (onFavoriteToggle) {
      onFavoriteToggle(property.id);
    }
  };

  return (
    <div
      onClick={() => onCardClick && onCardClick(property.id)}
      className={cn(
        "group cursor-pointer overflow-hidden rounded-2xl border border-border/50 bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl",
        className
      )}
      role="article"
      aria-label={`Property listing: ${property.title}`}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        <img
          src={property.imageUrl}
          alt={property.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Favorite Heart Trigger */}
        <button
          onClick={handleFavoriteClick}
          aria-label={favorite ? "Remove from saved favorites" : "Save to favorites"}
          className={cn(
            "absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md transition-transform duration-200 active:scale-90",
            favorite
              ? "bg-rose-500 text-white shadow-md"
              : "bg-background/70 text-foreground hover:bg-background"
          )}
        >
          <Heart className={cn("h-4 w-4", favorite && "fill-current")} />
        </button>

        {/* Price Tag Overlay */}
        <div className="absolute bottom-3 left-3 rounded-xl bg-background/90 px-3 py-1.5 backdrop-blur-md shadow-sm">
          <span className="font-mono text-base font-bold text-foreground">
            {formatCurrency(property.monthlyRent)}
          </span>
          <span className="text-xs text-muted-foreground"> / month</span>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
          <span className="truncate">{property.address}, {property.city}</span>
        </div>

        <div className="mt-1.5 flex items-center justify-between">
          <h3 className="font-heading text-lg font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors">
            {property.title}
          </h3>
          {property.isVerifiedLandlord && (
            <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400" title="Verified Landlord">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Bed className="h-4 w-4 text-foreground/70" />
            <span>{property.bedrooms} Beds</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="h-4 w-4 text-foreground/70" />
            <span>{property.bathrooms} Baths</span>
          </div>
          <div className="flex items-center gap-1">
            <Square className="h-4 w-4 text-foreground/70" />
            <span>{property.sqft} sqft</span>
          </div>
        </div>
      </div>
    </div>
  );
};
