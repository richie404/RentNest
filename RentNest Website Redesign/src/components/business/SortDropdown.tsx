import React from "react";
import { ArrowUpDown } from "lucide-react";
import { Select } from "../ui/Select";

interface SortDropdownProps {
  value: string;
  onChange: (sortValue: string) => void;
}

export const SortDropdown: React.FC<SortDropdownProps> = ({ value, onChange }) => {
  const options = [
    { value: "RECOMMENDED", label: "Recommended" },
    { value: "PRICE_ASC", label: "Price: Low to High" },
    { value: "PRICE_DESC", label: "Price: High to Low" },
    { value: "RATING_DESC", label: "Highest Rated" },
    { value: "NEWEST", label: "Newest Listings" },
  ];

  return (
    <div className="flex items-center gap-2">
      <ArrowUpDown className="h-4 w-4 text-muted-foreground shrink-0" />
      <Select
        options={options}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-44 py-2"
      />
    </div>
  );
};
