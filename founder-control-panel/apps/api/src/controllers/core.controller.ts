import { prisma } from '../db/prisma.js';
import { MissionService } from '../services/mission.service.js';
import { ProjectService } from '../services/project.service.js';
import { IdeaEvaluationService } from '../services/idea-evaluation.service.js';
import { ProvenanceService } from '../services/provenance.service.js';
import { AIOrchestrationService } from '../services/ai-orchestration.service.js';
import { AppError } from '../lib/errors.js';
import { logEvent } from '../lib/logger.js';

const missionSvc = new MissionService();
const projectSvc = new ProjectService();
const evalSvc = new IdeaEvaluationService();
const provenanceSvc = new ProvenanceService();
const aiSvc = new AIOrchestrationService();

export const getDashboard = async (req, res, next) => {
  try {
    const [mission, projects, latestWeeklyReview, killSwitch] = await Promise.all([
      prisma.mission.findUnique({ where: { userId: req.user.sub } }),
      prisma.project.findMany({ where: { userId: req.user.sub }, orderBy: { createdAt: 'desc' } }),
      prisma.weeklyReview.findFirst({ where: { userId: req.user.sub }, orderBy: { createdAt: 'desc' } }),
      prisma.killSwitchState.findFirst({ where: { userId: req.user.sub }, orderBy: { updatedAt: 'desc' } }),
    ]);
    res.json({ mission, projects, latestWeeklyReview, killSwitch });
  } catch (e) { next(e); }
};

export const upsertMission = async (req, res, next) => {
  try {
    const mission = await missionSvc.upsertMission(req.user.sub, req.validated.missionText);
    logEvent('mission.updated', { userId: req.user.sub, missionId: mission.id });
    res.json(mission);
  } catch (e) { next(e); }
};

export const listProjects = async (req, res, next) => {
  try {
    const projects = await prisma.project.findMany({ where: { userId: req.user.sub }, orderBy: { createdAt: 'desc' } });
    res.json(projects);
  } catch (e) { next(e); }
};

export const createProject = async (req, res, next) => {
  try {
    const project = await projectSvc.createProject(req.user.sub, req.validated);
    logEvent('project.created', { userId: req.user.sub, projectId: project.id, status: project.status });
    res.status(201).json(project);
  } catch (e) { next(e); }
};

export const createWeeklyReview = async (req, res, next) => {
  try {
    const review = await prisma.weeklyReview.create({ data: { ...req.validated, userId: req.user.sub } });
    res.status(201).json(review);
  } catch (e) { next(e); }
};

export const getLatestWeeklyReview = async (req, res, next) => {
  try {
    const review = await prisma.weeklyReview.findFirst({ where: { userId: req.user.sub }, orderBy: { createdAt: 'desc' } });
    res.json(review);
  } catch (e) { next(e); }
};

export const createIdea = async (req, res, next) => {
  try {
    const idea = await prisma.idea.create({
      data: {
        ...req.validated,
        userId: req.user.sub,
        status: 'UNTRIAGED',
        tags: { create: req.validated.tags.map((name: string) => ({ name })) },
      },
      include: { tags: true },
    });
    res.status(201).json(idea);
  } catch (e) { next(e); }
};

export const updateIdeaStatus = async (req, res, next) => {
  try {
    await prisma.idea.updateMany({ where: { id: req.params.ideaId, userId: req.user.sub }, data: { status: req.validated.status } as any });
    const idea = await prisma.idea.findFirst({ where: { id: req.params.ideaId, userId: req.user.sub } });
    res.json(idea);
  } catch (e) { next(e); }
};

