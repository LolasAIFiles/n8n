import { prisma } from '../db/prisma.js';

export class ProvenanceService {
  async log(entry: { userId: string; action: string; model: string; promptVersion: string; inputPayload: unknown; outputPayload: unknown; relatedEntityType?: string; relatedEntityId?: string }) {
    return prisma.aIProvenanceLog.create({ data: entry });
  }
}
