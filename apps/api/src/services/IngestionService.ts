import { prisma } from '../config/database';
import { runIngestionPipeline } from '@kerala-lottery/data-ingestion';
import { LotteryCode } from '@kerala-lottery/shared';
import { persistDrawsToDatabase } from '@kerala-lottery/data-ingestion';

export class IngestionService {
  static async syncLottery(lotteryCode: LotteryCode, timeout?: number) {
    const job = await prisma.ingestionJob.create({
      data: {
        status: 'running',
        startedAt: new Date(),
      },
    });

    try {
      const result = await runIngestionPipeline(lotteryCode, {
        timeout,
      });

      const persistResult = await persistDrawsToDatabase(
        prisma,
        result.draws,
        job.id,
      );

      await prisma.ingestionJob.update({
        where: { id: job.id },
        data: {
          status: result.success ? 'success' : 'failure',
          completedAt: new Date(),
        },
      });

      return {
        jobId: job.id,
        status: result.success ? 'success' : 'failure',
        lotteryCode,
        drawsProcessed: result.draws.length,
        drawsCreated: persistResult.createdCount,
        drawsSkipped: persistResult.skippedCount,
        errors: [...result.errors, ...persistResult.errors],
        warnings: result.warnings,
      };
    } catch (error) {
      await prisma.ingestionJob.update({
        where: { id: job.id },
        data: {
          status: 'failure',
          completedAt: new Date(),
        },
      });

      throw error;
    }
  }

  static async syncAllLotteries(timeout?: number) {
    const lotteries: LotteryCode[] = [
      'BT', 'SS', 'DL', 'KN', 'SK', 'KR', 'SM',
    ];

    const results = await Promise.all(
      lotteries.map((code) => this.syncLottery(code, timeout)),
    );

    return {
      syncedAt: new Date(),
      results,
      summary: {
        totalDrawsProcessed: results.reduce((sum, r) => sum + r.drawsProcessed, 0),
        totalDrawsCreated: results.reduce((sum, r) => sum + r.drawsCreated, 0),
        totalErrors: results.reduce((sum, r) => sum + r.errors.length, 0),
      },
    };
  }

  static async getIngestionStatus(jobId: string) {
    const job = await prisma.ingestionJob.findUnique({
      where: { id: jobId },
      include: {
        audits: {
          include: {
            draw: true,
          },
        },
      },
    });

    return job;
  }

  static async getIngestionHistory(limit: number = 20) {
    return prisma.ingestionJob.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { audits: true },
        },
      },
    });
  }
}
