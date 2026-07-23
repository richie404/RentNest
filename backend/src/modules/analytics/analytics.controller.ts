import { Request, Response } from "express";
import { AnalyticsService } from "./analytics.service";
import { ApiResponse } from "../../utils/response-formatter";

export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  public getAdminExecutiveSummary = async (_req: Request, res: Response): Promise<Response> => {
    const summary = await this.analyticsService.getAdminExecutiveSummary();
    return ApiResponse.success(res, summary, "Admin executive summary retrieved successfully.");
  };

  public getOccupancyAnalytics = async (_req: Request, res: Response): Promise<Response> => {
    const metrics = await this.analyticsService.getOccupancyAnalytics();
    return ApiResponse.success(res, metrics, "Occupancy analytics retrieved successfully.");
  };

  public getRevenueTrends = async (_req: Request, res: Response): Promise<Response> => {
    const trends = await this.analyticsService.getRevenueTrends();
    return ApiResponse.success(res, trends, "Revenue trend analytics retrieved successfully.");
  };

  public getMaintenanceAnalytics = async (_req: Request, res: Response): Promise<Response> => {
    const analytics = await this.analyticsService.getMaintenanceAnalytics();
    return ApiResponse.success(res, analytics, "Maintenance analytics retrieved successfully.");
  };

  public exportReport = async (req: Request, res: Response): Promise<Response> => {
    const format = req.query.format as "CSV" | "EXCEL" | "PDF";
    const reportType = req.query.reportType as "REVENUE" | "OCCUPANCY" | "MAINTENANCE";

    const exportData = await this.analyticsService.exportReport(format, reportType);
    return ApiResponse.success(res, exportData, `Report exported successfully in ${format} format.`);
  };
}
