import { DiscoveryRepository } from "../../repositories/discovery.repository";
import { AuditLogRepository } from "../../repositories/audit-log.repository";
import { SearchQueryDTO } from "./discovery.types";

export class DiscoveryService {
  constructor(
    private discoveryRepository: DiscoveryRepository,
    private auditLogRepository: AuditLogRepository
  ) {}

  public async search(options: SearchQueryDTO, userId?: number): Promise<{ data: any[]; meta: any }> {
    const { data, total } = await this.discoveryRepository.advancedSearch(options);
    const page = options.page || 1;
    const limit = options.limit || 10;
    const totalPages = Math.ceil(total / limit);

    if (userId) {
      await this.auditLogRepository.logAction({
        actorUserId: userId,
        actionType: "INSERT",
        targetTable: "search_history",
        recordKey: String(userId),
        postImageJson: options,
      });
    }

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  public async getRecommendations(limit?: number, city?: string): Promise<any[]> {
    return this.discoveryRepository.getRecommendations(limit || 6, city);
  }

  public async compareProperties(propertyIds: number[], userId?: number): Promise<any[]> {
    const results = await this.discoveryRepository.compareProperties(propertyIds);

    if (userId) {
      await this.auditLogRepository.logAction({
        actorUserId: userId,
        actionType: "INSERT",
        targetTable: "property_comparisons",
        recordKey: String(userId),
        postImageJson: { propertyIds },
      });
    }

    return results;
  }

  public async getSuggestions(keyword: string): Promise<{ cities: string[]; properties: string[] }> {
    return this.discoveryRepository.getSearchSuggestions(keyword);
  }
}
