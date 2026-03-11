import { prisma } from '../db/prisma.js';
export class MissionService {
  async upsertMission(userId: string, missionText: string) {
    return prisma.mission.upsert({ where: { userId }, create: { userId, missionText }, update: { missionText } });
  }
}
