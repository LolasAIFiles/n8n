import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).optional().default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).optional().default(5001),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().optional().default('7d'),
  JWT_ISSUER: z.string().optional().default('founder-control-panel'),
  JWT_AUDIENCE: z.string().optional().default('founder-control-panel-web'),
  AI_USE_MOCK: z.enum(['true', 'false']).optional().default('false'),
  OPENAI_BASE_URL: z.string().url().optional().default('https://api.openai.com/v1'),
  OPENAI_API_KEY: z.string().optional(),
  AI_MODEL: z.string().optional().default('gpt-4o-mini'),
});

export type AppEnv = z.infer<typeof envSchema>;

export const validateEnv = (env: NodeJS.ProcessEnv): AppEnv => {
  const parsed = envSchema.safeParse(env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    throw new Error(`Invalid environment configuration: ${issues.join('; ')}`);
  }

  if (parsed.data.AI_USE_MOCK !== 'true' && !parsed.data.OPENAI_API_KEY) {
    throw new Error('Invalid environment configuration: OPENAI_API_KEY is required when AI_USE_MOCK is not true');
  }

  return parsed.data;
};