export const listIdeaBank = async (req, res, next) => {
  try {
    const q = String(req.query.q ?? '');
    const status = String(req.query.status ?? '');
    const dormant = String(req.query.dormant ?? '') === 'true';
    const ideas = await prisma.idea.findMany({
      where: {
        userId: req.user.sub,
        ...(status ? { status } : {}),
        ...(dormant ? { status: 'PARK' } : {}),
        OR: q ? [{ title: { contains: q, mode: 'insensitive' } }, { description: { contains: q, mode: 'insensitive' } }, { tags: { some: { name: { contains: q, mode: 'insensitive' } } } }] : undefined,
      },
      include: { tags: true, evaluations: { take: 1, orderBy: { createdAt: 'desc' } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(ideas);
  } catch (e) { next(e); }
};

export const decisionEvaluate = async (req, res, next) => {
  try {
    const payload = req.validated;
    const result = evalSvc.manualDecision(payload);
    const evaluation = await prisma.ideaEvaluation.create({ data: { userId: req.user.sub, ideaId: payload.ideaId, mode: payload.mode, inputPayload: payload, score: result.totalScore, recommendation: result.recommendation, reasoning: result.reasoning } });
    await provenanceSvc.log({ userId: req.user.sub, action: 'IDEA_EVALUATION', model: payload.mode === 'AI' ? process.env.AI_MODEL || 'openai-compatible' : 'manual-scoring', promptVersion: 'v1', inputPayload: payload, outputPayload: result, relatedEntityType: 'IdeaEvaluation', relatedEntityId: evaluation.id });
    await prisma.idea.update({ where: { id: payload.ideaId }, data: { status: result.recommendation } });
    res.json({ ...result, labels: ['recommendation', 'estimated'], overrideAllowed: true });
  } catch (e) { next(e); }
};

export const lifeAlignmentEvaluate = async (req, res, next) => {
  try {
    const result = evalSvc.lifeAlignment(req.validated);
    await prisma.idea.updateMany({ where: { id: req.validated.ideaId, userId: req.user.sub }, data: { lifeAlignmentStatus: result.recommendation } });
    res.json({ ...result, labels: ['recommendation', 'estimated'], overrideAllowed: true });
  } catch (e) { next(e); }
};

export const detector10kEvaluate = async (req, res, next) => {
  try {
    const result = evalSvc.detector10k(req.validated);
    await provenanceSvc.log({ userId: req.user.sub, action: 'IDEA_10K_DETECTOR', model: process.env.AI_MODEL || 'heuristic', promptVersion: 'v1', inputPayload: req.validated, outputPayload: result, relatedEntityType: 'Idea', relatedEntityId: req.validated.ideaId });
    res.json({ ...result, labels: ['recommendation', 'estimated'], overrideAllowed: true });
  } catch (e) { next(e); }
};

export const generateBlueprint = async (req, res, next) => {
  try {
    const idea = await prisma.idea.findFirstOrThrow({ where: { id: req.validated.ideaId, userId: req.user.sub } });
    let ai;
    try {
      ai = await aiSvc.generateBlueprint(`${idea.title}: ${idea.description}`);
    } catch (error) {
      throw new AppError(502, 'Blueprint generation failed. Please retry in a moment.', 'AI_BLUEPRINT_FAILED', {
        ideaId: idea.id,
        cause: error instanceof Error ? error.message : 'unknown',
      });
    }
    const blueprint = await prisma.blueprint.create({ data: { userId: req.user.sub, ideaId: idea.id, output: ai.output, model: ai.model, promptVersion: ai.promptVersion } });
    await provenanceSvc.log({ userId: req.user.sub, action: 'BLUEPRINT_GENERATION', model: ai.model, promptVersion: ai.promptVersion, inputPayload: { ideaId: idea.id }, outputPayload: ai.output, relatedEntityType: 'Blueprint', relatedEntityId: blueprint.id });
    res.status(201).json({ status: 'completed', blueprint, labels: ['AI-generated', 'recommendation'], overrideAllowed: true });
  } catch (e) { next(e); }
};

export const listBlueprints = async (req, res, next) => {
  try {
    const blueprints = await prisma.blueprint.findMany({ where: { userId: req.user.sub }, orderBy: { createdAt: 'desc' }, include: { idea: true } });
    res.json(blueprints);
  } catch (e) { next(e); }
};

export const runCompression = async (req, res, next) => {
  try {
    const ideas = await prisma.idea.findMany({ where: { id: { in: req.validated.ideaIds }, userId: req.user.sub } });
    if (ideas.length !== req.validated.ideaIds.length) {
      throw new AppError(400, 'One or more selected ideas are missing or inaccessible', 'IDEA_SELECTION_INVALID');
    }
    let ai;
    try {
      ai = await aiSvc.compressIdeas(ideas.map((i) => `${i.title}: ${i.description}`));
    } catch (error) {
      throw new AppError(502, 'Idea compression failed. Please retry in a moment.', 'AI_COMPRESSION_FAILED', {
        ideaCount: ideas.length,
        cause: error instanceof Error ? error.message : 'unknown',
      });
    }
    const run = await prisma.compressionRun.create({ data: { userId: req.user.sub, inputIdeaIds: req.validated.ideaIds, output: ai.output, model: ai.model, promptVersion: ai.promptVersion } });
    await provenanceSvc.log({ userId: req.user.sub, action: 'IDEA_COMPRESSION', model: ai.model, promptVersion: ai.promptVersion, inputPayload: req.validated, outputPayload: ai.output, relatedEntityType: 'CompressionRun', relatedEntityId: run.id });
    res.status(201).json({ ...run, labels: ['AI-generated', 'recommendation'], overrideAllowed: true });
  } catch (e) { next(e); }
};

export const listCompressionRuns = async (req, res, next) => {
  try {
    const runs = await prisma.compressionRun.findMany({ where: { userId: req.user.sub }, orderBy: { createdAt: 'desc' } });
    res.json(runs);
  } catch (e) { next(e); }
};

export const saveCompressedConceptAsIdea = async (req, res, next) => {
  try {
    const run = await prisma.compressionRun.findFirstOrThrow({ where: { id: req.validated.compressionRunId, userId: req.user.sub } });
    const out: any = run.output;
    const idea = await prisma.idea.create({
      data: {
        userId: req.user.sub,
        title: req.validated.title,
        description: out.strongestUnifyingConcept || 'Compressed concept',
        problemSolved: out.sharedPainPoint || 'Reduce founder overwhelm',
        targetCustomer: out.sharedCustomer || 'Founders',
        industry: 'SaaS',
        notes: `From compression run ${run.id}`,
        status: 'UNTRIAGED',
      },
    });
    res.status(201).json(idea);
  } catch (e) { next(e); }
};

export const listMarketplaceListings = async (req, res, next) => {
  try {
    const listings = await prisma.marketplaceListing.findMany({ where: { userId: req.user.sub }, orderBy: { createdAt: 'desc' } });
    res.json(listings);
  } catch (e) { next(e); }
};

export const createMarketplaceListing = async (req, res, next) => {
  try {
    if (req.validated.blueprintId) {
      const blueprint = await prisma.blueprint.findFirst({ where: { id: req.validated.blueprintId, userId: req.user.sub } });
      if (!blueprint) throw new AppError(404, 'Blueprint not found for listing creation', 'BLUEPRINT_NOT_FOUND');
    }
    const listing = await prisma.marketplaceListing.create({ data: { ...req.validated, userId: req.user.sub } });
    res.status(201).json({ ...listing, checkout: { provider: 'stripe', status: 'placeholder-ready' } });
  } catch (e) { next(e); }
};

export const updateMarketplaceListing = async (req, res, next) => {
  try {
    const existing = await prisma.marketplaceListing.findFirst({ where: { id: req.params.listingId, userId: req.user.sub } });
    if (!existing) throw new AppError(404, 'Listing not found', 'LISTING_NOT_FOUND');
    if (req.validated.blueprintId) {
      const blueprint = await prisma.blueprint.findFirst({ where: { id: req.validated.blueprintId, userId: req.user.sub } });
      if (!blueprint) throw new AppError(404, 'Blueprint not found for listing update', 'BLUEPRINT_NOT_FOUND');
    }
    const listing = await prisma.marketplaceListing.update({ where: { id: existing.id }, data: req.validated });
    res.json({ ...listing, checkout: { provider: 'stripe', status: 'placeholder-ready' } });
  } catch (e) { next(e); }
};

export const upsertKillSwitch = async (req, res, next) => {
  try {
    const state = await prisma.killSwitchState.upsert({ where: { userId_sessionId: { userId: req.user.sub, sessionId: req.validated.sessionId } }, update: req.validated, create: { ...req.validated, userId: req.user.sub } });
    res.json(state);
  } catch (e) { next(e); }
};

export const getKillSwitch = async (req, res, next) => {
  try {
    const sessionId = String(req.query.sessionId || 'default-session');
    const state = await prisma.killSwitchState.findUnique({ where: { userId_sessionId: { userId: req.user.sub, sessionId } } });
    res.json(state);
  } catch (e) { next(e); }
};

export const upsertAutomationProgress = async (req, res, next) => {
  try {
    const state = await prisma.automationProgress.upsert({ where: { userId_engine: { userId: req.user.sub, engine: req.validated.engine } } as any, update: req.validated, create: { ...req.validated, userId: req.user.sub } });
    res.json(state);
  } catch (e) { next(e); }
};

export const listAutomationProgress = async (req, res, next) => {
  try {
    const rows = await prisma.automationProgress.findMany({ where: { userId: req.user.sub }, orderBy: { updatedAt: 'desc' } });
    res.json(rows);
  } catch (e) { next(e); }
};
