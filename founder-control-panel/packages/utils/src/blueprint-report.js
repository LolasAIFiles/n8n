export const blueprintSections = [
  ['Opportunity Summary', 'opportunitySummary'],
  ['Who This Helps', 'whoThisHelps'],
  ['Customer Persona', 'customerPersona'],
  ['Business Model', 'businessModel'],
  ['Monetization Strategy', 'monetizationStrategy'],
  ['Marketing Strategy', 'marketingStrategy'],
  ['90-Day Launch Roadmap', 'launchRoadmap90Day'],
  ['Automation Opportunities', 'automationOpportunities'],
  ['Licensing / Sell-Don\'t-Build Angle', 'licensingAngle'],
  ['Risks / Stress Warnings', 'riskWarnings'],
  ['Lifestyle Fit', 'lifestyleFit'],
  ['Recommended Next Action', 'recommendedNextAction'],
];

export function toBlueprintReport(output) {
  return blueprintSections.map(([label, key]) => ({ label, key, value: output?.[key] || 'Not provided.' }));
}
