import React from "react";
import { DollarSign, Check, X, Star } from "lucide-react";
import type { PropertyData } from "../types/property";

interface CompareTableProps {
  properties: PropertyData[];
}

export const CompareTable: React.FC<CompareTableProps> = ({ properties }) => {
  if (properties.length === 0) return null;

  return (
    <div className="overflow-x-auto rounded-3xl border border-border/60 bg-card p-6 shadow-xl">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-border/40">
            <th className="p-3 w-48 font-bold text-muted-foreground uppercase tracking-wider">Features</th>
            {properties.map((p) => (
              <th key={p.id} className="p-3 font-heading font-bold text-foreground text-sm">
                {p.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/30">
          <tr>
            <td className="p-3 font-semibold text-muted-foreground">Monthly Rent</td>
            {properties.map((p) => (
              <td key={p.id} className="p-3 font-heading font-extrabold text-primary text-base">
                ${p.monthlyRent.toLocaleString()} / mo
              </td>
            ))}
          </tr>
          <tr>
            <td className="p-3 font-semibold text-muted-foreground">Bedrooms / Baths</td>
            {properties.map((p) => (
              <td key={p.id} className="p-3 text-foreground font-medium">
                {p.bedrooms} Beds • {p.bathrooms} Baths
              </td>
            ))}
          </tr>
          <tr>
            <td className="p-3 font-semibold text-muted-foreground">Square Feet</td>
            {properties.map((p) => (
              <td key={p.id} className="p-3 text-foreground font-medium">
                {p.squareFeet} sqft
              </td>
            ))}
          </tr>
          <tr>
            <td className="p-3 font-semibold text-muted-foreground">Rating</td>
            {properties.map((p) => (
              <td key={p.id} className="p-3 text-amber-500 font-bold flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-current" /> {p.rating} ({p.reviewCount} reviews)
              </td>
            ))}
          </tr>
          <tr>
            <td className="p-3 font-semibold text-muted-foreground">Pet Friendly</td>
            {properties.map((p) => {
              const isPet = p.amenities.includes("Pet Friendly");
              return (
                <td key={p.id} className="p-3">
                  {isPet ? <Check className="h-4 w-4 text-emerald-500" /> : <X className="h-4 w-4 text-muted-foreground" />}
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>
    </div>
  );
};
