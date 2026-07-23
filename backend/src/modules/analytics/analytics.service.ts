import { AnalyticsRepository } from "../../repositories/analytics.repository";

export class AnalyticsService {
  private cache: Map<string, { timestamp: number; data: any }> = new Map();
  private CACHE_TTL_MS = 60 * 1000; // 60 seconds TTL

  constructor(private analyticsRepository: AnalyticsRepository) {}

  public async getAdminExecutiveSummary(): Promise<any> {
    const cacheKey = "admin_executive_summary";
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL_MS) {
      return cached.data;
    }

    const data = await this.analyticsRepository.getAdminExecutiveSummary();
    this.cache.set(cacheKey, { timestamp: Date.now(), data });
    return data;
  }

  public async getOccupancyAnalytics(): Promise<any> {
    const cacheKey = "occupancy_analytics";
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL_MS) {
      return cached.data;
    }

    const data = await this.analyticsRepository.getOccupancyAnalytics();
    this.cache.set(cacheKey, { timestamp: Date.now(), data });
    return data;
  }

  public async getRevenueTrends(): Promise<any[]> {
    return this.analyticsRepository.getRevenueTrends();
  }

  public async getMaintenanceAnalytics(): Promise<any> {
    return this.analyticsRepository.getMaintenanceAnalytics();
  }

  public async exportReport(format: "CSV" | "EXCEL" | "PDF", reportType: "REVENUE" | "OCCUPANCY" | "MAINTENANCE"): Promise<{ downloadUrl: string; format: string }> {
    // Return structured report export payload
    return {
      downloadUrl: `https://exports.rentnest.com/reports/${reportType.toLowerCase()}_${Date.now()}.${format.toLowerCase()}`,
      format,
    };
  }
}
