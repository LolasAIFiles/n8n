import { prisma } from '../db/prisma.js';
import { AppError } from '../lib/errors.js';

export class ProjectService {
  async createProject(userId: string, data: { name: string; description: string; status: 'ACTIVE' | 'PARKED' | 'COMPLETED' }) {
    if (data.status === 'ACTIVE') {
      const count = await prisma.project.count({ where: { userId, status: 'ACTIVE' } });
      if (count >= 3) throw new AppError(409, 'Maximum 3 active projects allowed');
    }
    return prisma.project.create({ data: { ...data, userId } });
  }
}
