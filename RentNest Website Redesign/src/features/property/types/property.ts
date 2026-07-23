export type PropertyType = "APARTMENT" | "CONDO" | "SINGLE_FAMILY" | "TOWNHOUSE" | "LUXURY_PENTHOUSE";
export type PropertyStatus = "AVAILABLE" | "PENDING" | "RENTED" | "MAINTENANCE" | "UNDER_REVIEW";

export interface PropertyAmenity {
  id: string;
  name: string;
  category: "INTERIOR" | "EXTERIOR" | "COMMUNITY";
  iconName?: string;
}

export interface PropertyReviewData {
  id: string;
  reviewerName: string;
  reviewerAvatar?: string;
  rating: number;
  date: string;
  comment: string;
  isVerified: boolean;
}

export interface PropertyData {
  id: number;
  title: string;
  tagline: string;
  description: string;
  propertyType: PropertyType;
  status: PropertyStatus;
  monthlyRent: number;
  securityDeposit: number;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  isVerified: boolean;
  isFeatured: boolean;
  rating: number;
  reviewCount: number;
  heroImage: string;
  images: string[];
  amenities: string[];
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  availableDate: string;
  createdAt: string;
}

export interface VisitSchedulePayload {
  propertyId: number;
  visitDate: string;
  visitTime: string;
  visitorName: string;
  visitorEmail: string;
  visitorPhone: string;
  notes?: string;
}

export interface PropertyAnalyticsData {
  propertyId: number;
  totalViews: number;
  totalInquiries: number;
  applicationsSubmitted: number;
  occupancyRate: number;
  monthlyRevenue: { month: string; value: number }[];
}
