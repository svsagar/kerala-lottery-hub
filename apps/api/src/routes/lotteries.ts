import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';

export const lotteryRouter = Router();

lotteryRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lotteries = await prisma.lottery.findMany({
      select: {
        id: true,
        code: true,
        name: true,
        nameML: true,
        dayOfWeek: true,
        description: true,
      },
    });

    res.json({
      status: 'success',
      data: lotteries,
      timestamp: new Date(),
    });
  } catch (error) {
    next(error);
  }
});

lotteryRouter.get('/:code', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code } = req.params;

    const lottery = await prisma.lottery.findUnique({
      where: { code },
      include: {
        draws: {
          take: 1,
          orderBy: { drawDate: 'desc' },
        },
      },
    });

    if (!lottery) {
      throw new AppError(404, `Lottery with code ${code} not found`);
    }

    res.json({
      status: 'success',
      data: lottery,
      timestamp: new Date(),
    });
  } catch (error) {
    next(error);
  }
});
