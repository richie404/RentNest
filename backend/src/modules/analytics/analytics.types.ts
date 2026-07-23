export interface ExportQueryDTO {
  format: "CSV" | "EXCEL" | "PDF";
  reportType: "REVENUE" | "OCCUPANCY" | "MAINTENANCE";
}
