export interface CreateMaintenanceRequestDTO {
  unitId: number;
  issueCategory: string;
  priorityLevel?: "LOW" | "MEDIUM" | "HIGH" | "EMERGENCY";
  permissionToEnter?: boolean;
  description: string;
}

export interface AssignVendorDTO {
  vendorId: number;
}

export interface UpdateMaintenanceStatusDTO {
  status: "OPEN" | "ASSIGNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  note?: string;
}
