import test from 'node:test';
import assert from 'node:assert/strict';
import { toBlueprintReport } from '../../../packages/utils/src/blueprint-report.js';
import { buildCompressionPayload, buildListingPayload, recommendationShape } from '../../../packages/utils/src/productization.js';

test('blueprint report transforms structured output to scannable sections', () => {
  const report = toBlueprintReport({ opportunitySummary: 'A', recommendedNextAction: 'Do next' });
  assert.ok(report.length >= 10);
  assert.equal(report[0].label, 'Opportunity Summary');
});

test('compression payload enforces 2-20 selection', () => {
  assert.throws(() => buildCompressionPayload(['a']));
  assert.deepEqual(buildCompressionPayload(['a', 'b']), { ideaIds: ['a', 'b'] });
});

test('listing payload normalizes defaults', () => {
  const payload = buildListingPayload({ blueprintId: 'id', title: 't', description: 'd', price: 100, licenseType: 'L', deliveryType: 'PDF' });
  assert.equal(payload.status, 'DRAFT');
  assert.equal(payload.platformFeePercent, 10);
});

test('recommendation shape always includes trust fields', () => {
  const out = recommendationShape({ recommendation: 'BUILD', confidence: 0.8 });
  assert.equal(out.overrideAllowed, true);
  assert.equal(typeof out.nextAction, 'string');
});
