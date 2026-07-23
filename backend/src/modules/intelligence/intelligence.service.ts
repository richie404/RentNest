import { IntelligenceRepository } from "../../repositories/intelligence.repository";
import { AIService } from "../../services/ai.service";

export class IntelligenceService {
  constructor(
    private intelligenceRepository: IntelligenceRepository,
    private aiService: AIService
  ) {}

  public async semanticSearch(queryText: string): Promise<any[]> {
    return this.intelligenceRepository.semanticSearchProperties(queryText);
  }

  public async analyzeSentiment(reviewText: string): Promise<any> {
    return this.aiService.analyzeText(
      `Analyze sentiment of this review: "${reviewText}"`,
      "Return JSON with sentiment enum POSITIVE/NEGATIVE/NEUTRAL and float score."
    );
  }

  public async categorizeMaintenance(issueDescription: string): Promise<any> {
    return this.aiService.analyzeText(
      `Categorize maintenance issue: "${issueDescription}"`,
      "Return JSON with category PLUMBING/ELECTRICAL/HVAC/APPLIANCE/OTHER."
    );
  }

  public async getFraudRiskFlags(applicationId: number): Promise<any> {
    return this.intelligenceRepository.getFraudRiskFlags(applicationId);
  }
}
