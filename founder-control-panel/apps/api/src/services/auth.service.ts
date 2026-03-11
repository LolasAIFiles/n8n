import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../db/prisma.js';
import { AppError } from '../lib/errors.js';

const jwtConfig = {
  secret: process.env.JWT_SECRET as string,
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  issuer: process.env.JWT_ISSUER || 'founder-control-panel',
  audience: process.env.JWT_AUDIENCE || 'founder-control-panel-web',
};

export class AuthService {
  async register(email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) throw new AppError(409, 'Email already used', 'AUTH_EMAIL_IN_USE');
    const passwordHash = await bcrypt.hash(password, 12);
    return prisma.user.create({ data: { email: normalizedEmail, passwordHash } });
  }

  async login(email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) throw new AppError(401, 'Invalid credentials', 'AUTH_INVALID_CREDENTIALS');
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new AppError(401, 'Invalid credentials', 'AUTH_INVALID_CREDENTIALS');
    return jwt.sign({ sub: user.id, email: user.email }, jwtConfig.secret, {
      expiresIn: jwtConfig.expiresIn,
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience,
    });
  }
}
