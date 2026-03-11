import { z } from 'zod';
import { prompts, PROMPT_VERSIONS } from '../../../../packages/prompts/src/index.js';
import { AIProvider } from '../lib/ai-provider.js';
import { AppError } from '../lib/errors.js';

const provider = new AIProvider();

const blueprintOutputSchema = z.object({
  opportunitySummary: z.string(),
  whoThisHelps: z.string(),
  customerPersona: z.string(),
  businessModel: z.string(),
  monetizationStrategy: z.string(),
  marketingStrategy: z.string(),
  launchRoadmap90Day: z.string(),
  automationOpportunities: z.string(),
  licensingAngle: z.string(),
  riskWarnings: z.string(),
  lifestyleFit: z.string(),
  recommendedNextAction: z.string(),
  confidence: z.number().min(0).max(1),
  reasoning: z.string(),
});

const compressionOutputSchema = z.object({
  sharedCustomer: z.string(),
  sharedPainPoint: z.string(),
  sharedValueProposition: z.string(),
  strongestUnifyingConcept: z.string(),
  suggestedName: z.string(),
  mergeOrSeparate: z.enum(['MERGE', 'SEPARATE']),
  why: z.string(),
  next3Actions: z.array(z.string()).length(3),
  buildVsSellRecommendation: z.enum(['BUILD', 'SELL_BLUEPRINT', 'PARK', 'IGNORE']),
  confidence: z.number().min(0).max(1),
  nextAction: z.string(),
});

export class AIOrchestrationService {
  async evaluateIdea(idea: string, mission: string) {
    const prompt = prompts.ideaEvaluation(idea, mission);
    const response = await provider.generate({ action: 'IDEA_EVALUATION', prompt });
    return { ...response, promptVersion: PROMPT_VERSIONS.IDEA_EVALUATION };
  }

  async generateBlueprint(idea: string) {
    const prompt = prompts.blueprintGeneration(idea);
    const response = await provider.generate({ action: 'BLUEPRINT_GENERATION', prompt });
    const parsed = blueprintOutputSchema.safeParse(response.output);
    if (!parsed.success) throw new AppError(502, 'AI blueprint output failed validation');
    return { ...response, output: parsed.data, promptVersion: PROMPT_VERSIONS.BLUEPRINT_GENERATION };
  }

  async compressIdeas(ideas: string[]) {
    const prompt = prompts.ideaCompression(ideas);
    const response = await provider.generate({ action: 'IDEA_COMPRESSION', prompt });
    const parsed = compressionOutputSchema.safeParse(response.output);
    if (!parsed.success) throw new AppError(502, 'AI compression output failed validation');
    return { ...response, output: parsed.data, promptVersion: PROMPT_VERSIONS.IDEA_COMPRESSION };
  }
}
