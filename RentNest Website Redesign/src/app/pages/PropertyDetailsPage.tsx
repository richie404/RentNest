import React, { useState } from "react";
import { useParams } from "react-router";
import { MapPin, Bed, Bath, Square, Calendar, ShieldCheck, DollarSign } from "lucide-react";
import { PropertyGallery } from "@/components/business/PropertyGallery";
import { ScheduleVisitModal } from "@/features/property/components/ScheduleVisitModal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { usePropertyDetailsQuery } from "@/features/property/hooks/useProperties";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

export const PropertyDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const propertyId = Number(id) || 1;
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);

  const { data: property, isLoading } = usePropertyDetailsQuery(propertyId);

  if (isLoading || !property) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Title & Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-foreground">{property.title}</h1>
            {property.isVerified && (
              <Badge variant="success" className="text-[10px]">
                <ShieldCheck className="h-3 w-3 mr-1" /> Verified Listing
              </Badge>
            )}
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            <span>{property.address}, {property.city}, {property.state} {property.zipCode}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div>
            <span className="text-[10px] text-muted-foreground uppercase block">Monthly Rent</span>
            <div className="font-heading text-2xl font-extrabold text-primary">${property.monthlyRent.toLocaleString()}</div>
          </div>
          <Button variant="primary" size="lg" onClick={() => setIsScheduleOpen(true)}>
            Schedule Tour
          </Button>
        </div>
      </div>

      {/* Property Photo Gallery */}
      <PropertyGallery images={property.images} />

      {/* Grid Content Specs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card variant="default" className="p-6">
            <h3 className="font-heading text-lg font-bold text-foreground mb-3">Property Overview</h3>
            <p className="text-xs text-muted-foreground leading-relaxed font-body">{property.description}</p>

            <div className="mt-6 grid grid-cols-3 gap-4 border-t border-border/40 pt-4">
              <div className="flex items-center gap-3">
                <Bed className="h-5 w-5 text-primary" />
                <div>
                  <span className="text-[10px] text-muted-foreground block">Bedrooms</span>
                  <strong className="text-xs text-foreground">{property.bedrooms} Beds</strong>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Bath className="h-5 w-5 text-primary" />
                <div>
                  <span className="text-[10px] text-muted-foreground block">Bathrooms</span>
                  <strong className="text-xs text-foreground">{property.bathrooms} Baths</strong>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Square className="h-5 w-5 text-primary" />
                <div>
                  <span className="text-[10px] text-muted-foreground block">Area</span>
                  <strong className="text-xs text-foreground">{property.squareFeet} sqft</strong>
                </div>
              </div>
            </div>
          </Card>

          <Card variant="default" className="p-6">
            <h3 className="font-heading text-lg font-bold text-foreground mb-3">Amenities & Features</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {property.amenities.map((am, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-foreground bg-muted/40 p-2.5 rounded-xl">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  <span>{am}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar Landlord Info */}
        <div className="space-y-6">
          <Card variant="default" className="p-6">
            <h4 className="font-heading text-sm font-bold text-foreground mb-3">Landlord / Manager</h4>
            <p className="text-xs font-semibold text-foreground">{property.ownerName}</p>
            <p className="text-xs text-muted-foreground">{property.ownerEmail}</p>

            <Button variant="outline" className="w-full mt-4" onClick={() => setIsScheduleOpen(true)}>
              Contact Manager
            </Button>
          </Card>
        </div>
      </div>

      <ScheduleVisitModal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        propertyId={property.id}
        propertyTitle={property.title}
      />
    </div>
  );
};
