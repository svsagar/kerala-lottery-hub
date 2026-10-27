import { Router, Request, Response, NextFunction } from 'express';
import { IngestionService } from '../services/IngestionService';
import { AppError } from '../middleware/errorHandler';

export const syncRouter = Router();

syncRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await IngestionService.syncAllLotteries();
    
    res.json({
      status: 'success',
      data: result,
      timestamp: new Date(),
    });
  } catch (error) {
    next(error);
  }
});

syncRouter.post('/:lotteryCode', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { lotteryCode } = req.params;
    
    const result = await IngestionService.syncLottery(lotteryCode as any);
    
    res.json({
      status: 'success',
      data: result,
      timestamp: new Date(),
    });
  } catch (error) {
    next(error);
  }
});

syncRouter.get('/status/:jobId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { jobId } = req.params;
    
    const status = await IngestionService.getIngestionStatus(jobId);
    
    if (!status) {
      throw new AppError(404, `Ingestion job ${jobId} not found`);
    }
    
    res.json({
      status: 'success',
      data: status,
      timestamp: new Date(),
    });
  } catch (error) {
    next(error);
  }
});

syncRouter.get('/history/:limit?', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = req.params.limit ? parseInt(req.params.limit, 10) : 20;
    
    const history = await IngestionService.getIngestionHistory(limit);
    
    res.json({
      status: 'success',
      data: history,
      timestamp: new Date(),
    });
  } catch (error) {
    next(error);
  }
});
