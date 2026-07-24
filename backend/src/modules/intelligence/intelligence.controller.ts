import { Request, Response } from "express";
import { IntelligenceService } from "./intelligence.service";
import { ApiResponse } from "../../utils/response-formatter";

export class IntelligenceController {
  constructor(private intelligenceService: IntelligenceService) {}

  public semanticSearch = async (req: Request, res: Response): Promise<Response> => {
    const q = req.query.q as string;
    const results = await this.intelligenceService.semanticSearch(q);
    return ApiResponse.success(res, results, "Semantic property search completed successfully.");
  };

  public analyzeSentiment = async (req: Request, res: Response): Promise<Response> => {
    const { reviewText } = req.body;
    const result = await this.intelligenceService.analyzeSentiment(reviewText);
    return ApiResponse.success(res, result, "Sentiment analysis completed successfully.");
  };

  public categorizeMaintenance = async (req: Request, res: Response): Promise<Response> => {
    const { issueDescription } = req.body;
    const result = await this.intelligenceService.categorizeMaintenance(issueDescription);
    return ApiResponse.success(res, result, "Maintenance auto-categorization completed successfully.");
  };

  public getFraudRiskFlags = async (req: Request, res: Response): Promise<Response> => {
    const applicationId = parseInt(req.params.id as string, 10);
    const flags = await this.intelligenceService.getFraudRiskFlags(applicationId);
    return ApiResponse.success(res, flags, "Fraud risk assessment retrieved successfully.");
  };
}
