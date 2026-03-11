import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createIdea,
  createMarketplaceListing,
  createProject,
  createWeeklyReview,
  decisionEvaluate,
  detector10kEvaluate,
  generateBlueprint,
  getDashboard,
  getKillSwitch,
  getLatestWeeklyReview,
  lifeAlignmentEvaluate,
  listAutomationProgress,
  listBlueprints,
  listCompressionRuns,
  listIdeaBank,
  listMarketplaceListings,
  listProjects,
  runCompression,
  saveCompressedConceptAsIdea,
  updateIdeaStatus,
  updateMarketplaceListing,
  upsertAutomationProgress,
  upsertKillSwitch,
  upsertMission,
} from '../controllers/core.controller.js';
import {
  automationSchema,
  blueprintSchema,
  compressionSchema,
  decisionSchema,
  detector10kSchema,
  ideaSchema,
  ideaStatusSchema,
  killSwitchSchema,
  lifeAlignmentSchema,
  listingCreateSchema,
  listingUpdateSchema,
  missionSchema,
  projectSchema,
  saveCompressedIdeaSchema,
  weeklySchema,
} from '../schemas/core.schema.js';

const r = Router();
r.use(authMiddleware);
r.get('/dashboard', getDashboard);
r.put('/missions/current', validate(missionSchema), upsertMission);
r.get('/projects', listProjects);
r.post('/projects', validate(projectSchema), createProject);
r.get('/weekly-reviews/latest', getLatestWeeklyReview);
r.post('/weekly-reviews', validate(weeklySchema), createWeeklyReview);
r.post('/ideas', validate(ideaSchema), createIdea);
r.patch('/ideas/:ideaId/status', validate(ideaStatusSchema), updateIdeaStatus);
r.get('/idea-bank', listIdeaBank);
r.post('/decision-engine/evaluate', validate(decisionSchema), decisionEvaluate);
r.post('/life-alignment/evaluate', validate(lifeAlignmentSchema), lifeAlignmentEvaluate);
r.post('/detector-10k/evaluate', validate(detector10kSchema), detector10kEvaluate);
r.get('/blueprints', listBlueprints);
r.post('/blueprints/generate', validate(blueprintSchema), generateBlueprint);
r.get('/compression-runs', listCompressionRuns);
r.post('/compression-runs', validate(compressionSchema), runCompression);
r.post('/compression-runs/save-idea', validate(saveCompressedIdeaSchema), saveCompressedConceptAsIdea);
r.get('/marketplace/listings', listMarketplaceListings);
r.post('/marketplace/listings', validate(listingCreateSchema), createMarketplaceListing);
r.patch('/marketplace/listings/:listingId', validate(listingUpdateSchema), updateMarketplaceListing);
r.get('/kill-switch', getKillSwitch);
r.post('/kill-switch', validate(killSwitchSchema), upsertKillSwitch);
r.get('/automation/progress', listAutomationProgress);
r.post('/automation/progress', validate(automationSchema), upsertAutomationProgress);
export default r;
