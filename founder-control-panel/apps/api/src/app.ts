import crypto from 'node:crypto';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.routes.js';
import coreRoutes from './routes/core.routes.js';
import { errorHandler } from './middleware/error-handler.js';
import { logEvent } from './lib/logger.js';

export const createApp = () => {
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: '1mb' }));
  app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 200 }));

  app.use((req, res, next) => {
    const requestId = req.headers['x-request-id']?.toString() || crypto.randomUUID();
    req.requestId = requestId;
    res.setHeader('x-request-id', requestId);
    const started = Date.now();
    res.on('finish', () => {
      logEvent('http.request.completed', {
        requestId,
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        durationMs: Date.now() - started,
      });
    });
    next();
  });

  app.get('/health', (_req, res) => res.json({ ok: true }));
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1', coreRoutes);
  app.use(errorHandler);
  return app;
};
