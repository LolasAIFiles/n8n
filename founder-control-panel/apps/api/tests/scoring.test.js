import test from 'node:test';
import assert from 'node:assert/strict';
import { decisionEngineScore, detector10kScore, lifeAlignmentScore } from '../../../packages/utils/src/scoring.js';

test('decision engine returns BUILD for high score', () => {
  const result = decisionEngineScore({ missionAlignment: 5, revenuePotential: 5, automationPotential: 5, freedomImpact: 4, socialImpact: 4 });
  assert.equal(result.recommendation, 'BUILD');
});

test('decision engine returns SELL_BLUEPRINT for solid mid-high score', () => {
  const result = decisionEngineScore({ missionAlignment: 4, revenuePotential: 4, automationPotential: 4, freedomImpact: 3, socialImpact: 3 });
  assert.equal(result.recommendation, 'SELL_BLUEPRINT');
});

test('decision engine returns PARK for mid score', () => {
  const result = decisionEngineScore({ missionAlignment: 2, revenuePotential: 2, automationPotential: 3, freedomImpact: 2, socialImpact: 3 });
  assert.equal(result.recommendation, 'PARK');
});

test('life alignment rejects high burden ideas', () => {
  const result = lifeAlignmentScore({ stressLevel: 8, automationPotential: 2, founderDependence: 8, travelRestrictionRisk: 7, impact: 4 });
  assert.equal(result, 'REJECT');
});

test('$10k detector range is returned', () => {
  const result = detector10kScore({ marketDemand: 8, feasibility90Days: 7, automationPotential: 7, buyerLikelihood: 7, packagingPotential: 7 });
  assert.equal(result.valueRange, '$15,000-$30,000');
});
