export const PROMPT_VERSIONS = {
  IDEA_EVALUATION: 'v1',
  BLUEPRINT_GENERATION: 'v1',
  IDEA_COMPRESSION: 'v1',
  IDEA_10K_DETECTOR: 'v1',
} as const;

export const prompts = {
  ideaEvaluation: (idea: string, mission: string) => `Evaluate idea for mission alignment, revenue potential, automation potential, lifestyle freedom, and social impact. Idea: ${idea}. Mission: ${mission}.`,
  blueprintGeneration: (idea: string) => `Generate opportunity summary, persona, business model, monetization, marketing, launch, 90-day roadmap, automation opportunities, licensing angle, risk notes, and lifestyle alignment for: ${idea}.`,
  ideaCompression: (ideas: string[]) => `Analyze ideas, find shared customer/problem/value prop, determine merge vs separate, propose compressed concept and next 3 actions: ${ideas.join(' | ')}`,
};
