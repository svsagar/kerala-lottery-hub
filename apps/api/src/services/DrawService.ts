import { prisma } from '../config/database';
import { LotteryCode } from '@kerala-lottery/shared';

export type VerificationStatus = 'UNVERIFIED' | 'PARTIALLY_VERIFIED' | 'FULLY_VERIFIED' | 'CACHED' | 'STALE' | 'REJECTED' | 'QUARANTINED';

export interface DrawQueryOptions {
  lotteryId?: string;
  lotteryCode?: LotteryCode;
  startDate?: Date;
  endDate?: Date;
  verificationStatus?: VerificationStatus;
  page?: number;
  limit?: number;
}

export class DrawService {
  static async getDraws(options: DrawQueryOptions) {
    const { lotteryCode, startDate, endDate, verificationStatus, page = 1, limit = 20 } = options;

    const where: any = {};

    if (lotteryCode) {
      const lottery = await prisma.lottery.findUnique({
        where: { code: lotteryCode },
      });
      if (lottery) where.lotteryId = lottery.id;
    }

    if (startDate || endDate) {
      where.drawDate = {};
      if (startDate) where.drawDate.gte = startDate;
      if (endDate) where.drawDate.lte = endDate;
    }

    if (verificationStatus) {
      where.verificationStatus = verificationStatus;
    }

    const [draws, total] = await Promise.all([
      prisma.draw.findMany({
        where,
        include: {
          lottery: true,
          prizeTiers: {
            include: { prizeEntries: true },
          },
          verificationIssues: true,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { drawDate: 'desc' },
      }),
      prisma.draw.count({ where }),
    ]);

    return {
      draws,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  static async getDrawById(id: string) {
    return prisma.draw.findUnique({
      where: { id },
      include: {
        lottery: true,
        prizeTiers: {
          include: { prizeEntries: true },
        },
        sourceDocument: true,
        verificationIssues: true,
      },
    });
  }

  static async getLatestDraw(lotteryCode: LotteryCode) {
    const lottery = await prisma.lottery.findUnique({
      where: { code: lotteryCode },
    });

    if (!lottery) return null;

    return prisma.draw.findFirst({
      where: {
        lotteryId: lottery.id,
        verificationStatus: { in: ['FULLY_VERIFIED', 'PARTIALLY_VERIFIED'] },
      },
      include: {
        lottery: true,
        prizeTiers: {
          include: { prizeEntries: true },
        },
      },
      orderBy: { drawDate: 'desc' },
    });
  }

  static async getLatestDrawsForAllLotteries() {
    const lotteries = await prisma.lottery.findMany();

    const draws = await Promise.all(
      lotteries.map((lottery: any) =>
        prisma.draw.findFirst({
          where: {
            lotteryId: lottery.id,
            verificationStatus: { in: ['FULLY_VERIFIED', 'PARTIALLY_VERIFIED'] },
          },
          include: {
            lottery: true,
            prizeTiers: {
              include: { prizeEntries: true },
            },
          },
          orderBy: { drawDate: 'desc' },
        }),
      ),
    );

    return draws.filter((draw) => draw !== null);
  }

  static async getDrawStats() {
    const [totalDraws, verifiedDraws, unverifiedDraws, quarantinedDraws] = await Promise.all([
      prisma.draw.count(),
      prisma.draw.count({ where: { verificationStatus: 'FULLY_VERIFIED' } }),
      prisma.draw.count({ where: { verificationStatus: 'UNVERIFIED' } }),
      prisma.draw.count({ where: { verificationStatus: 'QUARANTINED' } }),
    ]);

    return {
      totalDraws,
      verifiedDraws,
      unverifiedDraws,
      quarantinedDraws,
    };
  }

  static async searchDrawsByEnding(ending: string, lotteryCode?: LotteryCode) {
    const where: any = {
      prizeEntries: {
        some: {
          lastFourDigits: ending,
        },
      },
    };

    if (lotteryCode) {
      const lottery = await prisma.lottery.findUnique({
        where: { code: lotteryCode },
      });
      if (lottery) {
        where.draw = {
          lotteryId: lottery.id,
        };
      }
    }

    return prisma.prizeTier.findMany({
      where,
      include: {
        draw: {
          include: { lottery: true },
        },
        prizeEntries: true,
      },
      orderBy: {
        draw: {
          drawDate: 'desc',
        },
      },
    });
  }
}
