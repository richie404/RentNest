export interface CreatePropertyDTO {
  propertyName: string;
  propertyType: "APARTMENT" | "SINGLE_FAMILY" | "MULTI_FAMILY" | "CONDO" | "COMMERCIAL";
  streetAddress: string;
  city: string;
  stateProvince: string;
  postalCode: string;
  country?: string;
  // Primary unit details (for initial property + unit creation via sp_CreateProperty)
  unitNumber: string;
  bedrooms: number;
  bathrooms: number;
  targetRent: number;
  deposit: number;
  squareFeet?: number;
}

export interface UpdatePropertyDTO {
  propertyName?: string;
  propertyType?: "APARTMENT" | "SINGLE_FAMILY" | "MULTI_FAMILY" | "CONDO" | "COMMERCIAL";
  streetAddress?: string;
  city?: string;
  stateProvince?: string;
  postalCode?: string;
  country?: string;
}

export interface CreateUnitDTO {
  unitNumber: string;
  bedrooms: number;
  bathrooms: number;
  squareFeet?: number;
  targetRent: number;
  securityDepositTarget: number;
  status?: "VACANT" | "OCCUPIED" | "UNDER_MAINTENANCE" | "RESERVED";
}

export interface UpdateUnitDTO {
  unitNumber?: string;
  bedrooms?: number;
  bathrooms?: number;
  squareFeet?: number;
  targetRent?: number;
  securityDepositTarget?: number;
  status?: "VACANT" | "OCCUPIED" | "UNDER_MAINTENANCE" | "RESERVED";
}

export interface PropertyFilterOptions {
  page?: number;
  limit?: number;
  city?: string;
  stateProvince?: string;
  propertyType?: string;
  minRent?: number;
  maxRent?: number;
  bedrooms?: number;
  bathrooms?: number;
  status?: string;
  search?: string;
  sortBy?: "rent_asc" | "rent_desc" | "newest" | "rating";
  amenityIds?: number[];
}

export interface SubmitReviewDTO {
  leaseId: number;
  revieweeUserId: number;
  rating: number;
  reviewText: string;
}
