import { Router, Request, Response, NextFunction } from 'express';
import { AnalysisService } from '../services/AnalysisService';
import { FrequencyAnalysisQuerySchema } from '@kerala-lottery/shared';

export const analysisRouter = Router();

analysisRouter.get('/frequency/:lotteryCode', async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { lotteryCode } = req.params;
    const { startDate, endDate, prizeTier } = req.query;

    const result = await AnalysisService.getFrequencyAnalysis(
      lotteryCode as any,
      prizeTier as string,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined,
    );

    res.json({
      status: 'success',
      data: result,
      timestamp: new Date(),
    });
  } catch (error) {
    next(error);
  }
});

analysisRouter.get('/digit-frequency/:lotteryCode/:position', async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { lotteryCode, position } = req.params;
    const { startDate, endDate } = req.query;

    const result = await AnalysisService.getDigitFrequency(
      lotteryCode as any,
      parseInt(position, 10),
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined,
    );

    res.json({
      status: 'success',
      data: result,
      timestamp: new Date(),
    });
  } catch (error) {
    next(error);
  }
});

analysisRouter.get('/recency-weighted/:lotteryCode', async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { lotteryCode } = req.params;
    const { lambda = 0.1, startDate, endDate } = req.query;

    const result = await AnalysisService.getRecencyWeightedFrequency(
      lotteryCode as any,
      parseFloat(lambda as string),
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined,
    );

    res.json({
      status: 'success',
      data: result,
      timestamp: new Date(),
    });
  } catch (error) {
    next(error);
  }
});
