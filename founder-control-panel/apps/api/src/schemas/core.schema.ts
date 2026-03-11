import { z } from 'zod';

export const missionSchema = z.object({ missionText: z.string().min(10).max(280) });
export const projectSchema = z.object({ name: z.string().min(2), description: z.string().min(2), status: z.enum(['ACTIVE', 'PARKED', 'COMPLETED']) });
export const weeklySchema = z.object({ wins: z.array(z.string().min(1)).length(3), energyScore: z.number().min(1).max(10), stressScore: z.number().min(1).max(10) });
export const ideaSchema = z.object({ title: z.string().min(2), description: z.string().min(2), problemSolved: z.string().min(2), targetCustomer: z.string().min(2), industry: z.string().min(2), notes: z.string().default(''), tags: z.array(z.string()).default([]) });
export const ideaStatusSchema = z.object({ status: z.enum(['UNTRIAGED', 'BUILD', 'SELL_BLUEPRINT', 'PARK', 'IGNORE']) });

export const decisionSchema = z.object({
  ideaId: z.string().uuid(),
  mode: z.enum(['MANUAL', 'AI']).default('MANUAL'),
  missionAlignment: z.number().min(1).max(5),
  revenuePotential: z.number().min(1).max(5),
  automationPotential: z.number().min(1).max(5),
  freedomImpact: z.number().min(1).max(5),
  socialImpact: z.number().min(1).max(5),
});

export const lifeAlignmentSchema = z.object({
  ideaId: z.string().uuid(),
  stressLevel: z.number().min(1).max(10),
  automationPotential: z.number().min(1).max(10),
  founderDependence: z.number().min(1).max(10),
  travelRestrictionRisk: z.number().min(1).max(10),
  impact: z.number().min(1).max(10),
});

export const detector10kSchema = z.object({
  ideaId: z.string().uuid(),
  marketDemand: z.number().min(1).max(10),
  feasibility90Days: z.number().min(1).max(10),
  automationPotential: z.number().min(1).max(10),
  buyerLikelihood: z.number().min(1).max(10),
  packagingPotential: z.number().min(1).max(10),
});

export const blueprintSchema = z.object({ ideaId: z.string().uuid() });
export const compressionSchema = z.object({ ideaIds: z.array(z.string().uuid()).min(2).max(20) });
export const saveCompressedIdeaSchema = z.object({ compressionRunId: z.string().uuid(), title: z.string().min(3) });

export const killSwitchSchema = z.object({ sessionId: z.string().min(2), active: z.boolean(), priority: z.string().min(2), nextAction: z.string().min(2) });
export const automationSchema = z.object({ engine: z.enum(['REVENUE_AUTOMATION', 'IDEA_ASSET_PIPELINE', 'AUDIENCE_ENGINE', 'OPPORTUNITY_SCANNER', 'DELEGATION_ENGINE']), checklist: z.array(z.object({ label: z.string(), done: z.boolean() })), completionRate: z.number().min(0).max(100), nextStep: z.string().min(2) });

export const listingCreateSchema = z.object({
  blueprintId: z.string().uuid(),
  title: z.string().min(3),
  description: z.string().min(10),
  price: z.number().positive(),
  licenseType: z.string().min(2),
  deliveryType: z.string().min(2),
  status: z.enum(['DRAFT', 'READY', 'PUBLISHED']).default('DRAFT'),
  platformFeePercent: z.number().min(0).max(100).default(10),
});

export const listingUpdateSchema = listingCreateSchema.partial().extend({ status: z.enum(['DRAFT', 'READY', 'PUBLISHED', 'ARCHIVED']).optional() });
