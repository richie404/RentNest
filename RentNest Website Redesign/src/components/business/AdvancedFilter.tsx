import React from "react";
import { Drawer } from "../ui/Drawer";
import { Checkbox } from "../ui/Checkbox";
import { Button } from "../ui/Button";

interface AdvancedFilterProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: () => void;
}

export const AdvancedFilter: React.FC<AdvancedFilterProps> = ({
  isOpen,
  onClose,
  onApply,
}) => {
  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Advanced Filters">
      <div className="space-y-6">
        <div>
          <h4 className="text-xs font-bold text-foreground mb-3">Bedrooms & Bathrooms</h4>
          <div className="flex gap-2">
            {["Any", "1+", "2+", "3+", "4+"].map((bed, i) => (
              <button
                key={i}
                className="flex-1 rounded-xl border border-border/60 py-2 text-xs font-semibold hover:bg-primary/10 hover:border-primary transition-colors"
              >
                {bed}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-xs font-bold text-foreground mb-3">Amenities</h4>
          <div className="space-y-2.5">
            <Checkbox label="Pet Friendly (Dogs & Cats Allowed)" />
            <Checkbox label="In-Unit Washer & Dryer" />
            <Checkbox label="Air Conditioning / HVAC" />
            <Checkbox label="Swimming Pool & Gym Access" />
            <Checkbox label="Covered Garage Parking" />
            <Checkbox label="EV Charging Station" />
          </div>
        </div>

        <div className="pt-4 border-t border-border/40 flex gap-3">
          <Button variant="outline" className="w-1/2" onClick={onClose}>
            Reset
          </Button>
          <Button
            variant="primary"
            className="w-1/2"
            onClick={() => {
              onApply();
              onClose();
            }}
          >
            Apply Filters
          </Button>
        </div>
      </div>
    </Drawer>
  );
};
