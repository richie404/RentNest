export interface SearchQueryDTO {
  search?: string;
  city?: string;
  stateProvince?: string;
  postalCode?: string;
  propertyType?: string;
  minRent?: number;
  maxRent?: number;
  minDeposit?: number;
  maxDeposit?: number;
  bedrooms?: number;
  bathrooms?: number;
  minSquareFeet?: number;
  sortBy?: "rent_asc" | "rent_desc" | "newest" | "rating_desc";
  page?: number;
  limit?: number;
}

export interface ComparePropertiesDTO {
  propertyIds: number[];
}
