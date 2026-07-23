import { Request, Response } from "express";
import { DiscoveryService } from "./discovery.service";
import { ApiResponse } from "../../utils/response-formatter";

export class DiscoveryController {
  constructor(private discoveryService: DiscoveryService) {}

  public search = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user?.userId;
    const { data, meta } = await this.discoveryService.search(req.query as any, userId);
    return ApiResponse.paginated(res, data, meta, "Property search results retrieved successfully.");
  };

  public getRecommendations = async (req: Request, res: Response): Promise<Response> => {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
    const city = req.query.city as string | undefined;

    const recommendations = await this.discoveryService.getRecommendations(limit, city);
    return ApiResponse.success(res, recommendations, "Property recommendations generated successfully.");
  };

  public compareProperties = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user?.userId;
    const { propertyIds } = req.body;

    const comparison = await this.discoveryService.compareProperties(propertyIds, userId);
    return ApiResponse.success(res, comparison, "Property comparison metrics retrieved successfully.");
  };

  public getSuggestions = async (req: Request, res: Response): Promise<Response> => {
    const query = req.query.q as string;
    const suggestions = await this.discoveryService.getSuggestions(query);
    return ApiResponse.success(res, suggestions, "Search auto-complete suggestions retrieved successfully.");
  };
}
