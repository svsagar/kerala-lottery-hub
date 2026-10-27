import { prisma } from '../config/database';
import { LotteryCode } from '@kerala-lottery/shared';

export interface FrequencyData {
  ending: string;
  frequency: number;
  percentage: number;
}

export class AnalysisService {
  static async getFrequencyAnalysis(
    lotteryCode: LotteryCode,
    prizeTierName?: string,
    startDate?: Date,
    endDate?: Date,
  ) {
    const lottery = await prisma.lottery.findUnique({
      where: { code: lotteryCode },
    });

    if (!lottery) throw new Error(`Lottery ${lotteryCode} not found`);

    const where: any = {
      draw: {
        lotteryId: lottery.id,
      },
    };

    if (startDate || endDate) {
      where.draw.drawDate = {};
      if (startDate) where.draw.drawDate.gte = startDate;
      if (endDate) where.draw.drawDate.lte = endDate;
    }

    if (prizeTierName) {
      where.prizeTier = { tierName: prizeTierName };
    }

    // Get all prize entries for the period
    const prizeEntries = await prisma.prizeEntry.findMany({
      where,
      include: {
        prizeTier: {
          include: {
            draw: true,
          },
        },
      },
    });

    // Calculate frequency
    const frequencyMap: Record<string, number> = {};
    prizeEntries.forEach((entry: any) => {
      frequencyMap[entry.lastFourDigits] = (frequencyMap[entry.lastFourDigits] || 0) + 1;
    });

    // Convert to array and calculate percentages
    const frequency: FrequencyData[] = Object.entries(frequencyMap)
      .map(([ending, count]) => ({
        ending,
        frequency: count,
        percentage: (count / prizeEntries.length) * 100,
      }))
      .sort((a, b) => b.frequency - a.frequency);

    return {
      lotteryCode,
      sampleSize: prizeEntries.length,
      analysisDate: new Date(),
      frequency,
      metadata: {
        startDate,
        endDate,
        prizeTierName,
      },
    };
  }

  static async getDigitFrequency(
    lotteryCode: LotteryCode,
    position: number,
    startDate?: Date,
    endDate?: Date,
  ) {
    const lottery = await prisma.lottery.findUnique({
      where: { code: lotteryCode },
    });

    if (!lottery) throw new Error(`Lottery ${lotteryCode} not found`);

    const where: any = {
      draw: {
        lotteryId: lottery.id,
      },
    };

    if (startDate || endDate) {
      where.draw.drawDate = {};
      if (startDate) where.draw.drawDate.gte = startDate;
      if (endDate) where.draw.drawDate.lte = endDate;
    }

    const prizeEntries = await prisma.prizeEntry.findMany({
      where,
    });

    const digitFreq: Record<string, number> = {};
    prizeEntries.forEach((entry: any) => {
      if (entry.ticketNumber.length > position) {
        const digit = entry.ticketNumber[position];
        digitFreq[digit] = (digitFreq[digit] || 0) + 1;
      }
    });

    const data = Object.entries(digitFreq)
      .map(([digit, frequency]) => ({
        digit,
        frequency,
        percentage: (frequency / prizeEntries.length) * 100,
      }))
      .sort((a, b) => b.frequency - a.frequency);

    return {
      lotteryCode,
      position,
      sampleSize: prizeEntries.length,
      data,
    };
  }

  static async getRecencyWeightedFrequency(
    lotteryCode: LotteryCode,
    decayLambda: number = 0.1,
    startDate?: Date,
    endDate?: Date,
  ) {
    const lottery = await prisma.lottery.findUnique({
      where: { code: lotteryCode },
    });

    if (!lottery) throw new Error(`Lottery ${lotteryCode} not found`);

    const where: any = {
      draw: {
        lotteryId: lottery.id,
      },
    };

    if (startDate || endDate) {
      where.draw.drawDate = {};
      if (startDate) where.draw.drawDate.gte = startDate;
      if (endDate) where.draw.drawDate.lte = endDate;
    }

    const prizeEntries = await prisma.prizeEntry.findMany({
      where,
      include: {
        prizeTier: {
          include: {
            draw: {
              select: { drawDate: true },
            },
          },
        },
      },
      orderBy: {
        prizeTier: {
          draw: {
            drawDate: 'desc',
          },
        },
      },
    });

    const now = new Date().getTime();
    const weightedFreq: Record<string, number> = {};

    prizeEntries.forEach((entry: any) => {
      const drawDate = entry.prizeTier.draw.drawDate.getTime();
      const daysDiff = (now - drawDate) / (1000 * 60 * 60 * 24);
      const weight = Math.exp(-decayLambda * daysDiff);

      weightedFreq[entry.lastFourDigits] = (weightedFreq[entry.lastFourDigits] || 0) + weight;
    });

    const data = Object.entries(weightedFreq)
      .map(([ending, score]) => ({
        ending,
        score: Math.round(score * 1000) / 1000,
      }))
      .sort((a, b) => b.score - a.score);

    return {
      lotteryCode,
      decayLambda,
      sampleSize: prizeEntries.length,
      data,
    };
  }
}
