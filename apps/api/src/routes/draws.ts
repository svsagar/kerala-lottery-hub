import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { DrawQuerySchema } from '@kerala-lottery/shared';
import { AppError } from '../middleware/errorHandler';

export const drawRouter = Router();

drawRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = DrawQuerySchema.parse(req.query);
    const { lotteryId, startDate, endDate, verificationStatus, page, limit } = query;

    const where: any = {};

    if (lotteryId) where.lotteryId = lotteryId;
    if (startDate || endDate) {
      where.drawDate = {};
      if (startDate) where.drawDate.gte = startDate;
      if (endDate) where.drawDate.lte = endDate;
    }
    if (verificationStatus) where.verificationStatus = verificationStatus;

    const draws = await prisma.draw.findMany({
      where,
      include: {
        lottery: true,
        prizeTiers: {
          include: {
            prizeEntries: true,
          },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { drawDate: 'desc' },
    });

    const total = await prisma.draw.count({ where });

    res.json({
      status: 'success',
      data: {
        draws,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      timestamp: new Date(),
    });
  } catch (error) {
    next(error);
  }
});

drawRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const draw = await prisma.draw.findUnique({
      where: { id },
      include: {
        lottery: true,
        prizeTiers: {
          include: {
            prizeEntries: true,
          },
        },
        verificationIssues: true,
      },
    });

    if (!draw) {
      throw new AppError(404, `Draw with ID ${id} not found`);
    }

    res.json({
      status: 'success',
      data: draw,
      timestamp: new Date(),
    });
  } catch (error) {
    next(error);
  }
});
