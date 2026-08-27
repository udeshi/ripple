import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

interface FlagRow {
  key: string;
  enabled: boolean;
  rolloutPercentage: number;
}

function bucketOf(subjectId: string, flagKey: string): number {
  const hash = createHash('sha256').update(`${subjectId}:${flagKey}`).digest();
  return hash.readUInt32BE(0) % 100;
}

@Injectable()
export class FlagsService {
  constructor(private prisma: PrismaService) {}

  async evaluateAll(subjectId?: string) {
    const flags = await this.prisma.featureFlag.findMany();
    return flags.map((flag) => ({
      key: flag.key,
      enabled: this.evaluate(flag, subjectId),
    }));
  }

  private evaluate(flag: FlagRow, subjectId?: string): boolean {
    if (!flag.enabled) return false;
    if (flag.rolloutPercentage >= 100) return true;
    if (flag.rolloutPercentage <= 0) return false;
    if (!subjectId) return false;
    return bucketOf(subjectId, flag.key) < flag.rolloutPercentage;
  }
}
