export interface AICompletionOptions {
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AIServiceProvider {
  getProviderName(): string;
  generateCompletion(options: AICompletionOptions): Promise<string>;
  generateEmbeddings(text: string): Promise<number[]>;
}

export class MockAIServiceProvider implements AIServiceProvider {
  public getProviderName(): string {
    return "MockProvider (Gemini/OpenAI/Claude/Ollama Ready)";
  }

  public async generateCompletion(options: AICompletionOptions): Promise<string> {
    const promptLower = options.prompt.toLowerCase();
    if (promptLower.includes("sentiment")) {
      return JSON.stringify({ sentiment: "POSITIVE", score: 0.95 });
    }
    if (promptLower.includes("categorize") || promptLower.includes("category")) {
      return JSON.stringify({ category: "PLUMBING", confidence: 0.98 });
    }
    return JSON.stringify({ recommendationScore: 0.92, insights: "High relevance property matching user preferences." });
  }

  public async generateEmbeddings(_text: string): Promise<number[]> {
    return new Array(1536).fill(0.01);
  }
}

export class AIService {
  constructor(private provider: AIServiceProvider = new MockAIServiceProvider()) {}

  public getProviderName(): string {
    return this.provider.getProviderName();
  }

  public async analyzeText(prompt: string, systemPrompt?: string): Promise<any> {
    const response = await this.provider.generateCompletion({ prompt, systemPrompt });
    try {
      return JSON.parse(response);
    } catch {
      return { raw: response };
    }
  }
}
