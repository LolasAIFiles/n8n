export function decisionEngineScore(input) {
  const totalScore = Object.values(input).reduce((a, b) => a + b, 0);
  const recommendation = totalScore >= 22 ? 'BUILD' : totalScore >= 17 ? 'SELL_BLUEPRINT' : totalScore >= 12 ? 'PARK' : 'IGNORE';
  return { totalScore, recommendation };
}

export function lifeAlignmentScore(input) {
  const penalty = input.stressLevel + input.founderDependence + input.travelRestrictionRisk;
  if (penalty >= 22) return 'REJECT';
  if (input.automationPotential <= 3) return 'SELL_BLUEPRINT';
  if (input.impact >= 7 && input.stressLevel <= 5) return 'BUILD';
  return 'PARK';
}

export function detector10kScore(input) {
  const score = Object.values(input).reduce((a, b) => a + b, 0);
  const valueRange = score >= 35 ? '$15,000-$30,000' : score >= 26 ? '$8,000-$18,000' : '$2,000-$8,000';
  return { score, valueRange };
}
