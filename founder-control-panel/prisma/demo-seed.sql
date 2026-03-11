-- Demo-ready private beta seed data
-- Login:
--   email: demo@foundercontrolpanel.dev
--   password: demo12345

INSERT INTO "User" ("id", "email", "passwordHash", "createdAt")
VALUES ('11111111-1111-1111-1111-111111111111', 'demo@foundercontrolpanel.dev', '$2a$12$Pcspn8fmrYiS915foIYw9e7A9gANYBcaTe8ddV2sL43O7OT6EmQH2', NOW())
ON CONFLICT ("email") DO UPDATE SET "passwordHash" = EXCLUDED."passwordHash";

INSERT INTO "Mission" ("id", "userId", "missionText", "createdAt")
VALUES ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Build calm, automated income streams that preserve freedom and meaningful impact.', NOW())
ON CONFLICT ("userId") DO UPDATE SET "missionText" = EXCLUDED."missionText";

INSERT INTO "Project" ("id", "userId", "name", "description", "status", "createdAt")
VALUES
('33333333-3333-3333-3333-333333333331', '11111111-1111-1111-1111-111111111111', 'AI founder ops template', 'Package founder workflows into a licenseable blueprint.', 'ACTIVE', NOW()),
('33333333-3333-3333-3333-333333333332', '11111111-1111-1111-1111-111111111111', 'Audience trust loop', 'Publish practical founder decisions with transparent reasoning.', 'PARKED', NOW())
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Idea" ("id", "userId", "title", "description", "problemSolved", "targetCustomer", "industry", "notes", "status", "monetizationStatus", "lifeAlignmentStatus", "createdAt")
VALUES
('44444444-4444-4444-4444-444444444441', '11111111-1111-1111-1111-111111111111', 'Founder decision dashboard', 'Single dashboard to evaluate ideas and commit to one next action.', 'Founder overwhelm and poor prioritization.', 'Solo founders with many opportunities.', 'SaaS', 'Seeded demo idea', 'BUILD', 'UNDECIDED', 'UNASSESSED', NOW()),
('44444444-4444-4444-4444-444444444442', '11111111-1111-1111-1111-111111111111', 'Blueprint listing accelerator', 'Convert AI blueprints into ready-to-sell marketplace listings.', 'Monetization delay after strategy output.', 'Builders selling knowledge assets.', 'SaaS', 'Seeded demo idea', 'SELL_BLUEPRINT', 'UNDECIDED', 'UNASSESSED', NOW())
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Blueprint" ("id", "userId", "ideaId", "output", "model", "promptVersion", "createdAt")
VALUES (
  '55555555-5555-5555-5555-555555555551',
  '11111111-1111-1111-1111-111111111111',
  '44444444-4444-4444-4444-444444444441',
  '{"opportunitySummary":"A founder decision system packaged as a reusable operating blueprint.","whoThisHelps":"Overloaded solo founders","customerPersona":"Early-stage founder with many parallel ideas","businessModel":"Subscription + blueprint asset upsell","monetizationStrategy":"Sell strategy blueprint templates","marketingStrategy":"Founder-led content and examples","launchRoadmap90Day":"Weeks 1-4 validate, 5-8 package, 9-12 launch","automationOpportunities":"Evaluation workflows, report generation, listing handoff","licensingAngle":"Sell non-exclusive licenses for implementation playbooks","riskWarnings":"Scope creep from too many concurrent ideas","lifestyleFit":"High if focused on one key workflow","recommendedNextAction":"Publish one flagship listing","confidence":0.79,"reasoning":"Good fit for leverage and low operational drag"}'::jsonb,
  'mock-openai-compatible',
  'v1',
  NOW()
)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "MarketplaceListing" ("id", "userId", "blueprintId", "title", "description", "price", "licenseType", "deliveryType", "status", "platformFeePercent", "createdAt")
VALUES (
  '66666666-6666-6666-6666-666666666661',
  '11111111-1111-1111-1111-111111111111',
  '55555555-5555-5555-5555-555555555551',
  'Founder Decision Dashboard Blueprint',
  'A practical blueprint for turning idea overload into one confident weekly plan.',
  4900,
  'Single License',
  'PDF + Notion',
  'READY',
  10,
  NOW()
)
ON CONFLICT ("id") DO NOTHING;
