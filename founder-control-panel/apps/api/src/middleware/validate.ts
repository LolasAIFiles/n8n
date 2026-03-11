import { AppError } from '../lib/errors.js';

export const validate = (schema) => (req, _res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const firstIssue = result.error.issues[0];
    return next(new AppError(400, `Invalid request body: ${firstIssue.message}`, 'VALIDATION_ERROR', {
      path: firstIssue.path.join('.') || 'body',
    }));
  }
  req.validated = result.data;
  next();
};
