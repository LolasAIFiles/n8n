import jwt from 'jsonwebtoken';
import { AppError } from '../lib/errors.js';

const verifyOptions = {
  issuer: process.env.JWT_ISSUER || 'founder-control-panel',
  audience: process.env.JWT_AUDIENCE || 'founder-control-panel-web',
};

export const authMiddleware = (req, _res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return next(new AppError(401, 'Missing token', 'AUTH_MISSING_TOKEN'));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string, verifyOptions);
    if (!decoded || typeof decoded !== 'object' || !decoded.sub) {
      return next(new AppError(401, 'Invalid token payload', 'AUTH_INVALID_TOKEN'));
    }
    req.user = decoded;
    next();
  } catch {
    next(new AppError(401, 'Invalid token', 'AUTH_INVALID_TOKEN'));
  }
};
