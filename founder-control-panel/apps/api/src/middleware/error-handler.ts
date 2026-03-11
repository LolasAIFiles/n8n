import { AppError } from '../lib/errors.js';
import { logError } from '../lib/logger.js';

export const errorHandler = (err, req, res, _next) => {
  const requestId = req.requestId || 'unknown';

  if (err instanceof AppError) {
    logError('api.error', {
      requestId,
      status: err.status,
      code: err.code,
      message: err.message,
      path: req.path,
      method: req.method,
      details: err.details,
    });
    return res.status(err.status).json({ error: err.message, code: err.code, requestId });
  }

  logError('api.error', {
    requestId,
    status: 500,
    message: err?.message || 'Unhandled error',
    path: req.path,
    method: req.method,
    stack: process.env.NODE_ENV === 'development' ? err?.stack : undefined,
  });
  return res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_SERVER_ERROR', requestId });
};
