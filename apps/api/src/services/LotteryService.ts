import { prisma } from '../config/database';
import { LotteryCode, LOTTERIES } from '@kerala-lottery/shared';

type Lottery = any;

export class LotteryService {
  // Initialize all 7 lotteries
  static async initializeLotteries(): Promise<void> {
    for (const [code, lottery] of Object.entries(LOTTERIES)) {
      await prisma.lottery.upsert({
        where: { code },
        update: {},
        create: {
          code,
          name: lottery.name,
          nameML: lottery.nameML,
          dayOfWeek: lottery.day,
          description: `Official ${lottery.name} lottery`,
        },
      });
    }
  }

  static async getAllLotteries(): Promise<Lottery[]> {
    return prisma.lottery.findMany({
      orderBy: { dayOfWeek: 'asc' },
    });
  }

  static async getLotteryByCode(code: LotteryCode): Promise<Lottery | null> {
    return prisma.lottery.findUnique({
      where: { code },
    });
  }

  static async getLotteryWithStats(code: LotteryCode) {
    const lottery = await prisma.lottery.findUnique({
      where: { code },
    });

    if (!lottery) return null;

    const drawCount = await prisma.draw.count({
      where: { lotteryId: lottery.id },
    });

    const latestDraw = await prisma.draw.findFirst({
      where: { lotteryId: lottery.id },
      orderBy: { drawDate: 'desc' },
      include: {
        prizeTiers: {
          include: { prizeEntries: true },
        },
      },
    });

    return {
      ...lottery,
      drawCount,
      latestDraw,
    };
  }

  static async getLotteriesWithStats() {
    const lotteries = await this.getAllLotteries();
    const stats = await Promise.all(
      lotteries.map((lottery: any) =>
        prisma.draw
          .count({
            where: { lotteryId: lottery.id },
          })
          .then((count: any) => ({ lotteryCode: lottery.code, drawCount: count })),
      ),
    );

    return lotteries.map((lottery) => ({
      ...lottery,
      drawCount: stats.find((s) => s.lotteryCode === lottery.code)?.drawCount || 0,
    }));
  }
}
