export class IdeaEvaluationService {
  manualDecision(input: { missionAlignment: number; revenuePotential: number; automationPotential: number; freedomImpact: number; socialImpact: number }) {
    const totalScore = Object.values(input).reduce((a, b) => a + b, 0);
    const recommendation = totalScore >= 22 ? 'BUILD' : totalScore >= 17 ? 'SELL_BLUEPRINT' : totalScore >= 12 ? 'PARK' : 'IGNORE';
    const confidence = Number((totalScore / 25).toFixed(2));
    const nextAction = recommendation === 'BUILD' ? 'Create a focused build plan for this week.' : recommendation === 'SELL_BLUEPRINT' ? 'Generate blueprint and prepare listing draft.' : recommendation === 'PARK' ? 'Park and revisit in the next review cycle.' : 'Archive and move on to the next idea.';
    return { totalScore, recommendation, reasoning: 'Structured score across mission, revenue, automation, freedom, and impact.', confidence, nextAction };
  }

  lifeAlignment(input: { stressLevel: number; automationPotential: number; founderDependence: number; travelRestrictionRisk: number; impact: number }) {
    const penalty = input.stressLevel + input.founderDependence + input.travelRestrictionRisk;
    if (penalty >= 22) return { recommendation: 'REJECT', reasoning: 'High stress/founder dependence/travel restriction risk.', confidence: 0.86, nextAction: 'Do not commit. Consider discard or blueprint-only angle.' };
    if (input.automationPotential <= 3) return { recommendation: 'SELL_BLUEPRINT', reasoning: 'Low automation potential; better sold/licensed.', confidence: 0.74, nextAction: 'Package as blueprint or license path.' };
    if (input.impact >= 7 && input.stressLevel <= 5) return { recommendation: 'BUILD', reasoning: 'Aligned with impact and manageable stress.', confidence: 0.78, nextAction: 'Move into focused execution with strict scope boundaries.' };
    return { recommendation: 'PARK', reasoning: 'Keep as optional asset, avoid immediate commitment.', confidence: 0.62, nextAction: 'Park and revisit after current priorities complete.' };
  }

  detector10k(input: { marketDemand: number; feasibility90Days: number; automationPotential: number; buyerLikelihood: number; packagingPotential: number }) {
    const score = Object.values(input).reduce((a, b) => a + b, 0);
    const valueRange = score >= 35 ? '$15,000-$30,000' : score >= 26 ? '$8,000-$18,000' : '$2,000-$8,000';
    const confidence = Math.min(0.95, Math.max(0.25, score / 45));
    const recommendation = score >= 26 ? 'SELL_BLUEPRINT' : 'PARK';
    const nextAction = recommendation === 'SELL_BLUEPRINT' ? 'Generate blueprint and draft listing terms.' : 'Park until stronger market/buyer signals appear.';
    return { valueRange, confidence, recommendation, reasoning: 'Heuristic from demand, feasibility, automation, buyer likelihood, packaging.', nextAction };
  }
}
