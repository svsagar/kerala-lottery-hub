import { PrismaClient } from '@prisma/client';
import { RawDrawData } from '../types';
import { calculateContentHash } from '../utils/hash';

export interface PersistenceResult {
  createdCount: number;
  skippedCount: number;
  errors: Array<{ drawKey: string; error: string }>;
}

export const persistDrawsToDatabase = async (
  prisma: PrismaClient,
  draws: RawDrawData[],
  jobId: string,
): Promise<PersistenceResult> => {
  let createdCount = 0;
  let skippedCount = 0;
  const errors: Array<{ drawKey: string; error: string }> = [];

  for (const draw of draws) {
    const drawKey = `${draw.lotteryCode}-${draw.drawNumber}`;

    try {
      // Start transaction
      await prisma.$transaction(async (tx: any) => {
        // Get or create source document
        const contentHash = await calculateContentHash(
          JSON.stringify(draw.sourceDocument),
        );

        let sourceDoc = await tx.sourceDocument.findUnique({
          where: { contentHash },
        });

        if (!sourceDoc) {
          sourceDoc = await tx.sourceDocument.create({
            data: {
              sourceType: draw.sourceDocument.sourceType,
              sourceUrl: draw.sourceDocument.sourceUrl,
              sourceFormat: draw.sourceDocument.sourceFormat,
              retrievedAt: draw.sourceDocument.retrievedAt,
              contentHash,
            },
          });
        }

        // Get lottery by code
        const lottery = await tx.lottery.findUnique({
          where: { code: draw.lotteryCode },
        });

        if (!lottery) {
          throw new Error(`Lottery ${draw.lotteryCode} not found`);
        }

        // Check for existing draw
        const existingDraw = await tx.draw.findUnique({
          where: {
            lotteryId_drawNumber: {
              lotteryId: lottery.id,
              drawNumber: draw.drawNumber,
            },
          },
        });

        if (existingDraw) {
          skippedCount++;
          return;
        }

        // Create draw
        const newDraw = await tx.draw.create({
          data: {
            lotteryId: lottery.id,
            drawNumber: draw.drawNumber,
            drawDate: draw.drawDate,
            verificationStatus: 'FULLY_VERIFIED',
            sourceDocumentId: sourceDoc.id,
          },
        });

        // Create prize tiers and entries
        for (const tier of draw.prizeTiers) {
          const prizeTier = await tx.prizeTier.create({
            data: {
              drawId: newDraw.id,
              tierName: tier.tierName,
              tierNumber: tier.tierNumber,
            },
          });

          // Create prize entries
          for (const ticket of tier.ticketNumbers) {
            await tx.prizeEntry.create({
              data: {
                prizeTierId: prizeTier.id,
                ticketNumber: ticket,
                lastFourDigits: ticket.slice(-4),
              },
            });
          }
        }

        // Create ingestion audit
        await tx.ingestionAudit.create({
          data: {
            jobId,
            drawId: newDraw.id,
            action: 'created',
          },
        });

        createdCount++;
      });
    } catch (error) {
      errors.push({
        drawKey,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return {
    createdCount,
    skippedCount,
    errors,
  };
};
