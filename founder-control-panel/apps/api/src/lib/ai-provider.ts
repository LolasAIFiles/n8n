import { AppError } from './errors.js';

export type AIAction = 'IDEA_EVALUATION' | 'BLUEPRINT_GENERATION' | 'IDEA_COMPRESSION' | 'IDEA_10K_DETECTOR';

export interface AIProviderRequest {
  action: AIAction;
  prompt: string;
  metadata?: Record<string, unknown>;
}

export interface AIProviderResponse {
  model: string;
  output: Record<string, unknown>;
}

function parseJsonObject(content: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(content);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('Expected object JSON');
    }
    return parsed as Record<string, unknown>;
  } catch {
    throw new AppError(502, 'AI provider returned malformed JSON output');
  }
}

export class AIProvider {
  private useMock(): boolean {
    return process.env.AI_USE_MOCK === 'true' || !process.env.OPENAI_API_KEY;
  }

  private mock(request: AIProviderRequest): AIProviderResponse {
    const model = process.env.AI_MODEL || 'mock-openai-compatible';
    if (request.action === 'BLUEPRINT_GENERATION') {
      return {
        model,
        output: {
          opportunitySummary: 'A focused founder operating system that reduces overwhelm and converts ideas into monetizable assets.',
          whoThisHelps: 'Idea-heavy founders seeking low-stress leverage and financial freedom.',
          customerPersona: 'Solo or small-team founders with many parallel opportunities and limited focus bandwidth.',
          businessModel: 'SaaS subscription with premium blueprint generation and listing enablement.',
          monetizationStrategy: 'Monthly subscription + one-off blueprint asset sales.',
          marketingStrategy: 'Founder-led educational content and targeted problem-aware distribution.',
          launchRoadmap90Day: 'Weeks 1-2 onboarding refinement, 3-6 decision loop optimization, 7-10 blueprint conversion push, 11-12 listing readiness.',
          automationOpportunities: 'Automated triage, recurring review reminders, and listing preparation workflows.',
          licensingAngle: 'Sell blueprint packages as licensed operating playbooks to avoid direct execution burden.',
          riskWarnings: 'Scope creep and operational overhead risk if too many ideas are built simultaneously.',
          lifestyleFit: 'Strong fit when priority stays on automation and selective execution.',
          recommendedNextAction: 'Choose one high-confidence idea and generate a listing-ready blueprint.',
          confidence: 0.78,
          reasoning: 'Recommendation balances leverage potential, operational load, and monetization speed.',
        },
      };
    }

    if (request.action === 'IDEA_COMPRESSION') {
      return {
        model,
        output: {
          sharedCustomer: 'Early-stage founders with idea overload.',
          sharedPainPoint: 'Too many opportunities and low strategic prioritization.',
          sharedValueProposition: 'Reduce overwhelm and turn ideas into assets.',
          strongestUnifyingConcept: 'Founder OS that captures, evaluates, compresses, and monetizes ideas.',
          suggestedName: 'Founder Control Panel',
          mergeOrSeparate: 'MERGE',
          why: 'Ideas serve the same customer journey and strengthen each other as one system.',
          next3Actions: ['Define single ICP promise', 'Generate one flagship blueprint', 'Create first marketplace listing draft'],
          buildVsSellRecommendation: 'SELL_BLUEPRINT',
          confidence: 0.76,
          nextAction: 'Validate compressed concept with 3 founder interviews this week.',
        },
      };
    }

    return {
      model,
      output: {
        recommendation: 'AI-generated recommendation',
        action: request.action,
        summary: 'Mock provider response. Configure OPENAI_BASE_URL/OPENAI_API_KEY for real model calls.',
        confidence: 0.6,
        nextAction: 'Review and manually confirm before committing.',
      },
    };
  }

  async generate(request: AIProviderRequest): Promise<AIProviderResponse> {
    if (this.useMock()) return this.mock(request);

    const baseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
    const model = process.env.AI_MODEL || 'gpt-4o-mini';
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) throw new AppError(503, 'AI provider unavailable: missing credentials');

    let response;
    try {
      response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          temperature: 0.2,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: 'Return only valid JSON object matching requested schema.' },
            { role: 'user', content: request.prompt },
          ],
        }),
      });
    } catch {
      throw new AppError(502, 'AI provider network request failed');
    }

    if (!response.ok) {
      throw new AppError(502, `AI provider request failed (${response.status})`);
    }

    const data = await response.json() as any;
    const content = data?.choices?.[0]?.message?.content;
    if (!content || typeof content !== 'string') {
      throw new AppError(502, 'AI provider returned empty content');
    }

    return { model, output: parseJsonObject(content) };
  }
}
