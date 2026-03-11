export function buildCompressionPayload(ideaIds) {
  if (!Array.isArray(ideaIds) || ideaIds.length < 2 || ideaIds.length > 20) throw new Error('Compression requires 2-20 ideas');
  return { ideaIds };
}

export function buildListingPayload(input) {
  const required = ['blueprintId', 'title', 'description', 'price', 'licenseType', 'deliveryType'];
  for (const k of required) if (!input[k]) throw new Error(`Missing ${k}`);
  return { ...input, status: input.status || 'DRAFT', platformFeePercent: input.platformFeePercent ?? 10 };
}

export function recommendationShape(rec) {
  return {
    recommendation: rec.recommendation || 'UNKNOWN',
    reasoning: rec.reasoning || '',
    confidence: typeof rec.confidence === 'number' ? rec.confidence : 0,
    nextAction: rec.nextAction || 'Review and decide manually.',
    overrideAllowed: true,
  };
}
