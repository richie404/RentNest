export interface CreateBookingDTO {
  unitId: number;
  startDate: string;
  endDate: string;
  monthlyRent: number;
}

export interface CreateApplicationDTO {
  unitId: number;
  desiredMoveInDate: string;
  proposedLeaseMonths?: number;
  declaredOccupantsCount?: number;
}

export interface UpdateApplicationStatusDTO {
  status: "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "WITHDRAWN";
}

export interface TerminateLeaseDTO {
  reason: string;
}
